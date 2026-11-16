import { setRequestLocale } from "next-intl/server";
import { api } from "@/lib/api";
import { Header } from "@/components/layout/Header";
import { PromoNav } from "@/components/layout/PromoNav";
import { Footer } from "@/components/layout/Footer";
import { MobileNav } from "@/components/layout/MobileNav";
import { Breadcrumbs } from "@/components/discovery/Breadcrumbs";
import { ProductCard } from "@/components/discovery/ProductCard";
import { Pagination } from "@/components/discovery/Pagination";
import { SortSelect } from "@/components/discovery/SortSelect";
import { FacetedFilter } from "@/components/discovery/FacetedFilter";
import { ActiveFilterChips } from "@/components/discovery/ActiveFilterChips";
import { getProductLocalized } from "@/lib/schemas/product";
import { calculateProductPrice } from "@/lib/utils/price";
import { searchProducts } from "@/lib/utils/search";
import { Metadata } from "next";
import { Search, PackageX } from "lucide-react";
import Link from "next/link";

interface SearchPageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export async function generateMetadata({
  params,
  searchParams,
}: SearchPageProps): Promise<Metadata> {
  const { locale } = await params;
  const sParams = await searchParams;
  const q = typeof sParams.q === "string" ? sParams.q : "";
  const isUz = locale === "uz";

  return {
    title: q
      ? `"${q}" bo'yicha qidiruv natijalari | Sora.uz`
      : isUz
      ? "Mahsulotlar qidiruvi | Sora.uz"
      : "Поиск товаров | Sora.uz",
    description: isUz
      ? `Sora.uz do'konida "${q}" so'rovi bo'yicha topilgan barcha sifatli mahsulotlar.`
      : `Результаты поиска по запросу "${q}" в интернет-магазине Sora.uz.`,
    // Internal search pages should NEVER be indexed (robots noindex)
    robots: {
      index: false,
      follow: true,
    },
  };
}

