import { Product, SubProductCard } from "@/lib/schemas/product";

export interface ModifiedProductInfo {
  id: string;
  name: string;
  slug: string;
  changes: string[];
}

export interface ProductDiffResult {
  added: Product[];
  deleted: Product[];
  modified: ModifiedProductInfo[];
  hasChanges: boolean;
  priceChanged: boolean;
  relationsChanged: boolean;
  catalogChanged: boolean;
  summary: {
    totalCached: number;
    totalFresh: number;
    addedCount: number;
    deletedCount: number;
    modifiedCount: number;
    changedCount: number;
    relationsModifiedCount: number;
  };
}

/**
 * Extracts a deterministic unique identifier for a related or recommended sub-product card.
 */
export function extractSubProductKey(
  item: SubProductCard,
  kind: "related" | "recommended"
): string {
  const id =
    kind === "related"
      ? item.related_products_id || item.id
      : item.recommended_products_id || item.id;
  return (
    id ||
    item.slug_uz ||
    item.slug_ru ||
    item.slug ||
    item.name_uz ||
    item.name_ru ||
    item.name ||
    ""
  ).trim();
}

/**
 * Compares two arrays of related or recommended products and returns a descriptive diff string if changed.
 */
export function compareSubProductList(
  cachedList: SubProductCard[] | undefined,
  freshList: SubProductCard[] | undefined,
  fieldName: "related_products" | "recommended_products",
  kind: "related" | "recommended"
): string | null {
  const cachedKeys = (cachedList || [])
    .map((item) => extractSubProductKey(item, kind))
    .filter(Boolean);
  const freshKeys = (freshList || [])
    .map((item) => extractSubProductKey(item, kind))
    .filter(Boolean);

  if (
    cachedKeys.length === freshKeys.length &&
    cachedKeys.every((key, idx) => key === freshKeys[idx])
  ) {
    return null;
  }

  const cachedSet = new Set(cachedKeys);
  const freshSet = new Set(freshKeys);

  let addedCount = 0;
  let removedCount = 0;

  for (const k of freshSet) {
    if (!cachedSet.has(k)) addedCount++;
  }
  for (const k of cachedSet) {
    if (!freshSet.has(k)) removedCount++;
  }

  if (addedCount === 0 && removedCount === 0) {
    return `${fieldName}: tartibi o'zgardi (${freshKeys.length} ta)`;
  }

  const deltaParts: string[] = [];
  if (addedCount > 0) deltaParts.push(`+${addedCount}`);
  if (removedCount > 0) deltaParts.push(`-${removedCount}`);
  const deltaSuffix = deltaParts.length > 0 ? ` (${deltaParts.join(", ")})` : "";

  return `${fieldName}: ${cachedKeys.length} -> ${freshKeys.length} ta${deltaSuffix}`;
}

/**
 * Compares two products and returns list of changed attributes.
 */
export function detectProductChanges(cached: Product, fresh: Product): string[] {
  const diffs: string[] = [];

  // 1. Price and stock comparison
  if (cached.price || fresh.price) {
    if (!cached.price && fresh.price) {
      diffs.push(`price_added: ${fresh.price.retail_price}`);
    } else if (cached.price && !fresh.price) {
      diffs.push("price_removed");
    } else if (cached.price && fresh.price) {
      if (cached.price.retail_price !== fresh.price.retail_price) {
        diffs.push(
          `retail_price: ${cached.price.retail_price} -> ${fresh.price.retail_price}`
        );
      }
      if (cached.price.wholesale_price !== fresh.price.wholesale_price) {
        diffs.push(
          `wholesale_price: ${cached.price.wholesale_price} -> ${fresh.price.wholesale_price}`
        );
      }
      if (cached.price.dealer_price !== fresh.price.dealer_price) {
        diffs.push(
          `dealer_price: ${cached.price.dealer_price} -> ${fresh.price.dealer_price}`
        );
      }
      if (cached.price.stock !== fresh.price.stock) {
        diffs.push(`stock: ${cached.price.stock} -> ${fresh.price.stock}`);
      }
      if (
        cached.price.quantity_remaining !== undefined &&
        fresh.price.quantity_remaining !== undefined &&
        cached.price.quantity_remaining !== fresh.price.quantity_remaining
      ) {
        diffs.push(
          `quantity: ${cached.price.quantity_remaining} -> ${fresh.price.quantity_remaining}`
        );
      }
    }
  }

  // 2. updated_at timestamp from 1C
  if (
    fresh.updated_at &&
    cached.updated_at &&
    fresh.updated_at !== cached.updated_at
  ) {
    diffs.push(`updated_at: ${cached.updated_at} -> ${fresh.updated_at}`);
  }

  // 3. Names and Slugs (UZ & RU)
  if (cached.uz?.name_uz !== fresh.uz?.name_uz) {
    diffs.push(`name_uz: "${cached.uz?.name_uz || ""}" -> "${fresh.uz?.name_uz || ""}"`);
  }
  if (cached.ru?.name_ru !== fresh.ru?.name_ru) {
    diffs.push(`name_ru: "${cached.ru?.name_ru || ""}" -> "${fresh.ru?.name_ru || ""}"`);
  }
  if (cached.uz?.slug_uz !== fresh.uz?.slug_uz) {
    diffs.push(`slug_uz: "${cached.uz?.slug_uz || ""}" -> "${fresh.uz?.slug_uz || ""}"`);
  }
  if (cached.ru?.slug_ru !== fresh.ru?.slug_ru) {
    diffs.push(`slug_ru: "${cached.ru?.slug_ru || ""}" -> "${fresh.ru?.slug_ru || ""}"`);
  }

  // 4. Media & Core metadata
  if (cached.main_picture !== fresh.main_picture) {
    diffs.push("main_picture changed");
  }
  if (cached.brand !== fresh.brand) {
    diffs.push(`brand: "${cached.brand || ""}" -> "${fresh.brand || ""}"`);
  }
  if (cached.product_sku !== fresh.product_sku) {
    diffs.push(
      `product_sku: "${cached.product_sku || ""}" -> "${fresh.product_sku || ""}"`
    );
  }

  // 5. Category slugs (UZ & RU)
  if (cached.uz?.category_slug_uz !== fresh.uz?.category_slug_uz) {
    diffs.push(
      `category_slug_uz: "${cached.uz?.category_slug_uz || ""}" -> "${fresh.uz?.category_slug_uz || ""}"`
    );
  }
  if (cached.ru?.category_slug_ru !== fresh.ru?.category_slug_ru) {
    diffs.push(
      `category_slug_ru: "${cached.ru?.category_slug_ru || ""}" -> "${fresh.ru?.category_slug_ru || ""}"`
    );
  }

  // 6. Related Products & Recommended Products comparison
  const relatedDiff = compareSubProductList(
    cached.related_products,
    fresh.related_products,
    "related_products",
    "related"
  );
  if (relatedDiff) {
    diffs.push(relatedDiff);
  }

  const recommendedDiff = compareSubProductList(
    cached.recommended_products,
    fresh.recommended_products,
    "recommended_products",
    "recommended"
  );
  if (recommendedDiff) {
    diffs.push(recommendedDiff);
  }

  return diffs;
}

