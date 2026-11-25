import type { Brand } from "../schemas/brand";
import type { Category, CategoryTreeNode } from "../schemas/category";
import type { Product, SubProductCard } from "../schemas/product";
import { buildCategoryTree } from "./category-tree";
import { calculateProductPrice } from "./price";
import {
  getValidGtin,
  getValidMpn,
  resolveProductImageUrl,
} from "./merchant";

export type AuditIssueKey =
  | "no_price"
  | "no_image"
  | "invalid_gtin"
  | "invalid_mpn"
  | "out_of_stock"
  | "missing_seo";

export type AuditFilterPreset =
  | "all"
  | "issues_only"
  | "merchant_ready"
  | AuditIssueKey;

export type SimilarCountBucket = "lt_4" | "eq_4" | "gt_4";
export type CrossSellCountBucket = "lt_12" | "eq_12" | "gt_12";

export const UNBRANDED_FILTER_KEY = "__unbranded__";
export const UNCATEGORIZED_FILTER_KEY = "__uncategorized__";

export interface AuditProductRow {
  id: string;
  sku: string;
  nameUz: string;
  nameRu: string;
  slugUz: string;
  slugRu: string;
  brand: string;
  categoryUz: string;
  categoryRu: string;
  categorySlugUz: string;
  categorySlugRu: string;
  retailPrice: number;
  wholesalePrice: number;
  effectivePrice: number;
  stock: string;
  barcode: string;
  hasImage: boolean;
  imageUrl: string;
  merchantApproved: boolean;
  seoVerified: boolean;
  similarCount: number;
  similarBucket: SimilarCountBucket;
  crossSellCount: number;
  crossSellBucket: CrossSellCountBucket;
  issues: AuditIssueKey[];
  seoMissingFields?: string[];
}

export interface AuditAggStats {
  totalProducts: number;
  inStockCount: number;
  outOfStockCount: number;
  noPriceCount: number;
  noImageCount: number;
  merchantReadyCount: number;
  similarEq4Count: number;
  crossSellEq12Count: number;
}

export interface AuditBrandStat extends AuditAggStats {
  key: string;
  name: string;
  isUnbranded: boolean;
  isInOfficialBrandsList: boolean;
  sharePercent: number;
}

export interface AuditCategoryNodeStat {
  id: string;
  nameUz: string;
  nameRu: string;
  slugUz: string;
  slugRu: string;
  parentId: string;
  depth: number;
  directCount: number;
  totalTreeCount: number;
  emptySubcategoryCount: number;
  isOrphan?: boolean;
  directStats: AuditAggStats;
  treeStats: AuditAggStats;
  subtreeSlugsUz: string[];
  subtreeSlugsRu: string[];
  subtreeNamesUz: string[];
  subtreeNamesRu: string[];
  children: AuditCategoryNodeStat[];
}

export interface CatalogAuditSummary {
  total: number;
  merchantReady: number;
  noPrice: number;
  noImage: number;
  invalidGtin: number;
  invalidMpn: number;
  outOfStock: number;
  missingSeo: number;
  similarLt4: number;
  similarEq4: number;
  similarGt4: number;
  crossSellLt12: number;
  crossSellEq12: number;
  crossSellGt12: number;
  unbrandedCount: number;
  uncategorizedCount: number;
  emptyCategoryCount: number;
}

export interface CatalogAuditReport {
  generatedAt: string;
  isFallback: boolean;
  summary: CatalogAuditSummary;
  brands: string[];
  categories: string[];
  brandStats: AuditBrandStat[];
  categoryTreeStats: AuditCategoryNodeStat[];
  uncategorizedStats: AuditAggStats;
  items: AuditProductRow[];
}

export interface BuildCatalogAuditOptions {
  categories?: Category[];
  categoryTree?: CategoryTreeNode[];
  brands?: Brand[];
}

export const AUDIT_ISSUE_LABELS: Record<
  AuditIssueKey,
  { uz: string; ru: string }
