import { z } from "zod";

/**
 * Zod schema for 1C Special Offers (promotions, low_price_guarantee, popular, new_products).
 */
export const OfferItemSchema = z.object({
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
});

export type OfferItem = z.infer<typeof OfferItemSchema>;

export const OfferListResponseSchema = z.array(OfferItemSchema);
export type OfferListResponse = z.infer<typeof OfferListResponseSchema>;

export type OfferCategoryKey =
  | "low_price_guarantee"
  | "new_products"
  | "popular"
  | "promotions";
