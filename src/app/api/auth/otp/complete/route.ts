import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import crypto from "crypto";
import { api } from "@/lib/api";
import { OtpCompleteInputSchema, normalizePhone } from "@/lib/schemas/auth";
import { deriveOneCPassword, verifyPhoneToken } from "@/lib/sms/otp-store";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = OtpCompleteInputSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error:
            parsed.error.issues[0]?.message ||
            "Ma'lumotlar to'liq kiritilmadi",
        },
        { status: 400 }
      );
    }

    const { verifiedToken, name, type, inn, phone2 } = parsed.data;
    const tokenPayload = verifyPhoneToken(verifiedToken);

    if (!tokenPayload) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Tasdiqlash sessiyasi muddati tugagan. Iltimos, telefon raqamingizni qaytadan tasdiqlang.",
        },
        { status: 401 }
      );
    }

    const verifiedPhone = tokenPayload.phone;
    const finalType = type || tokenPayload.type;
    const finalInn = (inn || tokenPayload.inn || "").trim();
    const normPhone2 = phone2 ? normalizePhone(phone2) : "";

    const derivedPassword = deriveOneCPassword(
      finalType === "B2B" && finalInn ? finalInn : verifiedPhone
    );

    const registerPayload =
      finalType === "B2B"
        ? {
            type: "B2B" as const,
            name: name.trim(),
            inn: finalInn,
            phone1: verifiedPhone,
            password: derivedPassword,
          }
        : {
            type: "B2C" as const,
            name: name.trim(),
            phone1: verifiedPhone,
            phone2: normPhone2,
            password: derivedPassword,
          };

    const result = await api.registerUser(registerPayload);

    // 1C returns 201 Created (result.success) or 409 Conflict with existing UUID and name (result.isConflict && result.id)
    let userId = result.id || "";
    const resolvedName =
      result.isConflict && result.name ? result.name.trim() : name.trim();

    if (!result.success && !result.isConflict) {
      // If 1C server is temporarily unreachable (>=500) or throws the 1C module 'type' check bug,
      // provide a resilient fallback UUID so the OTP-verified customer is never blocked.
      const isOneCTypeBug =
        typeof result.error === "string" &&
        result.error.includes("'type' parametri");

      if (result.statusCode >= 500 || isOneCTypeBug) {
        userId = crypto.randomUUID();
      } else {
        return NextResponse.json(
          {
            success: false,
            error: result.error || "Ro'yxatdan o'tishda xatolik yuz berdi",
          },
          { status: result.statusCode || 400 }
        );
      }
    }

    if (!userId) {
      userId = crypto.randomUUID();
    }

    const sessionUser = {
      id: userId,
      name: resolvedName,
      type: finalType,
      phone: verifiedPhone,
      inn: finalType === "B2B" ? finalInn : undefined,
    };

    const cookieStore = await cookies();
    cookieStore.set("sora_session", JSON.stringify(sessionUser), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: "/",
    });

    return NextResponse.json({
      success: true,
      user: sessionUser,
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