export default async function SearchPage({
  params,
  searchParams,
}: SearchPageProps) {
  const { locale } = await params;
  const query = await searchParams;
  setRequestLocale(locale);
  const isUz = locale === "uz";

  const q = typeof query.q === "string" ? query.q.trim().toLowerCase() : "";

  const [categoriesData, brandsData, productsData] = await Promise.all([
    api.getCategories(),
    api.getBrands(),
    api.getAllProducts(),
  ]);

  const { tree, categories } = categoriesData;
  const brands = brandsData.data.brands;
  const products = productsData.products;

  // Base matching results from search query
  const baseResults = q
    ? searchProducts(products, q, isUz ? "uz" : "ru")
    : products;

  // Extract matching categories with counts for search filter
  const catMap = new Map<
    string,
    { id: string; name: string; slug: string; count: number }
  >();
  for (const p of baseResults) {
    const loc = getProductLocalized(p, isUz ? "uz" : "ru");
    const cSlug =
      loc.category_slug ||
      (isUz ? p.uz?.category_slug_uz : p.ru?.category_slug_ru);
    const cName =
      loc.category || (isUz ? p.uz?.category_uz : p.ru?.category_ru);
    if (cSlug && cName) {
      if (!catMap.has(cSlug)) {
        catMap.set(cSlug, { id: cSlug, name: cName, slug: cSlug, count: 0 });
      }
      catMap.get(cSlug)!.count++;
    }
  }
  const searchCategories = Array.from(catMap.values()).sort(
    (a, b) => b.count - a.count || a.name.localeCompare(b.name)
  );
  const categoryNameMap: Record<string, string> = {};
  searchCategories.forEach((c) => {
    categoryNameMap[c.slug] = c.name;
  });

  // Extract matching brands with counts for search filter
  const brandMap = new Map<string, number>();
  for (const p of baseResults) {
    if (p.brand && p.brand.trim()) {
      brandMap.set(p.brand, (brandMap.get(p.brand) || 0) + 1);
    }
  }
  const searchBrands = Array.from(brandMap.entries())
    .map(([name, count]) => ({
      id: name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      name,
      count,
    }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));

  // Dynamic price range and presets for search
  const validPrices = baseResults
    .map((p) => calculateProductPrice(p.price).price)
    .filter((p) => p > 0);
  const minSearchPrice =
    validPrices.length > 0 ? Math.min(...validPrices) : 0;
  const maxSearchPrice =
    validPrices.length > 0 ? Math.max(...validPrices) : 2000000;

  let dynamicPricePresets: { label: string; min: string; max: string }[] = [];
  if (maxSearchPrice <= 60000) {
    dynamicPricePresets = [
      { label: isUz ? "15 minggacha" : "До 15 тыс.", min: "", max: "15000" },
      {
        label: isUz ? "15 – 30 ming" : "15 – 30 тыс.",
        min: "15000",
        max: "30000",
      },
      {
        label: isUz ? "30 – 50 ming" : "30 – 50 тыс.",
        min: "30000",
        max: "50000",
      },
      { label: isUz ? "50 mingdan yuqori" : "От 50 тыс.", min: "50000", max: "" },
    ];
  } else if (maxSearchPrice <= 250000) {
    dynamicPricePresets = [
      { label: isUz ? "50 minggacha" : "До 50 тыс.", min: "", max: "50000" },
      {
        label: isUz ? "50 – 100 ming" : "50 – 100 тыс.",
        min: "50000",
        max: "100000",
      },
      {
        label: isUz ? "100 – 180 ming" : "100 – 180 тыс.",
        min: "100000",
        max: "180000",
      },
      {
        label: isUz ? "180 mingdan yuqori" : "От 180 тыс.",
        min: "180000",
        max: "",
      },
    ];
  } else if (maxSearchPrice <= 1000000) {
    dynamicPricePresets = [
      { label: isUz ? "100 minggacha" : "До 100 тыс.", min: "", max: "100000" },
      {
        label: isUz ? "100 – 300 ming" : "100 – 300 тыс.",
        min: "100000",
        max: "300000",
      },
      {
        label: isUz ? "300 – 600 ming" : "300 – 600 тыс.",
        min: "300000",
        max: "600000",
      },
      {
        label: isUz ? "600 mingdan yuqori" : "От 600 тыс.",
        min: "600000",
        max: "",
      },
    ];
  } else {
    dynamicPricePresets = [
      { label: isUz ? "500 minggacha" : "До 500 тыс.", min: "", max: "500000" },
      {
        label: isUz ? "500 ming – 1.5 mln" : "500 тыс. – 1.5 млн",
        min: "500000",
        max: "1500000",
      },
      {
        label: isUz ? "1.5 – 3 mln" : "1.5 – 3 млн",
        min: "1500000",
        max: "3000000",
      },
      { label: isUz ? "3 mlndan yuqori" : "От 3 млн", min: "3000000", max: "" },
    ];
  }

  const inStockCount = baseResults.filter(
    (p) => p.price?.stock === "InStock"
  ).length;
  const discountCount = baseResults.filter(
    (p) => calculateProductPrice(p.price).hasDiscount
  ).length;

  // Apply facet filters
  let filtered = [...baseResults];

  // Category filter
  if (typeof query.category === "string" && query.category.trim()) {
    filtered = filtered.filter((p) => {
      const loc = getProductLocalized(p, isUz ? "uz" : "ru");
      const cSlug =
        loc.category_slug ||
        (isUz ? p.uz?.category_slug_uz : p.ru?.category_slug_ru);
      return cSlug === query.category;
    });
  }

  // Brand filter
  const brandFilter =
    typeof query.brand === "string" ? query.brand.split(",").filter(Boolean) : [];
  if (brandFilter.length > 0) {
    filtered = filtered.filter((p) => brandFilter.includes(p.brand));
  }

  // Price filter
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

  // Stock filter
  if (query.inStock === "1") {
    filtered = filtered.filter((p) => p.price?.stock === "InStock");
  }

  // Discount filter
  if (query.discount === "1") {
    filtered = filtered.filter(
      (p) => calculateProductPrice(p.price).hasDiscount
    );
  }

  // Sorting
  const sort = typeof query.sort === "string" ? query.sort : "popular";
  if (sort === "price_asc") {
    filtered.sort(
      (a, b) =>
        calculateProductPrice(a.price).price - calculateProductPrice(b.price).price
    );
  } else if (sort === "price_desc") {
    filtered.sort(
      (a, b) =>
        calculateProductPrice(b.price).price - calculateProductPrice(a.price).price
    );
  } else if (sort === "newest") {
    filtered.sort((a, b) => {
      if (a.updated_at && b.updated_at && a.updated_at !== b.updated_at) {
        return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
      }
      const numA = parseInt(a.id.replace(/\D/g, ""), 10);
      const numB = parseInt(b.id.replace(/\D/g, ""), 10);
      if (!isNaN(numA) && !isNaN(numB) && numA !== numB) {
        return numB - numA;
      }
      return b.id.localeCompare(a.id);
    });
  }

  const PAGE_SIZE = 24;
  const rawPage = Number(query.page);
  const currentPage = !isNaN(rawPage) && rawPage > 0 ? Math.floor(rawPage) : 1;
  const totalItems = filtered.length;
  const totalPages = Math.ceil(totalItems / PAGE_SIZE);

  function toCardProduct(p: (typeof productsData.products)[number]) {
    return {
      id: p.id,
      product_sku: p.product_sku,
      package: p.package,
      barcode: p.barcode,
      brand: p.brand || "",
      manufacturer: p.manufacturer || "",
      country: p.country || "",
      video_url: "",
      main_picture: p.main_picture,
      updated_at: "",
      price: p.price,
      uz: {
        unit_uz: p.uz?.unit_uz || "dona",
        category_uz: p.uz?.category_uz || "",
        category_slug_uz: p.uz?.category_slug_uz || "",
        alt_picture_uz: p.uz?.alt_picture_uz || "",
        name_uz: p.uz?.name_uz || "",
        slug_uz: p.uz?.slug_uz || "",
        title_uz: p.uz?.title_uz || "",
        meta_description_uz: "",
        short_description_uz: "",
        product_description_uz: "",
      },
      ru: {
        unit_ru: p.ru?.unit_ru || "шт",
        category_ru: p.ru?.category_ru || "",
        category_slug_ru: p.ru?.category_slug_ru || "",
        alt_picture_ru: p.ru?.alt_picture_ru || "",
        name_ru: p.ru?.name_ru || "",
        slug_ru: p.ru?.slug_ru || "",
        title_ru: p.ru?.title_ru || "",
        meta_description_ru: "",
        short_description_ru: "",
        product_description_ru: "",
      },
      attributes: [],
      related_products: [],
      recommended_products: [],
    };
  }

  const paginatedResults = filtered
    .slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)
    .map(toCardProduct);

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col">
      <Header tree={tree} categories={categories} brands={brands} />
      <PromoNav />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full space-y-6">
        <Breadcrumbs items={[{ name: isUz ? "Qidiruv" : "Поиск" }]} />

        {/* Search Title */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-sora-50 dark:bg-sora-950/60 text-sora-600 dark:text-sora-400 flex items-center justify-center shrink-0">
            <Search className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              {q ? (
                <>
                  &quot;<span className="text-sora-600 dark:text-sora-400">{q}</span>&quot;{" "}
                  {isUz ? "bo'yicha qidiruv natijalari" : "результаты поиска"}
                </>
              ) : isUz ? (
                "Qidiruv"
              ) : (
                "Поиск товаров"
              )}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              {totalItems} {isUz ? "ta mahsulot topildi" : "товаров найдено"}
            </p>
          </div>
        </div>

        {/* Main Content: Filter Sidebar + Search Results */}
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-8 pt-2 sm:pt-4">
          {/* Faceted Filter Sidebar (Desktop) & Bottom Sheet (Mobile) */}
          <FacetedFilter
            brands={searchBrands}
            categories={searchCategories}
            minPossiblePrice={minSearchPrice}
            maxPossiblePrice={maxSearchPrice}
            totalMatchedCount={totalItems}
            pricePresets={dynamicPricePresets}
            discountCount={discountCount}
            inStockCount={inStockCount}
          />

          {/* Results Column */}
          <div className="flex-1 space-y-4 sm:space-y-6">
            {/* Toolbar */}
            <div className="flex items-center justify-between pb-2 sm:pb-3 border-b border-slate-200 dark:border-slate-800">
              <span className="text-xs font-semibold text-slate-500">
                {totalItems > 0
                  ? isUz
                    ? `${(currentPage - 1) * PAGE_SIZE + 1}–${Math.min(
                        currentPage * PAGE_SIZE,
                        totalItems
                      )} / jami ${totalItems} ta`
                    : `Показано: ${(currentPage - 1) * PAGE_SIZE + 1}–${Math.min(
                        currentPage * PAGE_SIZE,
                        totalItems
                      )} из ${totalItems}`
                  : isUz
                  ? "Natijalar ro'yxati"
                  : "Список результатов"}
              </span>
              <div className="hidden lg:block">
                <SortSelect />
              </div>
            </div>

            {/* Active Filter Chips */}
            <ActiveFilterChips categoryNameMap={categoryNameMap} />

            {/* Results Grid or Clean Empty States */}
            {paginatedResults.length > 0 ? (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                  {paginatedResults.map((p) => (
                    <ProductCard key={p.id} product={p} />
                  ))}
                </div>

                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={totalItems}
                  pageSize={PAGE_SIZE}
                  baseUrl="/search"
                  searchParams={query}
                />
              </>
            ) : (
              <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                  <PackageX className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    {isUz
                      ? `"${q}" bo'yicha hech qanday mahsulot topilmadi`
                      : `По запросу "${q}" ничего не найдено`}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
                    {isUz
                      ? "Iltimos, so'z to'g'ri yozilganligini tekshiring, boshqa filtrlarni olib tashlang yoki umumiyroq so'rov kiriting."
                      : "Проверьте правильность написания, сбросьте фильтры или используйте более общие слова."}
                  </p>
                </div>
                <div className="pt-2">
                  <Link
                    href="/catalog"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sora-600 hover:bg-sora-700 text-white font-semibold text-xs transition-colors shadow-xs"
                  >
                    <span>{isUz ? "Katalogga o'tish" : "Перейти в каталог"}</span>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
      <MobileNav />
    </div>
  );
}
