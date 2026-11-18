import { Brand } from "../schemas/brand";
import { Category } from "../schemas/category";
import { FaqItem, FaqScope, FaqTopic } from "../schemas/faq";
import { Product } from "../schemas/product";
import { FIXTURE_FAQS } from "../api/fixtures";
import {
  CATEGORY_SLUG_ALIASES,
  getCategoryBreadcrumb,
} from "./category-tree";

export type FaqPageKey =
  | "home"
  | "delivery"
  | "payment"
  | "b2b"
  | "warranty"
  | "contact";

export interface ResolvedFaqItem {
  id: string;
  topic: FaqTopic;
  sortOrder: number;
  question: string;
  answer: string;
  paragraphs: string[];
  updatedAt: string;
}

const DEFAULT_HOME_LIMIT = 8;
const DEFAULT_PAGE_LIMIT = 8;
const DEFAULT_ENTITY_LIMIT = 6;

function normalizeRef(value: string): string {
  return value.trim().toLowerCase();
}

/**
 * Checks whether a FAQ item is active and has non-empty localized question & answer.
 */
function toResolvedFaq(
  item: FaqItem,
  locale: "uz" | "ru"
): ResolvedFaqItem | null {
  if (item.is_active !== true) return null;

  const question = (locale === "uz" ? item.question_uz : item.question_ru).trim();
  const answer = (locale === "uz" ? item.answer_uz : item.answer_ru).trim();

  if (!question || !answer) return null;

  const paragraphs = answer
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);

  return {
    id: item.id,
    topic: item.topic,
    sortOrder: item.sort_order,
    question,
    answer,
    paragraphs: paragraphs.length > 0 ? paragraphs : [answer],
    updatedAt: item.updated_at,
  };
}

function hasTarget(
  item: FaqItem,
  scope: FaqScope,
  ref: string,
  requireIncludeChildren = false
): boolean {
  const targetRef = normalizeRef(ref);
  if (!targetRef) return false;

  return item.targets.some((t) => {
    if (t.scope !== scope) return false;
    if (normalizeRef(t.ref) !== targetRef) return false;
    if (requireIncludeChildren && t.include_children !== true) return false;
    return true;
  });
}

function sortByOrder(items: FaqItem[]): FaqItem[] {
  return [...items].sort((a, b) => a.sort_order - b.sort_order);
}

/**
 * Merges ordered priority buckets, sorts inside each priority group by sort_order,
 * deduplicates by id, filters by active + locale, and caps at limit.
 */
function resolveFromBuckets(
  buckets: FaqItem[][],
  locale: "uz" | "ru",
  limit: number,
  options?: { dedupeByQuestion?: boolean }
): ResolvedFaqItem[] {
  const result: ResolvedFaqItem[] = [];
  const seenIds = new Set<string>();
  const seenQuestions = new Set<string>();

  for (const bucket of buckets) {
    const sorted = sortByOrder(bucket);
    for (const raw of sorted) {
      if (seenIds.has(raw.id)) continue;

      const resolved = toResolvedFaq(raw, locale);
      if (!resolved) continue;

      const qKey = resolved.question.toLowerCase();
      if (options?.dedupeByQuestion && seenQuestions.has(qKey)) continue;

      seenIds.add(raw.id);
      seenQuestions.add(qKey);
      result.push(resolved);

      if (result.length >= limit) {
        return result;
      }
    }
  }

  return result;
}

/**
 * Bosh sahifa (/) uchun FAQ savollarini yig'adi:
 * 1. 1C dan kelgan `page:home` savollari;
 * 2. Agar 8 tadan kam bo'lsa, dizayndagi 2×4 muvozanat buzilmasligi uchun
 *    FIXTURE_FAQS zaxira savollari bilan 8 taga to'ldiriladi.
 */