> = {
  no_price: { uz: "Narxi 0 so'm", ru: "Цена 0 сум" },
  no_image: { uz: "Rasmi yo'q", ru: "Нет фото" },
  invalid_gtin: { uz: "Xato shtrix-kod (GTIN)", ru: "Неверный штрих-код (GTIN)" },
  invalid_mpn: { uz: "Artikul yo'q / N/A", ru: "Нет артикула / N/A" },
  out_of_stock: { uz: "Omborda yo'q", ru: "Нет в наличии" },
  missing_seo: { uz: "Tavsif / SEO bo'sh", ru: "Пустое описание / SEO" },
};

export const SIMILAR_BUCKET_LABELS: Record<
  SimilarCountBucket,
  { uz: string; ru: string }
> = {
  lt_4: { uz: "4 tadan kam", ru: "Меньше 4" },
  eq_4: { uz: "4 ta", ru: "4 шт." },
  gt_4: { uz: "4 tadan ko'p", ru: "Больше 4" },
};

export const CROSS_SELL_BUCKET_LABELS: Record<
  CrossSellCountBucket,
  { uz: string; ru: string }
> = {
  lt_12: { uz: "12 tadan kam", ru: "Меньше 12" },
  eq_12: { uz: "12 ta", ru: "12 шт." },
  gt_12: { uz: "12 tadan ko'p", ru: "Больше 12" },
};

function countUniqueRelations(
  list: SubProductCard[] | undefined,
  selfId: string,
  kind: "recommended" | "related"
): number {
  if (!Array.isArray(list) || list.length === 0) return 0;
  const seen = new Set<string>();
  for (const entry of list) {
    if (!entry || typeof entry !== "object") continue;
    const targetId = (
      kind === "recommended"
        ? entry.recommended_products_id || entry.id || ""
        : entry.related_products_id || entry.id || ""
    ).trim();
    if (targetId && targetId === selfId) continue;

    const fallbackSlug = (
      entry.slug_uz ||
      entry.slug_ru ||
      entry.slug ||
      entry.name_uz ||
      entry.name_ru ||
      ""
    ).trim();
    const dedupeKey = targetId || fallbackSlug;
    if (dedupeKey) seen.add(dedupeKey);
  }
  return seen.size;
}

function getSimilarBucket(count: number): SimilarCountBucket {
  if (count < 4) return "lt_4";
  if (count === 4) return "eq_4";
  return "gt_4";
}

function getCrossSellBucket(count: number): CrossSellCountBucket {
  if (count < 12) return "lt_12";
  if (count === 12) return "eq_12";
  return "gt_12";
}

function createEmptyAggStats(): AuditAggStats {
  return {
    totalProducts: 0,
    inStockCount: 0,
    outOfStockCount: 0,
    noPriceCount: 0,
    noImageCount: 0,
    merchantReadyCount: 0,
    similarEq4Count: 0,
    crossSellEq12Count: 0,
  };
}

function accumulateRowStats(stats: AuditAggStats, row: AuditProductRow): void {
  stats.totalProducts++;
  if (row.stock === "OutOfStock") {
    stats.outOfStockCount++;
  } else {
    stats.inStockCount++;
  }
  if (row.effectivePrice <= 0) stats.noPriceCount++;
  if (!row.hasImage) stats.noImageCount++;
  if (row.merchantApproved) stats.merchantReadyCount++;
  if (row.similarBucket === "eq_4") stats.similarEq4Count++;
  if (row.crossSellBucket === "eq_12") stats.crossSellEq12Count++;
}

function mergeAggStats(target: AuditAggStats, source: AuditAggStats): void {
  target.totalProducts += source.totalProducts;
  target.inStockCount += source.inStockCount;
  target.outOfStockCount += source.outOfStockCount;
  target.noPriceCount += source.noPriceCount;
  target.noImageCount += source.noImageCount;
  target.merchantReadyCount += source.merchantReadyCount;
  target.similarEq4Count += source.similarEq4Count;
  target.crossSellEq12Count += source.crossSellEq12Count;
}

function normalizeLookupKey(value: string): string {
  return value.trim().toLowerCase();
}

