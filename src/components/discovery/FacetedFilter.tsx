"use client";

import { useQueryState } from "nuqs";
import { useTranslations } from "next-intl";
import { Brand } from "@/lib/schemas/brand";
import { Filter, X, RotateCcw } from "lucide-react";
import { useState } from "react";

interface FacetedFilterProps {
  brands: Brand[];
  minPossiblePrice?: number;
  maxPossiblePrice?: number;
}

export function FacetedFilter({
  brands,
  minPossiblePrice = 0,
  maxPossiblePrice = 20000000,
}: FacetedFilterProps) {
  const t = useTranslations("filter");

  // nuqs URL query states
  const [selectedBrand, setSelectedBrand] = useQueryState("brand", {
    defaultValue: "",
  });
  const [minPrice, setMinPrice] = useQueryState("minPrice", {
    defaultValue: "",
  });
  const [maxPrice, setMaxPrice] = useQueryState("maxPrice", {
    defaultValue: "",
  });
  const [inStock, setInStock] = useQueryState("inStock", {
    defaultValue: "",
  });

  const [mobileOpen, setMobileOpen] = useState(false);

  const activeBrands = selectedBrand ? selectedBrand.split(",").filter(Boolean) : [];

  const toggleBrand = (brandName: string) => {
    let next: string[];
    if (activeBrands.includes(brandName)) {
      next = activeBrands.filter((b) => b !== brandName);
    } else {
      next = [...activeBrands, brandName];
    }
    setSelectedBrand(next.length > 0 ? next.join(",") : null);
  };

  const resetAll = () => {
    setSelectedBrand(null);
    setMinPrice(null);
    setMaxPrice(null);
    setInStock(null);
  };

  const hasActiveFilters =
    activeBrands.length > 0 || !!minPrice || !!maxPrice || !!inStock;

  const content = (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
        <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <Filter className="w-4 h-4 text-blue-600" />
          {t("title")}
        </h3>
        {hasActiveFilters && (
          <button
            onClick={resetAll}
            className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 font-medium flex items-center gap-1"
          >
            <RotateCcw className="w-3 h-3" />
            {t("title") !== "Фильтры" ? "Tozalash" : "Сбросить"}
          </button>
        )}
      </div>

      {/* Availability */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
          {t("availability")}
        </h4>
        <label className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-300 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={inStock === "1"}
            onChange={(e) => setInStock(e.target.checked ? "1" : null)}
            className="w-4 h-4 rounded-sm text-blue-600 focus:ring-blue-500 border-slate-300 cursor-pointer"
          />
          <span>{t("onlyInStock")}</span>
        </label>
      </div>

      {/* Brands */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
          {t("brands")}
        </h4>
        <div className="max-h-48 overflow-y-auto space-y-2 pr-2 text-xs">
          {brands.map((brand) => {
            const checked = activeBrands.includes(brand.name);
            return (
              <label
                key={brand.id}
                className="flex items-center justify-between py-1 text-slate-700 dark:text-slate-300 hover:text-blue-600 cursor-pointer select-none"
              >
                <div className="flex items-center gap-2.5">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleBrand(brand.name)}
                    className="w-4 h-4 rounded-sm text-blue-600 focus:ring-blue-500 border-slate-300 cursor-pointer"
                  />
                  <span>{brand.name}</span>
                </div>
              </label>
            );
          })}
        </div>
      </div>

      {/* Price Range */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
          {t("price")}
        </h4>
        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder={t("priceFrom")}
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value || null)}
            className="w-full h-9 px-3 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 focus:outline-hidden focus:border-blue-500"
          />
          <span className="text-slate-400 text-xs">—</span>
          <input
            type="number"
            placeholder={t("priceTo")}
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value || null)}
            className="w-full h-9 px-3 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 focus:outline-hidden focus:border-blue-500"
          />
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar Filter */}
      <aside className="hidden lg:block w-64 shrink-0 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs h-fit sticky top-24">
        {content}
      </aside>

      {/* Mobile Toggle Button */}
      <div className="lg:hidden">
        <button
          onClick={() => setMobileOpen(true)}
          className="h-10 px-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200 shadow-xs"
        >
          <Filter className="w-4 h-4 text-blue-600" />
          <span>{t("title")}</span>
          {hasActiveFilters && (
            <span className="w-2 h-2 rounded-full bg-blue-600" />
          )}
        </button>

        {/* Mobile Drawer */}
        {mobileOpen && (
          <div className="fixed inset-0 z-50 flex bg-black/50 backdrop-blur-xs">
            <div className="relative w-full max-w-xs h-full bg-white dark:bg-slate-900 p-6 overflow-y-auto shadow-2xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100 dark:border-slate-800">
                  <h3 className="font-bold text-base">{t("title")}</h3>
                  <button
                    onClick={() => setMobileOpen(false)}
                    className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <X className="w-5 h-5 text-slate-500" />
                  </button>
                </div>
                {content}
              </div>

              <div className="pt-6 border-t border-slate-100 dark:border-slate-800 mt-6">
                <button
                  onClick={() => setMobileOpen(false)}
                  className="w-full h-11 bg-blue-600 text-white font-bold text-sm rounded-xl"
                >
                  Ko&apos;rish (Qo&apos;llash)
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
