"use client";

import { CategoryTreeNode, Category } from "@/lib/schemas/category";
import { Brand } from "@/lib/schemas/brand";
import { Product } from "@/lib/schemas/product";
import { Link } from "@/i18n/routing";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { MegaMenu } from "@/components/discovery/MegaMenu";
import { SearchAutocomplete } from "@/components/discovery/SearchAutocomplete";
import { Heart, ShoppingBag, User } from "lucide-react";
import { useCartStore } from "@/lib/store/cart";
import { useFavoritesStore } from "@/lib/store/favorites";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

interface HeaderProps {
  tree: CategoryTreeNode[];
  categories: Category[];
  brands: Brand[];
  products: Product[];
}

export function Header({ tree, categories, brands, products }: HeaderProps) {
  const t = useTranslations("common");
  const { getTotalItems } = useCartStore();
  const { getCount } = useFavoritesStore();

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const cartCount = mounted ? getTotalItems() : 0;
  const favCount = mounted ? getCount() : 0;

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <span className="text-2xl sm:text-3xl font-black tracking-tight text-blue-600 dark:text-blue-400">
            SORA<span className="text-amber-500">.UZ</span>
          </span>
        </Link>

        {/* Mega Menu Trigger */}
        <div className="hidden md:block">
          <MegaMenu tree={tree} brands={brands} />
        </div>

        {/* Search Input with Autocomplete */}
        <div className="flex-1 max-w-xl mx-2 hidden sm:block">
          <SearchAutocomplete
            products={products}
            categories={categories}
            brands={brands}
          />
        </div>

        {/* Actions (Favorites, Cart, Language) */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Favorites */}
          <Link
            href="/favorites"
            aria-label={t("favorites")}
            className="relative p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors"
          >
            <Heart className="w-5 h-5" />
            {favCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center">
                {favCount}
              </span>
            )}
          </Link>

          {/* Cart */}
          <Link
            href="/cart"
            aria-label={t("cart")}
            className="relative p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors"
          >
            <ShoppingBag className="w-5 h-5" />
            {cartCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                {cartCount}
              </span>
            )}
          </Link>

          {/* Language Switcher */}
          <LanguageSwitcher />
        </div>
      </div>

      {/* Mobile Search Bar Row */}
      <div className="sm:hidden px-4 pb-3">
        <SearchAutocomplete
          products={products}
          categories={categories}
          brands={brands}
        />
      </div>
    </header>
  );
}
