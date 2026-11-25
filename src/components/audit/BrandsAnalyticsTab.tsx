"use client";

import { useMemo, useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  PackageOpen,
  Search,
  Tag,
  AlertTriangle,
} from "lucide-react";
import {
  UNBRANDED_FILTER_KEY,
  type AuditBrandStat,
} from "@/lib/utils/catalog-audit";

interface BrandsAnalyticsTabProps {
  brandStats: AuditBrandStat[];
  totalCatalog: number;
  unbrandedCount: number;
  locale: "uz" | "ru";
  onSelectBrand: (brandKey: string) => void;
}

type BrandSortMode = "total_desc" | "name_asc" | "merchant_desc" | "issues_desc";

export function BrandsAnalyticsTab({
  brandStats,
  totalCatalog,
  unbrandedCount,
  locale,
  onSelectBrand,
}: BrandsAnalyticsTabProps) {
  const isUz = locale === "uz";
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<BrandSortMode>("total_desc");

  const { namedCount, activeBrandsCount, zeroBrandsCount } = useMemo(() => {
    const named = brandStats.filter((b) => !b.isUnbranded);
    const active = named.filter((b) => b.totalProducts > 0).length;
    const zero = named.filter((b) => b.totalProducts === 0).length;
    return {
      namedCount: named.length,
      activeBrandsCount: active,
      zeroBrandsCount: zero,
    };
  }, [brandStats]);

  const filteredBrands = useMemo(() => {
    const needle = search.trim().toLowerCase();
    const list = brandStats.filter((b) => {
      if (!needle) return true;
      const label = b.isUnbranded
        ? isUz
          ? "brend ko'rsatilmagan"
          : "без бренда"
        : b.name.toLowerCase();
      return label.includes(needle);
    });

    return [...list].sort((a, b) => {
      if (a.isUnbranded !== b.isUnbranded) {
        return a.isUnbranded ? 1 : -1;
      }
      if (sortBy === "name_asc") {
        return a.name.localeCompare(b.name);
      }
      if (sortBy === "merchant_desc") {
        return b.merchantReadyCount - a.merchantReadyCount || b.totalProducts - a.totalProducts;
      }
      if (sortBy === "issues_desc") {
        const aIssues = a.noPriceCount + a.noImageCount;
        const bIssues = b.noPriceCount + b.noImageCount;
        return bIssues - aIssues || b.totalProducts - a.totalProducts;
      }
      return b.totalProducts - a.totalProducts || a.name.localeCompare(b.name);
    });
  }, [brandStats, search, sortBy, isUz]);

  return (
    <div className="space-y-5">
      {/* KPI Cards */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <div className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-slate-100 text-slate-700">
            <Tag className="w-4 h-4" />
          </div>
          <div className="mt-3 text-2xl font-bold text-slate-900">
            {namedCount}
          </div>
          <div className="text-xs font-medium text-slate-600 mt-0.5">
            {isUz ? "Jami brendlar (1C + katalog)" : "Всего брендов (1С + каталог)"}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <div className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div className="mt-3 text-2xl font-bold text-slate-900">
            {activeBrandsCount}
          </div>
          <div className="text-xs font-medium text-slate-600 mt-0.5">
            {isUz ? "Mahsuloti bor brendlar" : "Активные бренды (>0 товаров)"}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <div className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-slate-100 text-slate-600 border border-slate-200">
            <PackageOpen className="w-4 h-4" />
          </div>
          <div className="mt-3 text-2xl font-bold text-slate-900">
            {zeroBrandsCount}
          </div>
          <div className="text-xs font-medium text-slate-600 mt-0.5">
            {isUz ? "0 mahsulotli brendlar (1C)" : "Бренды с 0 товарами (1С)"}
          </div>
        </div>

        <button
          type="button"
          disabled={unbrandedCount === 0}
          onClick={() => onSelectBrand(UNBRANDED_FILTER_KEY)}
          className="text-left rounded-2xl border border-amber-200 bg-amber-50/50 p-4 transition-all hover:bg-amber-50 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-amber-100 text-amber-800 border border-amber-200">
              <AlertTriangle className="w-4 h-4" />
            </span>
            {unbrandedCount > 0 && (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-800">
                {isUz ? "Ko'rish" : "Открыть"}
                <ArrowRight className="w-3 h-3" />
              </span>
            )}
          </div>
          <div className="mt-3 text-2xl font-bold text-slate-900">
            {unbrandedCount}
          </div>
          <div className="text-xs font-medium text-amber-900 mt-0.5">
            {isUz ? "Brend ko'rsatilmagan mahsulotlar" : "Товары без бренда"}
          </div>
        </button>
      </section>

      {/* Search & Sort Bar */}
      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={
              isUz ? "Brend nomi bo'yicha qidirish..." : "Поиск по названию бренда..."
            }
            className="w-full rounded-xl border border-slate-300 bg-white pl-10 pr-3.5 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs font-medium text-slate-500 whitespace-nowrap">
            {isUz ? "Saralash:" : "Сортировка:"}
          </label>
          <select
            aria-label={isUz ? "Brendlarni saralash" : "Сортировка брендов"}
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as BrandSortMode)}
            className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-slate-900 focus:outline-none"
          >
            <option value="total_desc">
              {isUz ? "Mahsulot soni (ko'pdan kamga)" : "По кол-ву товаров (убыв.)"}
            </option>
            <option value="name_asc">
              {isUz ? "Nomi bo'yicha (A → Z)" : "По алфавиту (А → Я)"}
            </option>
            <option value="merchant_desc">
              {isUz ? "Merchant tayyor bo'yicha" : "По готовности Merchant"}
            </option>
            <option value="issues_desc">
              {isUz ? "Narxsiz/rasmsiz ko'pligi bo'yicha" : "По проблемным товарам"}
            </option>
          </select>
        </div>
      </section>

      {/* Brands Table */}
      <section className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-xs font-semibold uppercase tracking-wide text-slate-600">
                <th className="py-3 px-4">#</th>
                <th className="py-3 px-4">{isUz ? "Brend" : "Бренд"}</th>
                <th className="py-3 px-4">
                  {isUz ? "Mahsulotlar soni" : "Кол-во товаров"}
                </th>
                <th className="py-3 px-4">
                  {isUz ? "Katalog ulushi" : "Доля"}
                </th>
                <th className="py-3 px-4">
                  {isUz ? "Omborda (Bor / Yo'q)" : "Наличие (Есть / Нет)"}
                </th>
                <th className="py-3 px-4">
                  {isUz ? "Narxsiz / Rasmsiz" : "Без цены / фото"}
                </th>
                <th className="py-3 px-4">
                  {isUz ? "Merchant tayyor" : "Merchant готов"}
                </th>
                <th className="py-3 px-4">
                  {isUz ? "O'xshash=4 / Birga=12" : "Похожие=4 / С этим=12"}
                </th>
                <th className="py-3 px-4 text-right">
                  {isUz ? "Jadval" : "Таблица"}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filteredBrands.length === 0 ? (
                <tr>
                  <td
                    colSpan={9}
                    className="py-10 px-4 text-center text-slate-500"
                  >
                    {isUz ? "Brend topilmadi." : "Бренды не найдены."}
                  </td>
                </tr>
              ) : (
                filteredBrands.map((stat, idx) => {
                  const maxRatio =
                    totalCatalog > 0
                      ? Math.min(100, Math.max(2, (stat.totalProducts / totalCatalog) * 100))
                      : 0;

                  return (
                    <tr
                      key={stat.key}
                      className={`hover:bg-slate-50/70 transition-colors ${
                        stat.isUnbranded ? "bg-amber-50/30" : ""
                      }`}
                    >
                      <td className="py-3 px-4 text-xs text-slate-400 font-mono">
                        {idx + 1}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className={`font-semibold ${
                              stat.isUnbranded
                                ? "text-amber-800 italic"
                                : "text-slate-900"
                            }`}
                          >
                            {stat.isUnbranded
                              ? isUz
                                ? "Brend ko'rsatilmagan"
                                : "Без бренда"
                              : stat.name}
                          </span>
                          {stat.totalProducts === 0 && (
                            <span className="rounded-full bg-slate-100 border border-slate-200 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                              0 ta
                            </span>
                          )}
                          {!stat.isUnbranded && stat.isInOfficialBrandsList && (
                            <span className="rounded-full bg-blue-50 border border-blue-200 px-2 py-0.5 text-[10px] font-medium text-blue-700">
                              1C
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-3 px-4 min-w-[160px]">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900">
                            {stat.totalProducts}
                          </span>
                          {stat.totalProducts > 0 && (
                            <div className="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden max-w-[100px]">
                              <div
                                className={`h-full rounded-full ${
                                  stat.isUnbranded
                                    ? "bg-amber-500"
                                    : "bg-slate-800"
                                }`}
                                style={{ width: `${maxRatio}%` }}
                              />
                            </div>
                          )}
                        </div>
                      </td>

                      <td className="py-3 px-4 text-xs font-medium text-slate-600">
                        {stat.sharePercent.toFixed(1)}%
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap text-xs">
                        <span className="text-emerald-700 font-semibold">
                          {stat.inStockCount}
                        </span>
                        <span className="text-slate-400 mx-1">/</span>
                        <span className="text-slate-600">
                          {stat.outOfStockCount}
                        </span>
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap text-xs">
                        <span
                          className={
                            stat.noPriceCount > 0
                              ? "text-red-700 font-semibold"
                              : "text-slate-500"
                          }
                        >
                          {stat.noPriceCount}
                        </span>
                        <span className="text-slate-400 mx-1">/</span>
                        <span
                          className={
                            stat.noImageCount > 0
                              ? "text-amber-700 font-semibold"
                              : "text-slate-500"
                          }
                        >
                          {stat.noImageCount}
                        </span>
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap text-xs">
                        <span className="font-semibold text-emerald-700">
                          {stat.merchantReadyCount}
                        </span>
                        <span className="text-slate-400">
                          {" "}
                          / {stat.totalProducts}
                        </span>
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap text-xs">
                        <span className="rounded bg-emerald-50 text-emerald-800 px-1.5 py-0.5 font-medium">
                          {stat.similarEq4Count}
                        </span>
                        <span className="text-slate-400 mx-1">/</span>
                        <span className="rounded bg-sky-50 text-sky-800 px-1.5 py-0.5 font-medium">
                          {stat.crossSellEq12Count}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <button
                          type="button"
                          disabled={stat.totalProducts === 0}
                          onClick={() => onSelectBrand(stat.key)}
                          className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                        >
                          <span>{isUz ? "Ko'rish" : "Смотреть"}</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
