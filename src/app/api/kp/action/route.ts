import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { api } from "@/lib/api";
import { getSessionUser } from "@/lib/auth/session";
import { normalizePhone } from "@/lib/schemas/auth";
import { KpActionInputSchema } from "@/lib/schemas/order";
import { verifyPhoneToken } from "@/lib/sms/otp-store";
import {
  checkAndRecordKpIpRateLimit,
  getRequestClientIp,
} from "@/lib/kp/rate-limit";
import { verifyKpPublicToken } from "@/lib/kp/token";

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
    const parsed = KpActionInputSchema.safeParse(rawBody);
    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error:
            parsed.error.issues[0]?.message ||
            "So'rov parametrlarida xatolik!",
        },
        { status: 400, headers: KP_SECURITY_HEADERS }
      );
    }

    const data = parsed.data;
    const cookieStore = await cookies();
    const sessionUser = await getSessionUser(cookieStore);
    const tokenPayload = data.publicToken
      ? verifyKpPublicToken(data.publicToken)
      : null;

    let ownerType: "B2B" | "B2C" | null = null;
    let clientId: string | undefined;
    let contactId: string | undefined;
    let verifiedActorPhone = sessionUser?.phone || "";

    if (sessionUser && sessionUser.id) {
      // Authenticated user from /orders or matching B2B session on /kp/[token]
      if (tokenPayload && tokenPayload.orderId !== data.orderId) {
        return NextResponse.json(
          { success: false, error: "QR-token ushbu hujjatga mos emas!" },
          { status: 403, headers: KP_SECURITY_HEADERS }
        );
      }

      if (
        !tokenPayload ||
        (sessionUser.type === "B2B" && sessionUser.id === tokenPayload.clientId)
      ) {
        ownerType = sessionUser.type;
        if (sessionUser.type === "B2B") {
          clientId = sessionUser.id;
        } else {
          contactId = sessionUser.id;
        }
      }
    }

    // Public QR page conversion gate: require verified SMS OTP token if no matching B2B session
    if (!ownerType && tokenPayload && tokenPayload.orderId === data.orderId) {
      const otpPayload = data.verifiedPhoneToken
        ? verifyPhoneToken(data.verifiedPhoneToken)
        : null;

      const phoneMatchesOtp =
        !!otpPayload &&
        (!data.verifiedPhone ||
          normalizePhone(otpPayload.phone) ===
            normalizePhone(data.verifiedPhone));

      if (!phoneMatchesOtp || !otpPayload) {
        return NextResponse.json(
          {
            success: false,
            code: "PHONE_VERIFICATION_REQUIRED",
            error:
              "Xaridni tasdiqlash uchun telefon raqamingizni SMS kod orqali tasdiqlang!",
          },
          { status: 401, headers: KP_SECURITY_HEADERS }
        );
      }

      ownerType = "B2B";
      clientId = tokenPayload.clientId;
      verifiedActorPhone = normalizePhone(otpPayload.phone);
    }

    if (!ownerType || (!clientId && !contactId)) {
      return NextResponse.json(
        {
          success: false,
          code: "AUTH_REQUIRED",
          error: "Ushbu amalni bajarish uchun tizimga kiring!",
        },
        { status: 401, headers: KP_SECURITY_HEADERS }
      );
    }

    let finalComment = data.comment?.trim();
    if (data.action === "CONVERT_TO_ORDER") {
      const actorNote = verifiedActorPhone
        ? `Tasdiqlagan: ${verifiedActorPhone}`
        : "";
      if (finalComment && actorNote) {
        finalComment = `${actorNote}. ${finalComment}`.slice(0, 350);
      } else if (!finalComment && actorNote) {
        finalComment = actorNote;
      }
    }

    const actionRes = await api.performOrderAction({
      order_id: data.orderId,
      type: ownerType,
      client_id: clientId,
      contact_id: contactId,
      action: data.action,
      without_delivery: data.withoutDelivery,
      geolocation: data.geolocation,
      comment: finalComment,
    });

    if (actionRes.success && actionRes.data) {
      return NextResponse.json(
        {
          success: true,
          ...actionRes.data,
        },
        { status: 200, headers: KP_SECURITY_HEADERS }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: actionRes.error || "Amalni bajarib bo'lmadi",
      },
      {
        status: actionRes.statusCode || 500,
        headers: KP_SECURITY_HEADERS,
      }
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
