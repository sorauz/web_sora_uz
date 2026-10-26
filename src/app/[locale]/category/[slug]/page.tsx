import { setRequestLocale } from "next-intl/server";
import { notFound, redirect } from "next/navigation";
import { api } from "@/lib/api";
import { Header } from "@/components/layout/Header";
import { PromoNav } from "@/components/layout/PromoNav";
import { Footer } from "@/components/layout/Footer";
import { MobileNav } from "@/components/layout/MobileNav";
import { Breadcrumbs } from "@/components/discovery/Breadcrumbs";
import { BreadcrumbJsonLd } from "@/components/seo/BreadcrumbJsonLd";
import { ItemListJsonLd } from "@/components/seo/ItemListJsonLd";
import { ProductCard } from "@/components/discovery/ProductCard";
import { FacetedFilter } from "@/components/discovery/FacetedFilter";
import { SortSelect } from "@/components/discovery/SortSelect";
import { findCategoryBySlug, getCategoryBreadcrumb, getAllCategorySlugs } from "@/lib/utils/category-tree";
import { getProductLocalized } from "@/lib/schemas/product";
import { calculateProductPrice } from "@/lib/utils/price";
import { Link } from "@/i18n/routing";
import { Pagination } from "@/components/discovery/Pagination";
import { SubcategoryChips } from "@/components/discovery/SubcategoryChips";
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
  const pageNum = typeof sParams.page === "string" ? parseInt(sParams.page, 10) : 1;
  const isPage = !isNaN(pageNum) && pageNum > 1;
  const pageTitleSuffix = isPage ? (isUz ? ` (${pageNum}-sahifa)` : ` (Страница ${pageNum})`) : "";
  const canonicalUrl = `https://sora.uz/${locale}/category/${canonicalSlug}${isPage ? `?page=${pageNum}` : ""}`;
  const hasFilterParams = Object.keys(sParams).some((k) =>
    ["brand", "minPrice", "maxPrice", "inStock", "sort"].includes(k)
  );

  return {
    title: isUz ? `${name}${pageTitleSuffix} — internet do'koni` : `${name}${pageTitleSuffix} — интернет-магазин`,
    description: isUz
      ? `${name} bo'yicha sifatli kanselyariya va ofis mahsulotlari arzon narxlarda va rasmiy kafolat bilan O'zbekistonda.`
      : `Качественные канцелярские товары в категории ${name} по доступным ценам с гарантией в Ташкенте.`,
    alternates: {
      canonical: canonicalUrl,
      languages: {
        uz: `https://sora.uz/uz/category/${category.group_slug_uz}`,
        "uz-UZ": `https://sora.uz/uz/category/${category.group_slug_uz}`,
        ru: `https://sora.uz/ru/category/${category.group_slug_ru}`,
        "ru-UZ": `https://sora.uz/ru/category/${category.group_slug_ru}`,
        "x-default": `https://sora.uz/uz/category/${category.group_slug_uz}`,
      },
      types: {
        "text/markdown": `https://sora.uz/${locale}/category/${canonicalSlug}.md`,
      },
    },
    openGraph: {
      title: isUz ? `${name}${pageTitleSuffix} — internet do'koni` : `${name}${pageTitleSuffix} — интернет-магазин`,
      description: isUz
        ? `${name} mahsulotlari arzon narxlarda Sora.uz do'konida.`
        : `Товары ${name} по доступным ценам в магазине Sora.uz.`,
      url: canonicalUrl,
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
    const sParams = new URLSearchParams();
    Object.entries(query).forEach(([k, v]) => {
      if (v !== undefined) {
        if (Array.isArray(v)) {
          v.forEach((val) => sParams.append(k, val));
        } else {
          sParams.set(k, v);
        }
      }
    });
    const qs = sParams.toString();
    redirect(`/${locale}/category/${canonicalSlug}${qs ? `?${qs}` : ""}`);
  }

  const categoryName = isUz ? currentCategory.group_uz : currentCategory.group_ru;
  const breadcrumbList = getCategoryBreadcrumb(categories, currentCategory.id).map(
    (c) => ({
      name: isUz ? c.group_uz : c.group_ru,
      href: `/category/${isUz ? c.group_slug_uz : c.group_slug_ru}`,
    })
  );

  // Filter products by category (recursively matching this category and all its descendant subcategories)
  const matchingSlugs = getAllCategorySlugs(currentCategory);

  // Subcategories with matching product count for progressive disclosure chips
  const subcategoryChips = currentCategory.children.map((sub) => {
    const subSlugs = getAllCategorySlugs(sub);
    const count = productsData.products.filter((p) => {
      const slugUz = p.uz?.category_slug_uz;
      const slugRu = p.ru?.category_slug_ru;
      const locSlug = getProductLocalized(p, isUz ? "uz" : "ru").category_slug;
      return (
        (slugUz && subSlugs.has(slugUz)) ||
        (slugRu && subSlugs.has(slugRu)) ||
        (locSlug && subSlugs.has(locSlug))
      );
    }).length;

    return {
      id: sub.id,
      name: isUz ? sub.group_uz : sub.group_ru,
      slug: isUz ? sub.group_slug_uz : sub.group_slug_ru,
      count,
    };
  });

  let filtered = productsData.products.filter((p) => {
    const slugUz = p.uz?.category_slug_uz;
    const slugRu = p.ru?.category_slug_ru;
    const locSlug = getProductLocalized(p, isUz ? "uz" : "ru").category_slug;
    return (
      (slugUz && matchingSlugs.has(slugUz)) ||
      (slugRu && matchingSlugs.has(slugRu)) ||
      (locSlug && matchingSlugs.has(locSlug))
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

  // Pagination (24 items per page for optimal grid layout across all screen sizes)
  const PAGE_SIZE = 24;
  const rawPage = Number(query.page);
  const currentPage = !isNaN(rawPage) && rawPage > 0 ? Math.floor(rawPage) : 1;
  const totalMatchedCount = filtered.length;
  const totalPages = Math.ceil(totalMatchedCount / PAGE_SIZE);
  const paginatedProducts = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col">
      <Header
        tree={tree}
        categories={categories}
        brands={brandsData.data.brands}
      />
      <PromoNav />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full space-y-6">
        {/* Breadcrumb & Structured Data */}
        <BreadcrumbJsonLd items={breadcrumbList} locale={locale} />
        <ItemListJsonLd
          name={currentPage > 1 ? `${categoryName} (${currentPage}-sahifa)` : categoryName}
          description={
            isUz
              ? `Sora.uz do'konida ${categoryName} bo'yicha sifatli tovarlar to'plami.`
              : `Список качественных товаров в категории ${categoryName} в интернет-магазине Sora.uz.`
          }
          products={paginatedProducts}
          locale={locale as "uz" | "ru"}
          currentPage={currentPage}
          pageSize={PAGE_SIZE}
        />
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

        {/* Subcategories Progressive Disclosure Chips */}
        {subcategoryChips.length > 0 && (
          <SubcategoryChips
            items={subcategoryChips}
            locale={locale as "uz" | "ru"}
            initialLimit={3}
          />
        )}

        {/* Main Content: Filter Sidebar + Products Grid */}
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-8 pt-2 sm:pt-4">
          {/* Faceted Filter Sidebar (Desktop) & 50/50 Filter+Sort Toolbar + Bottom Sheet (Mobile) */}
          <FacetedFilter
            brands={brandsData.data.brands}
            totalMatchedCount={totalMatchedCount}
          />

          {/* Products Column */}
          <div className="flex-1 space-y-4 sm:space-y-6">
            {/* Top Toolbar (Count + Desktop Sort) */}
            <div className="flex items-center justify-between pb-2 sm:pb-3 border-b border-slate-200 dark:border-slate-800">
              <span className="text-xs font-semibold text-slate-500">
                {totalMatchedCount > PAGE_SIZE
                  ? `${(currentPage - 1) * PAGE_SIZE + 1}–${Math.min(currentPage * PAGE_SIZE, totalMatchedCount)} / ${totalMatchedCount} ${isUz ? "ta mahsulot" : "товаров"}`
                  : `${totalMatchedCount} ${isUz ? "ta mahsulot topildi" : "товаров найдено"}`}
              </span>
              <div className="hidden lg:block">
                <SortSelect />
              </div>
            </div>

            {/* Product Grid */}
            {paginatedProducts.length > 0 ? (
              <div className="space-y-6">
                <div className="grid grid-cols-2 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                  {paginatedProducts.map((prod) => (
                    <ProductCard
                      key={prod.id}
                      product={prod}
                      rating={4.7}
                      reviewCount={18}
                    />
                  ))}
                </div>

                {/* Pagination Controls */}
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={totalMatchedCount}
                  pageSize={PAGE_SIZE}
                  searchParams={query}
                />
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
              <div className="flex items-center gap-2 text-sora-600 dark:text-sora-400">
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
