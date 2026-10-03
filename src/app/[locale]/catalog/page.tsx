import { setRequestLocale } from "next-intl/server";
import { redirect } from "next/navigation";
import { api } from "@/lib/api";
import { Header } from "@/components/layout/Header";
import { PromoNav } from "@/components/layout/PromoNav";
import { Footer } from "@/components/layout/Footer";
import { MobileNav } from "@/components/layout/MobileNav";
import { Breadcrumbs } from "@/components/discovery/Breadcrumbs";
import { CategoryCard } from "@/components/discovery/CategoryCard";
import { BrandCard } from "@/components/discovery/BrandCard";
import { ProductCard } from "@/components/discovery/ProductCard";
import { Link } from "@/i18n/routing";
import { Metadata } from "next";
import { ShieldCheck, Sparkles, Flame, BadgePercent } from "lucide-react";

interface CatalogPageProps {
  params: Promise<{ locale: string }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}

export async function generateMetadata({ params }: CatalogPageProps): Promise<Metadata> {
  const { locale } = await params;
  const isUz = locale === "uz";
  return {
    title: isUz ? "Mahsulotlar Katalogi — Sora.uz" : "Каталог товаров — Sora.uz",
    description: isUz
      ? "Sora.uz barcha toifalar katalogi: Ofis jihozlari, kanselyariya mollari, smartfonlar va kompyuter anjomlari."
      : "Каталог всех категорий Sora.uz: Офисная техника, канцелярия, смартфоны и компьютерные аксессуары.",
    alternates: {
      canonical: `https://sora.uz/${locale}/catalog`,
      languages: {
        uz: "https://sora.uz/uz/catalog",
        "uz-UZ": "https://sora.uz/uz/catalog",
        ru: "https://sora.uz/ru/catalog",
        "ru-UZ": "https://sora.uz/ru/catalog",
        "x-default": "https://sora.uz/uz/catalog",
      },
    },
  };
}

