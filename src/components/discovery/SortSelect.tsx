"use client";

import { useQueryState } from "nuqs";
import { useTranslations } from "next-intl";
import { ArrowUpDown } from "lucide-react";

export function SortSelect({ className = "" }: { className?: string }) {
  const t = useTranslations("filter");
  const [sort, setSort] = useQueryState("sort", { defaultValue: "popular" });

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="relative inline-flex items-center w-full">
        <ArrowUpDown className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          aria-label={t("sortBy")}
          className="w-full h-10 pl-9 pr-7 text-xs font-semibold rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:border-sora-500 cursor-pointer appearance-none shadow-xs truncate"
        >
          <option value="popular">{t("sortPopular")}</option>
          <option value="price_asc">{t("sortPriceAsc")}</option>
          <option value="price_desc">{t("sortPriceDesc")}</option>
          <option value="newest">{t("sortNew")}</option>
        </select>
      </div>
    </div>
  );
}
