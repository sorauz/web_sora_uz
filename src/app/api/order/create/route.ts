import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { api } from "@/lib/api";
import { CheckoutCreateOrderInputSchema } from "@/lib/schemas/order";
import { AuthUser, AuthUserSchema, normalizePhone } from "@/lib/schemas/auth";
import { deriveOneCPassword } from "@/lib/sms/otp-store";
import { buildOneCOrderPayload } from "@/lib/utils/order-payload";

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
    let sessionUser: AuthUser | null = null;

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
    const cleanInn = (data.companyInn || "").replace(/\D/g, "");

    // 2. Resolve contact_id (КонтактноеЛицо GUID) for BOTH B2C and B2B orders
    // so 1C always receives the responsible person's phone record on the order.
    const resolveContactId = async (): Promise<string | undefined> => {
      const sessionPhoneMatches =
        sessionUser?.type === "B2C" &&
        !!sessionUser.id &&
        (!sessionUser.phone || normalizePhone(sessionUser.phone) === cleanPhone);

      if (sessionPhoneMatches && sessionUser?.id) {
        return sessionUser.id;
      }

      try {
        const regRes = await api.registerUser({
          type: "B2C",
          name: data.fullName.trim(),
          phone1: cleanPhone,
          phone2: cleanAltPhone,
          password: deriveOneCPassword(cleanPhone),
        });

        if (regRes.id) {
          return regRes.id;
        }
      } catch {
        // Temporary 1C /register hiccup handled below
      }

      // B2C requires contact_id; for B2B omit synthetic UUID so 1C won't reject with 404
      return isB2B ? undefined : crypto.randomUUID();
    };

    // 3. Resolve client_id (Контрагент GUID — required for B2B)
    const resolveClientId = async (): Promise<string | undefined> => {
      if (!isB2B) return undefined;

      const sessionInnMatches =
        sessionUser?.type === "B2B" &&
        !!sessionUser.id &&
        (!cleanInn ||
          !sessionUser.inn ||
          sessionUser.inn.replace(/\D/g, "") === cleanInn);

      if (sessionInnMatches && sessionUser?.id) {
        return sessionUser.id;
      }

      if (cleanInn) {
        try {
          const regB2B = await api.registerUser({
            type: "B2B",
            name: (data.companyName || data.fullName).trim(),
            inn: cleanInn,
            phone1: cleanPhone,
            password: deriveOneCPassword(cleanInn || cleanPhone),
          });
          if (regB2B.id) {
            return regB2B.id;
          }
        } catch {
          // Fallback below
        }
      }

      return crypto.randomUUID();
    };

    const [contactId, clientId] = await Promise.all([
      resolveContactId(),
      resolveClientId(),
    ]);

    // 4. Construct 1C order payload (includes contact_id + phone in B2B comment)
    const oneCPayload = buildOneCOrderPayload({
      data,
      contactId,
      clientId,
      cleanPhone,
      cleanAltPhone,
    });

    // 5. Send order to 1C ERP
    const orderResult = await api.createOrder(oneCPayload);

    if (orderResult.success && orderResult.data) {
      return NextResponse.json(
        {
          success: true,
          order_id: orderResult.data.order_id,
          order_number: orderResult.data.order_number,
          message:
            orderResult.data.message || "Buyurtma muvaffaqiyatli qabul qilindi",
          isFallback: !!orderResult.isFallback,
        },
        { status: 201 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error:
          orderResult.error || "Buyurtmani qabul qilishda xatolik yuz berdi",
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
