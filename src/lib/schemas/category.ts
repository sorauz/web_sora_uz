import { z } from "zod";

export const CategorySchema = z.object({
  id: z.string(),
  group_uz: z.string(),
  group_ru: z.string(),
  group_slug_uz: z.string(),
  group_slug_ru: z.string(),
  parent_id: z.string().default(""),
  parent_name_uz: z.string().optional(),
  parent_name_ru: z.string().optional(),
});

export type Category = z.infer<typeof CategorySchema>;

export const CategoriesResponseSchema = z.object({
  categories: z.array(CategorySchema),
});

export type CategoriesResponse = z.infer<typeof CategoriesResponseSchema>;

export interface CategoryTreeNode extends Category {
  children: CategoryTreeNode[];
}
