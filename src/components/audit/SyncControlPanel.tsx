"use client";

import { useState, type FormEvent } from "react";
import {
  AlertOctagon,
  AlertTriangle,
  CheckCircle2,
  Clock,
  FolderTree,
  Globe,
  Layers,
  Loader2,
  MessageSquare,
  Package,
  RefreshCw,
  Ruler,
  HelpCircle,
  Send,
  Sparkles,
  Tag,
  Zap,
  GitCompare,
  BadgeDollarSign,
  Award,
  Flame,
  History,
} from "lucide-react";

export interface SyncCommandPayload {
  mode?: "smart-diff" | "relations-diff";
  scope?: "relations";
  fast?: boolean;
  tag?: string;
  path?: string;
}

export interface SyncExecutionResponse {
  revalidated: boolean;
  mode?: "smart-diff" | "relations-diff";
  tag?: string | null;
  path?: string | null;
  message?: string;
  error?: string;
  sitemapRevalidated?: boolean;
  durationMs?: number;
  now?: number;
  summary?: {
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
    modified: Array<{
      id: string;
      name: string;
      slug: string;
      changes: string[];
    }>;
    revalidatedTags: string[];
    revalidatedPaths: string[];
  };
  indexnow?: {
    dispatched: boolean;
    urlCount: number;
  };
}

export interface SyncHistoryItem {
  id: string;
  label: string;
  timestamp: number;
  ok: boolean;
  result: SyncExecutionResponse;
}

interface SyncControlPanelProps {
  locale: "uz" | "ru";
  isSyncing: boolean;
  activeCommandId: string | null;
  latestEntry: SyncHistoryItem | null;
  history: SyncHistoryItem[];
  onExecute: (commandId: string, label: string, payload: SyncCommandPayload) => Promise<void>;
  onRefreshAudit: () => void;
  isRefreshingAudit: boolean;
}

