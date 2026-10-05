import { z } from "zod";

/**
 * Zod schema for a single Product Review from 1C ERP (/SORA/hs/for_msp/review).
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
  ratingValue: z.number().int().min(1).max(5).default(5),
  bestRating: z.number().int().default(5),
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
