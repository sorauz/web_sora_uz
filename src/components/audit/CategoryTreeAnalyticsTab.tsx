"use client";

import { useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  ChevronDown,
  ChevronRight,
  FolderTree,
  Layers,
  PackageOpen,
  Search,
} from "lucide-react";
import {
  UNCATEGORIZED_FILTER_KEY,
  type AuditAggStats,
  type AuditCategoryNodeStat,
} from "@/lib/utils/catalog-audit";

interface CategoryTreeAnalyticsTabProps {
  categoryTreeStats: AuditCategoryNodeStat[];
  uncategorizedStats: AuditAggStats;
  totalCatalog: number;
  emptyCategoryCount: number;
  locale: "uz" | "ru";
  onSelectCategoryNode: (nodeKey: string) => void;
}

function countAllNodes(nodes: AuditCategoryNodeStat[]): number {
  let count = 0;
  for (const n of nodes) {
    count += 1 + countAllNodes(n.children);
  }
  return count;
}

function collectExpandableIds(nodes: AuditCategoryNodeStat[]): string[] {
  const ids: string[] = [];
  for (const n of nodes) {
    if (n.children.length > 0) {
      ids.push(n.id);
      ids.push(...collectExpandableIds(n.children));
    }
  }
  return ids;
}

function filterCategoryTree(
  nodes: AuditCategoryNodeStat[],
  searchNeedle: string,
  emptyOnly: boolean
): AuditCategoryNodeStat[] {
  const result: AuditCategoryNodeStat[] = [];

  for (const node of nodes) {
    const filteredChildren = filterCategoryTree(
      node.children,
      searchNeedle,
      emptyOnly
    );

    const matchesSearch =
      !searchNeedle ||
      node.nameUz.toLowerCase().includes(searchNeedle) ||
      node.nameRu.toLowerCase().includes(searchNeedle) ||
      node.slugUz.toLowerCase().includes(searchNeedle) ||
      node.slugRu.toLowerCase().includes(searchNeedle);

    const matchesEmpty = !emptyOnly || node.totalTreeCount === 0;

    if ((matchesSearch && matchesEmpty) || filteredChildren.length > 0) {
      result.push({
        ...node,
        children: filteredChildren,
      });
    }
  }

  return result;
}

