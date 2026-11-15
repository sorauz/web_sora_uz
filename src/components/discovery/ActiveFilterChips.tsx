"use client";

import { useQueryStates, parseAsString } from "nuqs";
import { useLocale } from "next-intl";
import { X, RotateCcw } from "lucide-react";
import { useTransition } from "react";

interface ActiveFilterChipsProps {
  className?: string;
}

export function ActiveFilterChips({ className = "" }: ActiveFilterChipsProps) {
  const locale = useLocale();
  const isUz = locale === "uz";
  const [, startTransition] = useTransition();

  const [filterState, setFilterState] = useQueryStates(
    {
      brand: parseAsString.withDefault(""),
      minPrice: parseAsString.withDefault(""),
      maxPrice: parseAsString.withDefault(""),
      inStock: parseAsString.withDefault(""),
      page: parseAsString.withDefault(""),
    },
    {
      shallow: false,
      startTransition,
    }
  );

  const activeBrands = filterState.brand
    ? filterState.brand.split(",").filter(Boolean)
    : [];
  const minPrice = filterState.minPrice;
  const maxPrice = filterState.maxPrice;
  const inStock = filterState.inStock === "1";

  const hasAnyFilter =
    activeBrands.length > 0 || !!minPrice || !!maxPrice || inStock;

  if (!hasAnyFilter) {
    return null;
  }

  const removeBrand = (brandToRemove: string) => {
    const updated = activeBrands.filter((b) => b !== brandToRemove);
    setFilterState({
      brand: updated.length > 0 ? updated.join(",") : null,
      page: null,
    });
  };

  const removePrice = () => {
    setFilterState({
      minPrice: null,
      maxPrice: null,
      page: null,
    });
  };

  const removeStock = () => {
    setFilterState({
      inStock: null,
      page: null,
    });
  };

  const resetAll = () => {
    setFilterState({
      brand: null,
      minPrice: null,
      maxPrice: null,
      inStock: null,
      page: null,
    });
  };

  const formatPrice = (p: string) => {
    const n = Number(p);
    return isNaN(n) ? p : n.toLocaleString("ru-RU");
  };

  return (
    <div
      data-testid="active-filter-chips"
      className={`flex flex-wrap items-center gap-2 py-1 ${className}`}
    >
      <span className="text-xs font-semibold text-slate-500 mr-0.5">
        {isUz ? "Faol filtrlar:" : "Фильтры:"}
      </span>

      {/* Brand Chips */}
      {activeBrands.map((b) => (
        <button
          key={b}
          type="button"
          onClick={() => removeBrand(b)}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold bg-sora-50 dark:bg-sora-950/60 text-sora-700 dark:text-sora-300 border border-sora-200 dark:border-sora-800 hover:bg-sora-100 transition-colors cursor-pointer group"
          title={isUz ? `${b} filtrini o'chirish` : `Удалить фильтр ${b}`}
        >
          <span>{b}</span>
          <X className="w-3.5 h-3.5 text-sora-400 group-hover:text-sora-700 transition-colors" />
        </button>
      ))}

      {/* Price Chip */}
      {(minPrice || maxPrice) && (
        <button
          type="button"
          onClick={removePrice}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 hover:bg-amber-100 transition-colors cursor-pointer group"
          title={isUz ? "Narx filtrini o'chirish" : "Удалить фильтр цены"}
        >
          <span>
            {minPrice && maxPrice
              ? `${formatPrice(minPrice)} – ${formatPrice(maxPrice)} so'm`
              : minPrice
              ? `${formatPrice(minPrice)} so'mdan`
              : `${formatPrice(maxPrice)} so'mgacha`}
          </span>
          <X className="w-3.5 h-3.5 text-amber-400 group-hover:text-amber-700 transition-colors" />
        </button>
      )}

      {/* Stock Chip */}
      {inStock && (
        <button
          type="button"
          onClick={removeStock}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 transition-colors cursor-pointer group"
          title={isUz ? "Mavjudlik filtrini o'chirish" : "Удалить фильтр наличия"}
        >
          <span>{isUz ? "Omborda mavjud" : "В наличии"}</span>
          <X className="w-3.5 h-3.5 text-emerald-400 group-hover:text-emerald-700 transition-colors" />
        </button>
      )}

      {/* Reset all button */}
      <button
        type="button"
        onClick={resetAll}
        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold text-rose-600 hover:text-rose-700 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer ml-auto sm:ml-1"
      >
        <RotateCcw className="w-3 h-3" />
        <span>{isUz ? "Tozalash" : "Сбросить"}</span>
      </button>
    </div>
  );
}
