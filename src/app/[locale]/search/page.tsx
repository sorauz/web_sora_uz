import { setRequestLocale } from "next-intl/server";
import { api } from "@/lib/api";
import { Header } from "@/components/layout/Header";
import { PromoNav } from "@/components/layout/PromoNav";
import { Footer } from "@/components/layout/Footer";
import { MobileNav } from "@/components/layout/MobileNav";
import { Breadcrumbs } from "@/components/discovery/Breadcrumbs";
import { ProductCard } from "@/components/discovery/ProductCard";
import { SortSelect } from "@/components/discovery/SortSelect";
import { getProductLocalized } from "@/lib/schemas/product";
import { calculateProductPrice } from "@/lib/utils/price";
import { Metadata } from "next";
import { Search } from "lucide-react";

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
    title: `"${q}" bo'yicha qidiruv natijalari — Sora.uz`,
    description: isUz
      ? `Sora.uz do'konida "${q}" so'rovi bo'yicha topilgan tovarlar.`
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

  let results = products.filter((p) => {
    if (!q) return true;
    const loc = getProductLocalized(p, isUz ? "uz" : "ru");
    const name = loc.name.toLowerCase();
    const sku = p.product_sku.toLowerCase();
    const brand = p.brand.toLowerCase();
    return name.includes(q) || sku.includes(q) || brand.includes(q);
  });

  // Sorting
  const sort = typeof query.sort === "string" ? query.sort : "popular";
  if (sort === "price_asc") {
    results.sort(
      (a, b) => calculateProductPrice(a.price).price - calculateProductPrice(b.price).price
    );
  } else if (sort === "price_desc") {
    results.sort(
      (a, b) => calculateProductPrice(b.price).price - calculateProductPrice(a.price).price
    );
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

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full space-y-6">
        <Breadcrumbs items={[{ name: isUz ? "Qidiruv" : "Поиск" }]} />

        {/* Search Title */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-sora-50 dark:bg-sora-950/60 text-sora-600 dark:text-sora-400 flex items-center justify-center">
            <Search className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              {q ? (
                <>
                  &quot;<span className="text-sora-600 dark:text-sora-400">{q}</span>&quot;{" "}
                  {isUz ? "bo'yicha qidiruv natijalari" : "результаты поиска"}
                </>
              ) : (
                isUz ? "Qidiruv" : "Поиск товаров"
              )}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              {results.length} {isUz ? "ta mahsulot topildi" : "товаров найдено"}
            </p>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
          <span className="text-xs text-slate-500 font-medium">
            {isUz ? "Natijalar ro'yxati" : "Список результатов"}
          </span>
          <SortSelect />
        </div>

        {/* Results Grid */}
        {results.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {results.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                rating={4.8}
                reviewCount={12}
              />
            ))}
          </div>
        ) : (
          <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3">
            <p className="text-base font-bold text-slate-800 dark:text-slate-200">
              {isUz
                ? `"${q}" so'rovi bo'yicha hech qanday mahsulot topilmadi`
                : `По запросу "${q}" ничего не найдено`}
            </p>
            <p className="text-xs text-slate-500">
              {isUz
                ? "Iltimos, so'z to'g'ri yozilganligini tekshiring yoki umumiyroq so'rov kiriting."
                : "Проверьте правильность написания или используйте другие слова."}
            </p>
          </div>
        )}
      </main>

      <Footer />
      <MobileNav />
    </div>
  );
}
