import { NextResponse } from "next/server";
import { clearSessionCookie } from "@/lib/auth/session";

export async function POST() {
  try {
    await clearSessionCookie();

    return NextResponse.json({
      success: true,
      message: "Tizimdan muvaffaqiyatli chiqildi",
    });
  } catch (err) {
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : "Chiqishda xatolik yuz berdi",
      },
      { status: 500 }
    );
  }
}
