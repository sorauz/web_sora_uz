import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { api } from "@/lib/api";
import { Header } from "@/components/layout/Header";
import { PromoNav } from "@/components/layout/PromoNav";
import { Footer } from "@/components/layout/Footer";
import { MobileNav } from "@/components/layout/MobileNav";
import { TopCategories } from "@/components/discovery/TopCategories";
import { FeaturedProductsTabs } from "@/components/discovery/FeaturedProductsTabs";
import { buildFeaturedTabGroups } from "@/lib/utils/featured-products";
import { BrandMarquee } from "@/components/discovery/BrandMarquee";
import { HeroSlider } from "@/components/home/HeroSlider";
import { Link } from "@/i18n/routing";
import {
  ArrowRight,
  Truck,
  ShieldCheck,
  CreditCard,
  Building2,
} from "lucide-react";

import { Metadata } from "next";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const isUz = locale === "uz";

  const title = isUz
    ? "Sora.uz — Kanselyariya va ofis mollari internet do'koni | Toshkent"
    : "Sora.uz — Интернет-магазин канцелярских и офисных товаров | Ташкент";

  const description = isUz
    ? "Sora.uz — Toshkent va O'zbekiston bo'ylab 10 000+ turdagi ofis jihozlari, maktab qurollari va qog'oz mahsulotlari arzon narxlarda, bepul yetkazib berish bilan."
    : "Sora.uz — Более 10 000 наименований канцелярских товаров, бумаги и офисной техники с быстрой доставкой по Ташкенту и всему Узбекистану.";

  return {
    title,
    description,
    alternates: {
      canonical: `https://sora.uz/${locale}`,
      languages: {
        uz: "https://sora.uz/uz",
        "uz-UZ": "https://sora.uz/uz",
        ru: "https://sora.uz/ru",
        "ru-UZ": "https://sora.uz/ru",
        "x-default": "https://sora.uz/uz",
      },
    },
    openGraph: {
      title,
      description,
      url: `https://sora.uz/${locale}`,
      siteName: "Sora.uz",
      locale: isUz ? "uz_UZ" : "ru_RU",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function HomePage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("home");
  const tCommon = await getTranslations("common");
  const isUz = locale === "uz";

  // Fetch real data from 1C API layer (products enriched with prices)
  const [categoriesData, brandsData, productsData, specialOffers] = await Promise.all([
    api.getCategories(),
    api.getBrands(),
    api.getAllProducts(),
    api.getSpecialOffers(),
  ]);

  const { tree, categories } = categoriesData;
  const brands = brandsData.data.brands;
  const products = productsData.products;

  // Real 1C Special Offers with intelligent deduplication across 4 tabs
  const featuredGroups = buildFeaturedTabGroups(products, specialOffers);

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col">
      {/* 1. Header (Lightweight RSC payload: search autocomplete dynamically fetches suggestions) */}
      <Header
        tree={tree}
        categories={categories}
        brands={brands}
      />

      {/* 2. Promo Navigation */}
      <PromoNav />

      {/* Main Page Flow */}
      <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 flex-1 space-y-8 sm:space-y-12">
        {/* 3. Dynamic Hero Banner Carousel (4 interactive slides, 0 CLS, priority LCP on slide 1) */}
        <HeroSlider />

        {/* 4. Ommabop Kategoriyalar (Top 8 asosiy toifalar real fotolar bilan) */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
              {t("categoriesTitle")}
            </h2>
            <Link
              href="/catalog"
              className="text-xs font-bold text-sora-600 hover:underline flex items-center gap-1"
            >
              <span>{tCommon("viewAll")}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <TopCategories categories={tree} locale={locale as "uz" | "ru"} />
        </section>

        {/* 5. Maxsus Takliflar Vitrinasi (Interactive Tabbed Showcase: Aksiyalar, Xit, Yangi, Eng arzon) */}
        <FeaturedProductsTabs
          groups={featuredGroups}
          locale={locale as "uz" | "ru"}
        />

        {/* 9. Rasmiy Brendlar Bloki (3-Row Continuous Marquee) */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
              {t("brandsTitle")}
            </h2>
            <Link
              href="/brands"
              className="text-xs font-bold text-sora-600 dark:text-sora-400 hover:underline flex items-center gap-1"
            >
              <span>{tCommon("viewAll")}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <BrandMarquee brands={brands} />
        </section>

        {/* 8. Afzalliklar Bloki (E-commerce Web Design §26) */}
        <section className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-10 border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-center">
            {t("featuresTitle")}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 space-y-2">
              <div className="w-10 h-10 rounded-xl bg-sora-100 dark:bg-sora-950 text-sora-600 dark:text-sora-400 flex items-center justify-center">
                <Truck className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                {t("f1Title")}
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                {t("f1Desc")}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 space-y-2">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                {t("f2Title")}
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                {t("f2Desc")}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 space-y-2">
              <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <CreditCard className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                {t("f3Title")}
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                {t("f3Desc")}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 space-y-2">
              <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                <Building2 className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                {t("f4Title")}
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                {t("f4Desc")}
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* 9. Footer */}
      <Footer />

      {/* 10. Mobile Bottom Nav */}
      <MobileNav />
    </div>
  );
}
