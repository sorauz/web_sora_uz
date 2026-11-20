import { NextRequest, NextResponse } from "next/server";
import { api } from "@/lib/api";
import { setSessionCookie } from "@/lib/auth/session";
import { LoginInputSchema, normalizePhone } from "@/lib/schemas/auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = LoginInputSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: parsed.error.issues[0]?.message || "Ma'lumotlar noto'g'ri kiritildi",
        },
        { status: 400 }
      );
    }

    const { type, phone, inn, password } = parsed.data;
    const identifier = type === "B2C" ? normalizePhone(phone || "") : (inn || "").trim();

    const result = await api.loginUser({
      type,
      identifier,
      password,
    });

    if (!result.success || !result.user) {
      return NextResponse.json(
        {
          success: false,
          error: result.error || "Avtorizatsiyadan o'tib bo'lmadi",
        },
        { status: result.statusCode || 401 }
      );
    }

    const resolvedType: "B2C" | "B2B" =
      result.user.type?.toUpperCase() === "B2B"
        ? "B2B"
        : result.user.type?.toUpperCase() === "B2C"
        ? "B2C"
        : type;

    const sessionUser = {
      id: result.user.id,
      name: result.user.name || (resolvedType === "B2C" ? "Foydalanuvchi" : "Tashkilot"),
      type: resolvedType,
      phone: resolvedType === "B2C" ? identifier : undefined,
      inn: resolvedType === "B2B" ? identifier : undefined,
    };

    // Set HMAC-signed secure session cookie (30 days)
    await setSessionCookie(sessionUser);

    return NextResponse.json({
      success: true,
      user: sessionUser,
    });
  } catch (err) {
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : "Serverda xatolik yuz berdi",
      },
      { status: 500 }
    );
  }
}
