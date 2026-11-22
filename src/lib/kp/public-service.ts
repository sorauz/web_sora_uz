import "server-only";
import { api } from "@/lib/api";
import { parseKpCommentMeta } from "@/lib/kp/calculations";
import { verifyKpPublicToken } from "@/lib/kp/token";
import type {
  OneCOrderProductLine,
  OneCOrderTimelineStep,
} from "@/lib/schemas/order";
import {
  normalizeOrderStatus,
  type NormalizedOrderStatus,
} from "@/lib/utils/order-status";

export interface SanitizedPublicKp {
  order_id: string;
  order_number: string;
  order_date: string | null;
  is_kp: boolean;
  kp_valid_until: string | null;
  status_code: NormalizedOrderStatus;
  status: string;
  total_amount: number;
  without_delivery: boolean;
  client_id: string;
  customer: {
    type: string;
    client_name: string | null;
    client_inn: string | null;
  };
  requisites: {
    bankAccount: string | null;
    bankMfo: string | null;
    legalAddress: string | null;
  };
  products: OneCOrderProductLine[];
  timeline: OneCOrderTimelineStep[];
}

export async function fetchSanitizedPublicKp(token: string): Promise<
  | { success: true; kp: SanitizedPublicKp }
  | { success: false; statusCode: number; error: string }
> {
  const verified = verifyKpPublicToken(token);
  if (!verified) {
    return {
      success: false,
      statusCode: 400,
      error: "QR-kod havolasi noto'g'ri yoki muddati buzilgan!",
    };
  }

  const detailRes = await api.getOrderDetail({
    orderId: verified.orderId,
    type: "B2B",
    clientId: verified.clientId,
  });

  if (!detailRes.success || !detailRes.data) {
    return {
      success: false,
      statusCode: detailRes.statusCode || 500,
      error: detailRes.error || "Tijorat taklifi 1C bazasida topilmadi!",
    };
  }

  const doc = detailRes.data;
  const normalizedStatus = normalizeOrderStatus({
    statusCode: doc.status_code,
    statusText: doc.status,
    posted: doc.posted,
    withoutDelivery: doc.delivery.without_delivery,
    isKp: doc.is_kp,
  });

  const requisites = parseKpCommentMeta(doc.comment);

  return {
    success: true,
    kp: {
      order_id: doc.order_id,
      order_number: doc.order_number,
      order_date: doc.order_date,
      is_kp: doc.is_kp,
      kp_valid_until: doc.kp_valid_until,
      status_code: normalizedStatus,
      status: doc.status,
      total_amount: doc.total_amount,
      without_delivery: doc.delivery.without_delivery,
      client_id: doc.customer?.client_id || verified.clientId,
      customer: {
        type: doc.customer?.type || "B2B",
        client_name: doc.customer?.client_name || null,
        client_inn: doc.customer?.client_inn || null,
      },
      requisites: {
        bankAccount: requisites.bankAccount || null,
        bankMfo: requisites.bankMfo || null,
        legalAddress: requisites.legalAddress || null,
      },
      products: doc.products,
      timeline: doc.is_kp ? [] : doc.timeline,
    },
  };
}
