import { setRequestLocale } from "next-intl/server";
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
  };
}

export default async function CatalogPage({ params, searchParams }: CatalogPageProps) {
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

  const offerFilter = typeof sParams.offer === "string" ? sParams.offer : (typeof sParams.badge === "string" ? sParams.badge : null);

  let activeOfferTitle = "";
  let offerBadge = "";
  let filteredOfferProducts: typeof products = [];

  if (offerFilter === "promotions" || offerFilter === "sale") {
    activeOfferTitle = isUz ? "Aksiyalar va Maxsus Chegirmalar" : "Акции и Скидки";
    offerBadge = isUz ? "Aksiya" : "Акция";
    filteredOfferProducts = specialOffers.promotions;
  } else if (offerFilter === "low-price" || offerFilter === "low_price_guarantee") {
    activeOfferTitle = isUz ? "Kafolatlangan Eng Arzon Narx" : "Гарантия лучшей цены";
    offerBadge = isUz ? "Eng arzon narx" : "Лучшая цена";
    filteredOfferProducts = specialOffers.lowPrice;
  } else if (offerFilter === "popular" || offerFilter === "top") {
    activeOfferTitle = isUz ? "Ommabop Mahsulotlar (Xit)" : "Популярные товары (Хиты)";
    offerBadge = isUz ? "Xit" : "Хит";
    filteredOfferProducts = specialOffers.popular;
  } else if (offerFilter === "new" || offerFilter === "new_products") {
    activeOfferTitle = isUz ? "Yangi Kelgan Mahsulotlar" : "Новые поступления";
    offerBadge = isUz ? "Yangi" : "Новинка";
    filteredOfferProducts = specialOffers.newProducts;
  }

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

        {/* Active Offer Filter Section */}
        {filteredOfferProducts.length > 0 ? (
          <section className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-900 dark:to-blue-950/40 border border-blue-100 dark:border-blue-900/50">
              <div>
                <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-600 text-white mb-2">
                  {offerBadge}
                </span>
                <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
                  {activeOfferTitle}
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
                  {isUz
                    ? `1C ERP tizimidagi maxsus taklif: ${filteredOfferProducts.length} ta mahsulot.`
                    : `Специальное предложение из 1С ERP: ${filteredOfferProducts.length} товаров.`}
                </p>
              </div>
              <Link
                href="/catalog"
                className="self-start sm:self-center px-4 py-2 text-xs font-semibold rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
              >
                {isUz ? "Filtrni tozalash (Barcha toifalar)" : "Сбросить фильтр (Все категории)"}
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {filteredOfferProducts.map((p) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  rating={4.8}
                  reviewCount={18}
                  badge={offerBadge}
                />
              ))}
            </div>
          </section>
        ) : null}

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
                        className="text-lg font-bold text-slate-900 dark:text-slate-100 hover:text-blue-600 transition-colors"
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
                          className="flex items-center justify-between py-1.5 px-2 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-blue-600 transition-colors"
                        >
                          <span>↳ {isUz ? sub.group_uz : sub.group_ru}</span>
                        </Link>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800">
                    <Link
                      href={`/category/${slug}`}
                      className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
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
              className="text-xs font-bold text-blue-600 hover:underline"
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
          <h2 className="text-xl sm:text-2xl font-bold">
            {isUz ? "Tavsiya etiladigan mahsulotlar" : "Рекомендуемые товары"}
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {products.slice(0, 4).map((p) => (
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
