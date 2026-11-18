"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  CheckCircle2,
  Copy,
  Check,
  Download,
  ExternalLink,
  ImageOff,
  LogOut,
  RefreshCw,
  RotateCcw,
  Search,
  AlertTriangle,
  Barcode,
  BadgeDollarSign,
  Tag,
  FileText,
  ChevronLeft,
  ChevronRight,
  Table2,
  ServerCog,
  Loader2,
  X,
} from "lucide-react";
import {
  SyncControlPanel,
  type SyncCommandPayload,
  type SyncExecutionResponse,
  type SyncHistoryItem,
} from "@/components/audit/SyncControlPanel";
import {
  AUDIT_ISSUE_LABELS,
  filterAuditItems,
  type AuditFilterPreset,
  type AuditIssueKey,
  type CatalogAuditReport,
} from "@/lib/utils/catalog-audit";

interface InternalAuditDashboardProps {
  report: CatalogAuditReport;
  locale: "uz" | "ru";
  accessKeyQuery?: string;
}

const PAGE_SIZE = 50;

const ISSUE_BADGE_STYLES: Record<AuditIssueKey, string> = {
  no_price: "bg-red-50 text-red-700 border-red-200",
  no_image: "bg-amber-50 text-amber-800 border-amber-200",
  invalid_gtin: "bg-orange-50 text-orange-800 border-orange-200",
  invalid_mpn: "bg-purple-50 text-purple-700 border-purple-200",
  out_of_stock: "bg-slate-100 text-slate-700 border-slate-300",
  missing_seo: "bg-sky-50 text-sky-700 border-sky-200",
};

function formatPrice(value: number): string {
  return value.toLocaleString("ru-RU");
}

function ProductThumb({ src, alt }: { src: string; alt: string }) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div
        className="w-11 h-11 rounded-lg border border-amber-200 bg-amber-50 flex items-center justify-center text-amber-600 shrink-0"
        title="Rasm mavjud emas"
      >
        <ImageOff className="w-4 h-4" />
      </div>
    );
  }

  return (
    <div className="w-11 h-11 rounded-lg border border-slate-200 bg-white overflow-hidden shrink-0 flex items-center justify-center">
      <Image
        src={src}
        alt={alt}
        width={44}
        height={44}
        unoptimized
        onError={() => setFailed(true)}
        className="w-11 h-11 object-contain"
      />
    </div>
  );
}

