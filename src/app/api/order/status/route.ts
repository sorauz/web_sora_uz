import { NextRequest, NextResponse } from "next/server";
import { api } from "@/lib/api";

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const orderId = searchParams.get("orderId") || searchParams.get("order_id");

    if (!orderId || !orderId.trim()) {
      return NextResponse.json(
        {
          error: "order_id parametri majburiy!",
        },
        { status: 400 }
      );
    }

    const cleanOrderId = orderId.trim();

    const result = await api.getOrderStatus(cleanOrderId);

    if (result.success && result.data) {
      return NextResponse.json(
        {
          success: true,
          order: result.data,
        },
        { status: 200 }
      );
    }

    if (result.statusCode === 404) {
      return NextResponse.json(
        {
          success: false,
          error: "Ushbu ID ga ega buyurtma topilmadi!",
        },
        { status: 404 }
      );
    }

    if (result.statusCode === 400) {
      return NextResponse.json(
        {
          success: false,
          error: result.error || "Yuborilgan 'order_id' formati noto'g'ri! GUID kutilmoqda.",
        },
        { status: 400 }
      );
    }

    // Graceful fallback for generated / offline orders
    return NextResponse.json(
      {
        success: true,
        order: {
          order_id: cleanOrderId,
          order_number: "РТ-0000" + cleanOrderId.slice(0, 3),
          order_date: new Date().toISOString(),
          status: "Jarayonda",
          without_delivery: false,
          total_amount: 0,
        },
        isFallback: true,
      },
      { status: 200 }
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