function buildBrandStats(
  items: AuditProductRow[],
  officialBrands: Brand[] = []
): AuditBrandStat[] {
  const totalCatalog = items.length;
  const officialNameSet = new Set(
    officialBrands.map((b) => normalizeLookupKey(b.name)).filter(Boolean)
  );
  const byBrand = new Map<string, AuditBrandStat>();
  const unbrandedStats = createEmptyAggStats();

  for (const b of officialBrands) {
    const cleanName = b.name.trim();
    if (!cleanName) continue;
    const norm = normalizeLookupKey(cleanName);
    if (!byBrand.has(norm)) {
      byBrand.set(norm, {
        key: cleanName,
        name: cleanName,
        isUnbranded: false,
        isInOfficialBrandsList: true,
        sharePercent: 0,
        ...createEmptyAggStats(),
      });
    }
  }

  for (const row of items) {
    if (!row.brand) {
      accumulateRowStats(unbrandedStats, row);
      continue;
    }
    const norm = normalizeLookupKey(row.brand);
    let entry = byBrand.get(norm);
    if (!entry) {
      entry = {
        key: row.brand,
        name: row.brand,
        isUnbranded: false,
        isInOfficialBrandsList: officialNameSet.has(norm),
        sharePercent: 0,
        ...createEmptyAggStats(),
      };
      byBrand.set(norm, entry);
    }
    accumulateRowStats(entry, row);
  }

  const statsList = Array.from(byBrand.values()).map((entry) => ({
    ...entry,
    sharePercent:
      totalCatalog > 0
        ? Math.round((entry.totalProducts / totalCatalog) * 1000) / 10
        : 0,
  }));

  statsList.sort((a, b) => {
    if (b.totalProducts !== a.totalProducts) {
      return b.totalProducts - a.totalProducts;
    }
    return a.name.localeCompare(b.name);
  });

  if (unbrandedStats.totalProducts > 0) {
    statsList.push({
      key: UNBRANDED_FILTER_KEY,
      name: "",
      isUnbranded: true,
      isInOfficialBrandsList: false,
      sharePercent:
        totalCatalog > 0
          ? Math.round((unbrandedStats.totalProducts / totalCatalog) * 1000) /
            10
          : 0,
      ...unbrandedStats,
    });
  }

  return statsList;
}

