import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { revalidateTag, revalidatePath } from "next/cache";
import { api } from "@/lib/api";
import { Product, SubProductCard } from "@/lib/schemas/product";
import { submitToIndexNow } from "@/lib/seo/indexnow";
import {
  computeProductDiff,
  ModifiedProductInfo,
  ProductDiffResult,
} from "./diff-utils";

export * from "./diff-utils";

export type RelationsMap = Record<
  string,
  {
    related_products: SubProductCard[];
    recommended_products: SubProductCard[];
  }
>;

// Module-level baseline memory cache + persistent disk cache (.next/cache or os.tmpdir)
let inMemoryRelationsSnapshot: RelationsMap | null = null;

function getSnapshotFilePaths(): string[] {
  return [
    path.join(process.cwd(), ".next", "cache", "sora-relations-snapshot.json"),
    path.join(os.tmpdir(), "sora-relations-snapshot.json"),
  ];
}

function readCachedRelationsSnapshot(): RelationsMap | null {
  if (inMemoryRelationsSnapshot) {
    return inMemoryRelationsSnapshot;
  }

  for (const filePath of getSnapshotFilePaths()) {
    try {
      if (fs.existsSync(filePath)) {
        const raw = fs.readFileSync(filePath, "utf8");
        const parsed = JSON.parse(raw) as RelationsMap;
        if (parsed && typeof parsed === "object") {
          inMemoryRelationsSnapshot = parsed;
          return parsed;
        }
      }
    } catch {
      // Ignore read errors and try next fallback path
    }
  }

  return null;
}