export function resolveHomeFaqs(
  faqs: FaqItem[],
  locale: "uz" | "ru",
  options?: {
    limit?: number;
    fallbackFaqs?: FaqItem[];
  }
): ResolvedFaqItem[] {
  const limit = options?.limit ?? DEFAULT_HOME_LIMIT;
  const fallbackPool = options?.fallbackFaqs ?? FIXTURE_FAQS;

  const liveHomeBucket = faqs.filter((item) => hasTarget(item, "page", "home"));

  // Count how many times each topic already appears in live home FAQs so padding
  // prefers missing/underrepresented buyer topics (e.g. warranty, product_info) first.
  const topicCounts = new Map<FaqTopic, number>();
  for (const item of liveHomeBucket) {
    if (item.is_active) {
      topicCounts.set(item.topic, (topicCounts.get(item.topic) ?? 0) + 1);
    }
  }

  const fallbackHomeBucket = fallbackPool
    .filter((item) => hasTarget(item, "page", "home"))
    .sort((a, b) => {
      const countDiff =
        (topicCounts.get(a.topic) ?? 0) - (topicCounts.get(b.topic) ?? 0);
      return countDiff !== 0 ? countDiff : a.sort_order - b.sort_order;
    });

  // Note: resolveFromBuckets sorts each bucket by sort_order; split fallback into
  // missing-topic bucket and remaining-fallback bucket so topic diversity is preserved.
  const missingTopicFallback = fallbackHomeBucket.filter(
    (item) => (topicCounts.get(item.topic) ?? 0) === 0
  );
  const otherFallback = fallbackHomeBucket.filter(
    (item) => (topicCounts.get(item.topic) ?? 0) > 0
  );

  return resolveFromBuckets(
    [liveHomeBucket, missingTopicFallback, otherFallback],
    locale,
    limit,
    { dedupeByQuestion: true }
  );
}

/**
 * Statik sahifalar (/delivery, /payment, /b2b, /warranty, /contact) uchun FAQ.
 */
export function resolvePageFaqs(
  faqs: FaqItem[],
  pageKey: FaqPageKey | string,
  locale: "uz" | "ru",
  options?: {
    limit?: number;
    fallbackFaqs?: FaqItem[];
  }
): ResolvedFaqItem[] {
  const limit = options?.limit ?? DEFAULT_PAGE_LIMIT;
  const liveBucket = faqs.filter((item) => hasTarget(item, "page", pageKey));

  const buckets: FaqItem[][] = [liveBucket];
  if (options?.fallbackFaqs && options.fallbackFaqs.length > 0) {
    buckets.push(
      options.fallbackFaqs.filter((item) => hasTarget(item, "page", pageKey))
    );
  }

  return resolveFromBuckets(buckets, locale, limit, {
    dedupeByQuestion: true,
  });
}

/**
 * Kategoriya sahifasi uchun ustuvorlik kaskadi:
 * 1. category:<current_id>
 * 2. Ota-kategoriyalar zanjirida include_children: true bo'lgan savollar (yaqinidan ildizgacha)
 * 3. category:*
 */
export function resolveCategoryFaqs(
  faqs: FaqItem[],
  params: {
    categoryId: string;
    categories?: Category[];
    locale: "uz" | "ru";
    limit?: number;
  }
): ResolvedFaqItem[] {
  const { categoryId, categories = [], locale, limit = DEFAULT_ENTITY_LIMIT } = params;

  const currentBucket = faqs.filter((item) =>
    hasTarget(item, "category", categoryId)
  );

  const buckets: FaqItem[][] = [currentBucket];

  // Ancestors from closest parent up to root (exclude current category itself)
  if (categories.length > 0) {
    const breadcrumb = getCategoryBreadcrumb(categories, categoryId);
    const ancestors = breadcrumb.slice(0, -1).reverse();

    for (const ancestor of ancestors) {
      const ancestorBucket = faqs.filter((item) =>
        hasTarget(item, "category", ancestor.id, true)
      );
      if (ancestorBucket.length > 0) {
        buckets.push(ancestorBucket);
      }
    }
  }

  const wildcardBucket = faqs.filter((item) =>
    hasTarget(item, "category", "*")
  );
  buckets.push(wildcardBucket);

  return resolveFromBuckets(buckets, locale, limit);
}

/**
 * Finds matching Category ID for a product using its localized category slugs.
 */
