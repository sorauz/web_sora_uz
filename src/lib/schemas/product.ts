import { z } from "zod";
import { ProductPriceStockSchema } from "./price";

export const ProductAttributeSchema = z.object({
  property_uz: z.string(),
  property_ru: z.string(),
  value_uz: z.string(),
  value_ru: z.string(),
});

export type ProductAttribute = z.infer<typeof ProductAttributeSchema>;

export const SubProductCardSchema = z.object({
  id: z.string().optional(),
  slug: z.string().optional(),
  name: z.string().optional(),
  title: z.string().optional(),
  short_description: z.string().optional(),
  alt_picture: z.string().optional(),
  picture: z.string().optional(),
});

export type SubProductCard = z.infer<typeof SubProductCardSchema>;

export const ProductLocalizedUzSchema = z.object({
  unit_uz: z.string().default("dona"),
  category_uz: z.string(),
  category_slug_uz: z.string(),
  alt_picture_uz: z.string().default(""),
  name_uz: z.string(),
  slug_uz: z.string(),
  title_uz: z.string(),
  meta_description_uz: z.string(),
  short_description_uz: z.string(),
  product_description_uz: z.string(),
});

export const ProductLocalizedRuSchema = z.object({
  unit_ru: z.string().default("шт"),
  category_ru: z.string(),
  category_slug_ru: z.string(),
  alt_picture_ru: z.string().default(""),
  name_ru: z.string(),
  slug_ru: z.string(),
  title_ru: z.string(),
  meta_description_ru: z.string(),
  short_description_ru: z.string(),
  product_description_ru: z.string(),
});

export const ProductSchema = z.object({
  id: z.string(),
  product_sku: z.string(),
  package: z.string().default(""),
  barcode: z.string().default(""),
  brand: z.string(),
  manufacturer: z.string(),
  country: z.string(),
  video_url: z.string().optional().default(""),
  main_picture: z.string(),
  updated_at: z.string().optional().default(""),
  uz: ProductLocalizedUzSchema,
  ru: ProductLocalizedRuSchema,
  attributes: z.array(ProductAttributeSchema).default([]),
  related_products: z.array(SubProductCardSchema).default([]),
  recommended_products: z.array(SubProductCardSchema).default([]),
  // Optionally populated from Price API
  price: ProductPriceStockSchema.optional(),
});

export type Product = z.infer<typeof ProductSchema>;

export const AllProductsResponseSchema = z.array(ProductSchema);
export type AllProductsResponse = z.infer<typeof AllProductsResponseSchema>;
