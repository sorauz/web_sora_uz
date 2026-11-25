import { NextRequest, NextResponse } from "next/server";
import { api } from "@/lib/api";
import { isAuditRequestAuthorized } from "@/lib/utils/audit-auth";
import {
  buildAuditCsv,
  buildCatalogAuditReport,
  filterAuditItems,
  type AuditFilterPreset,
  type CrossSellCountBucket,
  type SimilarCountBucket,
} from "@/lib/utils/catalog-audit";
import { buildAuditXlsx } from "@/lib/utils/catalog-audit-excel";

const VALID_PRESETS = new Set<AuditFilterPreset>([
  "all",
  "issues_only",
  "merchant_ready",
  "no_price",
  "no_image",
  "invalid_gtin",
  "invalid_mpn",
  "out_of_stock",
  "missing_seo",
]);

const VALID_SIMILAR = new Set<SimilarCountBucket | "all">([
  "all",
  "lt_4",
  "eq_4",
  "gt_4",
]);

const VALID_CROSS_SELL = new Set<CrossSellCountBucket | "all">([
  "all",
  "lt_12",
  "eq_12",
  "gt_12",
]);

const NO_INDEX_HEADERS = {
  "X-Robots-Tag": "noindex, nofollow, noarchive",
  "Cache-Control": "no-store",
} as const;

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const explicitKey =
    searchParams.get("key") || request.headers.get("x-audit-key");

  if (!(await isAuditRequestAuthorized(explicitKey))) {
    return NextResponse.json(
      { ok: false, error: "Ruxsat yo‘q (401)" },
      { status: 401, headers: NO_INDEX_HEADERS },
    );
  }

  const rawLocale = searchParams.get("locale");
  const locale: "uz" | "ru" = rawLocale === "ru" ? "ru" : "uz";

  const rawIssue = searchParams.get("issue") || "all";
  const issue: AuditFilterPreset = VALID_PRESETS.has(rawIssue as AuditFilterPreset)
    ? (rawIssue as AuditFilterPreset)
    : "all";

  const rawSimilar = (searchParams.get("similar") || "all") as
    | SimilarCountBucket
    | "all";
  const similar: SimilarCountBucket | "all" = VALID_SIMILAR.has(rawSimilar)
    ? rawSimilar
    : "all";

  const rawCrossSell = (searchParams.get("crossSell") || "all") as
    | CrossSellCountBucket
    | "all";
  const crossSell: CrossSellCountBucket | "all" =
    VALID_CROSS_SELL.has(rawCrossSell) ? rawCrossSell : "all";

  const brand = searchParams.get("brand") || "";
  const category = searchParams.get("category") || "";
  const categoryNode = searchParams.get("categoryNode") || "";
  const q = searchParams.get("q") || "";

  const [{ products, isFallback, checkedSeoIds }, categoriesRes, brandsRes] =
    await Promise.all([
      api.getAllProductsWithAuditDetails({ noCache: true }),
      api.getCategories({ noCache: true }),
      api.getBrands({ noCache: true }),
    ]);

  const report = buildCatalogAuditReport(
    products,
    isFallback,
    locale,
    checkedSeoIds,
    {
      categories: categoriesRes.categories,
      categoryTree: categoriesRes.tree,
      brands: brandsRes.data.brands,
    },
  );

  const filtered = filterAuditItems(
    report.items,
    {
      issue,
      brand,
      category,
      categoryNode,
      categoryTreeStats: report.categoryTreeStats,
      similar,
      crossSell,
      q,
    },
    locale,
  );

  const format = searchParams.get("format") || "xlsx";
  const dateTag = new Date().toISOString().slice(0, 10);
  const safeIssue = issue.replace(/[^a-z0-9_-]/gi, "_");

  if (format === "csv") {
    const csv = buildAuditCsv(filtered, locale);
    const filename = `sora-audit-${safeIssue}-${dateTag}.csv`;

    return new NextResponse(csv, {
      status: 200,
      headers: {
        ...NO_INDEX_HEADERS,
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  }

  const xlsxBuffer = await buildAuditXlsx(filtered, locale, {
    brandStats: report.brandStats,
    categoryTreeStats: report.categoryTreeStats,
    uncategorizedStats: report.uncategorizedStats,
  });
  const filename = `sora-audit-${safeIssue}-${dateTag}.xlsx`;

  return new NextResponse(new Uint8Array(xlsxBuffer), {
    status: 200,
    headers: {
      ...NO_INDEX_HEADERS,
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
