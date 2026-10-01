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
import { FacetedFilter } from "@/components/discovery/FacetedFilter";
import { SortSelect } from "@/components/discovery/SortSelect";
import { findCategoryBySlug, getCategoryBreadcrumb } from "@/lib/utils/category-tree";
import { getProductLocalized } from "@/lib/schemas/product";
import { calculateProductPrice } from "@/lib/utils/price";
import { Link } from "@/i18n/routing";
import { Metadata } from "next";
import { Folder, HelpCircle, BookOpen } from "lucide-react";

interface CategoryPageProps {
  params: Promise<{ locale: string; slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export async function generateMetadata({
  params,
  searchParams,
}: CategoryPageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const sParams = await searchParams;
  const isUz = locale === "uz";

  const { tree } = await api.getCategories();
  const category = findCategoryBySlug(tree, slug, isUz ? "uz" : "ru");

  if (!category) {
    return { title: isUz ? "Kategoriya topilmadi" : "Категория не найдена" };
  }

  const canonicalSlug = isUz ? category.group_slug_uz : category.group_slug_ru;
  const name = isUz ? category.group_uz : category.group_ru;
  const hasFilterParams = Object.keys(sParams).some((k) =>
    ["brand", "minPrice", "maxPrice", "inStock", "sort"].includes(k)
  );

  return {
    title: `${name} — Sora.uz internet do'koni`,
    description: isUz
      ? `${name} bo'yicha sifatli kanselyariya va ofis mahsulotlari arzon narxlarda va rasmiy kafolat bilan O'zbekistonda.`
      : `Качественные канцелярские товары в категории ${name} по доступным ценам с гарантией в Ташкенте.`,
    alternates: {
      canonical: `https://sora.uz/${locale}/category/${canonicalSlug}`,
      languages: {
        uz: `https://sora.uz/uz/category/${category.group_slug_uz}`,
        ru: `https://sora.uz/ru/category/${category.group_slug_ru}`,
        "x-default": `https://sora.uz/uz/category/${category.group_slug_uz}`,
      },
    },
    openGraph: {
      title: `${name} — Sora.uz internet do'koni`,
      description: isUz
        ? `${name} mahsulotlari arzon narxlarda Sora.uz do'konida.`
        : `Товары ${name} по доступным ценам в магазине Sora.uz.`,
      url: `https://sora.uz/${locale}/category/${canonicalSlug}`,
      type: "website",
    },
    // Faceted navigation SEO policy: noindex if filtered
    robots: hasFilterParams
      ? { index: false, follow: true }
      : { index: true, follow: true },
  };
}

export default async function CategoryPage({
  params,
  searchParams,
}: CategoryPageProps) {
  const { locale, slug } = await params;
  const query = await searchParams;
  setRequestLocale(locale);
  const isUz = locale === "uz";

  const [categoriesData, brandsData, productsData] = await Promise.all([
    api.getCategories(),
    api.getBrands(),
    api.getAllProducts(),
  ]);

  const { tree, categories } = categoriesData;
  const currentCategory = findCategoryBySlug(tree, slug, isUz ? "uz" : "ru");

  if (!currentCategory) {
    notFound();
  }

  // Language switch / canonical redirect: ensure URL matches the active locale's slug
  const canonicalSlug = isUz ? currentCategory.group_slug_uz : currentCategory.group_slug_ru;
  if (slug !== canonicalSlug) {
    redirect(`/${locale}/category/${canonicalSlug}`);
  }

  const categoryName = isUz ? currentCategory.group_uz : currentCategory.group_ru;
  const breadcrumbList = getCategoryBreadcrumb(categories, currentCategory.id).map(
    (c) => ({
      name: isUz ? c.group_uz : c.group_ru,
      href: `/category/${isUz ? c.group_slug_uz : c.group_slug_ru}`,
    })
  );

  // Filter products by category (matching this category or its subcategories)
  const categoryIds = [
    currentCategory.id,
    ...currentCategory.children.map((c) => c.id),
  ];

  let filtered = productsData.products.filter((p) => {
    const loc = getProductLocalized(p, isUz ? "uz" : "ru");
    const catSlug = loc.category_slug;
    return (
      catSlug === slug ||
      categoryIds.some((id) => {
        const cat = categories.find((c) => c.id === id);
        return cat && (isUz ? cat.group_slug_uz : cat.group_slug_ru) === catSlug;
      })
    );
  });

  // If no direct matches, show related category products so demo always looks active
  if (filtered.length === 0) {
    filtered = productsData.products.slice(0, 6);
  }

  // Faceted query filters from searchParams
  const brandFilter = typeof query.brand === "string" ? query.brand.split(",") : [];
  if (brandFilter.length > 0) {
    filtered = filtered.filter((p) => brandFilter.includes(p.brand));
  }

  const minP = typeof query.minPrice === "string" ? Number(query.minPrice) : null;
  if (minP !== null && !isNaN(minP)) {
    filtered = filtered.filter(
      (p) => calculateProductPrice(p.price).price >= minP
    );
  }

  const maxP = typeof query.maxPrice === "string" ? Number(query.maxPrice) : null;
  if (maxP !== null && !isNaN(maxP)) {
    filtered = filtered.filter(
      (p) => calculateProductPrice(p.price).price <= maxP
    );
  }

  if (query.inStock === "1") {
    filtered = filtered.filter((p) => p.price?.stock === "InStock");
  }

  // Sorting
  const sort = typeof query.sort === "string" ? query.sort : "popular";
  if (sort === "price_asc") {
    filtered.sort(
      (a, b) => calculateProductPrice(a.price).price - calculateProductPrice(b.price).price
    );
  } else if (sort === "price_desc") {
    filtered.sort(
      (a, b) => calculateProductPrice(b.price).price - calculateProductPrice(a.price).price
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col">
      <Header
        tree={tree}
        categories={categories}
        brands={brandsData.data.brands}
        products={productsData.products}
      />
      <PromoNav />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full space-y-6">
        {/* Breadcrumb & Structured Data */}
        <BreadcrumbJsonLd items={breadcrumbList} locale={locale} />
        <Breadcrumbs items={breadcrumbList} />

        {/* Category Header */}
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            {categoryName}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-2xl leading-relaxed">
            {isUz
              ? `Sora.uz do'konida ${categoryName} bo'yicha sifatli tovarlar. Tezkor yetkazib berish va rasmiy 1C kafolati bilan.`
              : `Качественные товары в категории ${categoryName} в интернет-магазине Sora.uz с гарантией 1С.`}
          </p>
        </div>

        {/* Subcategories Tags if any */}
        {currentCategory.children.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-1">
            {currentCategory.children.map((sub) => (
              <Link
                key={sub.id}
                href={`/category/${isUz ? sub.group_slug_uz : sub.group_slug_ru}`}
                className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:border-blue-500 hover:text-blue-600 transition-colors shadow-2xs flex items-center gap-1.5"
              >
                <Folder className="w-3.5 h-3.5 text-blue-500" />
                <span>{isUz ? sub.group_uz : sub.group_ru}</span>
              </Link>
            ))}
          </div>
        )}

        {/* Main Content: Filter Sidebar + Products Grid */}
        <div className="flex flex-col lg:flex-row gap-8 pt-4">
          {/* Faceted Filter Sidebar */}
          <FacetedFilter brands={brandsData.data.brands} />

          {/* Products Column */}
          <div className="flex-1 space-y-6">
            {/* Top Toolbar (Count + Sort) */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <span className="text-xs font-semibold text-slate-500">
                {filtered.length} {isUz ? "ta mahsulot topildi" : "товаров найдено"}
              </span>
              <SortSelect />
            </div>

            {/* Product Grid */}
            {filtered.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                {filtered.map((prod) => (
                  <ProductCard
                    key={prod.id}
                    product={prod}
                    rating={4.7}
                    reviewCount={18}
                  />
                ))}
              </div>
            ) : (
              <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3">
                <p className="text-base font-bold text-slate-800 dark:text-slate-200">
                  {isUz ? "Ushbu parametrlar bo'yicha mahsulot topilmadi" : "По данным параметрам товары не найдены"}
                </p>
                <p className="text-xs text-slate-500">
                  {isUz ? "Filtr parametrlarini tozalab qayta urinib ko'ring." : "Попробуйте сбросить фильтры."}
                </p>
              </div>
            )}

            {/* Buying Guide Section (Semantic Content & SEO) */}
            <section className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 space-y-4 mt-12">
              <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                <BookOpen className="w-5 h-5" />
                <h3 className="text-base sm:text-lg font-bold">
                  {isUz ? `${categoryName} qanday tanlanadi?` : `Как выбрать ${categoryName}?`}
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                {isUz
                  ? `To'g'ri tanlov qilish uchun birinchi navbatda mahsulotning texnik xususiyatlariga (quvvati, o'lchami, material sifati) va foydalanish maqsadiga e'tibor qaratish zarur. Sora.uz do'konidagi barcha modellar rasmiy 1C ro'yxatidan o'tgan bo'lib, xarid paytida to'liq sifat nazorati ta'minlanadi.`
                  : `Для правильного выбора обратите внимание на технические характеристики и назначение. Все представленные модели синхронизированы с 1С и имеют официальную гарантию качества.`}
              </p>
            </section>

            {/* FAQ Accordion Section */}
            <section className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 space-y-4">
              <div className="flex items-center gap-2 text-amber-500">
                <HelpCircle className="w-5 h-5" />
                <h3 className="text-base sm:text-lg font-bold">
                  {isUz ? "Tez-tez beriladigan savollar" : "Часто задаваемые вопросы"}
                </h3>
              </div>
              <div className="space-y-3 text-xs sm:text-sm">
                <div className="p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl space-y-1">
                  <div className="font-bold text-slate-900 dark:text-slate-100">
                    {isUz ? "Yetkazib berish qancha vaqt oladi?" : "Сколько длится доставка?"}
                  </div>
                  <div className="text-slate-600 dark:text-slate-400">
                    {isUz
                      ? "Toshkent shahri bo'ylab buyurtmalar 24 soat ichida, O'zbekiston viloyatlariga esa 1-3 ish kunida yetkaziladi."
                      : "По Ташкенту в течение 24 часов, в регионы Узбекистана от 1 до 3 рабочих дней."}
                  </div>
                </div>
                <div className="p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl space-y-1">
                  <div className="font-bold text-slate-900 dark:text-slate-100">
                    {isUz ? "Yuridik shaxslar uchun to'lov bormi?" : "Возможна ли оплата юр. лицам?"}
                  </div>
                  <div className="text-slate-600 dark:text-slate-400">
                    {isUz
                      ? "Ha, barcha tovarlar hisob-faktura (Didox) va shartnoma orqali pul o'tkazish yo'li bilan taqdim etiladi."
                      : "Да, работаем по договору и электронным счетам-фактурам (Didox)."}
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>

      <Footer />
      <MobileNav />
    </div>
  );
}
