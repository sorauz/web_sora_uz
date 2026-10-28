import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { api } from "@/lib/api";
import {
  CheckoutCreateOrderInputSchema,
  OneCOrderRequest,
} from "@/lib/schemas/order";
import { AuthUserSchema, normalizePhone } from "@/lib/schemas/auth";
import { deriveOneCPassword } from "@/lib/sms/otp-store";

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.json();
    const parseResult = CheckoutCreateOrderInputSchema.safeParse(rawBody);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          error: "Buyurtma ma'lumotlarida xatolik!",
          details: parseResult.error.format(),
        },
        { status: 400 }
      );
    }

    const data = parseResult.data;

    // 1. Check logged-in session cookie
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("sora_session");
    let sessionUser: { id: string; name: string; type: "B2C" | "B2B" } | null = null;

    if (sessionCookie?.value) {
      try {
        const parsed = JSON.parse(sessionCookie.value);
        const validated = AuthUserSchema.safeParse(parsed);
        if (validated.success) {
          sessionUser = validated.data;
        }
      } catch {
        // Ignore session parse error
      }
    }

    const cleanPhone = normalizePhone(data.phone);
    const cleanAltPhone = data.altPhone ? normalizePhone(data.altPhone) : "";
    const isB2B = data.customerType === "B2B";

    // 2. Determine contact_id (КонтактноеЛицо GUID — required for B2C, optional for B2B)
    let contactId: string | undefined =
      sessionUser?.type === "B2C" && sessionUser.id
        ? sessionUser.id
        : undefined;

    if (!isB2B && !contactId) {
      // B2C guest order: get or create КонтактноеЛицо in 1C
      try {
        const regRes = await api.registerUser({
          type: "B2C",
          name: data.fullName,
          phone1: cleanPhone,
          phone2: cleanAltPhone,
          password: deriveOneCPassword(cleanPhone),
        });

        if (regRes.id) {
          contactId = regRes.id;
        }
      } catch {
        // Fallback to random UUID if 1C register has temporary hiccup
      }

      if (!contactId) {
        contactId = crypto.randomUUID();
      }
    }

    // 3. Determine client_id (Контрагент GUID — required for B2B)
    let clientId: string | undefined = undefined;

    if (isB2B) {
      if (sessionUser?.type === "B2B" && sessionUser.id) {
        clientId = sessionUser.id;
      } else if (data.companyInn) {
        const cleanInn = data.companyInn.replace(/\D/g, "");
        try {
          const regB2B = await api.registerUser({
            type: "B2B",
            name: data.companyName || data.fullName,
            inn: cleanInn,
            phone1: cleanPhone,
            password: deriveOneCPassword(cleanInn || cleanPhone),
          });
          if (regB2B.id) {
            clientId = regB2B.id;
          }
        } catch {
          // Fallback
        }
        if (!clientId) {
          clientId = crypto.randomUUID();
        }
      } else {
        clientId = crypto.randomUUID();
      }
    }

    // 4. Delivery and Geolocation formatting
    const withoutDelivery = data.deliveryMethod === "pickup";
    const resolvedGeolocation = withoutDelivery
      ? ""
      : (data.geolocation || "").trim().slice(0, 150);
    let comment = data.orderComment || "";

    if (!withoutDelivery) {
      const addressParts = [
        data.region,
        data.district,
        data.address,
        data.landmark ? `Mo'ljal: ${data.landmark}` : "",
      ]
        .filter(Boolean)
        .join(", ");

      if (addressParts) {
        comment = comment
          ? `Yetkazish manzili: ${addressParts}. Izoh: ${comment}`
          : `Yetkazish manzili: ${addressParts}`;
      }
    } else {
      comment = comment ? `Olib ketish (Samovyvoz). Izoh: ${comment}` : `Olib ketish (Samovyvoz)`;
    }

    // 5. Construct 1C order payload
    const oneCPayload: OneCOrderRequest = {
      type: isB2B ? "B2B" : "B2C",
      contact_id: contactId,
      client_id: isB2B ? clientId : undefined,
      without_delivery: withoutDelivery,
      geolocation: resolvedGeolocation,
      comment: comment.substring(0, 350),
      products: data.items.map((item) => ({
        product_id: item.id,
        quantity: item.quantity,
        price: item.price,
      })),
    };

    // 6. Send order to 1C ERP
    const orderResult = await api.createOrder(oneCPayload);

    if (orderResult.success && orderResult.data) {
      return NextResponse.json(
        {
          success: true,
          order_id: orderResult.data.order_id,
          order_number: orderResult.data.order_number,
          message: orderResult.data.message || "Buyurtma muvaffaqiyatli qabul qilindi",
          isFallback: !!orderResult.isFallback,
        },
        { status: 201 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: orderResult.error || "Buyurtmani qabul qilishda xatolik yuz berdi",
      },
      { status: orderResult.statusCode || 500 }
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
