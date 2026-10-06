import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { api } from "@/lib/api";
import { RegisterInputSchema, normalizePhone } from "@/lib/schemas/auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = RegisterInputSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: parsed.error.issues[0]?.message || "Ma'lumotlar to'liq kiritilmadi",
        },
        { status: 400 }
      );
    }

    const { type, name, phone1, phone2, inn, password } = parsed.data;
    const normPhone1 = normalizePhone(phone1);
    const normPhone2 = phone2 ? normalizePhone(phone2) : "";

    const payload = {
      type,
      name: name.trim(),
      password,
      ...(type === "B2C"
        ? { phone1: normPhone1, phone2: normPhone2 }
        : { inn: (inn || "").trim() }),
    };

    const result = await api.registerUser(payload);

    if (!result.success) {
      if (result.isConflict) {
        return NextResponse.json(
          {
            success: false,
            isConflict: true,
            id: result.id,
            error:
              "Ushbu telefon raqami (yoki INN) allaqachon ro'yxatdan o'tgan. Iltimos, tizimga kiring!",
          },
          { status: 409 }
        );
      }

      return NextResponse.json(
        {
          success: false,
          error: result.error || "Ro'yxatdan o'tishda xatolik yuz berdi",
        },
        { status: result.statusCode || 400 }
      );
    }

    const sessionUser = {
      id: result.id || "",
      name: name.trim(),
      type,
      phone: normPhone1,
      inn: inn?.trim(),
    };

    // Auto-login on successful registration
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
