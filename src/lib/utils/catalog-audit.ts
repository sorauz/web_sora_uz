import type { Product } from "../schemas/product";
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
  retailPrice: number;
  wholesalePrice: number;
  effectivePrice: number;
  stock: string;
  barcode: string;
  hasImage: boolean;
  imageUrl: string;
  merchantApproved: boolean;
  issues: AuditIssueKey[];
  seoMissingFields?: string[];
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
}

export interface CatalogAuditReport {
  generatedAt: string;
  isFallback: boolean;
  summary: CatalogAuditSummary;
  brands: string[];
  categories: string[];
  items: AuditProductRow[];
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

/**
 * Evaluates all 1C products against Google Merchant Center and SEO completeness rules.
 */
export function buildCatalogAuditReport(
  products: Product[],
  isFallback: boolean,
  locale: "uz" | "ru" = "uz",
  checkedSeoIds?: Set<string>
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

    const brand = (p.brand || "").trim();
    if (brand) brandSet.add(brand);

    const catUz = (p.uz?.category_uz || "").trim();
    const catRu = (p.ru?.category_ru || "").trim();
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
      retailPrice,
      wholesalePrice,
      effectivePrice,
      stock,
      barcode: rawBarcode,
      hasImage,
      imageUrl,
      merchantApproved,
      issues,
      ...(seoMissingFields.length > 0 ? { seoMissingFields } : {}),
    });
  }

  return {
    generatedAt: new Date().toISOString(),
    isFallback,
    summary,
    brands: Array.from(brandSet).sort((a, b) => a.localeCompare(b)),
    categories: Array.from(categorySet).sort((a, b) => a.localeCompare(b)),
    items,
  };
}

export interface AuditFilterCriteria {
  issue?: AuditFilterPreset;
  brand?: string;
  category?: string;
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
  const q = filters.q?.trim().toLowerCase() || "";

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

    if (brandFilter && item.brand !== brandFilter) {
      return false;
    }

    if (categoryFilter) {
      const cat =
        locale === "uz"
          ? item.categoryUz || item.categoryRu
          : item.categoryRu || item.categoryUz;
      if (cat !== categoryFilter) return false;
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
      escapeCsvCell(issueText),
      escapeCsvCell(productUrl),
    ].join(",");

    rows.push(line);
  }

  return "\uFEFF" + rows.join("\r\n");
}