function writeCachedRelationsSnapshot(map: RelationsMap): void {
  inMemoryRelationsSnapshot = map;
  const serialized = JSON.stringify(map);

  for (const filePath of getSnapshotFilePaths()) {
    try {
      const dir = path.dirname(filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(filePath, serialized, "utf8");
      return;
    } catch {
      // Fallback to os.tmpdir() if .next/cache is read-only
    }
  }
}

function attachRelationsToProducts(
  products: Product[],
  relationsMap: RelationsMap
): Product[] {
  return products.map((p) => {
    const rel = relationsMap[p.id];
    if (!rel) return p;
    return {
      ...p,
      related_products:
        p.related_products && p.related_products.length > 0
          ? p.related_products
          : rel.related_products,
      recommended_products:
        p.recommended_products && p.recommended_products.length > 0
          ? p.recommended_products
          : rel.recommended_products,
    };
  });
}

export interface SmartDiffOptions {
  onlyRelations?: boolean;
  skipRelations?: boolean;
}

export interface SmartDiffRevalidateResult {
  revalidated: boolean;
  mode: "smart-diff" | "relations-diff";
  message: string;
  sitemapRevalidated: boolean;
  summary: {
    totalCached: number;
    totalFresh: number;
    addedCount: number;
    deletedCount: number;
    modifiedCount: number;
    changedCount: number;
    relationsModifiedCount?: number;
  };
  details?: {
    addedIds: string[];
    deletedIds: string[];
    modified: ModifiedProductInfo[];
    revalidatedTags: string[];
    revalidatedPaths: string[];
  };
  indexnow?: {
    dispatched: boolean;
    urlCount: number;
  };
  now: number;
  error?: string;
}

/**
 * Main Smart Diff Revalidation Orchestrator:
 * 1. Fetches current cached products vs fresh live 1C ERP products.
 * 2. Enriches products with cached vs live `related_products` and `recommended_products` from 1C `/product?id={id}`.
 * 3. Checks fallback safety (never diff against mock fixtures if 1C is down).
 * 4. In-memory diff computation across prices, stock, metadata, related_products, and recommended_products.
 * 5. Zero ISR write if no changes.
 * 6. Selective tag invalidation (`product-${id}`) + sitemap.xml refresh when changes are detected.
 * 7. IndexNow dispatch for affected URLs.
 */
export async function runSmartDiffRevalidation(
  options?: SmartDiffOptions
): Promise<SmartDiffRevalidateResult> {
  const modeLabel: "smart-diff" | "relations-diff" = options?.onlyRelations
    ? "relations-diff"
    : "smart-diff";

  try {
    // 1. Fetch cached and live fresh catalog data
    const [cachedRes, freshRes] = await Promise.all([
      api.getAllProducts(),
      api.getAllProducts({ noCache: true }),
    ]);

    // Safety guard: if 1C is offline, do not diff against fixture fallbacks
    if (freshRes.isFallback) {
      return {
        revalidated: false,
        mode: modeLabel,
        sitemapRevalidated: false,
        message:
          "1C ERP API mavjud emas yoki xato qaytardi. Kesh xavfsizligi ta'minlandi (o'zgarish qilinmadi).",
        summary: {
          totalCached: cachedRes.products.length,
          totalFresh: 0,
          addedCount: 0,
          deletedCount: 0,
          modifiedCount: 0,
          changedCount: 0,
          relationsModifiedCount: 0,
        },
        now: Date.now(),
        error: "1C ERP API offline or returned fallback data",
      };
    }

    let cachedProducts = cachedRes.products;
    let freshProducts = freshRes.products;
    let freshRelationsMap: RelationsMap | null = null;

    // 2. Check related_products & recommended_products across all products unless explicitly skipped
    if (!options?.skipRelations) {
      const allProductalreadyHasRelations = freshProducts.some(
        (p) =>
          (p.related_products && p.related_products.length > 0) ||
          (p.recommended_products && p.recommended_products.length > 0)
      );

      if (!allProductalreadyHasRelations) {
        const productIds = freshProducts.map((p) => p.id);
        const existingBaseline = readCachedRelationsSnapshot();
        const freshRelRes = await api.fetchAllProductRelations(productIds);

        if (!freshRelRes.isFallback) {
          freshRelationsMap = freshRelRes.relationsMap;

          if (!existingBaseline) {
            // Initialize baseline on first run
            writeCachedRelationsSnapshot(freshRelationsMap);
            cachedProducts = attachRelationsToProducts(
              cachedProducts,
              freshRelationsMap
            );
          } else {
            cachedProducts = attachRelationsToProducts(
              cachedProducts,
              existingBaseline
            );
          }

          freshProducts = attachRelationsToProducts(
            freshProducts,
            freshRelationsMap
          );
        }
      }
    }

    // 3. Compute in-memory diff
    const diff: ProductDiffResult = computeProductDiff(
      cachedProducts,
      freshProducts,
      { onlyRelations: options?.onlyRelations }
    );

    // 4. Case A: 0 changes detected -> 100% cost saving
    if (!diff.hasChanges) {
      return {
        revalidated: false,
        mode: modeLabel,
        sitemapRevalidated: false,
        message:
          "1C ERP bilan solishtirildi: hech qanday o'zgarish topilmadi. Kesh va sitemap tegilmadi (0 ISR Write).",
        summary: diff.summary,
        now: Date.now(),
      };
    }

    // 5. Case B: Changes detected -> Targeted revalidation
    const revalidatedTags: string[] = [];
    const revalidatedPaths: string[] = [];
    const indexNowUrls: string[] = [];

    // Always revalidate sitemap when products or prices change
    revalidatePath("/sitemap.xml");
    revalidatedPaths.push("/sitemap.xml");
    indexNowUrls.push("https://sora.uz/sitemap.xml");

    if (diff.added.length > 0 || diff.deleted.length > 0) {
      // Structure/counts changed -> revalidate catalog, categories, products
      revalidateTag("products", { expire: 0 });
      revalidateTag("all-products", { expire: 0 });
      revalidateTag("prices", { expire: 0 });
      revalidatedTags.push("products", "all-products", "prices");

      if (freshRelationsMap) {
        writeCachedRelationsSnapshot(freshRelationsMap);
        revalidateTag("product-relations", { expire: 0 });
        revalidatedTags.push("product-relations");
      }

      revalidatePath("/[locale]/products/[slug]", "page");
      revalidatePath("/[locale]/catalog", "page");
      revalidatePath("/[locale]/category/[slug]", "page");
      revalidatePath("/[locale]", "layout");
      revalidatedPaths.push(
        "/[locale]/products/[slug]",
        "/[locale]/catalog",
        "/[locale]/category/[slug]",
        "/[locale]"
      );

      indexNowUrls.push(
        "https://sora.uz/uz",
        "https://sora.uz/ru",
        "https://sora.uz/uz/catalog",
        "https://sora.uz/ru/catalog"
      );

      for (const p of diff.added) {
        const uzSlug = p.uz?.slug_uz || p.ru?.slug_ru;
        const ruSlug = p.ru?.slug_ru || p.uz?.slug_uz;
        if (uzSlug) indexNowUrls.push(`https://sora.uz/uz/products/${uzSlug}`);
        if (ruSlug) indexNowUrls.push(`https://sora.uz/ru/products/${ruSlug}`);
      }
    } else {
      // Only modified existing products -> Granular product tags
      const freshProductMap = new Map<string, Product>();
      for (const p of freshProducts) {
        freshProductMap.set(p.id, p);
      }

      for (const mod of diff.modified) {
        revalidateTag(`product-${mod.id}`, { expire: 0 });
        revalidatedTags.push(`product-${mod.id}`);

        const fullProd = freshProductMap.get(mod.id);
        const uzSlug = fullProd?.uz?.slug_uz || mod.slug;
        const ruSlug = fullProd?.ru?.slug_ru || mod.slug;

        if (uzSlug) {
          revalidatePath(`/uz/products/${uzSlug}`);
          indexNowUrls.push(`https://sora.uz/uz/products/${uzSlug}`);
        }
        if (ruSlug) {
          revalidatePath(`/ru/products/${ruSlug}`);
          indexNowUrls.push(`https://sora.uz/ru/products/${ruSlug}`);
        }
      }

      if (diff.catalogChanged) {
        revalidateTag("all-products", { expire: 0 });
        revalidatedTags.push("all-products");
      }

      if (diff.relationsChanged && freshRelationsMap) {
        writeCachedRelationsSnapshot(freshRelationsMap);
        revalidateTag("product-relations", { expire: 0 });
        revalidatedTags.push("product-relations");
      }

      if (diff.priceChanged) {
        revalidateTag("prices", { expire: 0 });
        revalidatedTags.push("prices");
      }

      revalidatePath("/[locale]/products/[slug]", "page");
      revalidatedPaths.push("/[locale]/products/[slug]");
    }

    // 6. Asynchronously notify search engines via IndexNow
    if (indexNowUrls.length > 0) {
      submitToIndexNow(indexNowUrls).catch((err) =>
        console.warn("[SmartDiff IndexNow Error]", err)
      );
    }

    return {
      revalidated: true,
      mode: modeLabel,
      sitemapRevalidated: true,
      message: `${diff.summary.changedCount} ta o'zgarish aniqlandi va faqat ta'sir ko'rgan keshlar yangilandi.`,
      summary: diff.summary,
      details: {
        addedIds: diff.added.map((p) => p.id),
        deletedIds: diff.deleted.map((p) => p.id),
        modified: diff.modified.slice(0, 50),
        revalidatedTags,
        revalidatedPaths,
      },
      indexnow: {
        dispatched: indexNowUrls.length > 0,
        urlCount: indexNowUrls.length,
      },
      now: Date.now(),
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return {
      revalidated: false,
      mode: modeLabel,
      sitemapRevalidated: false,
      message: "Smart Diff revalidation bajarishda xatolik yuz berdi",
      summary: {
        totalCached: 0,
        totalFresh: 0,
        addedCount: 0,
        deletedCount: 0,
        modifiedCount: 0,
        changedCount: 0,
        relationsModifiedCount: 0,
      },
      now: Date.now(),
      error: message,
    };
  }
}
