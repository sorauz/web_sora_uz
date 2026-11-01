import { z } from "zod";

/**
 * Baholash tizimining o'zgarmas doimiy standart chegaralari (1 dan 5 gacha).
 * 1C ERP dan bestRating / worstRating kelmasa ham, Next.js da doim 1 va 5 deb olinadi.
 */
export const DEFAULT_BEST_RATING = 5;
export const DEFAULT_WORST_RATING = 1;

/**
 * Zod schema for a single Product Review from 1C ERP (/SORA/hs/for_msp/review).
 * 1C endpointidan bestRating maydoni olib tashlangan bo'lsa ham,
 * schema uni ixtiyoriy (optional / nullish) qabul qiladi va xatolik bermaydi.
 */
export const ReviewSchema = z.object({
  time_of_comment: z.string().default(""),
  productId: z.string(),
  productName: z.string().default(""),
  datePublished: z.string().default(""),
  name_author: z.string().default("Foydalanuvchi"),
  permission_to_publish: z
    .union([z.boolean(), z.string()])
    .transform((val) => {
      if (typeof val === "boolean") return val;
      const lower = val.trim().toLowerCase();
      return (
        lower === "да" ||
        lower === "ha" ||
        lower === "yes" ||
        lower === "true" ||
        lower === "1"
      );
    })
    .default(true),
  ratingValue: z
    .number()
    .int()
    .min(DEFAULT_WORST_RATING)
    .max(DEFAULT_BEST_RATING)
    .default(DEFAULT_BEST_RATING),
  bestRating: z.number().int().nullish(),
  worstRating: z.number().int().nullish(),
  reviewBody: z.string().default(""),
  pic_url: z.string().optional().default(""),
});

export type Review = z.infer<typeof ReviewSchema>;

export const ReviewListResponseSchema = z.array(ReviewSchema);
export type ReviewListResponse = z.infer<typeof ReviewListResponseSchema>;

export interface ReviewStats {
  averageRating: number;
  reviewCount: number;
  distribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
  percentages: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
}
