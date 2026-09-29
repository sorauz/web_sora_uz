"use client";

import { useEffect, useState } from "react";
import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { Heart, ArrowRight, Trash2 } from "lucide-react";
import { useFavoritesStore } from "@/lib/store/favorites";
import { Product } from "@/lib/schemas/product";
import { ProductCard } from "@/components/discovery/ProductCard";

interface FavoritesViewProps {
  allProducts: Product[];
}

export function FavoritesView({ allProducts }: FavoritesViewProps) {
  const t = useTranslations("favorites");
  const common = useTranslations("common");
  const { favoriteIds, clearFavorites } = useFavoritesStore();

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <div className="py-20 flex justify-center items-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Filter products that are in favorites
  const favProducts = allProducts.filter((p) => favoriteIds.includes(p.id));

  if (favProducts.length === 0) {
    return (
      <div className="text-center py-16 sm:py-24 px-4 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs max-w-2xl mx-auto space-y-6">
        <div className="w-20 h-20 sm:w-24 sm:h-24 bg-rose-50 dark:bg-rose-950/60 text-rose-500 rounded-3xl flex items-center justify-center mx-auto shadow-inner">
          <Heart className="w-10 h-10 sm:w-12 sm:h-12" />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            {t("emptyTitle")}
          </h2>
          <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
            {t("emptyDesc")}
          </p>
        </div>

        <div>
          <Link
            href="/catalog"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold text-sm rounded-2xl shadow-lg shadow-blue-500/20 transition-all"
          >
            <span>{common("catalog")}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-baseline gap-2">
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            {t("title")}
          </h1>
          <span className="text-sm font-semibold text-slate-500">
            ({favProducts.length} {t("itemsCount")})
          </span>
        </div>

        <button
          type="button"
          onClick={clearFavorites}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-rose-600 transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>{t("clearAll")}</span>
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
        {favProducts.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </div>
  );
}