function buildCategoryTreeStats(
  items: AuditProductRow[],
  rawTree: CategoryTreeNode[]
): {
  treeStats: AuditCategoryNodeStat[];
  uncategorizedStats: AuditAggStats;
  emptyCategoryCount: number;
} {
  const bySlug = new Map<string, string>();
  const byName = new Map<string, string>();

  const indexTreeNodes = (nodes: CategoryTreeNode[]) => {
    for (const node of nodes) {
      if (node.group_slug_uz?.trim()) {
        bySlug.set(normalizeLookupKey(node.group_slug_uz), node.id);
      }
      if (node.group_slug_ru?.trim()) {
        bySlug.set(normalizeLookupKey(node.group_slug_ru), node.id);
      }
      if (node.group_uz?.trim()) {
        byName.set(normalizeLookupKey(node.group_uz), node.id);
      }
      if (node.group_ru?.trim()) {
        byName.set(normalizeLookupKey(node.group_ru), node.id);
      }
      if (node.children?.length) {
        indexTreeNodes(node.children);
      }
    }
  };
  indexTreeNodes(rawTree);

  const directRowsByNodeId = new Map<string, AuditAggStats>();
  const orphanByKey = new Map<
    string,
    {
      nameUz: string;
      nameRu: string;
      slugUz: string;
      slugRu: string;
      stats: AuditAggStats;
    }
  >();
  const uncategorizedStats = createEmptyAggStats();

  for (const row of items) {
    const slugUzKey = normalizeLookupKey(row.categorySlugUz);
    const slugRuKey = normalizeLookupKey(row.categorySlugRu);
    const nameUzKey = normalizeLookupKey(row.categoryUz);
    const nameRuKey = normalizeLookupKey(row.categoryRu);

    const matchedNodeId =
      (slugUzKey && bySlug.get(slugUzKey)) ||
      (slugRuKey && bySlug.get(slugRuKey)) ||
      (nameUzKey && byName.get(nameUzKey)) ||
      (nameRuKey && byName.get(nameRuKey)) ||
      "";

    if (matchedNodeId) {
      let stats = directRowsByNodeId.get(matchedNodeId);
      if (!stats) {
        stats = createEmptyAggStats();
        directRowsByNodeId.set(matchedNodeId, stats);
      }
      accumulateRowStats(stats, row);
      continue;
    }

    if (!nameUzKey && !nameRuKey && !slugUzKey && !slugRuKey) {
      accumulateRowStats(uncategorizedStats, row);
      continue;
    }

    const orphanKey = slugUzKey || slugRuKey || nameUzKey || nameRuKey;
    let orphan = orphanByKey.get(orphanKey);
    if (!orphan) {
      orphan = {
        nameUz: row.categoryUz || row.categoryRu,
        nameRu: row.categoryRu || row.categoryUz,
        slugUz: row.categorySlugUz,
        slugRu: row.categorySlugRu,
        stats: createEmptyAggStats(),
      };
      orphanByKey.set(orphanKey, orphan);
    }
    accumulateRowStats(orphan.stats, row);
  }

  let emptyCategoryCount = 0;

  const mapNode = (
    node: CategoryTreeNode,
    depth: number
  ): AuditCategoryNodeStat => {
    const directStats =
      directRowsByNodeId.get(node.id) ?? createEmptyAggStats();
    const treeStats = { ...directStats };
    const subtreeSlugsUz = new Set<string>();
    const subtreeSlugsRu = new Set<string>();
    const subtreeNamesUz = new Set<string>();
    const subtreeNamesRu = new Set<string>();

    if (node.group_slug_uz?.trim()) subtreeSlugsUz.add(node.group_slug_uz.trim());
    if (node.group_slug_ru?.trim()) subtreeSlugsRu.add(node.group_slug_ru.trim());
    if (node.group_uz?.trim()) subtreeNamesUz.add(node.group_uz.trim());
    if (node.group_ru?.trim()) subtreeNamesRu.add(node.group_ru.trim());

    const mappedChildren = (node.children || []).map((child) => {
      const childStat = mapNode(child, depth + 1);
      mergeAggStats(treeStats, childStat.treeStats);
      for (const s of childStat.subtreeSlugsUz) subtreeSlugsUz.add(s);
      for (const s of childStat.subtreeSlugsRu) subtreeSlugsRu.add(s);
      for (const n of childStat.subtreeNamesUz) subtreeNamesUz.add(n);
      for (const n of childStat.subtreeNamesRu) subtreeNamesRu.add(n);
      return childStat;
    });

    mappedChildren.sort((a, b) => {
      if (b.totalTreeCount !== a.totalTreeCount) {
        return b.totalTreeCount - a.totalTreeCount;
      }
      return a.nameUz.localeCompare(b.nameUz);
    });

    if (treeStats.totalProducts === 0) {
      emptyCategoryCount++;
    }

    const emptyChildCount = mappedChildren.reduce(
      (acc, c) =>
        acc + (c.totalTreeCount === 0 ? 1 : 0) + c.emptySubcategoryCount,
      0
    );

    return {
      id: node.id,
      nameUz: node.group_uz,
      nameRu: node.group_ru,
      slugUz: node.group_slug_uz,
      slugRu: node.group_slug_ru,
      parentId: node.parent_id || "",
      depth,
      directCount: directStats.totalProducts,
      totalTreeCount: treeStats.totalProducts,
      emptySubcategoryCount: emptyChildCount,
      directStats,
      treeStats,
      subtreeSlugsUz: Array.from(subtreeSlugsUz),
      subtreeSlugsRu: Array.from(subtreeSlugsRu),
      subtreeNamesUz: Array.from(subtreeNamesUz),
      subtreeNamesRu: Array.from(subtreeNamesRu),
      children: mappedChildren,
    };
  };

  const treeStats = rawTree.map((root) => mapNode(root, 0));

  for (const [orphanKey, orphan] of orphanByKey.entries()) {
    treeStats.push({
      id: `orphan:${orphanKey}`,
      nameUz: orphan.nameUz,
      nameRu: orphan.nameRu,
      slugUz: orphan.slugUz,
      slugRu: orphan.slugRu,
      parentId: "",
      depth: 0,
      directCount: orphan.stats.totalProducts,
      totalTreeCount: orphan.stats.totalProducts,
      emptySubcategoryCount: 0,
      isOrphan: true,
      directStats: orphan.stats,
      treeStats: { ...orphan.stats },
      subtreeSlugsUz: orphan.slugUz ? [orphan.slugUz] : [],
      subtreeSlugsRu: orphan.slugRu ? [orphan.slugRu] : [],
      subtreeNamesUz: orphan.nameUz ? [orphan.nameUz] : [],
      subtreeNamesRu: orphan.nameRu ? [orphan.nameRu] : [],
      children: [],
    });
  }

  treeStats.sort((a, b) => {
    if (b.totalTreeCount !== a.totalTreeCount) {
      return b.totalTreeCount - a.totalTreeCount;
    }
    return a.nameUz.localeCompare(b.nameUz);
  });

  return { treeStats, uncategorizedStats, emptyCategoryCount };
}