export function InternalAuditDashboard({
  report,
  locale,
  accessKeyQuery,
}: InternalAuditDashboardProps) {
  const router = useRouter();
  const isUz = locale === "uz";
  const [isRefreshing, startRefresh] = useTransition();

  const [issue, setIssue] = useState<AuditFilterPreset>("issues_only");
  const [brand, setBrand] = useState("");
  const [category, setCategory] = useState("");
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const [activeTab, setActiveTab] = useState<"audit" | "sync">("audit");
  const [isSyncing, setIsSyncing] = useState(false);
  const [activeSyncCommandId, setActiveSyncCommandId] = useState<string | null>(
    null,
  );
  const [syncHistory, setSyncHistory] = useState<SyncHistoryItem[]>([]);
  const [rowSyncNotice, setRowSyncNotice] = useState<SyncHistoryItem | null>(
    null,
  );

  async function executeSyncCommand(
    commandId: string,
    label: string,
    payload: SyncCommandPayload,
    showRowNotice = false,
  ) {
    if (isSyncing) return;
    setIsSyncing(true);
    setActiveSyncCommandId(commandId);

    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (accessKeyQuery) {
        headers["x-audit-key"] = accessKeyQuery;
      }

      const res = await fetch("/api/internal-audit/sync", {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
      });

      const data = (await res.json().catch(() => null)) as
        | SyncExecutionResponse
        | null;

      const normalized: SyncExecutionResponse = data || {
        revalidated: false,
        error: isUz ? "Serverdan javob olinmadi" : "Нет ответа от сервера",
      };

      const entry: SyncHistoryItem = {
        id: `${commandId}-${Date.now()}`,
        label,
        timestamp: Date.now(),
        ok: res.ok,
        result: normalized,
      };

      setSyncHistory((prev) => [entry, ...prev].slice(0, 10));
      if (showRowNotice) {
        setRowSyncNotice(entry);
      }
    } catch {
      const entry: SyncHistoryItem = {
        id: `${commandId}-${Date.now()}`,
        label,
        timestamp: Date.now(),
        ok: false,
        result: {
          revalidated: false,
          error: isUz
            ? "Tarmoq xatoligi yuz berdi"
            : "Произошла ошибка сети",
        },
      };
      setSyncHistory((prev) => [entry, ...prev].slice(0, 10));
      if (showRowNotice) {
        setRowSyncNotice(entry);
      }
    } finally {
      setIsSyncing(false);
      setActiveSyncCommandId(null);
    }
  }

  const filteredItems = useMemo(
    () => filterAuditItems(report.items, { issue, brand, category, q }, locale),
    [report.items, issue, brand, category, q, locale],
  );

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);

  const pagedItems = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE;
    return filteredItems.slice(start, start + PAGE_SIZE);
  }, [filteredItems, safePage]);

  const exportHref = useMemo(() => {
    const params = new URLSearchParams();
    params.set("locale", locale);
    params.set("issue", issue);
    if (brand) params.set("brand", brand);
    if (category) params.set("category", category);
    if (q.trim()) params.set("q", q.trim());
    if (accessKeyQuery) params.set("key", accessKeyQuery);
    return `/api/internal-audit/export?${params.toString()}`;
  }, [locale, issue, brand, category, q, accessKeyQuery]);

  const formattedTime = useMemo(() => {
    try {
      return new Intl.DateTimeFormat(isUz ? "uz-UZ" : "ru-RU", {
        dateStyle: "medium",
        timeStyle: "medium",
        timeZone: "Asia/Tashkent",
      }).format(new Date(report.generatedAt));
    } catch {
      return report.generatedAt;
    }
  }, [report.generatedAt, isUz]);

  function selectIssueFilter(next: AuditFilterPreset) {
    setIssue((prev) => (prev === next ? "all" : next));
    setPage(1);
  }

  function resetFilters() {
    setIssue("all");
    setBrand("");
    setCategory("");
    setQ("");
    setPage(1);
  }

  async function copyGuid(id: string) {
    try {
      await navigator.clipboard.writeText(id);
      setCopiedId(id);
      setTimeout(() => {
        setCopiedId((current) => (current === id ? null : current));
      }, 1500);
    } catch {
      // Clipboard API may be unavailable in restricted contexts
    }
  }

  async function handleLogout() {
    setIsLoggingOut(true);
    try {
      await fetch("/api/internal-audit/auth", { method: "DELETE" });
    } finally {
      router.refresh();
    }
  }

  const hasActiveFilters =
    issue !== "all" || brand !== "" || category !== "" || q.trim() !== "";

  const kpiCards: Array<{
    key: AuditFilterPreset;
    label: string;
    count: number;
    icon: typeof CheckCircle2;
    tone: string;
    activeRing: string;
  }> = [
    {
      key: "merchant_ready",
      label: isUz ? "Merchantga tayyor" : "Готово для Merchant",
      count: report.summary.merchantReady,
      icon: CheckCircle2,
      tone: "text-emerald-700 bg-emerald-50 border-emerald-200",
      activeRing: "ring-2 ring-emerald-500 border-emerald-500",
    },
    {
      key: "no_price",
      label: isUz ? "Narxi 0 so‘m" : "Цена 0 сум",
      count: report.summary.noPrice,
      icon: BadgeDollarSign,
      tone: "text-red-700 bg-red-50 border-red-200",
      activeRing: "ring-2 ring-red-500 border-red-500",
    },
    {
      key: "no_image",
      label: isUz ? "Rasmi yo‘q" : "Нет фото",
      count: report.summary.noImage,
      icon: ImageOff,
      tone: "text-amber-700 bg-amber-50 border-amber-200",
      activeRing: "ring-2 ring-amber-500 border-amber-500",
    },
    {
      key: "invalid_gtin",
      label: isUz ? "Xato shtrix-kod" : "Неверный штрих-код",
      count: report.summary.invalidGtin,
      icon: Barcode,
      tone: "text-orange-700 bg-orange-50 border-orange-200",
      activeRing: "ring-2 ring-orange-500 border-orange-500",
    },
    {
      key: "invalid_mpn",
      label: isUz ? "Artikul yo‘q / N/A" : "Нет артикула / N/A",
      count: report.summary.invalidMpn,
      icon: Tag,
      tone: "text-purple-700 bg-purple-50 border-purple-200",
      activeRing: "ring-2 ring-purple-500 border-purple-500",
    },
    {
      key: "missing_seo",
      label: isUz ? "Tavsif / SEO bo‘sh" : "Пустое SEO / описание",
      count: report.summary.missingSeo,
      icon: FileText,
      tone: "text-sky-700 bg-sky-50 border-sky-200",
      activeRing: "ring-2 ring-sky-500 border-sky-500",
    },
  ];

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 pb-12">
      {/* Top Bar */}
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 py-4 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-lg sm:text-xl font-bold text-slate-900">
                {isUz
                  ? "1C Katalog va Google Merchant Auditi"
                  : "Аудит каталога 1С и Google Merchant"}
              </h1>
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold border ${
                  report.isFallback
                    ? "bg-amber-50 text-amber-800 border-amber-200"
                    : "bg-emerald-50 text-emerald-700 border-emerald-200"
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    report.isFallback ? "bg-amber-500" : "bg-emerald-500"
                  }`}
                />
                {report.isFallback
                  ? "FALLBACK DATA"
                  : isUz
                    ? "1C LIVE (no-store)"
                    : "1С LIVE (no-store)"}
              </span>
              <span className="text-xs font-medium text-slate-500 bg-slate-100 rounded-full px-2.5 py-0.5">
                {isUz
                  ? `Jami: ${report.summary.total} ta mahsulot`
                  : `Всего: ${report.summary.total} товаров`}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {isUz ? "Oxirgi yangilanish:" : "Последнее обновление:"}{" "}
              <span className="font-medium text-slate-700">{formattedTime}</span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => startRefresh(() => router.refresh())}
              disabled={isRefreshing}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw
                className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`}
              />
              <span>{isUz ? "1C dan yangilash" : "Обновить из 1С"}</span>
            </button>

            <a
              href={exportHref}
              download
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>
                {isUz
                  ? `Excel (CSV) yuklab olish (${filteredItems.length} ta)`
                  : `Скачать Excel (CSV) (${filteredItems.length} шт.)`}
              </span>
            </a>

            <button
              type="button"
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-100 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200 disabled:opacity-50 cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>{isUz ? "Chiqish" : "Выйти"}</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 border-t border-slate-100 flex items-center gap-1 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab("audit")}
            className={`inline-flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-semibold transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === "audit"
                ? "border-slate-900 text-slate-900"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Table2 className="w-4 h-4" />
            <span>{isUz ? "Audit jadvali" : "Таблица аудита"}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("sync")}
            className={`inline-flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-semibold transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === "sync"
                ? "border-emerald-600 text-emerald-700"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <ServerCog className="w-4 h-4" />
            <span>
              {isUz
                ? "1C Sinxronizatsiya va Kesh"
                : "Синхронизация 1С и Кэш"}
            </span>
            {syncHistory.length > 0 && (
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-700">
                {syncHistory.length}
              </span>
            )}
          </button>
        </div>
      </header>

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 mt-6 space-y-6">
        {activeTab === "sync" ? (
          <SyncControlPanel
            locale={locale}
            isSyncing={isSyncing}
            activeCommandId={activeSyncCommandId}
            latestEntry={syncHistory[0] ?? null}
            history={syncHistory}
            onExecute={(commandId, label, payload) =>
              executeSyncCommand(commandId, label, payload, false)
            }
            onRefreshAudit={() => startRefresh(() => router.refresh())}
            isRefreshingAudit={isRefreshing}
          />
        ) : (
          <>
            {rowSyncNotice && (
              <div
                role="status"
                className={`flex flex-wrap items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-sm ${
                  rowSyncNotice.ok
                    ? "border-emerald-200 bg-emerald-50 text-emerald-900"
                    : "border-red-200 bg-red-50 text-red-900"
                }`}
              >
                <div className="flex items-center gap-2">
                  {rowSyncNotice.ok ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                  )}
                  <span className="font-semibold">{rowSyncNotice.label}:</span>
                  <span>
                    {rowSyncNotice.ok
                      ? isUz
                        ? `Sayt keshi yangilandi (${rowSyncNotice.result.durationMs ?? 0} ms)`
                        : `Кэш сайта обновлён (${rowSyncNotice.result.durationMs ?? 0} ms)`
                      : rowSyncNotice.result.message ||
                        rowSyncNotice.result.error ||
                        (isUz ? "Xatolik" : "Ошибка")}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveTab("sync")}
                    className="rounded-lg bg-white/80 border border-current/20 px-2.5 py-1 text-xs font-semibold hover:bg-white cursor-pointer"
                  >
                    {isUz ? "Tarixni ko‘rish" : "История"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setRowSyncNotice(null)}
                    aria-label={isUz ? "Yopish" : "Закрыть"}
                    className="p-1 rounded-lg hover:bg-black/5 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
            {/* 6 KPI Cards */}
        <section
          aria-label={isUz ? "Audit ko‘rsatkichlari" : "Сводка аудита"}
          className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3"
        >
          {kpiCards.map((card) => {
            const Icon = card.icon;
            const isActive = issue === card.key;
            return (
              <button
                key={card.key}
                type="button"
                onClick={() => selectIssueFilter(card.key)}
                className={`text-left rounded-2xl border bg-white p-4 transition-all cursor-pointer hover:shadow-sm ${
                  isActive ? card.activeRing : "border-slate-200"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`inline-flex items-center justify-center w-8 h-8 rounded-lg border ${card.tone}`}
                  >
                    <Icon className="w-4 h-4" />
                  </span>
                  {isActive && (
                    <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                      {isUz ? "Faol" : "Активно"}
                    </span>
                  )}
                </div>
                <div className="mt-3 text-2xl font-bold text-slate-900">
                  {card.count}
                </div>
                <div className="text-xs font-medium text-slate-600 mt-0.5">
                  {card.label}
                </div>
              </button>
            );
          })}
        </section>

        {/* Filters */}
        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-3">
            <div className="lg:col-span-4 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="search"
                value={q}
                onChange={(e) => {
                  setQ(e.target.value);
                  setPage(1);
                }}
                placeholder={
                  isUz
                    ? "Nomi, artikul, shtrix-kod yoki 1C ID bo‘yicha qidiruv..."
                    : "Поиск по названию, артикулу, штрих-коду или 1С ID..."
                }
                className="w-full rounded-xl border border-slate-300 bg-white pl-10 pr-3.5 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:outline-none"
              />
            </div>

            <div className="lg:col-span-3">
              <select
                aria-label={isUz ? "Muammo turi" : "Тип проблемы"}
                value={issue}
                onChange={(e) => {
                  setIssue(e.target.value as AuditFilterPreset);
                  setPage(1);
                }}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-slate-900 focus:outline-none"
              >
                <option value="issues_only">
                  {isUz
                    ? "Faqat muammoli mahsulotlar"
                    : "Только с ошибками"}
                </option>
                <option value="all">
                  {isUz ? "Barcha mahsulotlar" : "Все товары"} (
                  {report.summary.total})
                </option>
                <option value="merchant_ready">
                  {isUz ? "Merchantga tayyor" : "Готово для Merchant"} (
                  {report.summary.merchantReady})
                </option>
                <option value="no_price">
                  {AUDIT_ISSUE_LABELS.no_price[locale]} ({report.summary.noPrice})
                </option>
                <option value="no_image">
                  {AUDIT_ISSUE_LABELS.no_image[locale]} ({report.summary.noImage})
                </option>
                <option value="invalid_gtin">
                  {AUDIT_ISSUE_LABELS.invalid_gtin[locale]} (
                  {report.summary.invalidGtin})
                </option>
                <option value="invalid_mpn">
                  {AUDIT_ISSUE_LABELS.invalid_mpn[locale]} (
                  {report.summary.invalidMpn})
                </option>
                <option value="out_of_stock">
                  {AUDIT_ISSUE_LABELS.out_of_stock[locale]} (
                  {report.summary.outOfStock})
                </option>
                <option value="missing_seo">
                  {AUDIT_ISSUE_LABELS.missing_seo[locale]} (
                  {report.summary.missingSeo})
                </option>
              </select>
            </div>

            <div className="lg:col-span-2">
              <select
                aria-label={isUz ? "Brend" : "Бренд"}
                value={brand}
                onChange={(e) => {
                  setBrand(e.target.value);
                  setPage(1);
                }}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-slate-900 focus:outline-none"
              >
                <option value="">
                  {isUz ? "Barcha brendlar" : "Все бренды"}
                </option>
                {report.brands.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>

            <div className="lg:col-span-2">
              <select
                aria-label={isUz ? "Kategoriya" : "Категория"}
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value);
                  setPage(1);
                }}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-slate-900 focus:outline-none"
              >
                <option value="">
                  {isUz ? "Barcha kategoriyalar" : "Все категории"}
                </option>
                {report.categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div className="lg:col-span-1 flex items-center justify-end">
              <button
                type="button"
                onClick={resetFilters}
                disabled={!hasActiveFilters}
                title={isUz ? "Filtrlarni tozalash" : "Сбросить фильтры"}
                className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span className="lg:hidden">
                  {isUz ? "Tozalash" : "Сброс"}
                </span>
              </button>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
            <span>
              {isUz
                ? `Topildi: ${filteredItems.length} ta mahsulot`
                : `Найдено: ${filteredItems.length} товаров`}
            </span>
            <span>
              {isUz
                ? `Sahifa: ${safePage} / ${totalPages}`
                : `Страница: ${safePage} / ${totalPages}`}
            </span>
          </div>
        </section>

        {/* Data Table */}
        <section className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 text-xs font-semibold uppercase tracking-wide text-slate-600">
                  <th className="py-3 px-4">{isUz ? "Rasm" : "Фото"}</th>
                  <th className="py-3 px-4">
                    {isUz ? "Mahsulot va 1C ID" : "Товар и 1С ID"}
                  </th>
                  <th className="py-3 px-4">{isUz ? "Artikul" : "Артикул"}</th>
                  <th className="py-3 px-4">
                    {isUz ? "Brend / Kategoriya" : "Бренд / Категория"}
                  </th>
                  <th className="py-3 px-4">{isUz ? "Narxlar" : "Цены"}</th>
                  <th className="py-3 px-4">
                    {isUz ? "Shtrix-kod" : "Штрих-код"}
                  </th>
                  <th className="py-3 px-4">{isUz ? "Holati" : "Статус"}</th>
                  <th className="py-3 px-4 text-right">
                    {isUz ? "Sayt" : "Сайт"}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {pagedItems.length === 0 ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="py-12 px-4 text-center text-slate-500"
                    >
                      {isUz
                        ? "Tanlangan filtrlar bo‘yicha mahsulot topilmadi."
                        : "По выбранным фильтрам ничего не найдено."}
                    </td>
                  </tr>
                ) : (
                  pagedItems.map((item) => {
                    const displayName = isUz
                      ? item.nameUz || item.nameRu
                      : item.nameRu || item.nameUz;
                    const displayCat = isUz
                      ? item.categoryUz || item.categoryRu
                      : item.categoryRu || item.categoryUz;
                    const slug = isUz
                      ? item.slugUz || item.slugRu
                      : item.slugRu || item.slugUz;

                    return (
                      <tr
                        key={item.id}
                        className="hover:bg-slate-50/70 transition-colors align-top"
                      >
                        <td className="py-3 px-4">
                          <ProductThumb
                            src={item.hasImage ? item.imageUrl : ""}
                            alt={displayName}
                          />
                        </td>

                        <td className="py-3 px-4 min-w-[240px] max-w-[340px]">
                          <div className="font-medium text-slate-900 leading-snug">
                            {displayName}
                          </div>
                          <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
                            <code className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[11px] text-slate-700">
                              {item.id}
                            </code>
                            <button
                              type="button"
                              onClick={() => copyGuid(item.id)}
                              title={
                                isUz
                                  ? "1C ID nusxalash"
                                  : "Скопировать 1С ID"
                              }
                              className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[11px] font-medium text-slate-600 hover:bg-slate-200 cursor-pointer"
                            >
                              {copiedId === item.id ? (
                                <>
                                  <Check className="w-3 h-3 text-emerald-600" />
                                  <span className="text-emerald-700">
                                    {isUz ? "Nusxalandi" : "Скопировано"}
                                  </span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3 h-3" />
                                  <span>{isUz ? "Nusxa" : "Коп."}</span>
                                </>
                              )}
                            </button>
                          </div>
                        </td>

                        <td className="py-3 px-4 whitespace-nowrap font-mono text-xs text-slate-700">
                          {item.sku || "—"}
                        </td>

                        <td className="py-3 px-4 min-w-[160px]">
                          <div className="font-medium text-slate-800">
                            {item.brand || "—"}
                          </div>
                          <div className="text-xs text-slate-500 mt-0.5">
                            {displayCat || "—"}
                          </div>
                        </td>

                        <td className="py-3 px-4 whitespace-nowrap">
                          <div className="font-semibold text-slate-900">
                            {formatPrice(item.retailPrice)}{" "}
                            <span className="text-xs font-normal text-slate-500">
                              {isUz ? "so‘m" : "сум"}
                            </span>
                          </div>
                          <div className="text-xs text-slate-500 mt-0.5">
                            {isUz ? "Ulgurji:" : "Опт:"}{" "}
                            {formatPrice(item.wholesalePrice)}
                          </div>
                          <div className="mt-1">
                            <span
                              className={`inline-block rounded-full px-2 py-0.5 text-[11px] font-medium ${
                                item.issues.includes("out_of_stock")
                                  ? "bg-slate-100 text-slate-600"
                                  : "bg-emerald-50 text-emerald-700"
                              }`}
                            >
                              {item.stock}
                            </span>
                          </div>
                        </td>

                        <td className="py-3 px-4 whitespace-nowrap font-mono text-xs text-slate-700">
                          {item.barcode || "—"}
                        </td>

                        <td className="py-3 px-4 min-w-[200px]">
                          {item.issues.length === 0 ? (
                            <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              {isUz ? "Muammo yo‘q" : "Без ошибок"}
                            </span>
                          ) : (
                            <div className="flex flex-wrap gap-1.5">
                              {item.issues.map((issueKey) => {
                                const seoDetail =
                                  issueKey === "missing_seo" &&
                                  item.seoMissingFields?.length
                                    ? ` (${item.seoMissingFields.join(", ")})`
                                    : "";
                                return (
                                  <span
                                    key={issueKey}
                                    title={`${AUDIT_ISSUE_LABELS[issueKey][locale]}${seoDetail}`}
                                    className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium ${ISSUE_BADGE_STYLES[issueKey]}`}
                                  >
                                    <AlertTriangle className="w-3 h-3 shrink-0" />
                                    {AUDIT_ISSUE_LABELS[issueKey][locale]}
                                    {seoDetail}
                                  </span>
                                );
                              })}
                            </div>
                          )}
                        </td>

                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          <div className="inline-flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              disabled={isSyncing}
                              onClick={() =>
                                executeSyncCommand(
                                  `row-${item.id}`,
                                  `${isUz ? "Mahsulot" : "Товар"} (product-${item.id})`,
                                  { tag: `product-${item.id}` },
                                  true,
                                )
                              }
                              title={
                                isUz
                                  ? "Ushbu mahsulot keshini 0 soniyada yangilash"
                                  : "Мгновенно обновить кэш этого товара"
                              }
                              className="inline-flex items-center gap-1 rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1.5 text-xs font-medium text-emerald-700 hover:bg-emerald-100 disabled:opacity-50 cursor-pointer"
                            >
                              {isSyncing && activeSyncCommandId === `row-${item.id}` ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <RefreshCw className="w-3.5 h-3.5" />
                              )}
                              <span>{isUz ? "Sinxron" : "Синхр."}</span>
                            </button>
                            {slug && (
                              <Link
                                href={`/${locale}/products/${slug}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100"
                              >
                                <span>{isUz ? "Ochish" : "Открыть"}</span>
                                <ExternalLink className="w-3.5 h-3.5" />
                              </Link>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="border-t border-slate-200 bg-slate-50/70 px-4 py-3 flex items-center justify-between gap-4">
              <button
                type="button"
                disabled={safePage <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>{isUz ? "Oldingi" : "Назад"}</span>
              </button>

              <span className="text-sm font-medium text-slate-600">
                {safePage} / {totalPages}
              </span>

              <button
                type="button"
                disabled={safePage >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <span>{isUz ? "Keyingi" : "Вперёд"}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </section>
          </>
        )}
      </div>
    </main>
  );
}
