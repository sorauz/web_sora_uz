import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { api } from "@/lib/api";
import { calculateProductPrice } from "@/lib/utils/price";
import { Header } from "@/components/layout/Header";
import { PromoNav } from "@/components/layout/PromoNav";
import { Footer } from "@/components/layout/Footer";
import { MobileNav } from "@/components/layout/MobileNav";
import { RandomCategories } from "@/components/discovery/RandomCategories";
import { ProductCard } from "@/components/discovery/ProductCard";
import { BrandMarquee } from "@/components/discovery/BrandMarquee";
import { HeroSlider } from "@/components/home/HeroSlider";
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

  // Real 1C Special Offers (promotions, low price guarantee, popular, new products):
  const promotionProducts =
    specialOffers.promotions.length > 0
      ? specialOffers.promotions
      : products.filter((p) => calculateProductPrice(p.price).hasDiscount);

  const lowPriceProducts =
    specialOffers.lowPrice.length > 0
      ? specialOffers.lowPrice
      : products;

  const popularProducts =
    specialOffers.popular.length > 0
      ? specialOffers.popular
      : products;

  const newProductsList =
    specialOffers.newProducts.length > 0
      ? specialOffers.newProducts
      : products;

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

        {/* 4. Ommabop Kategoriyalar (4 random aylanuvchi toifalar) */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
              {t("categoriesTitle")}
            </h2>
            <Link
              href="/catalog"
              className="text-xs font-bold text-sora-600 dark:text-sora-400 hover:underline flex items-center gap-1"
            >
              <span>{tCommon("viewAll")}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <RandomCategories categories={tree} locale={locale as "uz" | "ru"} />
        </section>

        {/* 5. Aksiyalar va Chegirmalar (/promotions) - 5 ustun, 2 qator */}
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
                href="/catalog/promotions"
                className="text-xs font-bold text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1"
              >
                <span>{tCommon("viewAll")}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5 sm:gap-4">
              {promotionProducts.slice(0, 10).map((p) => (
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

        {/* 6. Eng Arzon Narx Kafolati (/low_price_guarantee) - 5 ustun, 2 qator */}
        {lowPriceProducts.length > 0 && (
          <section id="low-price" className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-sora-50 dark:bg-sora-950/60 text-sora-600 dark:text-sora-400 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
                    {t("lowPriceTitle")}
                  </h2>
                </div>
              </div>
              <Link
                href="/catalog/low_price_guarantee"
                className="text-xs font-bold text-sora-600 dark:text-sora-400 hover:underline flex items-center gap-1"
              >
                <span>{tCommon("viewAll")}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5 sm:gap-4">
              {lowPriceProducts.slice(0, 10).map((p) => (
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

        {/* 7. Ommabop Mahsulotlar - Xit Savdo (/popular) - 5 ustun, 2 qator */}
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
                href="/catalog/popular"
                className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1"
              >
                <span>{tCommon("viewAll")}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5 sm:gap-4">
              {popularProducts.slice(0, 10).map((p) => (
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

        {/* 8. Yangi Mahsulotlar - Novinki (/new_products) - 5 ustun, 2 qator */}
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
                href="/catalog/new_products"
                className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
              >
                <span>{tCommon("viewAll")}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5 sm:gap-4">
              {newProductsList.slice(0, 10).map((p) => (
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
