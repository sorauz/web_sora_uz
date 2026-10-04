import { setRequestLocale } from "next-intl/server";
import { notFound, redirect } from "next/navigation";
import { api } from "@/lib/api";
import { Header } from "@/components/layout/Header";
import { PromoNav } from "@/components/layout/PromoNav";
import { Footer } from "@/components/layout/Footer";
import { MobileNav } from "@/components/layout/MobileNav";
import { Breadcrumbs } from "@/components/discovery/Breadcrumbs";
import { BreadcrumbJsonLd } from "@/components/seo/BreadcrumbJsonLd";
import { ProductCard } from "@/components/discovery/ProductCard";
import { Link } from "@/i18n/routing";
import { Metadata } from "next";
import { ShieldCheck, Sparkles, Flame, BadgePercent, ArrowRight } from "lucide-react";

export const revalidate = 3600;

const VALID_OFFERS = [
  "low_price_guarantee",
  "new_products",
  "popular",
  "promotions",
] as const;

type ValidOfferKey = (typeof VALID_OFFERS)[number];

const OFFER_ALIASES: Record<string, ValidOfferKey> = {
  "low-price": "low_price_guarantee",
  "new": "new_products",
  "sale": "promotions",
  "top": "popular",
};

interface OfferConfig {
  key: ValidOfferKey;
  titleUz: string;
  titleRu: string;
  descriptionUz: string;
  descriptionRu: string;
  headingUz: string;
  headingRu: string;
  badgeUz: string;
  badgeRu: string;
  icon: typeof ShieldCheck;
  gradientClass: string;
  accentBg: string;
  iconBg: string;
}

const OFFER_CONFIGS: Record<ValidOfferKey, OfferConfig> = {
  low_price_guarantee: {
    key: "low_price_guarantee",
    titleUz: "Kafolatlangan Eng Arzon Narx — Sora.uz",
    titleRu: "Гарантия лучшей цены — Sora.uz",
    descriptionUz: "Sora.uz da kafolatlangan eng arzon narxdagi tovarlar to'plami. Rasmiy 1C ERP sinxron narxlari.",
    descriptionRu: "Товары с гарантией самой низкой цены в интернет-магазине Sora.uz. Официальные цены из базы 1С ERP.",
    headingUz: "Kafolatlangan Eng Arzon Narx",
    headingRu: "Гарантия лучшей цены",
    badgeUz: "Eng arzon narx",
    badgeRu: "Лучшая цена",
    icon: ShieldCheck,
    gradientClass: "from-emerald-700 via-teal-800 to-slate-900",
    accentBg: "bg-emerald-500",
    iconBg: "bg-emerald-500/20 text-emerald-300",
  },
  new_products: {
    key: "new_products",
    titleUz: "Yangi Kelgan Mahsulotlar — Sora.uz",
    titleRu: "Новые поступления товаров — Sora.uz",
    descriptionUz: "Sora.uz do'koniga 1C ERP orqali kiritilgan eng yangi modellar, kanselyariya va zamonaviy jihozlar.",
    descriptionRu: "Свежие поступления и новые модели канцелярии и офисной техники в каталоге Sora.uz.",
    headingUz: "Yangi Kelgan Mahsulotlar",
    headingRu: "Новые поступления",
    badgeUz: "Yangi",
    badgeRu: "Новинка",
    icon: Sparkles,
    gradientClass: "from-emerald-700 via-teal-800 to-slate-900",
    accentBg: "bg-emerald-600",
    iconBg: "bg-emerald-500/20 text-emerald-300",
  },
  popular: {
    key: "popular",
    titleUz: "Ommabop Mahsulotlar (Xit Savdo) — Sora.uz",
    titleRu: "Популярные товары (Хиты продаж) — Sora.uz",
    descriptionUz: "Mijozlarimiz tomonidan eng ko'p tanlanayotgan yetakchi mahsulotlar va ishonchli xit tovarlar.",
    descriptionRu: "Лидеры продаж и самые популярные товары среди покупателей интернет-магазина Sora.uz.",
    headingUz: "Ommabop Mahsulotlar (Xit)",
    headingRu: "Популярные товары (Хиты)",
    badgeUz: "Xit",
    badgeRu: "Хит",
    icon: Flame,
    gradientClass: "from-amber-600 via-orange-700 to-slate-900",
    accentBg: "bg-amber-500",
    iconBg: "bg-amber-500/20 text-amber-300",
  },
  promotions: {
    key: "promotions",
    titleUz: "Aksiyalar va Maxsus Chegirmalar — Sora.uz",
    titleRu: "Акции и специальные скидки — Sora.uz",
    descriptionUz: "Cheklangan muddatli maxsus aksiyalar, arzonlashtirilgan narxlar va foydali chegirmalar.",
    descriptionRu: "Выгодные акции, скидки и специальные предложения на ограниченный период на Sora.uz.",
    headingUz: "Aksiyalar va Chegirmalar",
    headingRu: "Акции и скидки",
    badgeUz: "Aksiya",
    badgeRu: "Акция",
    icon: BadgePercent,
    gradientClass: "from-rose-700 via-pink-800 to-slate-900",
    accentBg: "bg-rose-500",
    iconBg: "bg-rose-500/20 text-rose-300",
  },
};