export default async function CatalogPage({ params, searchParams }: CatalogPageProps) {
  const { locale } = await params;
  const sParams = (await searchParams) || {};
  setRequestLocale(locale);
  const isUz = locale === "uz";

  const offerFilter = typeof sParams.offer === "string" ? sParams.offer : (typeof sParams.badge === "string" ? sParams.badge : null);

  // SEO & UX: Redirect query-based offer URLs to permanent clean static routes
  if (offerFilter) {
    if (offerFilter === "promotions" || offerFilter === "sale") {
      redirect(`/${locale}/catalog/promotions`);
    } else if (offerFilter === "low-price" || offerFilter === "low_price_guarantee") {
      redirect(`/${locale}/catalog/low_price_guarantee`);
    } else if (offerFilter === "popular" || offerFilter === "top") {
      redirect(`/${locale}/catalog/popular`);
    } else if (offerFilter === "new" || offerFilter === "new_products") {
      redirect(`/${locale}/catalog/new_products`);
    }
  }

  const [categoriesData, brandsData, productsData] = await Promise.all([
    api.getCategories(),
    api.getBrands(),
    api.getAllProducts(),
  ]);

  const { tree, categories } = categoriesData;
  const brands = brandsData.data.brands;
  const products = productsData.products;

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
          items={[{ name: isUz ? "Katalog" : "Каталог" }]}
        />

        {/* Page Title */}
        <div className="space-y-2">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            {isUz ? "Barcha mahsulotlar katalogi" : "Каталог всех товаров"}
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {isUz
              ? "1C ERP ma'lumotlar bazasidagi barcha rasmiy toifalar va brendlar ro'yxati."
              : "Полный список официальных категорий и брендов из базы 1С ERP."}
          </p>
        </div>

        {/* Special Offer Quick Banners */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <Link
            href="/catalog/low_price_guarantee"
            className="p-4 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white flex flex-col justify-between hover:shadow-lg transition-all hover:-translate-y-0.5"
          >
            <ShieldCheck className="w-5 h-5 mb-2 text-white/90" />
            <div>
              <div className="text-[11px] uppercase font-semibold text-emerald-100">1C ERP</div>
              <div className="text-sm font-bold">{isUz ? "Eng arzon narx kafolati" : "Гарантия лучшей цены"}</div>
            </div>
          </Link>
          <Link
            href="/catalog/new_products"
            className="p-4 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white flex flex-col justify-between hover:shadow-lg transition-all hover:-translate-y-0.5"
          >
            <Sparkles className="w-5 h-5 mb-2 text-white/90" />
            <div>
              <div className="text-[11px] uppercase font-semibold text-emerald-100">1C ERP</div>
              <div className="text-sm font-bold">{isUz ? "Yangi kelgan tovarlar" : "Новые поступления"}</div>
            </div>
          </Link>
          <Link
            href="/catalog/popular"
            className="p-4 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-700 text-white flex flex-col justify-between hover:shadow-lg transition-all hover:-translate-y-0.5"
          >
            <Flame className="w-5 h-5 mb-2 text-white/90" />
            <div>
              <div className="text-[11px] uppercase font-semibold text-amber-100">1C ERP</div>
              <div className="text-sm font-bold">{isUz ? "Ommabop xit tovarlar" : "Хиты продаж"}</div>
            </div>
          </Link>
          <Link
            href="/catalog/promotions"
            className="p-4 rounded-2xl bg-gradient-to-br from-rose-500 to-pink-700 text-white flex flex-col justify-between hover:shadow-lg transition-all hover:-translate-y-0.5"
          >
            <BadgePercent className="w-5 h-5 mb-2 text-white/90" />
            <div>
              <div className="text-[11px] uppercase font-semibold text-rose-100">1C ERP</div>
              <div className="text-sm font-bold">{isUz ? "Aksiyalar va chegirmalar" : "Акции и скидки"}</div>
            </div>
          </Link>
        </div>

        {/* All Root Categories & Subcategories */}
        <section className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tree.map((cat) => {
              const name = isUz ? cat.group_uz : cat.group_ru;
              const slug = isUz ? cat.group_slug_uz : cat.group_slug_ru;
              return (
                <div
                  key={cat.id}
                  className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                      <Link
                        href={`/category/${slug}`}
                        className="text-lg font-bold text-slate-900 dark:text-slate-100 hover:text-sora-600 transition-colors"
                      >
                        {name}
                      </Link>
                      <span className="text-xs text-slate-400 font-mono">
                        {cat.children.length} {isUz ? "bo'lim" : "подразд."}
                      </span>
                    </div>

                    {/* Subcategories */}
                    <div className="pt-4 space-y-2">
                      {cat.children.map((sub) => (
                        <Link
                          key={sub.id}
                          href={`/category/${isUz ? sub.group_slug_uz : sub.group_slug_ru}`}
                          className="flex items-center justify-between py-1.5 px-2 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-sora-600 transition-colors"
                        >
                          <span>↳ {isUz ? sub.group_uz : sub.group_ru}</span>
                        </Link>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800">
                    <Link
                      href={`/category/${slug}`}
                      className="text-xs font-bold text-sora-600 dark:text-sora-400 hover:underline"
                    >
                      {isUz ? "Barcha tovarlarni ko'rish →" : "Смотреть все товары →"}
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Popular Brands Section */}
        <section className="space-y-4 pt-6 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <h2 className="text-xl sm:text-2xl font-bold">
              {isUz ? "Rasmiy hamkor brendlar" : "Официальные бренды"}
            </h2>
            <Link
              href="/brands"
              className="text-xs font-bold text-sora-600 hover:underline"
            >
              {isUz ? "Barcha brendlar →" : "Все бренды →"}
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {brands.slice(0, 8).map((b) => (
              <BrandCard key={b.id} brand={b} />
            ))}
          </div>
        </section>

        {/* Top Products Grid */}
        <section className="space-y-4 pt-6 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <h2 className="text-xl sm:text-2xl font-bold">
              {isUz ? "Katalogdagi mahsulotlar" : "Товары из каталога"}
            </h2>
            <span className="text-xs text-slate-500 font-mono">
              {products.length} {isUz ? "ta tovar" : "товаров"}
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {products.slice(0, 16).map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                rating={4.8}
                reviewCount={24}
                badge={isUz ? "Top" : "Топ"}
              />
            ))}
          </div>
        </section>
      </main>

      <Footer />
      <MobileNav />
    </div>
  );
}
