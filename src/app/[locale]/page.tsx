import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { api } from "@/lib/api";
import { calculateProductPrice } from "@/lib/utils/price";
import { Header } from "@/components/layout/Header";
import { PromoNav } from "@/components/layout/PromoNav";
import { Footer } from "@/components/layout/Footer";
import { MobileNav } from "@/components/layout/MobileNav";
import { CategoryCard } from "@/components/discovery/CategoryCard";
import { ProductCard } from "@/components/discovery/ProductCard";
import { BrandCard } from "@/components/discovery/BrandCard";
import { Link } from "@/i18n/routing";
import {
  Sparkles,
  ArrowRight,
  TrendingUp,
  Percent,
  Truck,
  ShieldCheck,
  CreditCard,
  Building2,
  CheckCircle2,
} from "lucide-react";
import Image from "next/image";

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
        ru: "https://sora.uz/ru",
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

  // Real 1C Special Offers (promotions, low price guarantee, popular, new products):
  const promotionProducts =
    specialOffers.promotions.length > 0
      ? specialOffers.promotions
      : products.filter((p) => calculateProductPrice(p.price).hasDiscount).slice(0, 4);

  const lowPriceProducts =
    specialOffers.lowPrice.length > 0
      ? specialOffers.lowPrice
      : products.slice(0, 4);

  const popularProducts =
    specialOffers.popular.length > 0
      ? specialOffers.popular
      : products.slice(4, 8);

  const newProductsList =
    specialOffers.newProducts.length > 0
      ? specialOffers.newProducts
      : products.slice(8, 12);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col">
      {/* 1. Header */}
      <Header
        tree={tree}
        categories={categories}
        brands={brands}
        products={products}
      />

      {/* 2. Promo Navigation */}
      <PromoNav />

      {/* Main Page Flow */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full space-y-12">
        {/* 3. Hero Banner (E-commerce Web Design §8) */}
        <section className="relative rounded-3xl bg-gradient-to-br from-blue-700 via-blue-800 to-indigo-950 text-white overflow-hidden p-6 sm:p-10 lg:p-12 shadow-lg">
          <div className="absolute right-0 top-0 w-1/2 h-full bg-radial from-blue-400/20 to-transparent pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
            <div className="lg:col-span-7 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/30 border border-blue-400/40 text-blue-200">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>{t("heroBadge")}</span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
                {t("heroTitle")}
              </h1>
              <p className="text-sm sm:text-base text-blue-100 max-w-xl leading-relaxed">
                {t("heroSubtitle")}
              </p>
              <div className="pt-2 flex flex-wrap gap-3">
                <Link
                  href="/catalog"
                  className="px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center gap-2"
                >
                  <span>{t("heroCta")}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/catalog?badge=sale"
                  className="px-6 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs sm:text-sm border border-white/20 transition-all"
                >
                  {t("heroSecondary")}
                </Link>
              </div>
            </div>

            {/* Hero Visual Showcase */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative w-64 sm:w-80 h-64 sm:h-72 bg-white/10 rounded-3xl p-4 backdrop-blur-xs border border-white/10 shadow-2xl flex items-center justify-center">
                <div className="relative w-full h-full">
                  <Image
                    src="https://i.ibb.co/qLcGdmjh/Deli-E3871.jpg"
                    alt="Deli E3871 Kombi perpletka mashinasi"
                    fill
                    sizes="(max-width: 640px) 256px, 320px"
                    className="object-contain p-2 drop-shadow-2xl"
                    priority
                  />
                </div>
                <div className="absolute -bottom-3 -left-3 bg-white text-slate-900 rounded-2xl py-2 px-4 shadow-xl border border-slate-100 text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>1C ERP Sinxron</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 4. Asosiy Kategoriyalar Bloki (E-commerce Web Design §9) */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
              {t("categoriesTitle")}
            </h2>
            <Link
              href="/catalog"
              className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
            >
              <span>{tCommon("viewAll")}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {tree.map((cat) => (
              <CategoryCard key={cat.id} category={cat} locale={locale as "uz" | "ru"} />
            ))}
          </div>
        </section>

        {/* 5. Aksiyalar va Chegirmalar (/promotions) */}
        {promotionProducts.length > 0 && (
          <section id="promotions" className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                  <Percent className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
                    {t("dealsTitle")}
                  </h2>
                </div>
              </div>
              <Link
                href="/catalog?offer=promotions"
                className="text-xs font-bold text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1"
              >
                <span>{tCommon("viewAll")}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {promotionProducts.slice(0, 4).map((p) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  rating={4.8}
                  reviewCount={22}
                  badge={isUz ? "Aksiya" : "Скидка"}
                />
              ))}
            </div>
          </section>
        )}

        {/* 6. Eng Arzon Narx Kafolati (/low_price_guarantee) */}
        {lowPriceProducts.length > 0 && (
          <section id="low-price" className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
                    {t("lowPriceTitle")}
                  </h2>
                </div>
              </div>
              <Link
                href="/catalog?offer=low-price"
                className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
              >
                <span>{tCommon("viewAll")}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {lowPriceProducts.slice(0, 4).map((p) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  rating={4.9}
                  reviewCount={31}
                  badge={isUz ? "Eng arzon narx" : "Лучшая цена"}
                />
              ))}
            </div>
          </section>
        )}

        {/* 7. Ommabop Mahsulotlar - Xit Savdo (/popular) */}
        {popularProducts.length > 0 && (
          <section id="popular" className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
                    {t("topProductsTitle")}
                  </h2>
                </div>
              </div>
              <Link
                href="/catalog?offer=popular"
                className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1"
              >
                <span>{tCommon("viewAll")}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {popularProducts.slice(0, 4).map((p) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  rating={4.9}
                  reviewCount={38}
                  badge={isUz ? "Xit" : "Хит"}
                />
              ))}
            </div>
          </section>
        )}

        {/* 8. Yangi Mahsulotlar - Novinki (/new_products) */}
        {newProductsList.length > 0 && (
          <section id="new-products" className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
                    {t("newProductsTitle")}
                  </h2>
                </div>
              </div>
              <Link
                href="/catalog?offer=new"
                className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
              >
                <span>{tCommon("viewAll")}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {newProductsList.slice(0, 4).map((p) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  rating={4.7}
                  reviewCount={15}
                  badge={isUz ? "Yangi" : "Новинка"}
                />
              ))}
            </div>
          </section>
        )}

        {/* 7. Rasmiy Brendlar Bloki (E-commerce Web Design §15) */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
              {t("brandsTitle")}
            </h2>
            <Link
              href="/brands"
              className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
            >
              <span>{tCommon("viewAll")}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {brands.slice(0, 8).map((b) => (
              <BrandCard key={b.id} brand={b} />
            ))}
          </div>
        </section>

        {/* 8. Afzalliklar Bloki (E-commerce Web Design §26) */}
        <section className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-10 border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-center">
            {t("featuresTitle")}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 space-y-2">
              <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center">
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
