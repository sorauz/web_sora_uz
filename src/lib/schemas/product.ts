import { z } from "zod";
import { ProductPriceStockSchema, ProductPriceStock } from "./price";

export const ProductAttributeSchema = z.object({
  property_uz: z.string().default(""),
  property_ru: z.string().default(""),
  value_uz: z.string().default(""),
  value_ru: z.string().default(""),
});

export type ProductAttribute = z.infer<typeof ProductAttributeSchema>;

export const SubProductCardSchema = z.object({
  id: z.string().optional(),
  related_products_id: z.string().optional(),
  recommended_products_id: z.string().optional(),
  slug: z.string().optional(),
  slug_uz: z.string().optional(),
  slug_ru: z.string().optional(),
  name: z.string().optional(),
  name_uz: z.string().optional(),
  name_ru: z.string().optional(),
  title: z.string().optional(),
  title_uz: z.string().optional(),
  title_ru: z.string().optional(),
  short_description: z.string().optional(),
  short_description_uz: z.string().optional(),
  short_description_ru: z.string().optional(),
  alt_picture: z.string().optional(),
  alt_picture_uz: z.string().optional(),
  alt_picture_ru: z.string().optional(),
  picture: z.string().optional(),
});

export type SubProductCard = z.infer<typeof SubProductCardSchema>;

function normalizeLocalizedUz(val: unknown): unknown {
  if (!val || typeof val !== "object") return val;
  const obj = val as Record<string, unknown>;
  if (obj.alt_picture_uz === undefined && obj.alt_uz !== undefined) {
    return { ...obj, alt_picture_uz: obj.alt_uz };
  }
  return obj;
}

function normalizeLocalizedRu(val: unknown): unknown {
  if (!val || typeof val !== "object") return val;
  const obj = val as Record<string, unknown>;
  if (obj.alt_picture_ru === undefined && obj.alt_ru !== undefined) {
    return { ...obj, alt_picture_ru: obj.alt_ru };
  }
  return obj;
}

function normalizeRawProduct(val: unknown): unknown {
  if (!val || typeof val !== "object") return val;
  const obj = val as Record<string, unknown>;
  const hasCompactKeys =
    (obj.product_sku === undefined && obj.sku !== undefined) ||
    (obj.main_picture === undefined && obj.pic !== undefined) ||
    (obj.updated_at === undefined && obj.up_date !== undefined);

  if (!hasCompactKeys) return obj;

  return {
    ...obj,
    ...(obj.product_sku === undefined && obj.sku !== undefined
      ? { product_sku: obj.sku }
      : {}),
    ...(obj.main_picture === undefined && obj.pic !== undefined
      ? { main_picture: obj.pic }
      : {}),
    ...(obj.updated_at === undefined && obj.up_date !== undefined
      ? { updated_at: obj.up_date }
      : {}),
  };
}

export const ProductLocalizedUzSchema = z.preprocess(
  normalizeLocalizedUz,
  z.object({
    unit_uz: z.string().default("dona"),
    category_uz: z.string().default(""),
    category_slug_uz: z.string().default(""),
    alt_picture_uz: z.string().default(""),
    name_uz: z.string().default(""),
    slug_uz: z.string().default(""),
    title_uz: z.string().default(""),
    meta_description_uz: z.string().default(""),
    short_description_uz: z.string().default(""),
    product_description_uz: z.string().optional().default(""),
  })
);

export const ProductLocalizedRuSchema = z.preprocess(
  normalizeLocalizedRu,
  z.object({
    unit_ru: z.string().default("шт"),
    category_ru: z.string().default(""),
    category_slug_ru: z.string().default(""),
    alt_picture_ru: z.string().default(""),
    name_ru: z.string().default(""),
    slug_ru: z.string().default(""),
    title_ru: z.string().default(""),
    meta_description_ru: z.string().default(""),
    short_description_ru: z.string().default(""),
    product_description_ru: z.string().optional().default(""),
  })
);

export const ProductSchema = z.preprocess(
  normalizeRawProduct,
  z.object({
    id: z.string(),
    product_sku: z.string().default(""),
    package: z.string().default(""),
    barcode: z.string().default(""),
    brand: z.string().default(""),
    manufacturer: z.string().default(""),
    country: z.string().default(""),
    video_url: z.string().optional().default(""),
    main_picture: z.string().default(""),
    gallery: z.array(z.string()).optional(),
    updated_at: z.string().optional().default(""),
    uz: ProductLocalizedUzSchema,
    ru: ProductLocalizedRuSchema,
    attributes: z.array(ProductAttributeSchema).optional().default([]),
    related_products: z.array(SubProductCardSchema).optional().default([]),
    recommended_products: z.array(SubProductCardSchema).optional().default([]),
    // Optionally populated from Price API or raw product endpoint
    price: z
      .union([ProductPriceStockSchema, z.string(), z.number()])
      .optional()
      .transform((val) => {
        if (val && typeof val === "object" && "retail_price" in val) {
          return val as ProductPriceStock;
        }
        return undefined;
      }),
  })
);

export type Product = z.infer<typeof ProductSchema>;

export const AllProductsResponseSchema = z.array(ProductSchema);
export type AllProductsResponse = z.infer<typeof AllProductsResponseSchema>;

export interface LocalizedProductData {
  name: string;
  slug: string;
  category: string;
  category_slug: string;
  alt_picture: string;
  title: string;
  meta_description: string;
  short_description: string;
  product_description: string;
  unit: string;
}

export function getProductLocalized(
  product: Product,
  locale: "uz" | "ru" = "uz"
): LocalizedProductData {
  if (locale === "uz") {
    return {
      name: product.uz.name_uz,
      slug: product.uz.slug_uz,
      category: product.uz.category_uz,
      category_slug: product.uz.category_slug_uz,
      alt_picture: product.uz.alt_picture_uz,
      title: product.uz.title_uz,
      meta_description: product.uz.meta_description_uz,
      short_description: product.uz.short_description_uz,
      product_description: product.uz.product_description_uz,
      unit: product.uz.unit_uz,
    };
  }
  return {
    name: product.ru.name_ru,
    slug: product.ru.slug_ru,
    category: product.ru.category_ru,
    category_slug: product.ru.category_slug_ru,
    alt_picture: product.ru.alt_picture_ru,
    title: product.ru.title_ru,
    meta_description: product.ru.meta_description_ru,
    short_description: product.ru.short_description_ru,
    product_description: product.ru.product_description_ru,
    unit: product.ru.unit_ru,
  };
}
