import { NextRequest, NextResponse } from "next/server";
import { api } from "@/lib/api";
import { isAuditRequestAuthorized } from "@/lib/utils/audit-auth";
import {
  buildAuditCsv,
  buildCatalogAuditReport,
  filterAuditItems,
  type AuditFilterPreset,
} from "@/lib/utils/catalog-audit";

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

  const brand = searchParams.get("brand") || "";
  const category = searchParams.get("category") || "";
  const q = searchParams.get("q") || "";

  const { products, isFallback, checkedSeoIds } =
    await api.getAllProductsWithAuditDetails({ noCache: true });
  const report = buildCatalogAuditReport(
    products,
    isFallback,
    locale,
    checkedSeoIds,
  );
  const filtered = filterAuditItems(
    report.items,
    { issue, brand, category, q },
    locale,
  );
  const csv = buildAuditCsv(filtered, locale);

  const dateTag = new Date().toISOString().slice(0, 10);
  const safeIssue = issue.replace(/[^a-z0-9_-]/gi, "_");
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
