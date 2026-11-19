import type { CheckoutCreateOrderInput, OneCOrderRequest } from "@/lib/schemas/order";

/**
 * Formats the 1C order comment (max 350 chars).
 * For B2B orders, prepends the responsible person's name and phone number(s)
 * at the very start so contact info is always visible in 1C and never truncated.
 */
export function formatOneCOrderComment(
  data: Pick<
    CheckoutCreateOrderInput,
    | "customerType"
    | "fullName"
    | "deliveryMethod"
    | "region"
    | "district"
    | "address"
    | "landmark"
    | "orderComment"
  >,
  cleanPhone: string,
  cleanAltPhone = ""
): string {
  const withoutDelivery = data.deliveryMethod === "pickup";
  const parts: string[] = [];

  if (data.customerType === "B2B") {
    const contactName = data.fullName.trim();
    const phones = [cleanPhone, cleanAltPhone].filter(Boolean).join(" / ");
    const contactSegment = [contactName, phones].filter(Boolean).join(", ");
    if (contactSegment) {
      parts.push(`Aloqa: ${contactSegment}`);
    }
  }

  if (!withoutDelivery) {
    const addressParts = [
      data.region?.trim(),
      data.district?.trim(),
      data.address?.trim(),
      data.landmark?.trim() ? `Mo'ljal: ${data.landmark.trim()}` : "",
    ]
      .filter(Boolean)
      .join(", ");

    if (addressParts) {
      parts.push(`Yetkazish manzili: ${addressParts}`);
    }
  } else {
    parts.push("Olib ketish (Samovyvoz)");
  }

  const userComment = data.orderComment?.trim();
  if (userComment) {
    parts.push(`Izoh: ${userComment}`);
  }

  return parts.join(". ").slice(0, 350);
}

/**
 * Builds the 1C ERP `POST /order` payload for both B2C and B2B customers.
 * Ensures B2B orders carry both `client_id` (Контрагент) and `contact_id` (КонтактноеЛицо)
 * whenever available so phone numbers are preserved in 1C.
 */
export function buildOneCOrderPayload(params: {
  data: CheckoutCreateOrderInput;
  contactId?: string;
  clientId?: string;
  cleanPhone: string;
  cleanAltPhone?: string;
}): OneCOrderRequest {
  const { data, contactId, clientId, cleanPhone, cleanAltPhone = "" } = params;
  const isB2B = data.customerType === "B2B";
  const withoutDelivery = data.deliveryMethod === "pickup";
  const resolvedGeolocation = withoutDelivery
    ? ""
    : (data.geolocation || "").trim().slice(0, 150);

  return {
    type: isB2B ? "B2B" : "B2C",
    ...(contactId ? { contact_id: contactId } : {}),
    ...(isB2B && clientId ? { client_id: clientId } : {}),
    without_delivery: withoutDelivery,
    geolocation: resolvedGeolocation,
    comment: formatOneCOrderComment(data, cleanPhone, cleanAltPhone),
    products: data.items.map((item) => ({
      product_id: item.id,
      quantity: item.quantity,
      price: item.price,
    })),
  };
}
