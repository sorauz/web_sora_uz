import { setRequestLocale } from "next-intl/server";
import { api } from "@/lib/api";
import { Header } from "@/components/layout/Header";
import { PromoNav } from "@/components/layout/PromoNav";
import { Footer } from "@/components/layout/Footer";
import { MobileNav } from "@/components/layout/MobileNav";
import { Breadcrumbs } from "@/components/discovery/Breadcrumbs";
import { ProductCard } from "@/components/discovery/ProductCard";
import { Link } from "@/i18n/routing";
import { Metadata } from "next";
import { ShieldCheck, BadgePercent, Flame, Sparkles, Tag, ArrowRight } from "lucide-react";

interface OffersPageProps {
  params: Promise<{ locale: string }>;
  searchParams?: Promise<{ tab?: string }>;
}

export async function generateMetadata({ params }: OffersPageProps): Promise<Metadata> {
  const { locale } = await params;
  const isUz = locale === "uz";
  return {
    title: isUz
      ? "Maxsus Takliflar va Chegirmalar — Sora.uz"
      : "Специальные предложения и скидки — Sora.uz",
    description: isUz
      ? "Sora.uz do'konining maxsus takliflari: Kafolatlangan eng arzon narxlar, aksiyalar, xit mahsulotlar va yangiliklar."
      : "Специальные предложения магазина Sora.uz: Гарантия лучшей цены, акции, хиты продаж и новинки.",
    alternates: {
      canonical: `https://sora.uz/${locale}/offers`,
      languages: {
        uz: "https://sora.uz/uz/offers",
        "uz-UZ": "https://sora.uz/uz/offers",
        ru: "https://sora.uz/ru/offers",
        "ru-UZ": "https://sora.uz/ru/offers",
        "x-default": "https://sora.uz/uz/offers",
      },
    },
  };
}

