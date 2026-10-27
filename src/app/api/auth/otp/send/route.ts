import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { OtpSendInputSchema, normalizePhone } from "@/lib/schemas/auth";
import { eskizService } from "@/lib/sms/eskiz";
import {
  checkOtpRateLimit,
  createOtpChallenge,
  generateOtpCode,
  OTP_TTL_SECONDS,
} from "@/lib/sms/otp-store";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = OtpSendInputSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error:
            parsed.error.issues[0]?.message ||
            "Telefon raqami noto'g'ri kiritildi",
        },
        { status: 400 }
      );
    }

    const { phone, locale } = parsed.data;
    const isUz = locale !== "ru";
    const normPhone = normalizePhone(phone);

    if (!/^\+998\d{9}$/.test(normPhone)) {
      return NextResponse.json(
        {
          success: false,
          error: isUz
            ? "Iltimos, to'liq O'zbekiston telefon raqamini kiriting (+998 XX XXX-XX-XX)"
            : "Пожалуйста, введите полный номер телефона Узбекистана (+998 XX XXX-XX-XX)",
        },
        { status: 400 }
      );
    }

    // Extract client IP for anti-spam rate limiting
    const forwardedFor = request.headers.get("x-forwarded-for");
    const clientIp =
      (forwardedFor ? forwardedFor.split(",")[0]?.trim() : null) ||
      request.headers.get("x-real-ip") ||
      "unknown";

    const cookieStore = await cookies();
    const existingChallengeCookie =
      cookieStore.get("sora_otp_challenge")?.value;

    // 1. Check Cooldown & Hourly Rate Limits
    const rateCheck = checkOtpRateLimit(
      normPhone,
      clientIp,
      existingChallengeCookie
    );

    if (!rateCheck.allowed) {
      const waitSec = rateCheck.retryAfterSeconds || 60;
      const errorMsg =
        rateCheck.reason === "cooldown"
          ? isUz
            ? `Iltimos, yangi kod olish uchun ${waitSec} soniya kuting`
            : `Пожалуйста, подождите ${waitSec} сек. для повторной отправки кода`
          : isUz
          ? "SMS so'rovlar limiti oshib ketdi. Iltimos, birozdan so'ng urinib ko'ring."
          : "Превышен лимит запросов СМС. Пожалуйста, попробуйте позже.";

      return NextResponse.json(
        {
          success: false,
          error: errorMsg,
          retryAfter: waitSec,
        },
        { status: 429 }
      );
    }

    // 2. Generate 4-digit OTP code & Send via Eskiz.uz
    const otpCode = generateOtpCode();
    const smsResult = await eskizService.sendOtpSms(
      normPhone,
      otpCode,
      locale
    );

    if (!smsResult.success) {
      return NextResponse.json(
        {
          success: false,
          error:
            smsResult.error ||
            (isUz
              ? "SMS yuborishda xatolik yuz berdi"
              : "Ошибка при отправке СМС"),
        },
        { status: 500 }
      );
    }

    // 3. Store hashed OTP challenge in memory + signed httpOnly cookie
    const challenge = createOtpChallenge(normPhone, otpCode, clientIp);

    cookieStore.set("sora_otp_challenge", challenge.signedChallengeCookie, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: OTP_TTL_SECONDS,
      path: "/",
    });

    return NextResponse.json({
      success: true,
      phone: normPhone,
      cooldown: challenge.cooldown,
      expiresIn: challenge.expiresIn,
      isTestMode: smsResult.isTestMode || false,
      devCode: smsResult.devCode,
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