export function findCategoryNodeStat(
  tree: AuditCategoryNodeStat[],
  nodeKey: string
): AuditCategoryNodeStat | null {
  const normalized = nodeKey.trim();
  if (!normalized) return null;

  for (const node of tree) {
    if (
      node.id === normalized ||
      (node.slugUz && node.slugUz === normalized) ||
      (node.slugRu && node.slugRu === normalized)
    ) {
      return node;
    }
    if (node.children.length > 0) {
      const found = findCategoryNodeStat(node.children, normalized);
      if (found) return found;
    }
  }
  return null;
}

/**
 * Evaluates all 1C products against Google Merchant Center, SEO,
 * product relation completeness, brand, and category tree analytics.
 */
export function buildCatalogAuditReport(
  products: Product[],
  isFallback: boolean,
  locale: "uz" | "ru" = "uz",
  checkedSeoIds?: Set<string>,
  options?: BuildCatalogAuditOptions
): CatalogAuditReport {
  const summary: CatalogAuditSummary = {
    total: 0,
    merchantReady: 0,
    noPrice: 0,
    noImage: 0,
    invalidGtin: 0,
    invalidMpn: 0,
    outOfStock: 0,
    missingSeo: 0,
    similarLt4: 0,
    similarEq4: 0,
    similarGt4: 0,
    crossSellLt12: 0,
    crossSellEq12: 0,
    crossSellGt12: 0,
    unbrandedCount: 0,
    uncategorizedCount: 0,
    emptyCategoryCount: 0,
  };

  const brandSet = new Set<string>();
  const categorySet = new Set<string>();
  const items: AuditProductRow[] = [];

  for (const p of products) {
    summary.total++;

    const priceInfo = calculateProductPrice(p.price);
    const retailPrice = Number(p.price?.retail_price) || 0;
    const wholesalePrice = Number(p.price?.wholesale_price) || 0;
    const effectivePrice = priceInfo.price;
    const stock = p.price?.stock || "InStock";

    const rawPicture = (p.main_picture || "").trim();
    const hasImage = rawPicture.length > 0;
    const imageUrl = hasImage
      ? resolveProductImageUrl(rawPicture, { updatedAt: p.updated_at })
      : "";

    const rawBarcode = (p.barcode || "").trim();
    const validGtin = getValidGtin(rawBarcode);
    const hasInvalidGtin = rawBarcode.length > 0 && !validGtin;

    const validMpn = getValidMpn(p.product_sku);
    const hasInvalidMpn = !validMpn;

    const isOutOfStock = stock === "OutOfStock";
    const seoVerified = !checkedSeoIds || checkedSeoIds.has(p.id);
    const seoMissingFields: string[] = [];
    if (seoVerified) {
      if (!p.uz?.short_description_uz?.trim()) seoMissingFields.push("short_uz");
      if (!p.uz?.meta_description_uz?.trim()) seoMissingFields.push("meta_uz");
      if (!p.uz?.product_description_uz?.trim()) seoMissingFields.push("desc_uz");
      if (!p.ru?.short_description_ru?.trim()) seoMissingFields.push("short_ru");
      if (!p.ru?.meta_description_ru?.trim()) seoMissingFields.push("meta_ru");
      if (!p.ru?.product_description_ru?.trim()) seoMissingFields.push("desc_ru");
      if (!p.attributes || p.attributes.length === 0) {
        seoMissingFields.push("attributes");
      }
    }
    const missingSeo = seoVerified && seoMissingFields.length > 0;

    const noPrice = effectivePrice <= 0;

    const issues: AuditIssueKey[] = [];
    if (noPrice) {
      issues.push("no_price");
      summary.noPrice++;
    }
    if (!hasImage) {
      issues.push("no_image");
      summary.noImage++;
    }
    if (hasInvalidGtin) {
      issues.push("invalid_gtin");
      summary.invalidGtin++;
    }
    if (hasInvalidMpn) {
      issues.push("invalid_mpn");
      summary.invalidMpn++;
    }
    if (isOutOfStock) {
      issues.push("out_of_stock");
      summary.outOfStock++;
    }
    if (missingSeo) {
      issues.push("missing_seo");
      summary.missingSeo++;
    }

    const merchantApproved =
      !noPrice && hasImage && !hasInvalidGtin && !hasInvalidMpn;
    if (merchantApproved) {
      summary.merchantReady++;
    }

    // 1C PDP mapping: recommended_products -> O'xshash mahsulotlar (target: 4),
    // related_products -> Bilan birga xarid qilinadi (target: 12)
    const similarCount = countUniqueRelations(
      p.recommended_products,
      p.id,
      "recommended"
    );
    const similarBucket = getSimilarBucket(similarCount);
    if (similarBucket === "lt_4") summary.similarLt4++;
    else if (similarBucket === "eq_4") summary.similarEq4++;
    else summary.similarGt4++;

    const crossSellCount = countUniqueRelations(
      p.related_products,
      p.id,
      "related"
    );
    const crossSellBucket = getCrossSellBucket(crossSellCount);
    if (crossSellBucket === "lt_12") summary.crossSellLt12++;
    else if (crossSellBucket === "eq_12") summary.crossSellEq12++;
    else summary.crossSellGt12++;

    const brand = (p.brand || "").trim();
    if (brand) {
      brandSet.add(brand);
    } else {
      summary.unbrandedCount++;
    }

    const catUz = (p.uz?.category_uz || "").trim();
    const catRu = (p.ru?.category_ru || "").trim();
    const catSlugUz = (p.uz?.category_slug_uz || "").trim();
    const catSlugRu = (p.ru?.category_slug_ru || "").trim();
    const activeCat = locale === "uz" ? catUz || catRu : catRu || catUz;
    if (activeCat) categorySet.add(activeCat);

    items.push({
      id: p.id,
      sku: (p.product_sku || "").trim(),
      nameUz: (p.uz?.name_uz || p.ru?.name_ru || "").trim(),
      nameRu: (p.ru?.name_ru || p.uz?.name_uz || "").trim(),
      slugUz: (p.uz?.slug_uz || p.ru?.slug_ru || "").trim(),
      slugRu: (p.ru?.slug_ru || p.uz?.slug_uz || "").trim(),
      brand,
      categoryUz: catUz,
      categoryRu: catRu,
      categorySlugUz: catSlugUz,
      categorySlugRu: catSlugRu,
      retailPrice,
      wholesalePrice,
      effectivePrice,
      stock,
      barcode: rawBarcode,
      hasImage,
      imageUrl,
      merchantApproved,
      seoVerified,
      similarCount,
      similarBucket,
      crossSellCount,
      crossSellBucket,
      issues,
      ...(seoMissingFields.length > 0 ? { seoMissingFields } : {}),
    });
  }

  const brandStats = buildBrandStats(items, options?.brands ?? []);

  const rawTree =
    options?.categoryTree && options.categoryTree.length > 0
      ? options.categoryTree
      : options?.categories && options.categories.length > 0
      ? buildCategoryTree(options.categories)
      : [];

  const {
    treeStats: categoryTreeStats,
    uncategorizedStats,
    emptyCategoryCount,
  } = buildCategoryTreeStats(items, rawTree);

  summary.uncategorizedCount = uncategorizedStats.totalProducts;
  summary.emptyCategoryCount = emptyCategoryCount;

  return {
    generatedAt: new Date().toISOString(),
    isFallback,
    summary,
    brands: Array.from(brandSet).sort((a, b) => a.localeCompare(b)),
    categories: Array.from(categorySet).sort((a, b) => a.localeCompare(b)),
    brandStats,
    categoryTreeStats,
    uncategorizedStats,
    items,
  };
}

