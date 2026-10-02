import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { Sparkles, TrendingUp, Percent, Tag, Award, Grid } from "lucide-react";

export function PromoNav() {
  const t = useTranslations("nav");

  return (
    <nav className="bg-slate-100/70 dark:bg-slate-800/40 border-b border-slate-200/80 dark:border-slate-800 text-xs font-semibold overflow-x-auto scrollbar-none py-2">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-6 whitespace-nowrap">
        <Link
          href="/catalog"
          className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 hover:text-blue-600 transition-colors"
        >
          <Grid className="w-3.5 h-3.5" />
          <span>{t("catalog")}</span>
        </Link>
        <Link
          href="/catalog/promotions"
          className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400 hover:text-rose-700 transition-colors"
        >
          <Percent className="w-3.5 h-3.5" />
          <span>{t("deals")}</span>
        </Link>
        <Link
          href="/catalog/low_price_guarantee"
          className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 hover:text-blue-700 transition-colors"
        >
          <Tag className="w-3.5 h-3.5" />
          <span>{t("cheap")}</span>
        </Link>
        <Link
          href="/catalog/popular"
          className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 hover:text-amber-700 transition-colors"
        >
          <TrendingUp className="w-3.5 h-3.5" />
          <span>{t("topProducts")}</span>
        </Link>
        <Link
          href="/catalog/new_products"
          className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 transition-colors"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>{t("new")}</span>
        </Link>
        <Link
          href="/offers"
          className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 font-bold transition-colors"
        >
          <span>1C Aksiyalar</span>
        </Link>
        <Link
          href="/brands"
          className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 hover:text-blue-600 transition-colors"
        >
          <Award className="w-3.5 h-3.5" />
          <span>{t("brands")}</span>
        </Link>
        <Link
          href="/delivery"
          className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors ml-auto hidden md:block"
        >
          {t("delivery")}
        </Link>
      </div>
    </nav>
  );
}
