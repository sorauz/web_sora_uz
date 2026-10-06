import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete("sora_session");

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
