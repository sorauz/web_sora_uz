import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { api } from "@/lib/api";
import {
  getSessionUser,
  setRecentOrderAccessCookie,
  setSessionCookie,
} from "@/lib/auth/session";
import { CheckoutCreateOrderInputSchema } from "@/lib/schemas/order";
import { AuthUser, normalizePhone } from "@/lib/schemas/auth";
import { deriveOneCPassword, verifyPhoneToken } from "@/lib/sms/otp-store";
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

    // 1. Check HMAC-verified logged-in session cookie
    const cookieStore = await cookies();
    const sessionUser: AuthUser | null = await getSessionUser(cookieStore);

    const cleanPhone = normalizePhone(data.phone);
    const cleanAltPhone = data.altPhone ? normalizePhone(data.altPhone) : "";
    const isB2B = data.customerType === "B2B";
    const cleanInn = (data.companyInn || "").replace(/\D/g, "");

    // 1.5. Strict SMS OTP Verification Gate (required for BOTH B2C and B2B)
    const sessionPhoneVerified =
      !!sessionUser?.phone && normalizePhone(sessionUser.phone) === cleanPhone;

    const otpTokenPayload = data.verifiedPhoneToken
      ? verifyPhoneToken(data.verifiedPhoneToken)
      : null;
    const tokenPhoneVerified =
      !!otpTokenPayload && normalizePhone(otpTokenPayload.phone) === cleanPhone;

    if (!sessionPhoneVerified && !tokenPhoneVerified) {
      return NextResponse.json(
        {
          success: false,
          code: "PHONE_VERIFICATION_REQUIRED",
          error:
            "Buyurtmani rasmiylashtirish uchun telefon raqamingizni SMS kod orqali tasdiqlang!",
        },
        { status: 401 }
      );
    }

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

      // Do NOT send synthetic crypto.randomUUID() — 1C rejects unknown GUIDs with 404.
      // For B2C this triggers 503 retry below; for B2B contact_id is optional in 1C.
      return undefined;
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
          // Handled cleanly as 503 below instead of synthetic UUID
        }
      }

      return undefined;
    };

    const [contactId, clientId] = await Promise.all([
      resolveContactId(),
      resolveClientId(),
    ]);

    if ((!isB2B && !contactId) || (isB2B && !clientId)) {
      return NextResponse.json(
        {
          success: false,
          retryable: true,
          error:
            "1C tizimida mijoz hisobini tasdiqlab bo'lmadi. Iltimos, birozdan so'ng qayta urinib ko'ring.",
        },
        { status: 503 }
      );
    }

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
      // If user verified phone via Checkout OTP without an existing session, persist session cookie
      if (!sessionUser && tokenPhoneVerified) {
        const primaryId = isB2B ? clientId : contactId;
        if (primaryId) {
          const newSessionUser: AuthUser = {
            id: primaryId,
            name: isB2B
              ? (data.companyName || data.fullName).trim()
              : data.fullName.trim(),
            type: isB2B ? "B2B" : "B2C",
            phone: cleanPhone,
            inn: isB2B && cleanInn ? cleanInn : undefined,
          };
          await setSessionCookie(newSessionUser, cookieStore);
        }
      }

      const ownerId = isB2B ? clientId : contactId;
      if (ownerId) {
        await setRecentOrderAccessCookie(
          {
            orderId: orderResult.data.order_id,
            type: isB2B ? "B2B" : "B2C",
            ownerId,
          },
          cookieStore
        );
      }

      const posted = orderResult.data.posted ?? true;
      const statusCode =
        orderResult.data.status_code || (posted ? "CONFIRMED" : "PENDING");
      const statusText =
        orderResult.data.status ||
        (posted ? "Qabul qilindi / Tasdiqlandi" : "Tekshirilmoqda");
      const defaultMessage = posted
        ? "Buyurtma muvaffaqiyatli qabul qilindi"
        : "Buyurtma qabul qilindi va menejer tekshiruviga yuborildi";

      return NextResponse.json(
        {
          success: true,
          order_id: orderResult.data.order_id,
          order_number: orderResult.data.order_number,
          message: orderResult.data.message || defaultMessage,
          status_code: statusCode,
          status: statusText,
          posted,
          total_amount: orderResult.data.total_amount,
        },
        { status: 201 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        retryable: Boolean(orderResult.retryable),
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
