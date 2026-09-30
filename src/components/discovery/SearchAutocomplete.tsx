"use client";

import { useState, useRef, useEffect } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "@/i18n/routing";
import { Search, X, ArrowRight } from "lucide-react";
import { Link } from "@/i18n/routing";
import Image from "next/image";
import { Product, getProductLocalized } from "@/lib/schemas/product";
import { Category } from "@/lib/schemas/category";
import { Brand } from "@/lib/schemas/brand";

interface SearchAutocompleteProps {
  products: Product[];
  categories: Category[];
  brands: Brand[];
}

export function SearchAutocomplete({
  products,
  categories,
  brands,
}: SearchAutocompleteProps) {
  const locale = useLocale() as "uz" | "ru";
  const t = useTranslations("common");
  const tSearch = useTranslations("search");
  const router = useRouter();
  const isUz = locale === "uz";

  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const trimmed = query.trim().toLowerCase();

  const matchedProducts = trimmed.length > 1
    ? products
        .filter((p) => {
          const loc = getProductLocalized(p, locale);
          const name = loc.name.toLowerCase();
          const sku = p.product_sku.toLowerCase();
          const brand = p.brand.toLowerCase();
          return name.includes(trimmed) || sku.includes(trimmed) || brand.includes(trimmed);
        })
        .slice(0, 4)
    : [];

  const matchedCategories = trimmed.length > 1
    ? categories
        .filter((c) => {
          const name = (isUz ? c.group_uz : c.group_ru).toLowerCase();
          return name.includes(trimmed);
        })
        .slice(0, 3)
    : [];

  const matchedBrands = trimmed.length > 1
    ? brands
        .filter((b) => b.name.toLowerCase().includes(trimmed))
        .slice(0, 3)
    : [];

  const hasResults =
    matchedProducts.length > 0 ||
    matchedCategories.length > 0 ||
    matchedBrands.length > 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trimmed) return;
    setIsOpen(false);
    router.push(`/search?q=${encodeURIComponent(trimmed)}`);
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-xl">
      <form onSubmit={handleSubmit} className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={t("searchPlaceholder")}
          className="w-full h-11 pl-10 pr-10 text-xs sm:text-sm rounded-2xl bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 focus:bg-white dark:focus:bg-slate-900 focus:outline-hidden focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-slate-900 dark:text-white transition-all shadow-xs"
        />
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setIsOpen(false);
            }}
            className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </form>

      {/* Autocomplete Dropdown */}
      {isOpen && trimmed.length > 1 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden z-50 animate-in fade-in-50 zoom-in-95 duration-100">
          {hasResults ? (
            <div className="p-3 space-y-4 max-h-[75vh] overflow-y-auto">
              {/* Categories */}
              {matchedCategories.length > 0 && (
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-2 mb-1.5">
                    {tSearch("categories")}
                  </div>
                  <div className="space-y-1">
                    {matchedCategories.map((c) => (
                      <Link
                        key={c.id}
                        href={`/category/${isUz ? c.group_slug_uz : c.group_slug_ru}`}
                        onClick={() => setIsOpen(false)}
                        className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-blue-950/40 hover:text-blue-600 transition-colors"
                      >
                        <span>📁 {isUz ? c.group_uz : c.group_ru}</span>
                        <ArrowRight className="w-3.5 h-3.5 opacity-60" />
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Brands */}
              {matchedBrands.length > 0 && (
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-2 mb-1.5">
                    {tSearch("brands")}
                  </div>
                  <div className="flex flex-wrap gap-1.5 px-2">
                    {matchedBrands.map((b) => (
                      <Link
                        key={b.id}
                        href={`/brand/${b.name.toLowerCase()}`}
                        onClick={() => setIsOpen(false)}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-medium text-slate-800 dark:text-slate-200 hover:bg-amber-100 dark:hover:bg-amber-950/60 hover:text-amber-700 transition-colors"
                      >
                        🏷️ {b.name}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Products */}
              {matchedProducts.length > 0 && (
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-2 mb-1.5">
                    {tSearch("products")}
                  </div>
                  <div className="space-y-1.5">
                    {matchedProducts.map((p) => {
                      const loc = getProductLocalized(p, locale);
                      const price = p.price?.retail_price || 0;
                      return (
                        <Link
                          key={p.id}
                          href={`/products/${loc.slug}`}
                          onClick={() => setIsOpen(false)}
                          className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
                        >
                          <div className="relative w-11 h-11 rounded-lg bg-slate-100 dark:bg-slate-800 overflow-hidden shrink-0 border border-slate-200 dark:border-slate-700 flex items-center justify-center">
                            <Image
                              src={p.main_picture}
                              alt={loc.name}
                              fill
                              sizes="44px"
                              className="object-contain p-1"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                              {loc.name}
                            </div>
                            <div className="text-[11px] text-blue-600 dark:text-blue-400 font-bold mt-0.5">
                              {price.toLocaleString()} {t("currency")}
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Footer View All */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={handleSubmit}
                  className="w-full py-2.5 text-center text-xs font-bold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-xl transition-colors flex items-center justify-center gap-1.5"
                >
                  <span>{t("viewAll")} ({tSearch("forQuery")} &quot;{trimmed}&quot;)</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ) : (
            <div className="p-6 text-center text-slate-500 text-xs">
              {t("empty")}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