export function CategoryTreeAnalyticsTab({
  categoryTreeStats,
  uncategorizedStats,
  totalCatalog,
  emptyCategoryCount,
  locale,
  onSelectCategoryNode,
}: CategoryTreeAnalyticsTabProps) {
  const isUz = locale === "uz";
  const [search, setSearch] = useState("");
  const [emptyOnly, setEmptyOnly] = useState(false);

  const allExpandableIds = useMemo(
    () => collectExpandableIds(categoryTreeStats),
    [categoryTreeStats]
  );

  const [expandedIds, setExpandedIds] = useState<Set<string>>(
    () => new Set(categoryTreeStats.map((root) => root.id))
  );

  const totalNodeCount = useMemo(
    () => countAllNodes(categoryTreeStats),
    [categoryTreeStats]
  );

  const filteredTree = useMemo(
    () =>
      filterCategoryTree(
        categoryTreeStats,
        search.trim().toLowerCase(),
        emptyOnly
      ),
    [categoryTreeStats, search, emptyOnly]
  );

  const isForceExpanded = search.trim().length > 0 || emptyOnly;

  function toggleExpand(nodeId: string) {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(nodeId)) next.delete(nodeId);
      else next.add(nodeId);
      return next;
    });
  }

  function renderTreeRows(nodes: AuditCategoryNodeStat[]): React.ReactNode[] {
    const rows: React.ReactNode[] = [];

    for (const node of nodes) {
      const hasChildren = node.children.length > 0;
      const isExpanded = isForceExpanded || expandedIds.has(node.id);
      const displayName = isUz
        ? node.nameUz || node.nameRu
        : node.nameRu || node.nameUz;
      const secondaryName = isUz ? node.nameRu : node.nameUz;
      const share =
        totalCatalog > 0
          ? Math.round((node.totalTreeCount / totalCatalog) * 1000) / 10
          : 0;

      rows.push(
        <tr
          key={node.id}
          className={`hover:bg-slate-50/70 transition-colors ${
            node.depth === 0 ? "bg-slate-50/40" : ""
          }`}
        >
          <td className="py-3 px-4 min-w-[290px]">
            <div
              className="flex items-center gap-2"
              style={{ paddingLeft: `${node.depth * 22}px` }}
            >
              {hasChildren ? (
                <button
                  type="button"
                  onClick={() => toggleExpand(node.id)}
                  aria-label={isExpanded ? "Collapse" : "Expand"}
                  className="inline-flex items-center justify-center w-6 h-6 rounded-md border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 shrink-0 cursor-pointer"
                >
                  {isExpanded ? (
                    <ChevronDown className="w-3.5 h-3.5" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5" />
                  )}
                </button>
              ) : (
                <span className="inline-block w-6 shrink-0 text-center text-slate-300">
                  {node.depth > 0 ? "└" : "•"}
                </span>
              )}

              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={`${
                      node.depth === 0
                        ? "font-bold text-slate-900"
                        : "font-medium text-slate-800"
                    }`}
                  >
                    {displayName}
                  </span>
                  {node.totalTreeCount === 0 && (
                    <span className="rounded-full border border-red-200 bg-red-50 px-2 py-0.5 text-[10px] font-semibold text-red-700">
                      {isUz ? "0 ta mahsulot" : "0 товаров"}
                    </span>
                  )}
                  {node.isOrphan && (
                    <span className="rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-medium text-amber-800">
                      {isUz ? "Daraxtdan tashqari" : "Вне дерева"}
                    </span>
                  )}
                </div>
                {secondaryName && secondaryName !== displayName && (
                  <div className="text-[11px] text-slate-400">
                    {secondaryName}
                  </div>
                )}
              </div>
            </div>
          </td>

          <td className="py-3 px-4 whitespace-nowrap text-xs font-medium text-slate-700">
            {node.directCount}
          </td>

          <td className="py-3 px-4 whitespace-nowrap">
            <span
              className={`font-bold ${
                node.totalTreeCount === 0 ? "text-red-600" : "text-slate-900"
              }`}
            >
              {node.totalTreeCount}
            </span>
            <span className="ml-1.5 text-[11px] text-slate-400">
              ({share.toFixed(1)}%)
            </span>
          </td>

          <td className="py-3 px-4 whitespace-nowrap text-xs">
            <span className="text-emerald-700 font-semibold">
              {node.treeStats.inStockCount}
            </span>
            <span className="text-slate-400 mx-1">/</span>
            <span className="text-slate-600">
              {node.treeStats.outOfStockCount}
            </span>
          </td>

          <td className="py-3 px-4 whitespace-nowrap text-xs">
            <span
              className={
                node.treeStats.noPriceCount > 0
                  ? "text-red-700 font-semibold"
                  : "text-slate-500"
              }
            >
              {node.treeStats.noPriceCount}
            </span>
            <span className="text-slate-400 mx-1">/</span>
            <span
              className={
                node.treeStats.noImageCount > 0
                  ? "text-amber-700 font-semibold"
                  : "text-slate-500"
              }
            >
              {node.treeStats.noImageCount}
            </span>
          </td>

          <td className="py-3 px-4 whitespace-nowrap text-xs">
            <span className="font-semibold text-emerald-700">
              {node.treeStats.merchantReadyCount}
            </span>
            <span className="text-slate-400"> / {node.totalTreeCount}</span>
          </td>

          <td className="py-3 px-4 text-right whitespace-nowrap">
            <button
              type="button"
              disabled={node.totalTreeCount === 0}
              onClick={() => onSelectCategoryNode(node.id)}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <span>{isUz ? "Ko'rish" : "Смотреть"}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </td>
        </tr>
      );

      if (hasChildren && isExpanded) {
        rows.push(...renderTreeRows(node.children));
      }
    }

    return rows;
  }

  return (
    <div className="space-y-5">
      {/* KPI Cards */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <div className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-teal-50 text-teal-700 border border-teal-200">
            <FolderTree className="w-4 h-4" />
          </div>
          <div className="mt-3 text-2xl font-bold text-slate-900">
            {categoryTreeStats.length}
          </div>
          <div className="text-xs font-medium text-slate-600 mt-0.5">
            {isUz ? "Asosiy kategoriyalar" : "Корневые категории"}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <div className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-slate-100 text-slate-700">
            <Layers className="w-4 h-4" />
          </div>
          <div className="mt-3 text-2xl font-bold text-slate-900">
            {totalNodeCount}
          </div>
          <div className="text-xs font-medium text-slate-600 mt-0.5">
            {isUz
              ? "Jami kategoriya va ostkategoriyalar"
              : "Всего категорий и подкатегорий"}
          </div>
        </div>

        <button
          type="button"
          onClick={() => setEmptyOnly((prev) => !prev)}
          className={`text-left rounded-2xl border p-4 transition-all cursor-pointer ${
            emptyOnly
              ? "border-red-400 ring-2 ring-red-500/20 bg-red-50/40"
              : "border-slate-200 bg-white hover:shadow-xs"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-red-50 text-red-700 border border-red-200">
              <PackageOpen className="w-4 h-4" />
            </span>
            {emptyOnly && (
              <span className="text-[11px] font-semibold uppercase text-red-700">
                {isUz ? "Faol" : "Активно"}
              </span>
            )}
          </div>
          <div className="mt-3 text-2xl font-bold text-slate-900">
            {emptyCategoryCount}
          </div>
          <div className="text-xs font-medium text-slate-600 mt-0.5">
            {isUz ? "Bo'sh (0 mahsulotli) bo'limlar" : "Пустые разделы (0 товаров)"}
          </div>
        </button>

        <button
          type="button"
          disabled={uncategorizedStats.totalProducts === 0}
          onClick={() => onSelectCategoryNode(UNCATEGORIZED_FILTER_KEY)}
          className="text-left rounded-2xl border border-amber-200 bg-amber-50/50 p-4 transition-all hover:bg-amber-50 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-amber-100 text-amber-800 border border-amber-200">
              <AlertTriangle className="w-4 h-4" />
            </span>
            {uncategorizedStats.totalProducts > 0 && (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-800">
                {isUz ? "Ko'rish" : "Открыть"}
                <ArrowRight className="w-3 h-3" />
              </span>
            )}
          </div>
          <div className="mt-3 text-2xl font-bold text-slate-900">
            {uncategorizedStats.totalProducts}
          </div>
          <div className="text-xs font-medium text-amber-900 mt-0.5">
            {isUz ? "Kategoriyasi ko'rsatilmagan" : "Товары без категории"}
          </div>
        </button>
      </section>

      {/* Toolbar */}
      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={
              isUz
                ? "Kategoriya yoki ostkategoriya qidirish..."
                : "Поиск категории или подкатегории..."
            }
            className="w-full rounded-xl border border-slate-300 bg-white pl-10 pr-3.5 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setExpandedIds(new Set(allExpandableIds))}
            className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
          >
            {isUz ? "Barchasini yoyish" : "Развернуть все"}
          </button>
          <button
            type="button"
            onClick={() => setExpandedIds(new Set())}
            className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
          >
            {isUz ? "Barchasini yig'ish" : "Свернуть все"}
          </button>
        </div>
      </section>

      {/* Tree Table */}
      <section className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-xs font-semibold uppercase tracking-wide text-slate-600">
                <th className="py-3 px-4">
                  {isUz ? "Kategoriya / Subkategoriya" : "Категория / Подкатегория"}
                </th>
                <th className="py-3 px-4">
                  {isUz ? "To'g'ridan-to'g'ri" : "Прямых"}
                </th>
                <th className="py-3 px-4">
                  {isUz ? "Daraxt bo'yicha jami" : "Итого (дерево)"}
                </th>
                <th className="py-3 px-4">
                  {isUz ? "Omborda (Bor / Yo'q)" : "Наличие"}
                </th>
                <th className="py-3 px-4">
                  {isUz ? "Narxsiz / Rasmsiz" : "Без цены / фото"}
                </th>
                <th className="py-3 px-4">
                  {isUz ? "Merchant tayyor" : "Merchant готов"}
                </th>
                <th className="py-3 px-4 text-right">
                  {isUz ? "Jadval" : "Таблица"}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filteredTree.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="py-10 px-4 text-center text-slate-500"
                  >
                    {isUz
                      ? "Tanlangan shart bo'yicha kategoriya topilmadi."
                      : "Категории не найдены."}
                  </td>
                </tr>
              ) : (
                renderTreeRows(filteredTree)
              )}

              {uncategorizedStats.totalProducts > 0 && !search.trim() && !emptyOnly && (
                <tr className="bg-amber-50/40 border-t-2 border-amber-200">
                  <td className="py-3 px-4 font-semibold text-amber-900 italic">
                    {isUz ? "Kategoriyasi ko'rsatilmagan mahsulotlar" : "Товары без категории"}
                  </td>
                  <td className="py-3 px-4 text-xs font-medium text-amber-900">
                    {uncategorizedStats.totalProducts}
                  </td>
                  <td className="py-3 px-4 font-bold text-amber-900">
                    {uncategorizedStats.totalProducts}
                  </td>
                  <td className="py-3 px-4 text-xs">
                    {uncategorizedStats.inStockCount} / {uncategorizedStats.outOfStockCount}
                  </td>
                  <td className="py-3 px-4 text-xs">
                    {uncategorizedStats.noPriceCount} / {uncategorizedStats.noImageCount}
                  </td>
                  <td className="py-3 px-4 text-xs">
                    {uncategorizedStats.merchantReadyCount} / {uncategorizedStats.totalProducts}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      type="button"
                      onClick={() =>
                        onSelectCategoryNode(UNCATEGORIZED_FILTER_KEY)
                      }
                      className="inline-flex items-center gap-1 rounded-lg border border-amber-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-amber-900 hover:bg-amber-100 cursor-pointer"
                    >
                      <span>{isUz ? "Ko'rish" : "Смотреть"}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
