import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { api } from "@/lib/api";
import { getRecentOrderAccess, getSessionUser } from "@/lib/auth/session";

const GUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const rawOrderId =
      searchParams.get("orderId") || searchParams.get("order_id");

    if (!rawOrderId || !rawOrderId.trim()) {
      return NextResponse.json(
        {
          success: false,
          error: "order_id parametri majburiy!",
        },
        { status: 400 }
      );
    }

    const cleanOrderId = rawOrderId.trim();
    if (!GUID_RE.test(cleanOrderId)) {
      return NextResponse.json(
        {
          success: false,
          error: "Yuborilgan 'order_id' formati noto'g'ri! GUID kutilmoqda.",
        },
        { status: 400 }
      );
    }

    // Resolve ownership ONLY from server-signed HttpOnly cookies (never from query params)
    const cookieStore = await cookies();
    const recentAccess = await getRecentOrderAccess(cleanOrderId, cookieStore);
    const sessionUser = await getSessionUser(cookieStore);

    let ownerType: "B2C" | "B2B" | null = null;
    let contactId: string | undefined;
    let clientId: string | undefined;

    if (recentAccess) {
      ownerType = recentAccess.type;
      if (recentAccess.type === "B2B") {
        clientId = recentAccess.ownerId;
      } else {
        contactId = recentAccess.ownerId;
      }
    } else if (sessionUser && sessionUser.id) {
      ownerType = sessionUser.type;
      if (sessionUser.type === "B2B") {
        clientId = sessionUser.id;
      } else {
        contactId = sessionUser.id;
      }
    }

    if (!ownerType || (!contactId && !clientId)) {
      return NextResponse.json(
        {
          success: false,
          code: "AUTH_REQUIRED",
          error: "Buyurtma tafsilotini ko'rish uchun tizimga kiring!",
        },
        { status: 401 }
      );
    }

    const result = await api.getOrderDetail({
      orderId: cleanOrderId,
      type: ownerType,
      contactId,
      clientId,
    });

    if (result.success && result.data) {
      return NextResponse.json(
        {
          success: true,
          order: result.data,
        },
        { status: 200 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error:
          result.error || "Buyurtma holatini olishda xatolik yuz berdi",
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