interface StaticOfferPageProps {
  params: Promise<{ locale: string; offer: string }>;
}

export function generateStaticParams() {
  const locales = ["uz", "ru"];
  const params: { locale: string; offer: string }[] = [];

  for (const locale of locales) {
    for (const offer of VALID_OFFERS) {
      params.push({ locale, offer });
    }
  }

  return params;
}

export async function generateMetadata({ params }: StaticOfferPageProps): Promise<Metadata> {
  const { locale, offer } = await params;
  const canonicalOffer = OFFER_ALIASES[offer] || (VALID_OFFERS.includes(offer as ValidOfferKey) ? offer : null);

  if (!canonicalOffer) {
    return { title: "Sahifa topilmadi — Sora.uz" };
  }

  const config = OFFER_CONFIGS[canonicalOffer as ValidOfferKey];
  const isUz = locale === "uz";

  const title = isUz ? config.titleUz : config.titleRu;
  const description = isUz ? config.descriptionUz : config.descriptionRu;

  return {
    title,
    description,
    alternates: {
      canonical: `https://sora.uz/${locale}/catalog/${canonicalOffer}`,
      languages: {
        uz: `https://sora.uz/uz/catalog/${canonicalOffer}`,
        "uz-UZ": `https://sora.uz/uz/catalog/${canonicalOffer}`,
        ru: `https://sora.uz/ru/catalog/${canonicalOffer}`,
        "ru-UZ": `https://sora.uz/ru/catalog/${canonicalOffer}`,
        "x-default": `https://sora.uz/uz/catalog/${canonicalOffer}`,
      },
    },
    openGraph: {
      title,
      description,
      url: `https://sora.uz/${locale}/catalog/${canonicalOffer}`,
      siteName: "Sora.uz",
      locale: isUz ? "uz_UZ" : "ru_RU",
      type: "website",
    },
  };
}

