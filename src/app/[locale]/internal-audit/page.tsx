import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { api } from "@/lib/api";
import {
  isAuditRequestAuthorized,
  verifyAuditAccessKey,
} from "@/lib/utils/audit-auth";
import { buildCatalogAuditReport } from "@/lib/utils/catalog-audit";
import { AuditLoginGate } from "@/components/audit/AuditLoginGate";
import { InternalAuditDashboard } from "@/components/audit/InternalAuditDashboard";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isUz = locale === "uz";

  return {
    title: isUz
      ? "Ichki Katalog Auditi (Yopiq)"
      : "Внутренний аудит каталога (Закрыто)",
    description: isUz
      ? "Sora.uz ichki 1C va Google Merchant katalog auditi paneli."
      : "Внутренняя панель аудита каталога 1С и Google Merchant.",
    robots: {
      index: false,
      follow: false,
      nocache: true,
      googleBot: {
        index: false,
        follow: false,
        noimageindex: true,
      },
    },
  };
}

export default async function InternalAuditPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ key?: string | string[] }>;
}) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as "uz" | "ru")) {
    notFound();
  }

  const currentLocale = locale as "uz" | "ru";
  setRequestLocale(currentLocale);

  const resolvedSearchParams = await searchParams;
  const rawKey = Array.isArray(resolvedSearchParams.key)
    ? resolvedSearchParams.key[0]
    : resolvedSearchParams.key;

  const authorized = await isAuditRequestAuthorized(rawKey);

  if (!authorized) {
    return <AuditLoginGate locale={currentLocale} />;
  }

  const { products, isFallback, checkedSeoIds } =
    await api.getAllProductsWithAuditDetails({ noCache: true });
  const report = buildCatalogAuditReport(
    products,
    isFallback,
    currentLocale,
    checkedSeoIds,
  );
  const validKeyQuery =
    rawKey && verifyAuditAccessKey(rawKey) ? rawKey : undefined;

  return (
    <InternalAuditDashboard
      report={report}
      locale={currentLocale}
      accessKeyQuery={validKeyQuery}
    />
  );
}
