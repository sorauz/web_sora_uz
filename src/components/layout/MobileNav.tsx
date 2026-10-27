"use client";

import { Link } from "@/i18n/routing";
import { Home, Grid, Search, Heart, ShoppingBag } from "lucide-react";
import { useCartStore } from "@/lib/store/cart";
import { useFavoritesStore } from "@/lib/store/favorites";
import { useMobileSearchStore } from "@/lib/store/mobileSearch";
import { useEffect, useState } from "react";
import { useTranslations, useLocale } from "next-intl";

export function MobileNav() {
  const t = useTranslations("common");
  const locale = useLocale();
  const isUz = locale === "uz";
  const { getTotalItems } = useCartStore();
  const { getCount } = useFavoritesStore();
  const { openSearch } = useMobileSearchStore();

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const cartCount = mounted ? getTotalItems() : 0;
  const favCount = mounted ? getCount() : 0;

  return (
    <nav
      aria-label={isUz ? "Mobil navigatsiya" : "Мобильная навигация"}
      className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 md:hidden pt-2 pb-[max(env(safe-area-inset-bottom),14px)] px-2 flex items-center justify-around select-none"
      style={{ touchAction: "manipulation" }}
    >
      {/* Home */}
      <Link
        href="/"
        className="min-w-[48px] min-h-[44px] flex flex-col items-center justify-center gap-1 text-[10px] font-medium text-slate-600 dark:text-slate-400 hover:text-sora-600 active:scale-95 transition-transform"
      >
        <Home className="w-5 h-5" />
        <span>{t("home")}</span>
      </Link>

      {/* Catalog */}
      <Link
        href="/catalog"
        className="min-w-[48px] min-h-[44px] flex flex-col items-center justify-center gap-1 text-[10px] font-medium text-slate-600 dark:text-slate-400 hover:text-sora-600 active:scale-95 transition-transform"
      >
        <Grid className="w-5 h-5" />
        <span>{t("catalog")}</span>
      </Link>

      {/* Search Trigger Button */}
      <button
        type="button"
        onClick={openSearch}
        aria-label={isUz ? "Qidiruv" : "Поиск"}
        className="min-w-[48px] min-h-[44px] flex flex-col items-center justify-center gap-1 text-[10px] font-medium text-slate-600 dark:text-slate-400 hover:text-sora-600 active:scale-95 transition-transform cursor-pointer"
      >
        <Search className="w-5 h-5" />
        <span>{isUz ? "Qidiruv" : "Поиск"}</span>
      </button>

      {/* Favorites */}
      <Link
        href="/favorites"
        className="min-w-[48px] min-h-[44px] relative flex flex-col items-center justify-center gap-1 text-[10px] font-medium text-slate-600 dark:text-slate-400 hover:text-sora-600 active:scale-95 transition-transform"
      >
        <Heart className="w-5 h-5" />
        {favCount > 0 && (
          <span className="absolute top-1 right-2 w-3.5 h-3.5 bg-rose-500 text-white rounded-full text-[9px] font-bold flex items-center justify-center">
            {favCount}
          </span>
        )}
        <span>{t("favorites")}</span>
      </Link>

      {/* Cart */}
      <Link
        href="/cart"
        className="min-w-[48px] min-h-[44px] relative flex flex-col items-center justify-center gap-1 text-[10px] font-medium text-slate-600 dark:text-slate-400 hover:text-sora-600 active:scale-95 transition-transform"
      >
        <ShoppingBag className="w-5 h-5" />
        {cartCount > 0 && (
          <span className="absolute top-1 right-2 w-3.5 h-3.5 bg-sora-600 text-white rounded-full text-[9px] font-bold flex items-center justify-center">
            {cartCount}
          </span>
        )}
        <span>{t("cart")}</span>
      </Link>
    </nav>
  );
}
