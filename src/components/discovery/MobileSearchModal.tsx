"use client";

import { useState, useRef, useEffect } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "@/i18n/routing";
import { Search, X, ArrowRight, Sparkles, FolderTree, Tag, Package } from "lucide-react";
import { Link } from "@/i18n/routing";
import Image from "next/image";
import { Product, getProductLocalized } from "@/lib/schemas/product";
import { Category } from "@/lib/schemas/category";
import { Brand } from "@/lib/schemas/brand";
import { calculateProductPrice } from "@/lib/utils/price";
import {
  searchProducts,
  searchCategories,
  searchBrands,
} from "@/lib/utils/search";
import { useMobileSearchStore } from "@/lib/store/mobileSearch";

interface MobileSearchModalProps {
  products?: Product[];
  categories?: Category[];
  brands?: Brand[];
}

const POPULAR_SEARCHES_UZ = [
  "Deli",
  "A4 qog'oz",
  "Stepler",
  "SvetoCopy",
  "Kalkulyator",
  "Uni-ball",
  "Fayl papka",
  "Skotch",
];

const POPULAR_SEARCHES_RU = [
  "Deli",
  "Бумага А4",
  "Степлер",
  "SvetoCopy",
  "Калькулятор",
  "Uni-ball",
  "Папка файл",
  "Скотч",
];

