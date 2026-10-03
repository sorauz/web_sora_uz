"use client";

import { Link } from "@/i18n/routing";
import { Home, Grid, Search, Heart, ShoppingBag } from "lucide-react";
import { useCartStore } from "@/lib/store/cart";
import { useFavoritesStore } from "@/lib/store/favorites";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

export function MobileNav() {
  const t = useTranslations("common");
  const { getTotalItems } = useCartStore();
  const { getCount } = useFavoritesStore();

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const cartCount = mounted ? getTotalItems() : 0;
  const favCount = mounted ? getCount() : 0;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 md:hidden py-1.5 px-4 flex items-center justify-around">
      <Link
        href="/"
        className="flex flex-col items-center gap-1 text-[10px] font-medium text-slate-600 dark:text-slate-400 hover:text-sora-600"
      >
        <Home className="w-5 h-5" />
        <span>{t("home")}</span>
      </Link>

      <Link
        href="/catalog"
        className="flex flex-col items-center gap-1 text-[10px] font-medium text-slate-600 dark:text-slate-400 hover:text-sora-600"
      >
        <Grid className="w-5 h-5" />
        <span>{t("catalog")}</span>
      </Link>

      <Link
        href="/search"
        className="flex flex-col items-center gap-1 text-[10px] font-medium text-slate-600 dark:text-slate-400 hover:text-sora-600"
      >
        <Search className="w-5 h-5" />
        <span>Qidiruv</span>
      </Link>

      <Link
        href="/favorites"
        className="relative flex flex-col items-center gap-1 text-[10px] font-medium text-slate-600 dark:text-slate-400 hover:text-sora-600"
      >
        <Heart className="w-5 h-5" />
        {favCount > 0 && (
          <span className="absolute -top-1 right-1 w-3.5 h-3.5 bg-rose-500 text-white rounded-full text-[9px] font-bold flex items-center justify-center">
            {favCount}
          </span>
        )}
        <span>{t("favorites")}</span>
      </Link>

      <Link
        href="/cart"
        className="relative flex flex-col items-center gap-1 text-[10px] font-medium text-slate-600 dark:text-slate-400 hover:text-sora-600"
      >
        <ShoppingBag className="w-5 h-5" />
        {cartCount > 0 && (
          <span className="absolute -top-1 right-1 w-3.5 h-3.5 bg-sora-600 text-white rounded-full text-[9px] font-bold flex items-center justify-center">
            {cartCount}
          </span>
        )}
        <span>{t("cart")}</span>
      </Link>
    </div>
  );
}
