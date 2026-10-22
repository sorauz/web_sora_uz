"use client";

import { useState, useEffect } from "react";
import { Product } from "@/lib/schemas/product";
import { FeaturedTabGroups } from "@/lib/utils/featured-products";
import { ProductCard } from "./ProductCard";
import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { Flame, TrendingUp, Sparkles, ShieldCheck, ArrowRight } from "lucide-react";

export type FeaturedTabKey = "promotions" | "popular" | "new_products" | "low_price";

interface TabConfig {
  key: FeaturedTabKey;
  icon: typeof Flame;
  labelUz: string;
  labelRu: string;
  badgeUz: string;
  badgeRu: string;
  viewAllHref: string;
  activeClass: string;
  defaultRating: number;
  defaultReviews: number;
}

const TABS_CONFIG: TabConfig[] = [
  {
    key: "promotions",
    icon: Flame,
    labelUz: "Aksiyalar",
    labelRu: "Скидки",
    badgeUz: "Aksiya",
    badgeRu: "Скидка",
    viewAllHref: "/catalog/promotions",
    activeClass: "bg-rose-600 text-white shadow-sm shadow-rose-600/30",
    defaultRating: 4.8,
    defaultReviews: 24,
  },
  {
    key: "popular",
    icon: TrendingUp,
    labelUz: "Xit tovarlar",
    labelRu: "Хиты продаж",
    badgeUz: "Xit",
    badgeRu: "Хит",
    viewAllHref: "/catalog/popular",
    activeClass: "bg-amber-600 text-white shadow-sm shadow-amber-600/30",
    defaultRating: 4.9,
    defaultReviews: 38,
  },
  {
    key: "new_products",
    icon: Sparkles,
    labelUz: "Yangi tovarlar",
    labelRu: "Новинки",
    badgeUz: "Yangi",
    badgeRu: "Новинка",
    viewAllHref: "/catalog/new_products",
    activeClass: "bg-emerald-600 text-white shadow-sm shadow-emerald-600/30",
    defaultRating: 4.7,
    defaultReviews: 19,
  },
  {
    key: "low_price",
    icon: ShieldCheck,
    labelUz: "Eng arzon narx",
    labelRu: "Лучшая цена",
    badgeUz: "Hamyonbop",
    badgeRu: "Выгодно",
    viewAllHref: "/catalog/low_price_guarantee",
    activeClass: "bg-sora-600 text-white shadow-sm shadow-sora-600/30",
    defaultRating: 4.9,
    defaultReviews: 31,
  },
];

interface FeaturedProductsTabsProps {
  groups: FeaturedTabGroups;
  locale: "uz" | "ru";
  initialTab?: FeaturedTabKey;
}

export function FeaturedProductsTabs({
  groups,
  locale,
  initialTab = "promotions",
}: FeaturedProductsTabsProps) {
  const [activeTab, setActiveTab] = useState<FeaturedTabKey>(initialTab);
  const t = useTranslations("home");
  const tCommon = useTranslations("common");
  const isUz = locale === "uz";

  // Check URL hash on client mount for direct deep-linking (e.g. #popular, #promotions)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const hash = window.location.hash.replace("#", "");
      if (hash === "promotions" || hash === "deals") {
        setActiveTab("promotions");
      } else if (hash === "popular" || hash === "top") {
        setActiveTab("popular");
      } else if (hash === "new-products" || hash === "new_products" || hash === "new") {
        setActiveTab("new_products");
      } else if (hash === "low-price" || hash === "low_price") {
        setActiveTab("low_price");
      }
    }
  }, []);

  const tabProductsMap: Record<FeaturedTabKey, Product[]> = {
    promotions: groups.promo,
    popular: groups.popular,
    new_products: groups.newProducts,
    low_price: groups.lowPrice,
  };

  const currentTabConfig =
    TABS_CONFIG.find((tab) => tab.key === activeTab) || TABS_CONFIG[0];
  const currentProducts = tabProductsMap[activeTab] || [];

  return (
    <section id="featured-tabs" className="space-y-4 sm:space-y-5">
      {/* Hidden Anchor Spans for Backwards Compatibility & Smooth Scrolling */}
      <span id="promotions" className="sr-only" />
      <span id="low-price" className="sr-only" />
      <span id="popular" className="sr-only" />
      <span id="new-products" className="sr-only" />

      {/* Header with Title and Tabs */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            {t("featuredTitle")}
          </h2>
          <Link
            href={currentTabConfig.viewAllHref}
            className="text-xs sm:text-sm font-bold text-sora-600 dark:text-sora-400 hover:underline flex items-center gap-1"
          >
            <span>{tCommon("viewAll")}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Tab Buttons (Horizontal scroll on mobile, flex on desktop) */}
        <div
          role="tablist"
          aria-label={isUz ? "Maxsus takliflar toifalari" : "Категории специальных предложений"}
          className="flex items-center gap-1.5 sm:gap-2.5 overflow-x-auto pb-1 scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0"
        >
          {TABS_CONFIG.map((tab) => {
            const isActive = activeTab === tab.key;
            const Icon = tab.icon;
            const count = tabProductsMap[tab.key]?.length || 0;

            return (
              <button
                key={tab.key}
                role="tab"
                id={`tab-${tab.key}`}
                aria-selected={isActive}
                aria-controls={`panel-${tab.key}`}
                onClick={() => setActiveTab(tab.key)}
                className={`px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2 whitespace-nowrap transition-all duration-200 shrink-0 cursor-pointer ${
                  isActive
                    ? tab.activeClass
                    : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{isUz ? tab.labelUz : tab.labelRu}</span>
                <span
                  className={`text-[10px] sm:text-xs px-1.5 py-0.5 rounded-md font-mono ${
                    isActive
                      ? "bg-white/25 text-white"
                      : "bg-slate-200/80 dark:bg-slate-700 text-slate-500 dark:text-slate-400"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Product Grid Showcase (10 items: 5 cols x 2 rows on desktop; 2 cols x 5 rows on mobile) */}
      <div
        id={`panel-${activeTab}`}
        role="tabpanel"
        aria-labelledby={`tab-${activeTab}`}
        className="min-h-[520px]"
      >
        <div
          key={activeTab}
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5 sm:gap-4 animate-in fade-in-50 duration-200"
        >
          {currentProducts.map((p) => (
            <ProductCard
              key={p.id}
              product={p}
              rating={currentTabConfig.defaultRating}
              reviewCount={currentTabConfig.defaultReviews}
              badge={isUz ? currentTabConfig.badgeUz : currentTabConfig.badgeRu}
            />
          ))}
        </div>
      </div>

      {/* Mobile-Only Bottom "Barchasini ko'rish" Button */}
      <div className="sm:hidden pt-1">
        <Link
          href={currentTabConfig.viewAllHref}
          className="inline-flex items-center justify-center gap-1.5 w-full py-2.5 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
        >
          <span>{tCommon("viewAll")}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </section>
  );
}