export function MobileSearchModal({
  products = [],
  categories = [],
  brands = [],
}: MobileSearchModalProps) {
  const { isOpen, closeSearch } = useMobileSearchStore();
  const locale = useLocale() as "uz" | "ru";
  const isUz = locale === "uz";
  const t = useTranslations("common");
  const tSearch = useTranslations("search");
  const router = useRouter();

  const [query, setQuery] = useState("");
  const [remoteResults, setRemoteResults] = useState<{
    products: Array<{
      id: string;
      slug: string;
      name: string;
      main_picture: string;
      price: number;
      oldPrice?: number;
      hasDiscount?: boolean;
    }>;
    categories: Array<{ id: string; name: string; slug: string }>;
    brands: Array<{ id: string; name: string }>;
  } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto focus input when modal opens & lock body scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
      return () => {
        clearTimeout(timer);
        document.body.style.overflow = "";
      };
    } else {
      document.body.style.overflow = "";
    }
  }, [isOpen]);

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        closeSearch();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, closeSearch]);

  const trimmed = query.trim().toLowerCase();
  const hasLocalData = products.length > 0;

  useEffect(() => {
    if (hasLocalData || trimmed.length < 2) {
      setRemoteResults(null);
      return;
    }

    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/search/suggestions?q=${encodeURIComponent(trimmed)}&locale=${locale}`,
          { signal: controller.signal }
        );
        if (res.ok) {
          const data = await res.json();
          setRemoteResults(data);
        }
      } catch {
        // ignore aborts
      }
    }, 150);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [trimmed, locale, hasLocalData]);

  if (!isOpen) return null;

  const matchedProducts = hasLocalData
    ? trimmed.length > 1
      ? searchProducts(products, trimmed, locale).slice(0, 6).map((p) => {
          const loc = getProductLocalized(p, locale);
          const priceInfo = calculateProductPrice(p.price);
          return {
            id: p.id,
            slug: loc.slug,
            name: loc.name,
            main_picture: p.main_picture,
            price: priceInfo.price,
            oldPrice: priceInfo.oldPrice,
            hasDiscount: priceInfo.hasDiscount,
          };
        })
      : []
    : remoteResults?.products || [];

  const matchedCategories = hasLocalData
    ? trimmed.length > 1
      ? searchCategories(categories, trimmed, locale).slice(0, 4).map((c) => ({
          id: c.id,
          name: isUz ? c.group_uz : c.group_ru,
          slug: isUz ? c.group_slug_uz : c.group_slug_ru,
        }))
      : []
    : remoteResults?.categories || [];

  const matchedBrands = hasLocalData
    ? trimmed.length > 1
      ? searchBrands(brands, trimmed).slice(0, 4).map((b) => ({
          id: b.id,
          name: b.name,
        }))
      : []
    : remoteResults?.brands || [];

  const hasResults =
    matchedProducts.length > 0 ||
    matchedCategories.length > 0 ||
    matchedBrands.length > 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trimmed) return;
    closeSearch();
    router.push(`/search?q=${encodeURIComponent(trimmed)}`);
  };

  const handleSelectTag = (tag: string) => {
    setQuery(tag);
    closeSearch();
    router.push(`/search?q=${encodeURIComponent(tag.toLowerCase())}`);
  };

  const popularSearches = isUz ? POPULAR_SEARCHES_UZ : POPULAR_SEARCHES_RU;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={isUz ? "Mobil qidiruv" : "Мобильный поиск"}
      className="fixed inset-0 z-50 bg-white dark:bg-slate-900 flex flex-col animate-in fade-in duration-150"
    >
      {/* Top Search Bar Header */}
      <div className="pt-3 pb-3 px-4 border-b border-slate-200 dark:border-slate-800 flex items-center gap-3 bg-white dark:bg-slate-900 shadow-xs">
        <form onSubmit={handleSubmit} className="flex-1 relative">
          <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={
              isUz
                ? "Tovar, brend yoki kategoriya..."
                : "Товар, бренд или категория..."
            }
            className="w-full h-11 pl-10 pr-9 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl text-sm placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-sora-500 transition-all"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck="false"
          />
          {query.length > 0 && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full"
              aria-label="Tozalash"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </form>

        <button
          type="button"
          onClick={closeSearch}
          className="text-sm font-semibold text-sora-600 dark:text-sora-400 px-1 py-2 active:scale-95 transition-transform"
        >
          {isUz ? "Yopish" : "Отмена"}
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6">
        {/* If Query is empty: show Popular Searches and Hints */}
        {query.trim().length <= 1 && (
          <div className="space-y-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>{isUz ? "Ommabop qidiruvlar" : "Популярные запросы"}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {popularSearches.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => handleSelectTag(tag)}
                    className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-medium text-slate-700 dark:text-slate-200 transition-colors active:scale-95"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Category Suggestions */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                <FolderTree className="w-3.5 h-3.5 text-sora-600" />
                <span>{isUz ? "Katalog bo'limlari" : "Разделы каталога"}</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {categories.slice(0, 6).map((cat) => {
                  const catName = isUz ? cat.group_uz : cat.group_ru;
                  const catSlug = isUz ? cat.group_slug_uz : cat.group_slug_ru;
                  return (
                    <Link
                      key={cat.id}
                      href={`/category/${catSlug}`}
                      onClick={closeSearch}
                      className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 hover:border-sora-300 dark:hover:border-sora-700 transition-colors flex items-center justify-between text-xs font-semibold text-slate-800 dark:text-slate-200"
                    >
                      <span className="line-clamp-1">{catName}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-1" />
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* If Query entered: show Live Autocomplete Results */}
        {query.trim().length > 1 && (
          <div className="space-y-5">
            {!hasResults ? (
              <div className="py-12 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
                  <Search className="w-6 h-6" />
                </div>
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  {isUz ? "Hech narsa topilmadi" : "Ничего не найдено"}
                </p>
                <p className="text-xs text-slate-400">
                  {isUz
                    ? "Boshqa so'z bilan qidirib ko'ring yoki imloni tekshiring"
                    : "Попробуйте изменить запрос или проверить написание"}
                </p>
              </div>
            ) : (
              <>
                {/* Categories match */}
                {matchedCategories.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500">
                      <FolderTree className="w-3.5 h-3.5 text-sora-600" />
                      <span>{tSearch("categories")}</span>
                    </div>
                    <div className="space-y-1">
                      {matchedCategories.map((c) => (
                        <Link
                          key={c.id}
                          href={`/category/${c.slug}`}
                          onClick={closeSearch}
                          className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200"
                        >
                          <span>📁 {c.name}</span>
                          <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* Brands match */}
                {matchedBrands.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500">
                      <Tag className="w-3.5 h-3.5 text-amber-500" />
                      <span>{tSearch("brands")}</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {matchedBrands.map((b) => (
                        <Link
                          key={b.id}
                          href={`/brand/${encodeURIComponent(b.name.toLowerCase())}`}
                          onClick={closeSearch}
                          className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:border-sora-500 hover:text-sora-600"
                        >
                          🏷️ {b.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* Products match */}
                {matchedProducts.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500">
                      <Package className="w-3.5 h-3.5 text-purple-500" />
                      <span>{tSearch("products")}</span>
                    </div>
                    <div className="divide-y divide-slate-100 dark:divide-slate-800">
                      {matchedProducts.map((p) => {
                        return (
                          <Link
                            key={p.id}
                            href={`/products/${p.slug}`}
                            onClick={closeSearch}
                            className="flex items-center gap-3 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-xl px-2 transition-colors"
                          >
                            <div className="w-12 h-12 relative rounded-lg bg-slate-50 dark:bg-slate-800 overflow-hidden shrink-0 border border-slate-100 dark:border-slate-800">
                              <Image
                                src={p.main_picture || "/placeholder-product.svg"}
                                alt={p.name}
                                fill
                                sizes="48px"
                                className="object-contain p-1"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                                {p.name}
                              </h4>
                              <p className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                                {p.price > 0 ? (
                                  `${p.price.toLocaleString("ru-RU")} ${t("currency")}`
                                ) : (
                                  <span className="text-slate-400 font-normal">
                                    {isUz ? "Narxi kelishiladi" : "Цена по запросу"}
                                  </span>
                                )}
                              </p>
                            </div>
                            <ArrowRight className="w-4 h-4 text-slate-300 dark:text-slate-600 shrink-0" />
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* View all search results button */}
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="w-full py-3 px-4 rounded-xl bg-sora-600 hover:bg-sora-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm active:scale-[0.98] transition-all"
                >
                  <span>
                    {isUz
                      ? `Barcha natijalarni ko'rish ("${trimmed}")`
                      : `Смотреть все результаты ("${trimmed}")`}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