export default async function StaticOfferPage({ params }: StaticOfferPageProps) {
  const { locale, offer } = await params;

  // Handle aliases via redirect
  if (OFFER_ALIASES[offer]) {
    redirect(`/${locale}/catalog/${OFFER_ALIASES[offer]}`);
  }

  if (!VALID_OFFERS.includes(offer as ValidOfferKey)) {
    notFound();
  }

  const offerKey = offer as ValidOfferKey;
  const config = OFFER_CONFIGS[offerKey];
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

  // Select target products
  let offerProducts: typeof products = [];
  if (offerKey === "low_price_guarantee") {
    offerProducts = specialOffers.lowPrice;
  } else if (offerKey === "new_products") {
    offerProducts = specialOffers.newProducts;
  } else if (offerKey === "popular") {
    offerProducts = specialOffers.popular;
  } else if (offerKey === "promotions") {
    offerProducts = specialOffers.promotions;
  }

  const heading = isUz ? config.headingUz : config.headingRu;
  const description = isUz ? config.descriptionUz : config.descriptionRu;
  const badge = isUz ? config.badgeUz : config.badgeRu;
  const Icon = config.icon;

  const quickNav = [
    {
      key: "low_price_guarantee",
      label: isUz ? "Eng arzon narx" : "Лучшая цена",
      icon: ShieldCheck,
      count: specialOffers.lowPrice.length,
    },
    {
      key: "new_products",
      label: isUz ? "Yangi mahsulotlar" : "Новинки",
      icon: Sparkles,
      count: specialOffers.newProducts.length,
    },
    {
      key: "popular",
      label: isUz ? "Xit savdo" : "Хиты",
      icon: Flame,
      count: specialOffers.popular.length,
    },
    {
      key: "promotions",
      label: isUz ? "Aksiyalar" : "Акции",
      icon: BadgePercent,
      count: specialOffers.promotions.length,
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

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full space-y-8">
        <Breadcrumbs
          items={[
            { name: isUz ? "Katalog" : "Каталог", href: "/catalog" },
            { name: heading },
          ]}
        />

        <BreadcrumbJsonLd
          items={[
            { name: isUz ? "Katalog" : "Каталог", href: `/${locale}/catalog` },
            { name: heading, href: `/${locale}/catalog/${offerKey}` },
          ]}
          locale={locale}
        />

        {/* Themed Hero Banner */}
        <section
          className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${config.gradientClass} text-white p-6 sm:p-10 shadow-lg`}
        >
          <div className="max-w-3xl relative z-10 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-semibold uppercase tracking-wider text-white">
              <Icon className="w-4 h-4" />
              <span>{isUz ? "1C ERP rasmiy taklifi" : "Официальное предложение 1С ERP"}</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
              {heading}
            </h1>
            <p className="text-sm sm:text-base text-slate-200 leading-relaxed max-w-2xl">
              {description}
            </p>
            <div className="pt-2 flex items-center gap-3">
              <span className="px-3 py-1 rounded-xl bg-white/10 backdrop-blur-md text-xs font-mono font-medium">
                {isUz
                  ? `${offerProducts.length} ta faol mahsulot`
                  : `${offerProducts.length} активных товаров`}
              </span>
              <Link
                href="/offers"
                className="text-xs font-semibold text-white/80 hover:text-white underline underline-offset-4 flex items-center gap-1"
              >
                <span>{isUz ? "Barcha maxsus takliflar markazi" : "Центр всех предложений"}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
          <div className="absolute -right-10 -bottom-10 w-72 h-72 rounded-full bg-white/10 blur-3xl pointer-events-none" />
        </section>

        {/* Quick Switcher Tabs */}
        <section className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-slate-200 dark:border-slate-800">
          {quickNav.map((item) => {
            const ItemIcon = item.icon;
            const isActive = item.key === offerKey;

            return (
              <Link
                key={item.key}
                href={`/catalog/${item.key}`}
                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
                  isActive
                    ? "bg-sora-600 text-white shadow-md shadow-sora-500/20"
                    : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800"
                }`}
              >
                <ItemIcon className={`w-4 h-4 ${isActive ? "text-white" : "text-slate-500"}`} />
                <span>{item.label}</span>
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-mono font-normal ${
                    isActive
                      ? "bg-white/20 text-white"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                  }`}
                >
                  {item.count}
                </span>
              </Link>
            );
          })}
        </section>

        {/* Products Grid */}
        <section className="space-y-6">
          {offerProducts.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {offerProducts.map((p) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  badge={badge}
                  rating={4.8}
                  reviewCount={24}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 space-y-4">
              <p className="text-slate-500">
                {isUz
                  ? "Hozirda bu toifada faol mahsulotlar mavjud emas."
                  : "В данный момент в этой категории активных товаров нет."}
              </p>
              <Link
                href="/catalog"
                className="inline-block px-6 py-2.5 rounded-xl bg-sora-600 text-white font-bold text-sm"
              >
                {isUz ? "Barcha mahsulotlar katalogi" : "Весь каталог товаров"}
              </Link>
            </div>
          )}
        </section>
      </main>

      <Footer />
      <MobileNav />
    </div>
  );
}
