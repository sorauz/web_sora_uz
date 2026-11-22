export interface CatalogProductSummary {
  id: string;
  sku: string;
  name_uz: string;
  name_ru: string;
  slug_uz: string;
  slug_ru: string;
  picture: string;
  price?: number;
  unit_uz: string;
  unit_ru: string;
}

export type CatalogProductMap = Record<string, CatalogProductSummary>;

interface CatalogSourceProduct {
  id?: string;
  product_sku?: string;
  main_picture?: string;
  price?: { retail_price?: number } | number | null;
  uz?: { name_uz?: string; slug_uz?: string; unit_uz?: string };
  ru?: { name_ru?: string; slug_ru?: string; unit_ru?: string };
}

/**
 * Builds an ID-indexed summary lookup map from 1C catalog products
 * for enriching order history, detail modals, and public KP views.
 */
export function buildCatalogProductMap(
  products: CatalogSourceProduct[] | undefined
): CatalogProductMap {
  const productsMap: CatalogProductMap = {};
  for (const p of products || []) {
    if (p.id) {
      productsMap[p.id] = {
        id: p.id,
        sku: p.product_sku || "",
        name_uz: p.uz?.name_uz || "",
        name_ru: p.ru?.name_ru || "",
        slug_uz: p.uz?.slug_uz || "",
        slug_ru: p.ru?.slug_ru || "",
        picture: p.main_picture || "",
        price:
          typeof p.price === "object" && p.price
            ? p.price.retail_price
            : undefined,
        unit_uz: p.uz?.unit_uz || "dona",
        unit_ru: p.ru?.unit_ru || "шт",
      };
    }
  }
  return productsMap;
}
