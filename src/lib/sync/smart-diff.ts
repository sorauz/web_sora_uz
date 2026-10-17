import { revalidateTag, revalidatePath } from "next/cache";
import { api } from "@/lib/api";
import { submitToIndexNow } from "@/lib/seo/indexnow";
import {
  computeProductDiff,
  ModifiedProductInfo,
  ProductDiffResult,
} from "./diff-utils";

export * from "./diff-utils";

export interface SmartDiffRevalidateResult {
  revalidated: boolean;
  mode: "smart-diff";
  message: string;
  sitemapRevalidated: boolean;
  summary: {
    totalCached: number;
    totalFresh: number;
    addedCount: number;
    deletedCount: number;
    modifiedCount: number;
    changedCount: number;
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
 * 2. Checks fallback safety (never diff against mock fixtures if 1C is down).
 * 3. In-memory diff computation.
 * 4. Zero ISR write if no changes.
 * 5. Selective tag invalidation + sitemap.xml refresh when changes are detected.
 * 6. IndexNow dispatch for affected URLs.
 */
export async function runSmartDiffRevalidation(): Promise<SmartDiffRevalidateResult> {
  try {
    // 1. Fetch cached and live fresh data
    const [cachedRes, freshRes] = await Promise.all([
      api.getAllProducts(),
      api.getAllProducts({ noCache: true }),
    ]);

    // Safety guard: if 1C is offline, do not diff against fixture fallbacks
    if (freshRes.isFallback) {
      return {
        revalidated: false,
        mode: "smart-diff",
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
        },
        now: Date.now(),
        error: "1C ERP API offline or returned fallback data",
      };
    }

    // 2. Compute in-memory diff
    const diff: ProductDiffResult = computeProductDiff(
      cachedRes.products,
      freshRes.products
    );

    // 3. Case A: 0 changes detected -> 100% cost saving
    if (!diff.hasChanges) {
      return {
        revalidated: false,
        mode: "smart-diff",
        sitemapRevalidated: false,
        message:
          "1C ERP bilan solishtirildi: hech qanday o'zgarish topilmadi. Kesh va sitemap tegilmadi (0 ISR Write).",
        summary: diff.summary,
        now: Date.now(),
      };
    }

    // 4. Case B: Changes detected -> Targeted revalidation
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
      revalidateTag("prices", { expire: 0 });
      revalidatedTags.push("products", "prices");

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
      for (const mod of diff.modified) {
        revalidateTag(`product-${mod.id}`, { expire: 0 });
        revalidatedTags.push(`product-${mod.id}`);
      }

      if (diff.priceChanged) {
        revalidateTag("prices", { expire: 0 });
        revalidatedTags.push("prices");
      }

      revalidatePath("/[locale]/products/[slug]", "page");
      revalidatedPaths.push("/[locale]/products/[slug]");

      for (const mod of diff.modified) {
        if (mod.slug) {
          indexNowUrls.push(
            `https://sora.uz/uz/products/${mod.slug}`,
            `https://sora.uz/ru/products/${mod.slug}`
          );
        }
      }
    }

    // 5. Asynchronously notify search engines via IndexNow
    if (indexNowUrls.length > 0) {
      submitToIndexNow(indexNowUrls).catch((err) =>
        console.warn("[SmartDiff IndexNow Error]", err)
      );
    }

    return {
      revalidated: true,
      mode: "smart-diff",
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
      mode: "smart-diff",
      sitemapRevalidated: false,
      message: "Smart Diff revalidation bajarishda xatolik yuz berdi",
      summary: {
        totalCached: 0,
        totalFresh: 0,
        addedCount: 0,
        deletedCount: 0,
        modifiedCount: 0,
        changedCount: 0,
      },
      now: Date.now(),
      error: message,
    };
  }
}