export function SyncControlPanel({
  locale,
  isSyncing,
  activeCommandId,
  latestEntry,
  history,
  onExecute,
  onRefreshAudit,
  isRefreshingAudit,
}: SyncControlPanelProps) {
  const isUz = locale === "uz";

  const [productTargetType, setProductTargetType] = useState<"product" | "reviews">("product");
  const [productIdInput, setProductIdInput] = useState("");
  const [customPathInput, setCustomPathInput] = useState("");
  const [confirmGlobalOpen, setConfirmGlobalOpen] = useState(false);

  const smartDiffActions: Array<{
    id: string;
    title: string;
    badge: string;
    description: string;
    icon: typeof Sparkles;
    payload: SyncCommandPayload;
  }> = [
    {
      id: "smart-diff-full",
      title: isUz ? "To‘liq Smart Diff" : "Полный Smart Diff",
      badge: "mode=smart-diff",
      description: isUz
        ? "Narx, qoldiq, nom, rasm, slug va related/recommended bog‘lamalarini solishtiradi. O‘zgarish bo‘lmasa 0 ISR Write sarflaydi."
        : "Сравнивает цены, остатки, названия, фото, slug и связи related/recommended. При отсутствии изменений тратит 0 ISR Write.",
      icon: Sparkles,
      payload: { mode: "smart-diff" },
    },
    {
      id: "smart-diff-fast",
      title: isUz ? "Tezkor Smart Diff (fast)" : "Быстрый Smart Diff (fast)",
      badge: "mode=smart-diff&fast=true",
      description: isUz
        ? "Bog‘langan mahsulotlarni chetlab o‘tib, faqat /all_product va /price bo‘yicha ~0.3 soniyada tezkor diff bajaradi."
        : "Пропускает проверку связей и выполняет быстрый diff только по /all_product и /price (~0.3 сек).",
      icon: Zap,
      payload: { mode: "smart-diff", fast: true },
    },
    {
      id: "relations-diff",
      title: isUz ? "O‘xshash / Tavsiya etilganlar Diff" : "Diff похожих и рекомендуемых",
      badge: "mode=relations-diff",
      description: isUz
        ? "Faqat 1C dagi related_products va recommended_products biriktirmalari o‘zgargan mahsulotlarni topib yangilaydi."
        : "Находит и обновляет только товары с изменившимися связями related_products и recommended_products.",
      icon: GitCompare,
      payload: { mode: "relations-diff" },
    },
  ];

  const targetedTagButtons: Array<{
    id: string;
    label: string;
    code: string;
    icon: typeof Tag;
    payload: SyncCommandPayload;
  }> = [
    {
      id: "tag-prices",
      label: isUz ? "Narxlar" : "Цены",
      code: "tag=prices",
      icon: BadgeDollarSign,
      payload: { tag: "prices" },
    },
    {
      id: "tag-products",
      label: isUz ? "Mahsulotlar" : "Товары",
      code: "tag=products",
      icon: Package,
      payload: { tag: "products" },
    },
    {
      id: "tag-offers",
      label: isUz ? "Aksiyalar va vitrinalar" : "Акции и витрины",
      code: "tag=offers",
      icon: Flame,
      payload: { tag: "offers" },
    },
    {
      id: "tag-categories",
      label: isUz ? "Kategoriyalar" : "Категории",
      code: "tag=categories",
      icon: FolderTree,
      payload: { tag: "categories" },
    },
    {
      id: "tag-brands",
      label: isUz ? "Brendlar" : "Бренды",
      code: "tag=brands",
      icon: Award,
      payload: { tag: "brands" },
    },
    {
      id: "tag-reviews",
      label: isUz ? "Barcha sharhlar" : "Все отзывы",
      code: "tag=reviews",
      icon: MessageSquare,
      payload: { tag: "reviews" },
    },
    {
      id: "tag-units",
      label: isUz ? "O‘lchov birliklari" : "Единицы измерения",
      code: "tag=units",
      icon: Ruler,
      payload: { tag: "units" },
    },
    {
      id: "tag-faq",
      label: "FAQ",
      code: "tag=faq",
      icon: HelpCircle,
      payload: { tag: "faq" },
    },
    {
      id: "path-uz",
      label: isUz ? "Bosh sahifa (UZ)" : "Главная (UZ)",
      code: "path=/uz",
      icon: Globe,
      payload: { path: "/uz" },
    },
    {
      id: "path-ru",
      label: isUz ? "Bosh sahifa (RU)" : "Главная (RU)",
      code: "path=/ru",
      icon: Globe,
      payload: { path: "/ru" },
    },
  ];

  async function handleProductSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const cleaned = productIdInput.trim();
    if (!cleaned || isSyncing) return;
    const tag = `${productTargetType}-${cleaned}`;
    await onExecute(
      `custom-${tag}`,
      isUz ? `Mahsulot (${tag})` : `Товар (${tag})`,
      { tag },
    );
  }

  async function handlePathSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const cleaned = customPathInput.trim();
    if (!cleaned || isSyncing) return;
    const normalizedPath = cleaned.startsWith("/") ? cleaned : `/${cleaned}`;
    await onExecute(
      `custom-path-${normalizedPath}`,
      `URL (${normalizedPath})`,
      { path: normalizedPath },
    );
  }

  async function handleGlobalFlush() {
    setConfirmGlobalOpen(false);
    await onExecute(
      "tag-all",
      isUz ? "Global kesh tozalash (tag=all)" : "Глобальный сброс (tag=all)",
      { tag: "all" },
    );
  }

  return (
    <div className="space-y-6">
      {/* Block A: Smart Diff */}
      <section className="rounded-2xl border border-emerald-200 bg-white p-5 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-2.5">
            <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700">
              <Sparkles className="w-4 h-4" />
            </span>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                {isUz
                  ? "A. Aqlli va Tejamkor Rejimlar (Smart Diff)"
                  : "A. Умные и экономные режимы (Smart Diff)"}
              </h2>
              <p className="text-xs text-slate-500">
                {isUz
                  ? "Tavsiya etiladi: faqat haqiqatda o‘zgargan mahsulotlar keshi yangilanadi (ortiqcha Vercel ISR xarajatisiz)."
                  : "Рекомендуется: обновляет кэш только реально изменившихся товаров (без лишних затрат Vercel ISR)."}
              </p>
            </div>
          </div>
          <span className="inline-flex items-center rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
            {isUz ? "Eng tejamkor" : "Макс. экономия"}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {smartDiffActions.map((action) => {
            const Icon = action.icon;
            const runningThis = isSyncing && activeCommandId === action.id;
            return (
              <div
                key={action.id}
                className="flex flex-col justify-between rounded-xl border border-slate-200 bg-slate-50/60 p-4"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1.5 font-semibold text-sm text-slate-900">
                      <Icon className="w-4 h-4 text-emerald-600 shrink-0" />
                      {action.title}
                    </span>
                  </div>
                  <code className="mt-1.5 inline-block rounded bg-white border border-slate-200 px-2 py-0.5 text-[11px] font-mono text-slate-600">
                    {action.badge}
                  </code>
                  <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                    {action.description}
                  </p>
                </div>

                <button
                  type="button"
                  disabled={isSyncing}
                  onClick={() => onExecute(action.id, action.title, action.payload)}
                  className="mt-4 w-full inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-3.5 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
                >
                  {runningThis ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <RefreshCw className="w-4 h-4" />
                  )}
                  <span>
                    {runningThis
                      ? isUz
                        ? "Tekshirilmoqda..."
                        : "Выполняется..."
                      : isUz
                        ? "Ishga tushirish"
                        : "Запустить"}
                  </span>
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* Block B: Targeted Revalidation */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-5">
        <div className="flex items-center gap-2.5">
          <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 text-slate-700">
            <Layers className="w-4 h-4" />
          </span>
          <div>
            <h2 className="text-base font-bold text-slate-900">
              {isUz
                ? "B. Aniq Yo‘nalishli Kesh Tozalash (Tag va Path)"
                : "B. Точечный сброс кэша (Tag и Path)"}
            </h2>
            <p className="text-xs text-slate-500">
              {isUz
                ? "Faqat kerakli bo‘lim, teg, bitta mahsulot yoki alohida URL manzilini yangilash."
                : "Обновление только нужного раздела, тега, одного товара или отдельного URL."}
            </p>
          </div>
        </div>

        {/* Preset Tag & Path Buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
          {targetedTagButtons.map((btn) => {
            const Icon = btn.icon;
            const runningThis = isSyncing && activeCommandId === btn.id;
            return (
              <button
                key={btn.id}
                type="button"
                disabled={isSyncing}
                onClick={() => onExecute(btn.id, btn.label, btn.payload)}
                className="flex items-start gap-2.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-left hover:border-slate-400 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                <span className="mt-0.5 text-slate-600 shrink-0">
                  {runningThis ? (
                    <Loader2 className="w-4 h-4 animate-spin text-slate-900" />
                  ) : (
                    <Icon className="w-4 h-4" />
                  )}
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-medium text-slate-900 truncate">
                    {btn.label}
                  </span>
                  <code className="block text-[11px] font-mono text-slate-500 truncate">
                    {btn.code}
                  </code>
                </span>
              </button>
            );
          })}
        </div>

        {/* Forms: Single Product & Custom Path */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
          <form onSubmit={handleProductSubmit} className="space-y-2">
            <label
              htmlFor="sync-product-id"
              className="block text-xs font-semibold uppercase tracking-wide text-slate-600"
            >
              {isUz
                ? "Bitta mahsulot yoki sharhini yangilash (eng tejamkor)"
                : "Обновить один товар или его отзывы (макс. экономно)"}
            </label>
            <div className="flex flex-wrap sm:flex-nowrap gap-2">
              <select
                aria-label={isUz ? "Teg turi" : "Тип тега"}
                value={productTargetType}
                onChange={(e) =>
                  setProductTargetType(e.target.value as "product" | "reviews")
                }
                className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:border-slate-900 focus:outline-none"
              >
                <option value="product">product-&#123;ID&#125;</option>
                <option value="reviews">reviews-&#123;ID&#125;</option>
              </select>
              <input
                id="sync-product-id"
                type="text"
                value={productIdInput}
                onChange={(e) => setProductIdInput(e.target.value)}
                placeholder={isUz ? "Mahsulot ID (masalan: E1589)" : "ID товара (напр.: E1589)"}
                className="flex-1 min-w-[160px] rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:outline-none"
              />
              <button
                type="submit"
                disabled={isSyncing || !productIdInput.trim()}
                className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isUz ? "Yuborish" : "Отправить"}</span>
              </button>
            </div>
          </form>

          <form onSubmit={handlePathSubmit} className="space-y-2">
            <label
              htmlFor="sync-custom-path"
              className="block text-xs font-semibold uppercase tracking-wide text-slate-600"
            >
              {isUz
                ? "Ixtiyoriy URL yo‘lini yangilash (path)"
                : "Обновить произвольный URL-путь (path)"}
            </label>
            <div className="flex flex-wrap sm:flex-nowrap gap-2">
              <input
                id="sync-custom-path"
                type="text"
                value={customPathInput}
                onChange={(e) => setCustomPathInput(e.target.value)}
                placeholder="/uz/delivery"
                className="flex-1 min-w-[200px] rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm font-mono text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:outline-none"
              />
              <button
                type="submit"
                disabled={isSyncing || !customPathInput.trim()}
                className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isUz ? "Yangilash" : "Обновить"}</span>
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* Block C: Global Emergency Flush */}
      <section className="rounded-2xl border border-red-200 bg-red-50/40 p-5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-start gap-3">
            <span className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-red-100 border border-red-200 text-red-700 shrink-0">
              <AlertOctagon className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                {isUz
                  ? "C. Favqulodda Global Kesh Tozalash (tag=all)"
                  : "C. Аварийный глобальный сброс кэша (tag=all)"}
              </h2>
              <p className="text-xs text-slate-600 mt-1 max-w-3xl">
                {isUz
                  ? "Barcha mahsulot sahifalari, kategoriyalar, vitrinalar, Google Merchant XML (/api/feeds/google-merchant), Yandex YML, /sitemap.xml va /llms-full.txt keshlarini noldan yangilaydi. Faqat ommaviy o‘zgarishlarda ishlating."
                  : "Полностью сбрасывает кэш всех товаров, категорий, витрин, Google Merchant XML, Yandex YML, /sitemap.xml и /llms-full.txt. Используйте только при массовых обновлениях."}
              </p>
            </div>
          </div>

          {!confirmGlobalOpen ? (
            <button
              type="button"
              disabled={isSyncing}
              onClick={() => setConfirmGlobalOpen(true)}
              className="shrink-0 inline-flex items-center justify-center gap-2 rounded-xl border border-red-300 bg-white px-4 py-2.5 text-sm font-semibold text-red-700 hover:bg-red-600 hover:text-white disabled:opacity-50 transition-colors cursor-pointer"
            >
              <AlertTriangle className="w-4 h-4" />
              <span>
                {isUz
                  ? "Butun sayt + Feedlarni yangilash"
                  : "Сбросить весь сайт + фиды"}
              </span>
            </button>
          ) : (
            <div className="flex flex-wrap items-center gap-2 bg-white border border-red-300 rounded-xl p-2.5 shrink-0">
              <span className="text-xs font-semibold text-red-700 px-1">
                {isUz ? "Tasdiqlaysizmi?" : "Подтверждаете?"}
              </span>
              <button
                type="button"
                disabled={isSyncing}
                onClick={handleGlobalFlush}
                className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-50 cursor-pointer"
              >
                {isUz ? "Ha, to‘liq yangilansin" : "Да, сбросить всё"}
              </button>
              <button
                type="button"
                disabled={isSyncing}
                onClick={() => setConfirmGlobalOpen(false)}
                className="rounded-lg border border-slate-300 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                {isUz ? "Bekor qilish" : "Отмена"}
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Latest Result */}
      {latestEntry && (
        <section
          aria-live="polite"
          className={`rounded-2xl border p-5 bg-white shadow-xs ${
            !latestEntry.ok
              ? "border-red-300"
              : latestEntry.result.revalidated
                ? "border-emerald-300"
                : "border-slate-300"
          }`}
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2.5 flex-wrap">
              {latestEntry.ok ? (
                <CheckCircle2
                  className={`w-5 h-5 shrink-0 ${
                    latestEntry.result.revalidated
                      ? "text-emerald-600"
                      : "text-slate-600"
                  }`}
                />
              ) : (
                <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
              )}
              <h3 className="font-bold text-slate-900">{latestEntry.label}</h3>
              <span
                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                  !latestEntry.ok
                    ? "bg-red-50 text-red-700"
                    : latestEntry.result.revalidated
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-slate-100 text-slate-700"
                }`}
              >
                {!latestEntry.ok
                  ? isUz
                    ? "Xatolik"
                    : "Ошибка"
                  : latestEntry.result.revalidated
                    ? isUz
                      ? "Yangilandi"
                      : "Обновлено"
                    : isUz
                      ? "O‘zgarish yo‘q (0 ISR Write)"
                      : "Без изменений (0 ISR Write)"}
              </span>
              {typeof latestEntry.result.durationMs === "number" && (
                <span className="inline-flex items-center gap-1 text-xs text-slate-500">
                  <Clock className="w-3.5 h-3.5" />
                  {latestEntry.result.durationMs} ms
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={onRefreshAudit}
              disabled={isRefreshingAudit}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-800 hover:bg-slate-100 disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${isRefreshingAudit ? "animate-spin" : ""}`}
              />
              <span>
                {isUz
                  ? "Audit jadvalini 1C dan qayta tekshirish"
                  : "Перепроверить таблицу из 1С"}
              </span>
            </button>
          </div>

          <p className="mt-3 text-sm text-slate-700">
            {latestEntry.result.message ||
              latestEntry.result.error ||
              (latestEntry.result.tag
                ? `${isUz ? "Yangilangan teg:" : "Сброшенный тег:"} ${latestEntry.result.tag}`
                : latestEntry.result.path
                  ? `${isUz ? "Yangilangan URL:" : "Обновлённый URL:"} ${latestEntry.result.path}`
                  : isUz
                    ? "Amal muvaffaqiyatli yakunlandi."
                    : "Операция успешно выполнена.")}
          </p>

          {/* Smart Diff Summary Grid */}
          {latestEntry.result.summary && (
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
              {[
                {
                  label: isUz ? "Keshda" : "В кэше",
                  val: latestEntry.result.summary.totalCached,
                },
                {
                  label: isUz ? "1C da" : "В 1С",
                  val: latestEntry.result.summary.totalFresh,
                },
                {
                  label: isUz ? "Qo‘shildi" : "Добавлено",
                  val: latestEntry.result.summary.addedCount,
                },
                {
                  label: isUz ? "O‘chirildi" : "Удалено",
                  val: latestEntry.result.summary.deletedCount,
                },
                {
                  label: isUz ? "O‘zgardi" : "Изменено",
                  val: latestEntry.result.summary.modifiedCount,
                },
                {
                  label: isUz ? "Bog‘lamalar" : "Связи",
                  val: latestEntry.result.summary.relationsModifiedCount ?? 0,
                },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2"
                >
                  <div className="text-[11px] font-medium text-slate-500">
                    {stat.label}
                  </div>
                  <div className="text-lg font-bold text-slate-900">
                    {stat.val}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Meta badges (IndexNow / Sitemap / Tags) */}
          <div className="mt-3 flex flex-wrap gap-2 text-xs">
            {typeof latestEntry.result.sitemapRevalidated === "boolean" && (
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-slate-700 font-medium">
                Sitemap:{" "}
                {latestEntry.result.sitemapRevalidated
                  ? isUz
                    ? "Yangilandi"
                    : "Обновлён"
                  : isUz
                    ? "Tegilmadi"
                    : "Не затронут"}
              </span>
            )}
            {latestEntry.result.indexnow && (
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-slate-700 font-medium">
                IndexNow:{" "}
                {latestEntry.result.indexnow.dispatched
                  ? `${latestEntry.result.indexnow.urlCount} URL`
                  : "0 URL"}
              </span>
            )}
            {latestEntry.result.details?.revalidatedTags?.slice(0, 8).map((t) => (
              <code
                key={t}
                className="rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-1 font-mono text-[11px] text-emerald-700"
              >
                {t}
              </code>
            ))}
          </div>

          {/* Changed products preview */}
          {latestEntry.result.details?.modified &&
            latestEntry.result.details.modified.length > 0 && (
              <div className="mt-4 rounded-xl border border-slate-200 overflow-hidden">
                <div className="bg-slate-50 px-3.5 py-2 text-xs font-semibold text-slate-700 border-b border-slate-200">
                  {isUz
                    ? `O‘zgargan mahsulotlar (${latestEntry.result.details.modified.length} ta)`
                    : `Изменённые товары (${latestEntry.result.details.modified.length} шт.)`}
                </div>
                <div className="divide-y divide-slate-100 max-h-64 overflow-y-auto">
                  {latestEntry.result.details.modified.slice(0, 30).map((m) => (
                    <div key={m.id} className="px-3.5 py-2 text-xs">
                      <div className="font-semibold text-slate-900">
                        {m.name}{" "}
                        <code className="ml-1 rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[11px] text-slate-600">
                          {m.id}
                        </code>
                      </div>
                      <div className="mt-1 flex flex-wrap gap-1.5">
                        {m.changes.map((c, idx) => (
                          <span
                            key={idx}
                            className="rounded bg-amber-50 border border-amber-200 px-2 py-0.5 text-[11px] text-amber-800"
                          >
                            {c}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
        </section>
      )}

      {/* Session Sync History */}
      {history.length > 0 && (
        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-800 mb-3">
            <History className="w-4 h-4 text-slate-500" />
            <span>
              {isUz
                ? "Joriy sessiyadagi sinxronizatsiya tarixi"
                : "История синхронизаций текущей сессии"}
            </span>
          </div>
          <div className="divide-y divide-slate-100">
            {history.map((entry) => (
              <div
                key={entry.id}
                className="py-2 flex flex-wrap items-center justify-between gap-2 text-xs"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className={`w-2 h-2 rounded-full shrink-0 ${
                      !entry.ok
                        ? "bg-red-500"
                        : entry.result.revalidated
                          ? "bg-emerald-500"
                          : "bg-slate-400"
                    }`}
                  />
                  <span className="font-semibold text-slate-900">
                    {entry.label}
                  </span>
                  {entry.result.message && (
                    <span className="text-slate-500 truncate max-w-md">
                      — {entry.result.message}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 text-slate-500 shrink-0">
                  {typeof entry.result.durationMs === "number" && (
                    <span>{entry.result.durationMs} ms</span>
                  )}
                  <span>
                    {new Date(entry.timestamp).toLocaleTimeString(
                      isUz ? "uz-UZ" : "ru-RU",
                    )}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
