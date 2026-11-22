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
import { verifyPhoneToken } from "@/lib/sms/otp-store";
import { resolveOneCCustomerIds } from "@/lib/auth/resolve-1c-customer";
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

    // 2. Resolve contact_id & client_id from verified session or 1C /register
    const { contactId, clientId } = await resolveOneCCustomerIds({
      sessionUser,
      isB2B,
      fullName: data.fullName,
      cleanPhone,
      cleanAltPhone,
      companyName: data.companyName,
      cleanInn,
    });

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
      // Persist or switch 30-day HMAC session cookie when guest verifies via OTP,
      // or when an existing user verifies a new phone number / switches B2C<->B2B account.
      let resolvedSessionUser: AuthUser | null = sessionUser;
      const targetType: "B2C" | "B2B" = isB2B ? "B2B" : "B2C";
      const primaryId = isB2B ? clientId : contactId;

      const phoneChangedOrNewSession =
        tokenPhoneVerified &&
        (!sessionUser ||
          !sessionUser.phone ||
          normalizePhone(sessionUser.phone) !== cleanPhone);
      const accountIdentityChanged =
        Boolean(primaryId) &&
        (!sessionUser ||
          sessionUser.id !== primaryId ||
          sessionUser.type !== targetType);

      if (primaryId && (phoneChangedOrNewSession || accountIdentityChanged)) {
        const updatedSessionUser: AuthUser = {
          id: primaryId,
          name: isB2B
            ? (data.companyName || data.fullName).trim()
            : data.fullName.trim(),
          type: targetType,
          phone: cleanPhone,
          inn: isB2B && cleanInn ? cleanInn : undefined,
        };
        await setSessionCookie(updatedSessionUser, cookieStore);
        resolvedSessionUser = updatedSessionUser;
      }

      const ownerId = isB2B ? clientId : contactId;
      if (ownerId) {
        await setRecentOrderAccessCookie(
          {
            orderId: orderResult.data.order_id,
            type: targetType,
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
          ...(resolvedSessionUser ? { session_user: resolvedSessionUser } : {}),
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
