import { z } from "zod";

/**
 * Biriktirish turi (scope): FAQ savol-javoblarining qaysi turdagi sahifalarga tegishliligi.
 * faq_api.txt spetsifikatsiyasi bo'yicha qat'iy enum.
 */
export const FaqScopeSchema = z.enum(["page", "category", "product", "brand"]);
export type FaqScope = z.infer<typeof FaqScopeSchema>;

/**
 * FAQ mavzu kodi (topic).
 * faq_api.txt spetsifikatsiyasi bo'yicha qat'iy enum.
 */
export const FaqTopicSchema = z.enum([
  "delivery",
  "order",
  "payment",
  "b2b",
  "warranty",
  "product_info",
  "usage",
]);
export type FaqTopic = z.infer<typeof FaqTopicSchema>;

/**
 * TargetItem obyekti: savolning qaysi sahifa, kategoriya, mahsulot yoki brendda ko'rinishini belgilaydi.
 * include_children maydoni kelmasa avtomatik false deb qabul qilinadi.
 */
export const FaqTargetSchema = z.object({
  scope: FaqScopeSchema,
  ref: z.string().min(1),
  include_children: z.boolean().default(false),
});
export type FaqTarget = z.infer<typeof FaqTargetSchema>;

/**
 * FAQItem obyekti (1C ERP Справочник.web_faq elementi).
 */
export const FaqItemSchema = z.object({
  id: z.string().min(1),
  is_active: z.boolean().default(true),
  sort_order: z.number().default(100),
  topic: FaqTopicSchema,
  question_uz: z.string().default(""),
  question_ru: z.string().default(""),
  answer_uz: z.string().default(""),
  answer_ru: z.string().default(""),
  targets: z.array(FaqTargetSchema).min(1),
  updated_at: z.string().default(""),
});
export type FaqItem = z.infer<typeof FaqItemSchema>;

/**
 * GET /faq javobining ildiz (Root) sxemasi.
 */
export const FaqResponseSchema = z.object({
  updated_at: z.string().default(""),
  count: z.number().int().nonnegative().default(0),
  faqs: z.array(FaqItemSchema).default([]),
});
export type FaqResponse = z.infer<typeof FaqResponseSchema>;
