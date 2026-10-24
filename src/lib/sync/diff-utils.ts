import { Product } from "@/lib/schemas/product";

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
  summary: {
    totalCached: number;
    totalFresh: number;
    addedCount: number;
    deletedCount: number;
    modifiedCount: number;
    changedCount: number;
  };
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

  // 5. Category slug
  if (cached.uz?.category_slug_uz !== fresh.uz?.category_slug_uz) {
    diffs.push(
      `category_slug_uz: "${cached.uz?.category_slug_uz || ""}" -> "${fresh.uz?.category_slug_uz || ""}"`
    );
  }

  return diffs;
}

/**
 * Computes difference between cached products and fresh 1C products.
 */
export function computeProductDiff(
  cachedProducts: Product[],
  freshProducts: Product[]
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

  // Detect added and modified
  for (const fresh of freshProducts) {
    const cached = cachedMap.get(fresh.id);
    if (!cached) {
      added.push(fresh);
    } else {
      const changes = detectProductChanges(cached, fresh);
      if (changes.length > 0) {
        if (
          changes.some(
            (c) =>
              c.startsWith("price") ||
              c.startsWith("retail_price") ||
              c.startsWith("wholesale_price") ||
              c.startsWith("dealer_price") ||
              c.startsWith("stock") ||
              c.startsWith("quantity")
          )
        ) {
          priceChanged = true;
        }
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
  for (const cached of cachedProducts) {
    if (!freshMap.has(cached.id)) {
      deleted.push(cached);
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
    summary: {
      totalCached: cachedProducts.length,
      totalFresh: freshProducts.length,
      addedCount: added.length,
      deletedCount: deleted.length,
      modifiedCount: modified.length,
      changedCount,
    },
  };
}
