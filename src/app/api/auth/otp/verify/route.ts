import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { api } from "@/lib/api";
import { OtpVerifyInputSchema, normalizePhone } from "@/lib/schemas/auth";
import {
  createVerifiedPhoneToken,
  deriveOneCPassword,
  OTP_TTL_SECONDS,
  verifyOtpChallenge,
} from "@/lib/sms/otp-store";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = OtpVerifyInputSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error:
            parsed.error.issues[0]?.message ||
            "4 xonali tasdiqlash kodi to'liq kiritilmadi",
        },
        { status: 400 }
      );
    }

    const { phone, code, type, inn, locale } = parsed.data;
    const isUz = locale !== "ru";
    const normPhone = normalizePhone(phone);

    const cookieStore = await cookies();
    const challengeCookie = cookieStore.get("sora_otp_challenge")?.value;

    const verifyResult = verifyOtpChallenge(normPhone, code, challengeCookie);

    if (!verifyResult.valid) {
      if (verifyResult.updatedCookieToken) {
        cookieStore.set("sora_otp_challenge", verifyResult.updatedCookieToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: OTP_TTL_SECONDS,
          path: "/",
        });
      } else {
        cookieStore.delete("sora_otp_challenge");
      }

      let errorMessage: string;
      if (verifyResult.reason === "expired" || verifyResult.reason === "not_found") {
        errorMessage = isUz
          ? "Tasdiqlash kodining amal qilish muddati tugadi. Iltimos, yangi kod oling."
          : "Срок действия кода истек. Пожалуйста, запросите новый код.";
      } else if (verifyResult.reason === "max_attempts") {
        errorMessage = isUz
          ? "3 marta noto'g'ri kod kiritildi. Xavfsizlik uchun yangi kod oling."
          : "Код введен неверно 3 раза. Пожалуйста, запросите новый код.";
      } else {
        const rem = verifyResult.remainingAttempts ?? 1;
        errorMessage = isUz
          ? `Tasdiqlash kodi noto'g'ri! Yana ${rem} ta urinish qoldi.`
          : `Неверный код подтверждения! Осталось попыток: ${rem}.`;
      }

      return NextResponse.json(
        {
          success: false,
          error: errorMessage,
          reason: verifyResult.reason,
          remainingAttempts: verifyResult.remainingAttempts,
        },
        { status: 400 }
      );
    }

    // OTP verified! Clear challenge cookie
    cookieStore.delete("sora_otp_challenge");

    // Step 3: Check if customer already exists in 1C ERP
    const cleanInn = inn?.trim() || "";
    const lookupType: "B2C" | "B2B" =
      type === "B2B" && cleanInn.length === 9 ? "B2B" : "B2C";
    const lookupIdentifier = lookupType === "B2B" ? cleanInn : normPhone;
    const derivedPassword = deriveOneCPassword(lookupIdentifier);

    let lookupResult = await api.loginUser({
      type: lookupType,
      identifier: lookupIdentifier,
      password: derivedPassword,
    });

    // If customer exists in 1C (e.g. created offline/legacy with a different password in 1C -> 401),
    // use 1C's POST /register 409 Conflict response ({ id, name }) for Seamless Login!
    if (!lookupResult.success && lookupResult.statusCode === 401) {
      const conflictProbe = await api.registerUser(
        lookupType === "B2B"
          ? {
              type: "B2B",
              name: "Tashkilot",
              inn: cleanInn,
              phone1: normPhone,
              password: derivedPassword,
            }
          : {
              type: "B2C",
              name: "Xaridor",
              phone1: normPhone,
              phone2: "",
              password: derivedPassword,
            }
      );

      if ((conflictProbe.isConflict || conflictProbe.success) && conflictProbe.id) {
        lookupResult = {
          success: true,
          statusCode: 200,
          user: {
            id: conflictProbe.id,
            name:
              conflictProbe.name ||
              (lookupType === "B2C" ? "Xaridor" : "Tashkilot"),
            type: lookupType,
          },
        };
      }
    }

    // Existing customer found in 1C ERP -> Log in immediately!
    if (lookupResult.success && lookupResult.user && lookupResult.user.id) {
      const sessionUser = {
        id: lookupResult.user.id,
        name:
          lookupResult.user.name ||
          (type === "B2C" ? "Xaridor" : "Tashkilot"),
        type: (lookupResult.user.type === "B2B" ? "B2B" : type) as
          | "B2C"
          | "B2B",
        phone: normPhone,
        inn: type === "B2B" && cleanInn ? cleanInn : undefined,
      };

      cookieStore.set("sora_session", JSON.stringify(sessionUser), {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 30, // 30 days
        path: "/",
      });

      return NextResponse.json({
        success: true,
        isNewUser: false,
        user: sessionUser,
      });
    }

    // Customer not found in 1C (404) -> Return verifiedToken for Step 3 (Name / INN registration)
    const verifiedToken = createVerifiedPhoneToken(
      normPhone,
      type,
      cleanInn || undefined
    );

    return NextResponse.json({
      success: true,
      isNewUser: true,
      phone: normPhone,
      verifiedToken,
    });
  } catch (err) {
    return NextResponse.json(
      {
        success: false,
        error:
          err instanceof Error ? err.message : "Serverda xatolik yuz berdi",
      },
      { status: 500 }
    );
  }
}
