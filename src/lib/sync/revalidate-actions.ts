import { revalidatePath, revalidateTag } from "next/cache";
import { submitToIndexNow } from "@/lib/seo/indexnow";
import {
  runSmartDiffRevalidation,
  type SmartDiffRevalidateResult,
} from "@/lib/sync/smart-diff";

export const ALLOWED_STATIC_TAGS = [
  "all",
  "prices",
  "products",
  "all-products",
  "product-relations",
  "offers",
  "categories",
  "brands",
  "reviews",
  "units",
  "faq",
] as const;

const STATIC_TAG_SET = new Set<string>(ALLOWED_STATIC_TAGS);
const PRODUCT_TAG_RE = /^product-[A-Za-z0-9_-]{1,80}$/;
const REVIEWS_TAG_RE = /^reviews-[A-Za-z0-9_-]{1,80}$/;

export function isValidRevalidateTag(tag: string): boolean {
  const trimmed = tag.trim();
  if (!trimmed) return false;
  return (
    STATIC_TAG_SET.has(trimmed) ||
    PRODUCT_TAG_RE.test(trimmed) ||
    REVIEWS_TAG_RE.test(trimmed)
  );
}

export function isValidRevalidatePath(path: string): boolean {
  const trimmed = path.trim();
  if (!trimmed.startsWith("/") || trimmed.length > 200) return false;
  if (trimmed.includes("..") || trimmed.includes("?") || trimmed.includes("#")) {
    return false;
  }
  return /^\/[A-Za-z0-9/_-]*$/.test(trimmed);
}

export function performRevalidation(tag?: string, path?: string): void {
  if (tag) {
    if (tag === "all") {
      const allTags = [
        "products",
        "all-products",
        "product-relations",
        "prices",
        "categories",
        "brands",
        "offers",
        "reviews",
        "units",
        "faq",
      ];
      for (const t of allTags) {
        revalidateTag(t, { expire: 0 });
      }
      revalidatePath("/", "layout");
      revalidatePath("/sitemap.xml");
      revalidatePath("/api/feeds/google-merchant");
      revalidatePath("/api/feeds/yandex-market");
      revalidatePath("/llms-full.txt");
    } else {
      revalidateTag(tag, { expire: 0 });

      // If products, prices, or individual product is revalidated,
      // flush the product page and discovery routes as well
      if (
        tag === "products" ||
        tag === "all-products" ||
        tag === "prices" ||
        tag.startsWith("product-")
      ) {
        revalidatePath("/[locale]/products/[slug]", "page");
        revalidatePath("/[locale]/catalog", "page");
        revalidatePath("/[locale]/category/[slug]", "page");
        revalidatePath("/[locale]", "layout");
        revalidatePath("/sitemap.xml");
        revalidatePath("/api/feeds/google-merchant");
        revalidatePath("/api/feeds/yandex-market");
        revalidatePath("/llms-full.txt");
      }
      if (tag === "categories") {
        revalidatePath("/[locale]/catalog", "page");
        revalidatePath("/[locale]/category/[slug]", "page");
        revalidatePath("/[locale]", "layout");
        revalidatePath("/sitemap.xml");
        revalidatePath("/api/feeds/yandex-market");
      }
      if (tag === "reviews" || tag.startsWith("reviews-")) {
        revalidatePath("/[locale]/products/[slug]", "page");
      }
      if (tag === "faq") {
        revalidatePath("/[locale]", "page");
        revalidatePath("/[locale]/category/[slug]", "page");
        revalidatePath("/[locale]/products/[slug]", "page");
        revalidatePath("/[locale]/brand/[slug]", "page");
        revalidatePath("/[locale]/delivery", "page");
        revalidatePath("/[locale]/payment", "page");
        revalidatePath("/[locale]/b2b", "page");
        revalidatePath("/[locale]/warranty", "page");
        revalidatePath("/[locale]/contact", "page");
      }
    }
  }

  if (path) {
    revalidatePath(path);
  }
}

/**
 * Resolves URLs to ping via IndexNow when tags or paths are revalidated
 */
export function resolveIndexNowUrls(
  tag?: string,
  path?: string,
  customUrls?: string | string[],
): string[] {
  const urls: string[] = [];

  if (path) {
    if (path === "/uz" || path === "/ru" || path.startsWith("/uz/") || path.startsWith("/ru/")) {
      urls.push(`https://sora.uz${path}`);
    } else {
      const cleanPath = path.startsWith("/") ? path : `/${path}`;
      urls.push(`https://sora.uz/uz${cleanPath}`);
      urls.push(`https://sora.uz/ru${cleanPath}`);
    }
  }

  if (tag === "products" || tag === "prices" || tag === "all") {
    urls.push(
      "https://sora.uz/uz",
      "https://sora.uz/ru",
      "https://sora.uz/uz/catalog",
      "https://sora.uz/ru/catalog",
    );
  } else if (tag === "categories") {
    urls.push("https://sora.uz/uz/catalog", "https://sora.uz/ru/catalog");
  }

  if (customUrls) {
    const list = Array.isArray(customUrls) ? customUrls : [customUrls];
    urls.push(...list);
  }

  return urls;
}

export interface RevalidateInput {
  mode?: string;
  scope?: string;
  fast?: boolean | string;
  tag?: string;
  path?: string;
  customUrls?: string | string[];
}

export type RevalidateStandardResult = {
  revalidated: boolean;
  tag: string | null;
  path: string | null;
  indexnow?: {
    dispatched: boolean;
    urlCount: number;
  };
  now: number;
  message?: string;
  error?: string;
};

export async function executeRevalidationRequest(
  input: RevalidateInput,
): Promise<{
  status: number;
  body: SmartDiffRevalidateResult | RevalidateStandardResult;
}> {
  const isSmartDiff =
    input.mode === "smart-diff" ||
    input.tag === "smart-diff" ||
    input.mode === "relations-diff" ||
    input.tag === "relations-diff";

  if (isSmartDiff) {
    const onlyRelations =
      input.mode === "relations-diff" ||
      input.tag === "relations-diff" ||
      input.scope === "relations";
    const skipRelations =
      !onlyRelations && (input.fast === true || input.fast === "true");

    const result = await runSmartDiffRevalidation({
      onlyRelations,
      skipRelations,
    });
    return {
      status: result.error && !result.summary ? 500 : 200,
      body: result,
    };
  }

  if (!input.tag && !input.path && !input.customUrls) {
    return {
      status: 400,
      body: {
        revalidated: false,
        tag: null,
        path: null,
        message: "Missing 'tag', 'path', 'mode', or 'urls' parameter to revalidate",
        now: Date.now(),
      },
    };
  }

  try {
    performRevalidation(input.tag || undefined, input.path || undefined);

    const indexNowUrls = resolveIndexNowUrls(
      input.tag || undefined,
      input.path || undefined,
      input.customUrls || undefined,
    );

    if (indexNowUrls.length > 0) {
      submitToIndexNow(indexNowUrls).catch((err) =>
        console.warn("[IndexNow Webhook Dispatch Error]", err),
      );
    }

    return {
      status: 200,
      body: {
        revalidated: true,
        tag: input.tag || null,
        path: input.path || null,
        indexnow: {
          dispatched: indexNowUrls.length > 0,
          urlCount: indexNowUrls.length,
        },
        now: Date.now(),
      },
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return {
      status: 500,
      body: {
        revalidated: false,
        tag: input.tag || null,
        path: input.path || null,
        error: message,
        now: Date.now(),
      },
    };
  }
}
