"use client";

import { useQueryStates, parseAsString } from "nuqs";
import { useTranslations, useLocale } from "next-intl";
import { Filter, X, RotateCcw, Search, ChevronDown, Loader2 } from "lucide-react";
import { useState, useMemo, useTransition, useEffect } from "react";
import { SortSelect } from "./SortSelect";
import { DualRangeSlider } from "./DualRangeSlider";

export interface FilterBrandItem {
  id: string;
  name: string;
  count?: number;
}

export interface FilterCategoryItem {
  id: string;
  name: string;
  slug: string;
  count?: number;
}

export interface FilterAttributeItem {
  name: string;
  values: {
    value: string;
    count: number;
  }[];
}

export interface PricePresetItem {
  label: string;
  min: string;
  max: string;
}

interface FacetedFilterProps {
  brands: FilterBrandItem[];
  categories?: FilterCategoryItem[];
  attributes?: FilterAttributeItem[];
  minPossiblePrice?: number;
  maxPossiblePrice?: number;
  totalMatchedCount?: number;
  pricePresets?: PricePresetItem[];
  discountCount?: number;
  inStockCount?: number;
}

function parseAttrs(attrsStr: string): { prop: string; val: string }[] {
  if (!attrsStr) return [];
  return attrsStr
    .split(";")
    .map((item) => {
      const idx = item.indexOf(":");
      if (idx === -1) return null;
      return {
        prop: item.slice(0, idx).trim(),
        val: item.slice(idx + 1).trim(),
      };
    })
    .filter(
      (item): item is { prop: string; val: string } =>
        item !== null && !!item.prop && !!item.val
    );
}

function stringifyAttrs(items: { prop: string; val: string }[]): string | null {
  if (items.length === 0) return null;
  return items.map((i) => `${i.prop}:${i.val}`).join(";");
}