export default async function OffersPage({ params, searchParams }: OffersPageProps) {
  const { locale } = await params;
  const sParams = (await searchParams) || {};
  setRequestLocale(locale);
  const isUz = locale === "uz";

  const [categoriesData, brandsData, productsData, specialOffers] = await Promise.all([
    api.getCategories(),
    api.getBrands(),
    api.getAllProducts(),
    api.getSpecialOffers(),
  ]);

  const { tree, categories } = categoriesData;
  const brands = brandsData.data.brands;
  const products = productsData.products;

  const currentTab = sParams.tab || "all";

  const tabs = [
    {
      id: "all",
      label: isUz ? "Barcha takliflar" : "Все предложения",
      icon: Tag,
      count:
        specialOffers.lowPrice.length +
        specialOffers.promotions.length +
        specialOffers.popular.length +
        specialOffers.newProducts.length,
    },
    {
      id: "low_price",
      label: isUz ? "Eng arzon narx kafolati" : "Гарантия лучшей цены",
      icon: ShieldCheck,
      count: specialOffers.lowPrice.length,
    },
    {
      id: "promotions",
      label: isUz ? "Aksiyalar va chegirmalar" : "Акции и скидки",
      icon: BadgePercent,
      count: specialOffers.promotions.length,
    },
    {
      id: "popular",
      label: isUz ? "Xit va ommabop" : "Хиты продаж",
      icon: Flame,
      count: specialOffers.popular.length,
    },
    {
      id: "new",
      label: isUz ? "Yangi mahsulotlar" : "Новые поступления",
      icon: Sparkles,
      count: specialOffers.newProducts.length,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col">
      <Header
        tree={tree}
        categories={categories}
        brands={brands}
        products={products}
      />
      <PromoNav />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full space-y-10">
        <Breadcrumbs
          items={[{ name: isUz ? "Maxsus takliflar" : "Специальные предложения" }]}
        />

        {/* Hero Banner */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-sora-700 via-sora-800 to-sora-950 text-white p-6 sm:p-10 shadow-lg">
          <div className="max-w-2xl relative z-10 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-semibold uppercase tracking-wider text-sora-100">
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>{isUz ? "1C ERP bilan sinxron takliflar" : "Синхронизировано с 1С ERP"}</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
              {isUz ? "Maxsus Takliflar & Chegirmalar" : "Специальные Предложения & Скидки"}
            </h1>
            <p className="text-sm sm:text-base text-sora-100 leading-relaxed">
              {isUz
                ? "Sora.uz rasmiy katalogidagi eng foydali xaridlar: Kafolatlangan eng arzon narxlar, cheklangan aksiyalar va yangi taqdim etilgan tovarlar."
                : "Самые выгодные предложения в официальном каталоге Sora.uz: Гарантия лучшей цены, ограниченные акции и свежие новинки."}
            </p>
          </div>
          <div className="absolute -right-12 -bottom-12 w-80 h-80 rounded-full bg-white/5 blur-2xl pointer-events-none" />
        </section>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-slate-200 dark:border-slate-800">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = currentTab === tab.id;
            const href = tab.id === "all" ? "/offers" : `/offers?tab=${tab.id}`;

            return (
              <Link
                key={tab.id}
                href={href}
                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
                  isActive
                    ? "bg-sora-600 text-white shadow-md shadow-sora-500/20"
                    : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-slate-500"}`} />
                <span>{tab.label}</span>
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-mono font-normal ${
                    isActive
                      ? "bg-white/20 text-white"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                  }`}
                >
                  {tab.count}
                </span>
              </Link>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="space-y-12">
          {/* Section: Low Price Guarantee */}
          {(currentTab === "all" || currentTab === "low_price") && specialOffers.lowPrice.length > 0 && (
            <section className="space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-600">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
                      {isUz ? "Kafolatlangan Eng Arzon Narx" : "Гарантия лучшей цены"}
                    </h2>
                    <p className="text-xs text-slate-500">
                      {isUz
                        ? "Bozordagi eng past narx kafolati bilan taklif etilayotgan mahsulotlar."
                        : "Товары с гарантией самой низкой цены на рынке."}
                    </p>
                  </div>
                </div>
                {currentTab === "all" && (
                  <Link
                    href="/offers?tab=low_price"
                    className="text-xs font-bold text-emerald-600 hover:underline flex items-center gap-1"
                  >
                    <span>{isUz ? "Barchasi" : "Все"}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                )}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                {specialOffers.lowPrice.map((p) => (
                  <ProductCard
                    key={p.id}
                    product={p}
                    badge={isUz ? "Eng arzon narx" : "Лучшая цена"}
                    rating={4.9}
                    reviewCount={32}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Section: Promotions & Discounts */}
          {(currentTab === "all" || currentTab === "promotions") && specialOffers.promotions.length > 0 && (
            <section className="space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-rose-100 dark:bg-rose-950/50 flex items-center justify-center text-rose-600">
                    <BadgePercent className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
                      {isUz ? "Aksiyalar va Maxsus Chegirmalar" : "Акции и специальные скидки"}
                    </h2>
                    <p className="text-xs text-slate-500">
                      {isUz
                        ? "Cheklangan muddatli maxsus aksiyalar va chegirmali takliflar."
                        : "Специальные предложения и скидки на ограниченный период."}
                    </p>
                  </div>
                </div>
                {currentTab === "all" && (
                  <Link
                    href="/offers?tab=promotions"
                    className="text-xs font-bold text-rose-600 hover:underline flex items-center gap-1"
                  >
                    <span>{isUz ? "Barchasi" : "Все"}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                )}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                {specialOffers.promotions.map((p) => (
                  <ProductCard
                    key={p.id}
                    product={p}
                    badge={isUz ? "Aksiya" : "Акция"}
                    rating={4.8}
                    reviewCount={24}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Section: Popular / Hits */}
          {(currentTab === "all" || currentTab === "popular") && specialOffers.popular.length > 0 && (
            <section className="space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-amber-100 dark:bg-amber-950/50 flex items-center justify-center text-amber-600">
                    <Flame className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
                      {isUz ? "Ommabop Mahsulotlar (Xit)" : "Популярные товары (Хиты продаж)"}
                    </h2>
                    <p className="text-xs text-slate-500">
                      {isUz
                        ? "Mijozlarimiz tomonidan eng ko'p tanlanayotgan yetakchi mahsulotlar."
                        : "Лидеры продаж и товары, наиболее часто выбираемые нашими клиентами."}
                    </p>
                  </div>
                </div>
                {currentTab === "all" && (
                  <Link
                    href="/offers?tab=popular"
                    className="text-xs font-bold text-amber-600 hover:underline flex items-center gap-1"
                  >
                    <span>{isUz ? "Barchasi" : "Все"}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                )}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                {specialOffers.popular.map((p) => (
                  <ProductCard
                    key={p.id}
                    product={p}
                    badge={isUz ? "Xit" : "Хит"}
                    rating={5.0}
                    reviewCount={45}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Section: New Products */}
          {(currentTab === "all" || currentTab === "new") && specialOffers.newProducts.length > 0 && (
            <section className="space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-sky-100 dark:bg-sky-950/50 flex items-center justify-center text-sky-600">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
                      {isUz ? "Yangi Kelgan Mahsulotlar" : "Новые поступления"}
                    </h2>
                    <p className="text-xs text-slate-500">
                      {isUz
                        ? "1C ERP tizimiga yangi kiritilgan zamonaviy modellar va jihozlar."
                        : "Свежие поступления и новые модели, добавленные в базу 1С ERP."}
                    </p>
                  </div>
                </div>
                {currentTab === "all" && (
                  <Link
                    href="/offers?tab=new"
                    className="text-xs font-bold text-sky-600 hover:underline flex items-center gap-1"
                  >
                    <span>{isUz ? "Barchasi" : "Все"}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                )}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                {specialOffers.newProducts.map((p) => (
                  <ProductCard
                    key={p.id}
                    product={p}
                    badge={isUz ? "Yangi" : "Новинка"}
                    rating={4.7}
                    reviewCount={12}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Empty fallback */}
          {tabs.every((t) => t.count === 0) && (
            <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 space-y-4">
              <p className="text-slate-500">
                {isUz
                  ? "Hozirda faol maxsus takliflar mavjud emas."
                  : "В данный момент активных специальных предложений нет."}
              </p>
              <Link
                href="/catalog"
                className="inline-block px-6 py-2.5 rounded-xl bg-sora-600 text-white font-bold text-sm"
              >
                {isUz ? "Katalogga o'tish" : "Перейти в каталог"}
              </Link>
            </div>
          )}
        </div>
      </main>

      <Footer />
      <MobileNav />
    </div>
  );
}
