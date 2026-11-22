import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { api } from "@/lib/api";
import { getSessionUser, setSessionCookie } from "@/lib/auth/session";
import { resolveOneCCustomerIds } from "@/lib/auth/resolve-1c-customer";
import { AuthUser, normalizePhone } from "@/lib/schemas/auth";
import { KpCreateInputSchema } from "@/lib/schemas/order";
import { verifyPhoneToken } from "@/lib/sms/otp-store";
import { formatKpOneCComment } from "@/lib/kp/calculations";
import {
  checkAndRecordKpIpRateLimit,
  getRequestClientIp,
} from "@/lib/kp/rate-limit";
import { encodeKpPublicToken } from "@/lib/kp/token";
import { SORA_COMPANY_INFO } from "@/lib/config/company";

const KP_SECURITY_HEADERS = {
  "X-Robots-Tag": "noindex, nofollow",
  "Cache-Control": "no-store",
};

export async function POST(req: NextRequest) {
  try {
    const clientIp = getRequestClientIp(req);
    const rateCheck = checkAndRecordKpIpRateLimit(clientIp);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Juda ko'p so'rov yuborildi. Iltimos, birozdan so'ng qayta urinib ko'ring.",
        },
        {
          status: 429,
          headers: {
            ...KP_SECURITY_HEADERS,
            "Retry-After": String(rateCheck.retryAfterSeconds ?? 60),
          },
        }
      );
    }

    const rawBody = await req.json();
    const parseResult = KpCreateInputSchema.safeParse(rawBody);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          error:
            parseResult.error.issues[0]?.message ||
            "Tijorat taklifi ma'lumotlarida xatolik!",
          details: parseResult.error.format(),
        },
        { status: 400, headers: KP_SECURITY_HEADERS }
      );
    }

    const data = parseResult.data;
    const cookieStore = await cookies();
    const sessionUser: AuthUser | null = await getSessionUser(cookieStore);

    const cleanPhone = normalizePhone(data.phone);
    const cleanInn = data.companyInn;

    // Strict SMS OTP / B2B Session Verification Gate
    const sessionPhoneVerified =
      !!sessionUser?.phone && normalizePhone(sessionUser.phone) === cleanPhone;

    const otpPayload = data.verifiedPhoneToken
      ? verifyPhoneToken(data.verifiedPhoneToken)
      : null;
    const tokenPhoneVerified =
      !!otpPayload && normalizePhone(otpPayload.phone) === cleanPhone;

    if (!sessionPhoneVerified && !tokenPhoneVerified) {
      return NextResponse.json(
        {
          success: false,
          code: "PHONE_VERIFICATION_REQUIRED",
          error:
            "Tijorat taklifi yaratish uchun telefon raqamingizni SMS kod orqali tasdiqlang!",
        },
        { status: 401, headers: KP_SECURITY_HEADERS }
      );
    }

    // Resolve B2B client_id and optional contact_id in 1C ERP
    const { contactId, clientId } = await resolveOneCCustomerIds({
      sessionUser,
      isB2B: true,
      fullName: data.fullName,
      cleanPhone,
      companyName: data.companyName,
      cleanInn,
    });

    if (!clientId) {
      return NextResponse.json(
        {
          success: false,
          retryable: true,
          error:
            "1C tizimida tashkilot hisobini tasdiqlab bo'lmadi. Iltimos, birozdan so'ng qayta urinib ko'ring.",
        },
        { status: 503, headers: KP_SECURITY_HEADERS }
      );
    }

    // Compute default +5 days validity ISO date (YYYY-MM-DD)
    const validDate = new Date();
    validDate.setDate(validDate.getDate() + SORA_COMPANY_INFO.kpDefaultValidDays);
    const validUntilIsoDate = validDate.toISOString().slice(0, 10);

    const comment = formatKpOneCComment({
      fullName: data.fullName,
      phone: cleanPhone,
      bankAccount: data.bankAccount,
      bankMfo: data.bankMfo,
      legalAddress: data.legalAddress,
    });

    const kpResult = await api.createOrder({
      type: "B2B",
      client_id: clientId,
      ...(contactId ? { contact_id: contactId } : {}),
      is_kp: true,
      kp_valid_until: validUntilIsoDate,
      without_delivery: true,
      geolocation: "",
      comment,
      products: data.items.map((item) => ({
        product_id: item.id,
        quantity: item.quantity,
        price: item.price,
      })),
    });

    if (!kpResult.success || !kpResult.data) {
      return NextResponse.json(
        {
          success: false,
          retryable: Boolean(kpResult.retryable),
          error:
            kpResult.error ||
            "1C tizimida tijorat taklifini yaratib bo'lmadi",
        },
        { status: kpResult.statusCode || 500, headers: KP_SECURITY_HEADERS }
      );
    }

    // Cancel previous KP only AFTER the new KP was created successfully
    const editingId = data.editingKpOrderId?.trim();
    if (editingId && editingId !== kpResult.data.order_id) {
      await api
        .performOrderAction({
          order_id: editingId,
          type: "B2B",
          client_id: clientId,
          action: "CANCEL_KP",
        })
        .catch(() => null);
    }

    // Persist 30-day B2B session cookie so subsequent KP generations are frictionless
    const updatedSessionUser: AuthUser = {
      id: clientId,
      name: data.companyName.trim(),
      type: "B2B",
      phone: cleanPhone,
      inn: cleanInn,
    };
    const shouldRefreshSession =
      !sessionUser ||
      sessionUser.type !== "B2B" ||
      sessionUser.id !== clientId ||
      !sessionUser.phone ||
      normalizePhone(sessionUser.phone) !== cleanPhone;

    if (shouldRefreshSession) {
      await setSessionCookie(updatedSessionUser, cookieStore);
    }

    const publicToken = encodeKpPublicToken({
      orderId: kpResult.data.order_id,
      clientId,
    });

    const kpValidUntil =
      kpResult.data.kp_valid_until || `${validUntilIsoDate}T23:59:59`;

    return NextResponse.json(
      {
        success: true,
        order_id: kpResult.data.order_id,
        order_number: kpResult.data.order_number,
        status_code: "KP_ACTIVE",
        is_kp: true,
        kp_valid_until: kpValidUntil,
        total_amount: kpResult.data.total_amount,
        public_token: publicToken,
        public_path: `/${data.docLocale}/kp/${publicToken}`,
        session_user: shouldRefreshSession ? updatedSessionUser : sessionUser,
      },
      { status: 201, headers: KP_SECURITY_HEADERS }
    );
  } catch (err) {
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : "Ichki server xatoligi",
      },
      { status: 500, headers: KP_SECURITY_HEADERS }
    );
  }
}
