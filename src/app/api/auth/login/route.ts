import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { api } from "@/lib/api";
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

    const sessionUser = {
      id: result.user.id,
      name: result.user.name || (type === "B2C" ? "Foydalanuvchi" : "Tashkilot"),
      type: result.user.type || type,
      phone: type === "B2C" ? identifier : undefined,
      inn: type === "B2B" ? identifier : undefined,
    };

    // Set secure session cookie (30 days)
    const cookieStore = await cookies();
    cookieStore.set("sora_session", JSON.stringify(sessionUser), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30,
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
        error: err instanceof Error ? err.message : "Serverda xatolik yuz berdi",
      },
      { status: 500 }
    );
  }
}