function findProductCategoryId(
  product: Product,
  categories: Category[]
): string | undefined {
  if (categories.length === 0) return undefined;

  const rawSlugUz = product.uz?.category_slug_uz?.trim();
  const rawSlugRu = product.ru?.category_slug_ru?.trim();
  const slugUz = rawSlugUz ? CATEGORY_SLUG_ALIASES[rawSlugUz] || rawSlugUz : "";
  const slugRu = rawSlugRu ? CATEGORY_SLUG_ALIASES[rawSlugRu] || rawSlugRu : "";

  const found = categories.find(
    (c) =>
      (slugUz && c.group_slug_uz === slugUz) ||
      (rawSlugUz && c.group_slug_uz === rawSlugUz) ||
      (slugRu && c.group_slug_ru === slugRu) ||
      (rawSlugRu && c.group_slug_ru === rawSlugRu)
  );

  return found?.id;
}

/**
 * Finds matching Brand ID for a product using case-insensitive brand name lookup.
 */
function findProductBrandId(
  product: Product,
  brands: Brand[]
): string | undefined {
  const brandName = product.brand?.trim().toLowerCase();
  if (!brandName || brands.length === 0) return undefined;

  return brands.find((b) => b.name.trim().toLowerCase() === brandName)?.id;
}

/**
 * Mahsulot sahifasi uchun ustuvorlik kaskadi:
 * 1. product:<product_id>
 * 2. category:<product.category_id> va ota-kategoriyalari (include_children: true)
 * 3. brand:<product.brand_id>
 * 4. product:*
 */
export function resolveProductFaqs(
  faqs: FaqItem[],
  params: {
    product: Product;
    categories?: Category[];
    brands?: Brand[];
    categoryId?: string;
    brandId?: string;
    locale: "uz" | "ru";
    limit?: number;
  }
): ResolvedFaqItem[] {
  const {
    product,
    categories = [],
    brands = [],
    locale,
    limit = DEFAULT_ENTITY_LIMIT,
  } = params;

  const resolvedCategoryId =
    params.categoryId ?? findProductCategoryId(product, categories);
  const resolvedBrandId =
    params.brandId ?? findProductBrandId(product, brands);

  // 1. Direct product target
  const productBucket = faqs.filter((item) =>
    hasTarget(item, "product", product.id)
  );
  const buckets: FaqItem[][] = [productBucket];

  // 2. Category & ancestor categories
  if (resolvedCategoryId) {
    const directCatBucket = faqs.filter((item) =>
      hasTarget(item, "category", resolvedCategoryId)
    );
    if (directCatBucket.length > 0) {
      buckets.push(directCatBucket);
    }

    if (categories.length > 0) {
      const breadcrumb = getCategoryBreadcrumb(categories, resolvedCategoryId);
      const ancestors = breadcrumb.slice(0, -1).reverse();

      for (const ancestor of ancestors) {
        const ancestorBucket = faqs.filter((item) =>
          hasTarget(item, "category", ancestor.id, true)
        );
        if (ancestorBucket.length > 0) {
          buckets.push(ancestorBucket);
        }
      }
    }
  }

  // 3. Brand target
  if (resolvedBrandId) {
    const brandBucket = faqs.filter((item) =>
      hasTarget(item, "brand", resolvedBrandId)
    );
    if (brandBucket.length > 0) {
      buckets.push(brandBucket);
    }
  }

  // 4. Wildcard product:* target
  const wildcardBucket = faqs.filter((item) =>
    hasTarget(item, "product", "*")
  );
  buckets.push(wildcardBucket);

  return resolveFromBuckets(buckets, locale, limit);
}

/**
 * Brend sahifasi (/brand/[slug]) uchun FAQ:
 * 1. brand:<brand_id>
 */
export function resolveBrandFaqs(
  faqs: FaqItem[],
  params: {
    brandId: string;
    locale: "uz" | "ru";
    limit?: number;
  }
): ResolvedFaqItem[] {
  const { brandId, locale, limit = DEFAULT_ENTITY_LIMIT } = params;

  const brandBucket = faqs.filter((item) =>
    hasTarget(item, "brand", brandId)
  );

  return resolveFromBuckets([brandBucket], locale, limit);
}