export interface AuditFilterCriteria {
  issue?: AuditFilterPreset;
  brand?: string;
  category?: string;
  categoryNode?: string;
  categoryTreeStats?: AuditCategoryNodeStat[];
  similar?: SimilarCountBucket | "all";
  crossSell?: CrossSellCountBucket | "all";
  q?: string;
}

export function filterAuditItems(
  items: AuditProductRow[],
  filters: AuditFilterCriteria,
  locale: "uz" | "ru" = "uz"
): AuditProductRow[] {
  const issueFilter = filters.issue || "all";
  const brandFilter = filters.brand?.trim() || "";
  const categoryFilter = filters.category?.trim() || "";
  const categoryNodeKey = filters.categoryNode?.trim() || "";
  const similarFilter = filters.similar || "all";
  const crossSellFilter = filters.crossSell || "all";
  const q = filters.q?.trim().toLowerCase() || "";

  let nodeSlugUzSet: Set<string> | null = null;
  let nodeSlugRuSet: Set<string> | null = null;
  let nodeNameUzSet: Set<string> | null = null;
  let nodeNameRuSet: Set<string> | null = null;

  if (
    categoryNodeKey &&
    categoryNodeKey !== UNCATEGORIZED_FILTER_KEY &&
    filters.categoryTreeStats?.length
  ) {
    const matchedNode = findCategoryNodeStat(
      filters.categoryTreeStats,
      categoryNodeKey
    );
    if (matchedNode) {
      nodeSlugUzSet = new Set(matchedNode.subtreeSlugsUz.map(normalizeLookupKey));
      nodeSlugRuSet = new Set(matchedNode.subtreeSlugsRu.map(normalizeLookupKey));
      nodeNameUzSet = new Set(matchedNode.subtreeNamesUz.map(normalizeLookupKey));
      nodeNameRuSet = new Set(matchedNode.subtreeNamesRu.map(normalizeLookupKey));
    }
  }

  return items.filter((item) => {
    if (issueFilter === "merchant_ready" && !item.merchantApproved) {
      return false;
    }
    if (issueFilter === "issues_only" && item.issues.length === 0) {
      return false;
    }
    if (
      issueFilter !== "all" &&
      issueFilter !== "merchant_ready" &&
      issueFilter !== "issues_only" &&
      !item.issues.includes(issueFilter)
    ) {
      return false;
    }

    if (brandFilter === UNBRANDED_FILTER_KEY) {
      if (item.brand) return false;
    } else if (brandFilter && item.brand !== brandFilter) {
      return false;
    }

    if (
      categoryFilter === UNCATEGORIZED_FILTER_KEY ||
      categoryNodeKey === UNCATEGORIZED_FILTER_KEY
    ) {
      if (
        item.categoryUz ||
        item.categoryRu ||
        item.categorySlugUz ||
        item.categorySlugRu
      ) {
        return false;
      }
    } else if (nodeSlugUzSet && nodeSlugRuSet && nodeNameUzSet && nodeNameRuSet) {
      const slugUz = normalizeLookupKey(item.categorySlugUz);
      const slugRu = normalizeLookupKey(item.categorySlugRu);
      const nameUz = normalizeLookupKey(item.categoryUz);
      const nameRu = normalizeLookupKey(item.categoryRu);
      const matchesSubtree =
        (slugUz && nodeSlugUzSet.has(slugUz)) ||
        (slugRu && nodeSlugRuSet.has(slugRu)) ||
        (nameUz && nodeNameUzSet.has(nameUz)) ||
        (nameRu && nodeNameRuSet.has(nameRu));
      if (!matchesSubtree) return false;
    } else if (categoryFilter) {
      const cat =
        locale === "uz"
          ? item.categoryUz || item.categoryRu
          : item.categoryRu || item.categoryUz;
      if (cat !== categoryFilter) return false;
    }

    if (similarFilter !== "all" && item.similarBucket !== similarFilter) {
      return false;
    }

    if (crossSellFilter !== "all" && item.crossSellBucket !== crossSellFilter) {
      return false;
    }

    if (q) {
      const haystack = `${item.nameUz} ${item.nameRu} ${item.sku} ${item.barcode} ${item.id} ${item.brand}`.toLowerCase();
      if (!haystack.includes(q)) return false;
    }

    return true;
  });
}

