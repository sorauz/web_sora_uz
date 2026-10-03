"use client";

import { Link } from "@/i18n/routing";
import { ShoppingBag, ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";

export function CartEmptyState() {
  const t = useTranslations("cart");

  return (
    <div className="text-center py-16 sm:py-24 px-4 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs max-w-2xl mx-auto space-y-6">
      <div className="w-20 h-20 sm:w-24 sm:h-24 bg-sora-50 dark:bg-sora-950/60 text-sora-600 dark:text-sora-400 rounded-3xl flex items-center justify-center mx-auto shadow-inner">
        <ShoppingBag className="w-10 h-10 sm:w-12 sm:h-12" />
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
          className="inline-flex items-center gap-2 px-8 py-3.5 bg-sora-600 hover:bg-sora-700 active:scale-95 text-white font-bold text-sm rounded-2xl shadow-lg shadow-sora-500/20 transition-all"
        >
          <span>{t("goToCatalog")}</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
