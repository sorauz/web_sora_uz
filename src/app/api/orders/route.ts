import { NextRequest, NextResponse } from "next/server";
import { api } from "@/lib/api";
import { getSessionUser } from "@/lib/auth/session";

export async function GET(req: NextRequest) {
  try {
    const sessionUser = await getSessionUser();

    if (!sessionUser || !sessionUser.id) {
      return NextResponse.json(
        {
          success: false,
          code: "AUTH_REQUIRED",
          error: "Buyurtmalar tarixini ko'rish uchun tizimga kiring!",
        },
        { status: 401 }
      );
    }

    const searchParams = req.nextUrl.searchParams;
    const rawLimit = searchParams.get("limit");
    const rawOffset = searchParams.get("offset");
    const rawOnlyOnline = searchParams.get("only_online");
    const rawIsKp = searchParams.get("is_kp");

    const parsedLimit = rawLimit !== null ? Number(rawLimit) : 20;
    const parsedOffset = rawOffset !== null ? Number(rawOffset) : 0;

    if (!Number.isFinite(parsedLimit) || !Number.isFinite(parsedOffset)) {
      return NextResponse.json(
        {
          success: false,
          error: "'limit' va 'offset' parametrlar son bo'lishi kerak!",
        },
        { status: 400 }
      );
    }

    const limit = Math.min(Math.max(Math.trunc(parsedLimit), 1), 100);
    const offset = Math.max(Math.trunc(parsedOffset), 0);

    let onlyOnline: boolean | undefined;
    if (rawOnlyOnline === "true") {
      onlyOnline = true;
    } else if (rawOnlyOnline === "false") {
      onlyOnline = false;
    } else if (rawOnlyOnline !== null && rawOnlyOnline.trim() !== "") {
      return NextResponse.json(
        {
          success: false,
          error: "'only_online' faqat 'true' yoki 'false' bo'lishi mumkin!",
        },
        { status: 400 }
      );
    }

    let isKp: boolean | undefined;
    if (rawIsKp === "true") {
      isKp = true;
    } else if (rawIsKp === "false") {
      isKp = false;
    } else if (rawIsKp !== null && rawIsKp.trim() !== "") {
      return NextResponse.json(
        {
          success: false,
          error: "'is_kp' faqat 'true' yoki 'false' bo'lishi mumkin!",
        },
        { status: 400 }
      );
    }

    const result = await api.getOrderHistory({
      type: sessionUser.type,
      contactId: sessionUser.type === "B2C" ? sessionUser.id : undefined,
      clientId: sessionUser.type === "B2B" ? sessionUser.id : undefined,
      limit,
      offset,
      onlyOnline,
      isKp,
    });

    if (result.success && result.data) {
      return NextResponse.json(
        {
          success: true,
          customerType: sessionUser.type,
          ...result.data,
        },
        { status: 200 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error:
          result.error || "Buyurtmalar tarixini olishda xatolik yuz berdi",
      },
      { status: result.statusCode || 500 }
    );
  } catch (err) {
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : "Ichki server xatoligi",
      },
      { status: 500 }
    );
  }
}
