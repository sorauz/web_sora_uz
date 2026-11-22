export type KpVatMode = "included" | "separate";

export interface KpCalculationInputItem {
  quantity: number;
  price: number;
}

export interface KpLineAmounts {
  quantity: number;
  unitPriceWithVat: number;
  unitPriceWithoutVat: number;
  lineTotalWithVat: number;
  lineNetWithoutVat: number;
  lineVatAmount: number;
  isNegotiable: boolean;
}

export interface KpTotalsSummary {
  lines: KpLineAmounts[];
  subtotalWithVat: number;
  subtotalWithoutVat: number;
  vatAmount: number;
  deliveryFee: number;
  grandTotal: number;
}

export interface KpRequisitesMeta {
  bankAccount?: string;
  bankMfo?: string;
  legalAddress?: string;
  extraComment?: string;
}

/**
 * Computes line-level and total VAT (12%) amounts cleanly for both
 * "included" (narx ichida) and "separate" (alohida ustunda) modes.
 * Items with price <= 0 are treated as negotiable ("Kelishiladi") and excluded from numeric totals.
 */
export function calculateKpTotals(
  items: KpCalculationInputItem[],
  options?: {
    freeDeliveryThreshold?: number;
    standardDeliveryFee?: number;
    includeDelivery?: boolean;
  }
): KpTotalsSummary {
  const freeThreshold = options?.freeDeliveryThreshold ?? 500_000;
  const standardFee = options?.standardDeliveryFee ?? 30_000;
  const includeDelivery = options?.includeDelivery ?? true;

  const lines: KpLineAmounts[] = items.map((item) => {
    const qty = Math.max(0, item.quantity);
    const price = Math.max(0, item.price);
    const isNegotiable = price === 0;
    const lineTotalWithVat = Math.round(qty * price * 100) / 100;
    const unitPriceWithoutVat = isNegotiable
      ? 0
      : Math.round((price / 1.12) * 100) / 100;
    const lineNetWithoutVat = isNegotiable
      ? 0
      : Math.round((lineTotalWithVat / 1.12) * 100) / 100;
    const lineVatAmount = isNegotiable
      ? 0
      : Math.round((lineTotalWithVat - lineNetWithoutVat) * 100) / 100;

    return {
      quantity: qty,
      unitPriceWithVat: price,
      unitPriceWithoutVat,
      lineTotalWithVat,
      lineNetWithoutVat,
      lineVatAmount,
      isNegotiable,
    };
  });

  const subtotalWithVat =
    Math.round(lines.reduce((acc, l) => acc + l.lineTotalWithVat, 0) * 100) / 100;
  const subtotalWithoutVat =
    Math.round((subtotalWithVat / 1.12) * 100) / 100;
  const vatAmount =
    Math.round((subtotalWithVat - subtotalWithoutVat) * 100) / 100;

  const deliveryFee =
    !includeDelivery || subtotalWithVat === 0 || subtotalWithVat >= freeThreshold
      ? 0
      : standardFee;

  const grandTotal = Math.round((subtotalWithVat + deliveryFee) * 100) / 100;

  return {
    lines,
    subtotalWithVat,
    subtotalWithoutVat,
    vatAmount,
    deliveryFee,
    grandTotal,
  };
}

/**
 * Formats KP requisites into a compact 1C comment string (<= 350 chars)
 * so bank details survive 1C storage alongside contact person info.
 */
export function formatKpOneCComment(params: {
  fullName: string;
  phone: string;
  bankAccount?: string;
  bankMfo?: string;
  legalAddress?: string;
}): string {
  const parts: string[] = [];
  const kpMeta: string[] = [];

  if (params.bankAccount?.trim()) {
    kpMeta.push(`H/R: ${params.bankAccount.trim()}`);
  }
  if (params.bankMfo?.trim()) {
    kpMeta.push(`MFO: ${params.bankMfo.trim()}`);
  }
  if (params.legalAddress?.trim()) {
    kpMeta.push(`Manzil: ${params.legalAddress.trim()}`);
  }

  parts.push("Tijorat taklifi (KP)");
  if (kpMeta.length > 0) {
    parts.push(`[KP ${kpMeta.join(" | ")}]`);
  }

  const contactInfo = [params.fullName.trim(), params.phone.trim()]
    .filter(Boolean)
    .join(", ");
  if (contactInfo) {
    parts.push(`Mas'ul: ${contactInfo}`);
  }

  return parts.join(" | ").slice(0, 350);
}

/**
 * Extracts KP bank requisites embedded inside a 1C order `comment` field.
 */
export function parseKpCommentMeta(comment?: string | null): KpRequisitesMeta {
  if (!comment) return {};
  const match = comment.match(/\[KP\s+([^\]]+)\]/i);
  if (!match || !match[1]) {
    return { extraComment: comment };
  }

  const result: KpRequisitesMeta = {};
  const segments = match[1].split("|").map((s) => s.trim());
  for (const seg of segments) {
    if (/^H\/R:/i.test(seg)) {
      result.bankAccount = seg.replace(/^H\/R:\s*/i, "").trim();
    } else if (/^MFO:/i.test(seg)) {
      result.bankMfo = seg.replace(/^MFO:\s*/i, "").trim();
    } else if (/^Manzil:/i.test(seg)) {
      result.legalAddress = seg.replace(/^Manzil:\s*/i, "").trim();
    }
  }
  return result;
}