export function FacetedFilter({
  brands,
  categories,
  attributes,
  minPossiblePrice = 0,
  maxPossiblePrice = 20000000,
  totalMatchedCount,
  pricePresets,
  discountCount,
  inStockCount,
}: FacetedFilterProps) {
  const t = useTranslations("filter");
  const common = useTranslations("common");
  const locale = useLocale();
  const isUz = locale === "uz";
  const [isPending, startTransition] = useTransition();

  // nuqs URL query states synchronized with Next.js Server Components
  const [filterState, setFilterState] = useQueryStates(
    {
      category: parseAsString.withDefault(""),
      brand: parseAsString.withDefault(""),
      minPrice: parseAsString.withDefault(""),
      maxPrice: parseAsString.withDefault(""),
      inStock: parseAsString.withDefault(""),
      discount: parseAsString.withDefault(""),
      attrs: parseAsString.withDefault(""),
      page: parseAsString.withDefault(""),
    },
    {
      shallow: false,
      startTransition,
    }
  );

  const selectedCategory = filterState.category;
  const selectedBrand = filterState.brand;
  const minPrice = filterState.minPrice;
  const maxPrice = filterState.maxPrice;
  const inStock = filterState.inStock;
  const discount = filterState.discount;
  const activeAttrs = parseAttrs(filterState.attrs);

  // Local inputs state for custom prices
  const [localMin, setLocalMin] = useState(minPrice);
  const [localMax, setLocalMax] = useState(maxPrice);

  useEffect(() => {
    setLocalMin(minPrice);
  }, [minPrice]);

  useEffect(() => {
    setLocalMax(maxPrice);
  }, [maxPrice]);

  const applyCustomPrice = () => {
    const cleanMin = localMin ? localMin.trim() : "";
    const cleanMax = localMax ? localMax.trim() : "";
    if (cleanMin !== minPrice || cleanMax !== maxPrice) {
      setFilterState({
        minPrice: cleanMin || null,
        maxPrice: cleanMax || null,
        page: null,
      });
    }
  };

  const [mobileOpen, setMobileOpen] = useState(false);
  const [brandSearch, setBrandSearch] = useState("");

  // Collapsible section states
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    categories: true,
    quick: true,
    price: true,
    brands: true,
  });

  const toggleSection = (section: string) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const activeBrands = selectedBrand ? selectedBrand.split(",").filter(Boolean) : [];

  const toggleBrand = (brandName: string) => {
    let next: string[];
    if (activeBrands.includes(brandName)) {
      next = activeBrands.filter((b) => b !== brandName);
    } else {
      next = [...activeBrands, brandName];
    }
    setFilterState({
      brand: next.length > 0 ? next.join(",") : null,
      page: null,
    });
  };

  const toggleAttribute = (prop: string, val: string) => {
    const exists = activeAttrs.some((a) => a.prop === prop && a.val === val);
    let next: { prop: string; val: string }[];
    if (exists) {
      next = activeAttrs.filter((a) => !(a.prop === prop && a.val === val));
    } else {
      next = [...activeAttrs, { prop, val }];
    }
    setFilterState({
      attrs: stringifyAttrs(next),
      page: null,
    });
  };

  const resetAll = () => {
    setLocalMin("");
    setLocalMax("");
    setBrandSearch("");
    setFilterState({
      category: null,
      brand: null,
      minPrice: null,
      maxPrice: null,
      inStock: null,
      discount: null,
      attrs: null,
      page: null,
    });
  };

  const hasActiveFilters =
    !!selectedCategory ||
    activeBrands.length > 0 ||
    !!minPrice ||
    !!maxPrice ||
    !!inStock ||
    !!discount ||
    activeAttrs.length > 0;

  const activeFilterCount =
    (selectedCategory ? 1 : 0) +
    activeBrands.length +
    (minPrice || maxPrice ? 1 : 0) +
    (inStock === "1" ? 1 : 0) +
    (discount === "1" ? 1 : 0) +
    activeAttrs.length;

  // Quick price presets
  const defaultPricePresets: PricePresetItem[] = [
    {
      label: isUz ? "50 minggacha" : "До 50 тыс.",
      min: "",
      max: "50000",
    },
    {
      label: isUz ? "50 – 200 ming" : "50 – 200 тыс.",
      min: "50000",
      max: "200000",
    },
    {
      label: isUz ? "200 – 500 ming" : "200 – 500 тыс.",
      min: "200000",
      max: "500000",
    },
    {
      label: isUz ? "500 mingdan yuqori" : "От 500 тыс.",
      min: "500000",
      max: "",
    },
  ];

  const activePresets =
    pricePresets && pricePresets.length > 0 ? pricePresets : defaultPricePresets;

  const handlePricePreset = (minVal: string, maxVal: string) => {
    const isSame = (minPrice || "") === minVal && (maxPrice || "") === maxVal;
    if (isSame) {
      setLocalMin("");
      setLocalMax("");
      setFilterState({
        minPrice: null,
        maxPrice: null,
        page: null,
      });
    } else {
      setLocalMin(minVal);
      setLocalMax(maxVal);
      setFilterState({
        minPrice: minVal || null,
        maxPrice: maxVal || null,
        page: null,
      });
    }
  };

  // Slider step sizing
  const priceRange = Math.max(1, maxPossiblePrice - minPossiblePrice);
  const sliderStep =
    priceRange > 5000000
      ? 50000
      : priceRange > 1000000
      ? 10000
      : priceRange > 200000
      ? 5000
      : priceRange > 50000
      ? 1000
      : 500;

  // Filter and sort brands: active brands always top, matching brandSearch query
  const filteredBrands = useMemo(() => {
    const q = brandSearch.trim().toLowerCase();
    const list = brands.filter((b) => b.name.toLowerCase().includes(q));

    return [...list].sort((a, b) => {
      const aChecked = activeBrands.includes(a.name);
      const bChecked = activeBrands.includes(b.name);
      if (aChecked && !bChecked) return -1;
      if (!aChecked && bChecked) return 1;
      return a.name.localeCompare(b.name);
    });
  }, [brands, brandSearch, activeBrands]);

  const content = (
    <div className="space-y-5">
      {/* Header with Title and Reset */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
        <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
          {isPending ? (
            <Loader2 className="w-4 h-4 text-sora-600 animate-spin" />
          ) : (
            <Filter className="w-4 h-4 text-sora-600" />
          )}
          <span>{t("title")}</span>
          {isPending && (
            <span className="text-[10px] text-sora-600 dark:text-sora-400 font-semibold animate-pulse">
              {isUz ? "Yangilanmoqda..." : "Обновление..."}
            </span>
          )}
        </h3>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={resetAll}
            className="text-xs text-sora-600 hover:text-sora-700 dark:text-sora-400 font-semibold flex items-center gap-1 cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span>{isUz ? "Tozalash" : "Сбросить"}</span>
          </button>
        )}
      </div>

      {/* 0. Categories Section (Specifically for Search Page) */}
      {categories && categories.length > 0 && (
        <div className="border-b border-slate-100 dark:border-slate-800/80 pb-4">
          <button
            type="button"
            onClick={() => toggleSection("categories")}
            className="w-full flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 py-1 cursor-pointer select-none"
          >
            <div className="flex items-center gap-2">
              <span>{t("categories")}</span>
              {selectedCategory && (
                <span className="w-2 h-2 rounded-full bg-sora-600" />
              )}
            </div>
            <ChevronDown
              className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                openSections.categories ? "rotate-180" : ""
              }`}
            />
          </button>

          {openSections.categories && (
            <div className="mt-3 space-y-1 max-h-48 overflow-y-auto pr-1 text-xs">
              {categories.map((cat) => {
                const isSelected = selectedCategory === cat.slug;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => {
                      setFilterState({
                        category: isSelected ? null : cat.slug,
                        page: null,
                      });
                    }}
                    className={`w-full flex items-center justify-between py-1.5 px-2 rounded-lg text-left transition-colors cursor-pointer ${
                      isSelected
                        ? "bg-sora-50 dark:bg-sora-950/60 text-sora-600 dark:text-sora-400 font-bold"
                        : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60"
                    }`}
                  >
                    <span className="truncate">{cat.name}</span>
                    {typeof cat.count === "number" && (
                      <span className="text-[11px] font-mono text-slate-400 shrink-0 ml-1">
                        ({cat.count})
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 1. Availability & Discount Quick Toggles (Collapsible) */}
      <div className="border-b border-slate-100 dark:border-slate-800/80 pb-4">
        <button
          type="button"
          onClick={() => toggleSection("quick")}
          className="w-full flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 py-1 cursor-pointer select-none"
        >
          <span>{t("availability")}</span>
          <ChevronDown
            className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
              openSections.quick ? "rotate-180" : ""
            }`}
          />
        </button>

        {openSections.quick && (
          <div className="mt-3 space-y-2">
            {/* In-Stock Toggle */}
            <label className="flex items-center justify-between text-xs text-slate-700 dark:text-slate-300 cursor-pointer select-none py-1 hover:text-sora-600 transition-colors">
              <div className="flex items-center gap-2.5">
                <input
                  type="checkbox"
                  checked={inStock === "1"}
                  onChange={(e) => {
                    setFilterState({
                      inStock: e.target.checked ? "1" : null,
                      page: null,
                    });
                  }}
                  className="w-4 h-4 rounded-md text-sora-600 focus:ring-sora-500 border-slate-300 dark:border-slate-700 cursor-pointer accent-sora-600"
                />
                <span className="font-medium">{t("onlyInStock")}</span>
              </div>
              {typeof inStockCount === "number" && (
                <span className="text-[11px] font-mono text-slate-400">
                  ({inStockCount})
                </span>
              )}
            </label>

            {/* Discount / Promotions Toggle */}
            <label className="flex items-center justify-between text-xs text-slate-700 dark:text-slate-300 cursor-pointer select-none py-1 hover:text-rose-600 transition-colors">
              <div className="flex items-center gap-2.5">
                <input
                  type="checkbox"
                  checked={discount === "1"}
                  onChange={(e) => {
                    setFilterState({
                      discount: e.target.checked ? "1" : null,
                      page: null,
                    });
                  }}
                  className="w-4 h-4 rounded-md text-rose-600 focus:ring-rose-500 border-slate-300 dark:border-slate-700 cursor-pointer accent-rose-600"
                />
                <span className="font-medium flex items-center gap-1.5 text-rose-600 dark:text-rose-400">
                  <span>🔥</span>
                  <span>{t("discountOnly")}</span>
                </span>
              </div>
              {typeof discountCount === "number" && (
                <span className="text-[11px] font-mono text-rose-500 font-bold">
                  ({discountCount})
                </span>
              )}
            </label>
          </div>
        )}
      </div>

      {/* 2. Price Section with Dual-Thumb Slider, Quick Presets & Inputs (Collapsible) */}
      <div className="border-b border-slate-100 dark:border-slate-800/80 pb-4">
        <button
          type="button"
          onClick={() => toggleSection("price")}
          className="w-full flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 py-1 cursor-pointer select-none"
        >
          <span>{t("price")}</span>
          <ChevronDown
            className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
              openSections.price ? "rotate-180" : ""
            }`}
          />
        </button>

        {openSections.price && (
          <div className="mt-3 space-y-3.5">
            {/* Quick Price Preset Chips */}
            <div className="flex flex-wrap gap-1.5">
              {activePresets.map((preset, idx) => {
                const isActive =
                  (minPrice || "") === preset.min &&
                  (maxPrice || "") === preset.max;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handlePricePreset(preset.min, preset.max)}
                    className={`px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-all cursor-pointer border ${
                      isActive
                        ? "bg-sora-600 text-white border-sora-600 shadow-2xs"
                        : "bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-sora-400"
                    }`}
                  >
                    {preset.label}
                  </button>
                );
              })}
            </div>

            {/* Dual-Thumb Range Slider */}
            {maxPossiblePrice > minPossiblePrice && (
              <div className="pt-1 pb-1">
                <DualRangeSlider
                  min={minPossiblePrice}
                  max={maxPossiblePrice}
                  step={sliderStep}
                  value={[
                    minPrice ? Number(minPrice) : minPossiblePrice,
                    maxPrice ? Number(maxPrice) : maxPossiblePrice,
                  ]}
                  onValueChange={([val0, val1]) => {
                    setLocalMin(val0 <= minPossiblePrice ? "" : String(val0));
                    setLocalMax(val1 >= maxPossiblePrice ? "" : String(val1));
                  }}
                  onValueCommit={([val0, val1]) => {
                    const isAtMin = val0 <= minPossiblePrice;
                    const isAtMax = val1 >= maxPossiblePrice;
                    const cleanMin = isAtMin ? null : String(val0);
                    const cleanMax = isAtMax ? null : String(val1);
                    setLocalMin(cleanMin || "");
                    setLocalMax(cleanMax || "");
                    setFilterState({
                      minPrice: cleanMin,
                      maxPrice: cleanMax,
                      page: null,
                    });
                  }}
                />
              </div>
            )}

            {/* Custom Min / Max Numeric Inputs */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <input
                  type="number"
                  inputMode="numeric"
                  min={minPossiblePrice}
                  max={maxPossiblePrice}
                  placeholder={t("priceFrom")}
                  value={localMin}
                  onChange={(e) => setLocalMin(e.target.value)}
                  onBlur={applyCustomPrice}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      applyCustomPrice();
                    }
                  }}
                  className="w-full h-9 px-3 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:border-sora-500"
                />
              </div>
              <span className="text-slate-400 text-xs font-bold">—</span>
              <div className="relative flex-1">
                <input
                  type="number"
                  inputMode="numeric"
                  min={minPossiblePrice}
                  max={maxPossiblePrice}
                  placeholder={t("priceTo")}
                  value={localMax}
                  onChange={(e) => setLocalMax(e.target.value)}
                  onBlur={applyCustomPrice}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      applyCustomPrice();
                    }
                  }}
                  className="w-full h-9 px-3 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:border-sora-500"
                />
              </div>
            </div>
            <p className="text-[11px] text-slate-400 text-right">
              {common("currency")}
            </p>
          </div>
        )}
      </div>

      {/* 3. Brands Section with Search (Collapsible) */}
      <div className="border-b border-slate-100 dark:border-slate-800/80 pb-4">
        <button
          type="button"
          onClick={() => toggleSection("brands")}
          className="w-full flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 py-1 cursor-pointer select-none"
        >
          <div className="flex items-center gap-2">
            <span>{t("brands")}</span>
            {activeBrands.length > 0 && (
              <span className="w-4 h-4 rounded-full bg-sora-600 text-white text-[10px] flex items-center justify-center font-bold">
                {activeBrands.length}
              </span>
            )}
          </div>
          <ChevronDown
            className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
              openSections.brands ? "rotate-180" : ""
            }`}
          />
        </button>

        {openSections.brands && (
          <div className="mt-3 space-y-2.5">
            {/* Quick Brand Search Input */}
            {brands.length > 5 && (
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={brandSearch}
                  onChange={(e) => setBrandSearch(e.target.value)}
                  placeholder={isUz ? "Brendni qidirish..." : "Поиск бренда..."}
                  className="w-full h-9 pl-8 pr-7 text-xs rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:border-sora-500"
                />
                {brandSearch && (
                  <button
                    type="button"
                    onClick={() => setBrandSearch("")}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    aria-label="Tozalash"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            )}

            {/* Brands List */}
            <div className="max-h-48 overflow-y-auto space-y-1 pr-2 text-xs scrollbar-thin">
              {filteredBrands.length === 0 ? (
                <p className="text-[11px] text-slate-400 py-2 text-center">
                  {isUz ? "Brend topilmadi" : "Бренд не найден"}
                </p>
              ) : (
                filteredBrands.map((brand) => {
                  const checked = activeBrands.includes(brand.name);
                  return (
                    <label
                      key={brand.id}
                      className="flex items-center justify-between py-1.5 px-1.5 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-sora-600 dark:hover:text-sora-400 cursor-pointer select-none transition-colors"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleBrand(brand.name)}
                          className="w-4 h-4 rounded-md text-sora-600 focus:ring-sora-500 border-slate-300 dark:border-slate-700 cursor-pointer accent-sora-600 shrink-0"
                        />
                        <span
                          className={`truncate ${
                            checked
                              ? "font-bold text-sora-600 dark:text-sora-400"
                              : ""
                          }`}
                        >
                          {brand.name}
                        </span>
                      </div>
                      {typeof brand.count === "number" && (
                        <span className="text-[11px] font-mono text-slate-400 dark:text-slate-500 ml-1 shrink-0">
                          ({brand.count})
                        </span>
                      )}
                    </label>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>

      {/* 4. Dynamic Attributes Sections (e.g. Format, Color, Density) */}
      {attributes &&
        attributes.length > 0 &&
        attributes.map((attr) => {
          const sectionKey = `attr_${attr.name}`;
          const isOpen = openSections[sectionKey] !== false; // default true
          const selectedVals = activeAttrs
            .filter((a) => a.prop === attr.name)
            .map((a) => a.val);

          return (
            <div
              key={attr.name}
              className="border-b border-slate-100 dark:border-slate-800/80 pb-4"
            >
              <button
                type="button"
                onClick={() => toggleSection(sectionKey)}
                className="w-full flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 py-1 cursor-pointer select-none"
              >
                <div className="flex items-center gap-2">
                  <span>{attr.name}</span>
                  {selectedVals.length > 0 && (
                    <span className="w-4 h-4 rounded-full bg-indigo-600 text-white text-[10px] flex items-center justify-center font-bold">
                      {selectedVals.length}
                    </span>
                  )}
                </div>
                <ChevronDown
                  className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                    isOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {isOpen && (
                <div className="mt-3 space-y-1 max-h-44 overflow-y-auto pr-1 text-xs">
                  {attr.values.map((v) => {
                    const isChecked = selectedVals.includes(v.value);
                    return (
                      <label
                        key={v.value}
                        className="flex items-center justify-between py-1.5 px-1.5 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer select-none transition-colors"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() =>
                              toggleAttribute(attr.name, v.value)
                            }
                            className="w-4 h-4 rounded-md text-sora-600 focus:ring-sora-500 border-slate-300 dark:border-slate-700 cursor-pointer accent-sora-600 shrink-0"
                          />
                          <span
                            className={`truncate ${
                              isChecked
                                ? "font-bold text-sora-600 dark:text-sora-400"
                                : ""
                            }`}
                          >
                            {v.value}
                          </span>
                        </div>
                        <span className="text-[11px] font-mono text-slate-400 ml-1 shrink-0">
                          ({v.count})
                        </span>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar Filter (w-72 = 288px) */}
      <aside
        className={`hidden lg:block w-72 shrink-0 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs h-fit sticky top-24 transition-opacity duration-200 ${
          isPending ? "opacity-75" : "opacity-100"
        }`}
      >
        {content}
      </aside>

      {/* Mobile 50/50 Filter & Sort Bar + Bottom Sheet Modal */}
      <div className="lg:hidden">
        <div className="grid grid-cols-2 gap-2.5 items-center">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            data-testid="mobile-filter-trigger"
            className="w-full h-10 px-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200 shadow-xs active:scale-95 transition-transform cursor-pointer"
          >
            {isPending ? (
              <Loader2 className="w-4 h-4 text-sora-600 shrink-0 animate-spin" />
            ) : (
              <Filter className="w-4 h-4 text-sora-600 shrink-0" />
            )}
            <span className="truncate">{t("title")}</span>
            {activeFilterCount > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-sora-600 text-white text-[10px] font-bold leading-none">
                {activeFilterCount}
              </span>
            )}
          </button>

          <SortSelect className="w-full" />
        </div>

        {/* Mobile Bottom Sheet Drawer */}
        {mobileOpen && (
          <div
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
            onClick={() => setMobileOpen(false)}
          >
            <div
              role="dialog"
              aria-modal="true"
              aria-label={t("title")}
              data-testid="mobile-filter-bottom-sheet"
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-lg max-h-[85vh] bg-white dark:bg-slate-900 rounded-t-3xl pt-3 px-5 pb-[max(env(safe-area-inset-bottom),16px)] shadow-2xl flex flex-col justify-between animate-in slide-in-from-bottom duration-200"
            >
              {/* Drag Handle Indicator & Sheet Header */}
              <div className="shrink-0">
                <div className="w-12 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700 mx-auto mb-3" />
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100 dark:border-slate-800">
                  <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                    <Filter className="w-4 h-4 text-sora-600" />
                    <span>{t("title")}</span>
                  </h3>
                  <button
                    type="button"
                    onClick={() => setMobileOpen(false)}
                    aria-label={isUz ? "Yopish" : "Закрыть"}
                    className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Scrollable Filter Sections */}
              <div className="flex-1 overflow-y-auto pr-1 py-1">
                {content}
              </div>

              {/* Sticky Bottom Action Bar with Live Product Counter */}
              <div className="shrink-0 pt-4 border-t border-slate-100 dark:border-slate-800 mt-3 flex items-center gap-2.5">
                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={resetAll}
                    className="h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer shrink-0"
                  >
                    {isUz ? "Tozalash" : "Сброс"}
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    applyCustomPrice();
                    setMobileOpen(false);
                  }}
                  data-testid="mobile-filter-apply"
                  className="flex-1 h-11 bg-sora-600 hover:bg-sora-700 text-white font-bold text-sm rounded-xl active:scale-98 transition-transform shadow-md cursor-pointer flex items-center justify-center gap-2"
                >
                  {isPending && (
                    <Loader2 className="w-4 h-4 text-white animate-spin" />
                  )}
                  <span>
                    {typeof totalMatchedCount === "number"
                      ? isUz
                        ? `${totalMatchedCount} ta mahsulotni ko'rish`
                        : `Показать (${totalMatchedCount} товаров)`
                      : isUz
                      ? "Ko'rish (Qo'llash)"
                      : "Применить"}
                  </span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