function escapeCsvCell(value: string): string {
  // Neutralize spreadsheet formula injection (=, +, -, @) unless intentional ="..." wrapper
  const safe = value.replace(/"/g, '""');
  return `"${safe}"`;
}

/**
 * Formats an identifier (SKU, Barcode, ID) as an Excel text literal (`="000001321"`)
 * so leading zeros are never stripped and 13-digit barcodes never convert to `4.60E+12`.
 */
function formatExcelTextCell(value: string): string {
  if (!value) return '""';
  const cleaned = value.replace(/"/g, '""');
  return `"=""${cleaned}"""`;
}

/**
 * Generates UTF-8 BOM CSV ready to open cleanly in Microsoft Excel.
 */
export function buildAuditCsv(
  items: AuditProductRow[],
  locale: "uz" | "ru" = "uz"
): string {
  const headers = [
    "1C_ID",
    "Artikul_SKU",
    "Mahsulot_Nomi_UZ",
    "Mahsulot_Nomi_RU",
    "Brend",
    "Kategoriya",
    "Chakana_Narx",
    "Ulgurji_Narx",
    "Qoldiq_Holati",
    "Shtrix_Kod",
    "Rasm_Bormi",
    "Merchant_Holati",
    "Oxshash_Soni",
    "Oxshash_Holati",
    "Birga_Xarid_Soni",
    "Birga_Xarid_Holati",
    "Muammo_Sabablari",
    "Sayt_Havolasi",
  ];

  const rows: string[] = [headers.map(escapeCsvCell).join(",")];

  for (const item of items) {
    const issueText =
      item.issues.length > 0
        ? item.issues
            .map((k) =>
              k === "missing_seo" && item.seoMissingFields?.length
                ? `${AUDIT_ISSUE_LABELS[k][locale]} (${item.seoMissingFields.join(", ")})`
                : AUDIT_ISSUE_LABELS[k][locale]
            )
            .join("; ")
        : locale === "uz"
        ? "Muammo yo'q"
        : "Без ошибок";

    const productUrl = item.slugUz
      ? `https://sora.uz/${locale}/products/${locale === "uz" ? item.slugUz : item.slugRu}`
      : "";

    const line = [
      formatExcelTextCell(item.id),
      formatExcelTextCell(item.sku),
      escapeCsvCell(item.nameUz),
      escapeCsvCell(item.nameRu),
      escapeCsvCell(item.brand),
      escapeCsvCell(locale === "uz" ? item.categoryUz : item.categoryRu),
      String(item.retailPrice),
      String(item.wholesalePrice),
      escapeCsvCell(item.stock),
      formatExcelTextCell(item.barcode),
      escapeCsvCell(item.hasImage ? (locale === "uz" ? "Ha" : "Да") : locale === "uz" ? "Yo'q" : "Нет"),
      escapeCsvCell(
        item.merchantApproved
          ? locale === "uz"
            ? "Tasdiqlanadi"
            : "Одобрен"
          : locale === "uz"
          ? "Rad etiladi"
          : "Отклонен"
      ),
      String(item.similarCount),
      escapeCsvCell(SIMILAR_BUCKET_LABELS[item.similarBucket][locale]),
      String(item.crossSellCount),
      escapeCsvCell(CROSS_SELL_BUCKET_LABELS[item.crossSellBucket][locale]),
      escapeCsvCell(issueText),
      escapeCsvCell(productUrl),
    ].join(",");

    rows.push(line);
  }

  return "\uFEFF" + rows.join("\r\n");
}
