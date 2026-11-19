import { z } from "zod";

function normalizeRawOffer(val: unknown): unknown {
  if (!val || typeof val !== "object") return val;
  const obj = val as Record<string, unknown>;
  const hasCompactKeys =
    (obj.main_picture === undefined && obj.pic !== undefined) ||
    (obj.alt_picture_uz === undefined && obj.alt_uz !== undefined) ||
    (obj.alt_picture_ru === undefined && obj.alt_ru !== undefined);

  if (!hasCompactKeys) return obj;

  return {
    ...obj,
    ...(obj.main_picture === undefined && obj.pic !== undefined
      ? { main_picture: obj.pic }
      : {}),
    ...(obj.alt_picture_uz === undefined && obj.alt_uz !== undefined
      ? { alt_picture_uz: obj.alt_uz }
      : {}),
    ...(obj.alt_picture_ru === undefined && obj.alt_ru !== undefined
      ? { alt_picture_ru: obj.alt_ru }
      : {}),
  };
}

/**
 * Zod schema for 1C Special Offers (promotions, low_price_guarantee, popular, new_products).
 */
export const OfferItemSchema = z.preprocess(
  normalizeRawOffer,
  z.object({
    offer_name: z.string(),
    Offer_start_time: z.string(),
    Offer_end_time: z.string(),
    id: z.string(),
    slug_uz: z.string(),
    slug_ru: z.string(),
    name_ru: z.string(),
    name_uz: z.string(),
    alt_picture_uz: z.string().default(""),
    alt_picture_ru: z.string().default(""),
    main_picture: z.string().default(""),
    group_uz: z.string().default(""),
    group_ru: z.string().default(""),
    group_slug_uz: z.string().default(""),
    group_slug_ru: z.string().default(""),
    brand: z.string().default(""),
  })
);

export type OfferItem = z.infer<typeof OfferItemSchema>;

export const OfferListResponseSchema = z.array(OfferItemSchema);
export type OfferListResponse = z.infer<typeof OfferListResponseSchema>;

export type OfferCategoryKey =
  | "low_price_guarantee"
  | "new_products"
  | "popular"
  | "promotions";