/**
 * Computes difference between cached products and fresh 1C products.
 */
export function computeProductDiff(
  cachedProducts: Product[],
  freshProducts: Product[],
  options?: { onlyRelations?: boolean }
): ProductDiffResult {
  const cachedMap = new Map<string, Product>();
  for (const p of cachedProducts) {
    cachedMap.set(p.id, p);
  }

  const freshMap = new Map<string, Product>();
  for (const p of freshProducts) {
    freshMap.set(p.id, p);
  }

  const added: Product[] = [];
  const deleted: Product[] = [];
  const modified: ModifiedProductInfo[] = [];
  let priceChanged = false;
  let relationsChanged = false;
  let catalogChanged = false;
  let relationsModifiedCount = 0;

  // Detect added and modified
  for (const fresh of freshProducts) {
    const cached = cachedMap.get(fresh.id);
    if (!cached) {
      if (!options?.onlyRelations) {
        added.push(fresh);
      }
    } else {
      let changes = detectProductChanges(cached, fresh);

      if (options?.onlyRelations) {
        changes = changes.filter(
          (c) =>
            c.startsWith("related_products") ||
            c.startsWith("recommended_products")
        );
      }

      if (changes.length > 0) {
        const hasPriceDiff = changes.some(
          (c) =>
            c.startsWith("price") ||
            c.startsWith("retail_price") ||
            c.startsWith("wholesale_price") ||
            c.startsWith("dealer_price") ||
            c.startsWith("stock") ||
            c.startsWith("quantity")
        );
        const hasRelationDiff = changes.some(
          (c) =>
            c.startsWith("related_products") ||
            c.startsWith("recommended_products")
        );
        const hasCatalogDiff = changes.some(
          (c) =>
            c.startsWith("updated_at") ||
            c.startsWith("name_") ||
            c.startsWith("slug_") ||
            c.startsWith("main_picture") ||
            c.startsWith("brand") ||
            c.startsWith("product_sku") ||
            c.startsWith("category_slug_")
        );

        if (hasPriceDiff) priceChanged = true;
        if (hasRelationDiff) {
          relationsChanged = true;
          relationsModifiedCount++;
        }
        if (hasCatalogDiff) catalogChanged = true;

        modified.push({
          id: fresh.id,
          name: fresh.uz?.name_uz || fresh.ru?.name_ru || fresh.id,
          slug: fresh.uz?.slug_uz || fresh.ru?.slug_ru || fresh.id,
          changes,
        });
      }
    }
  }

  // Detect deleted
  if (!options?.onlyRelations) {
    for (const cached of cachedProducts) {
      if (!freshMap.has(cached.id)) {
        deleted.push(cached);
      }
    }
  }

  const changedCount = added.length + deleted.length + modified.length;
  const hasChanges = changedCount > 0;

  return {
    added,
    deleted,
    modified,
    hasChanges,
    priceChanged,
    relationsChanged,
    catalogChanged,
    summary: {
      totalCached: cachedProducts.length,
      totalFresh: freshProducts.length,
      addedCount: added.length,
      deletedCount: deleted.length,
      modifiedCount: modified.length,
      changedCount,
      relationsModifiedCount,
    },
  };
}
