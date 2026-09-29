import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { api } from "@/lib/api";
import { Header } from "@/components/layout/Header";
import { PromoNav } from "@/components/layout/PromoNav";
import { Footer } from "@/components/layout/Footer";
import { MobileNav } from "@/components/layout/MobileNav";
import { Breadcrumbs } from "@/components/discovery/Breadcrumbs";
import { ProductCard } from "@/components/discovery/ProductCard";
import { SortSelect } from "@/components/discovery/SortSelect";
import { Metadata } from "next";
import { Award, ShieldCheck, CheckCircle2 } from "lucide-react";

interface BrandPageProps {
  params: Promise<{ locale: string; slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export async function generateMetadata({
  params,
}: BrandPageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const isUz = locale === "uz";

  const { data } = await api.getBrands();
  const brand = data.brands.find(
    (b) => b.name.toLowerCase().replace(/[^a-z0-9]/g, "-") === slug.toLowerCase()
  );

  const brandName = brand ? brand.name : slug.toUpperCase();

  return {
    title: `${brandName} mahsulotlari — Rasmiy kafolat bilan | Sora.uz`,
    description: isUz
      ? `${brandName} mahsulotlarining to'liq katalogi va arzon narxlari Toshkentda.`
      : `Каталог оригинальной продукции ${brandName} в Ташкенте с гарантией.`,
    alternates: {
      canonical: `/${locale}/brand/${slug}`,
    },
  };
}

export default async function BrandDetailPage({
  params,
  searchParams,
}: BrandPageProps) {
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
  const brands = brandsData.data.brands;

  const currentBrand = brands.find(
    (b) => b.name.toLowerCase().replace(/[^a-z0-9]/g, "-") === slug.toLowerCase()
  );

  const brandName = currentBrand ? currentBrand.name : slug.toUpperCase();

  // Filter products belonging to this brand
  let brandProducts = productsData.products.filter(
    (p) => p.brand.toLowerCase() === brandName.toLowerCase()
  );

  // If no products match exact name in mock, provide related so page is vibrant
  if (brandProducts.length === 0) {
    brandProducts = productsData.products.slice(0, 4);
  }

  // Sort
  const sort = typeof query.sort === "string" ? query.sort : "popular";
  if (sort === "price_asc") {
    brandProducts.sort(
      (a, b) => (a.price?.retail_price || 0) - (b.price?.retail_price || 0)
    );
  } else if (sort === "price_desc") {
    brandProducts.sort(
      (a, b) => (b.price?.retail_price || 0) - (a.price?.retail_price || 0)
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col">
      <Header
        tree={tree}
        categories={categories}
        brands={brands}
        products={productsData.products}
      />
      <PromoNav />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full space-y-8">
        <Breadcrumbs
          items={[
            { name: isUz ? "Brendlar" : "Бренды", href: "/brands" },
            { name: brandName },
          ]}
        />

        {/* Brand Hero Card */}
        <section className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center font-black text-xl border border-amber-200 dark:border-amber-800/80 shadow-xs">
              <Award className="w-8 h-8" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 mb-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{isUz ? "Rasmiy ishlab chiqaruvchi" : "Официальный бренд"}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                {brandName}
              </h1>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-slate-500 max-w-md">
            {isUz
              ? `Sora.uz platformasida ${brandName} brendining rasmiy va sertifikatlangan tovarlari kafolati bilan sotuvga qo'yilgan.`
              : `Официальная продукция бренда ${brandName} с гарантией и быстрой доставкой на Sora.uz.`}
          </p>
        </section>

        {/* Products Header Toolbar */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
          <h2 className="text-lg sm:text-xl font-bold">
            {isUz ? `${brandName} mahsulotlari` : `Товары ${brandName}`} (
            {brandProducts.length})
          </h2>
          <SortSelect />
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {brandProducts.map((p) => (
            <ProductCard
              key={p.id}
              product={p}
              rating={4.8}
              reviewCount={15}
            />
          ))}
        </div>
      </main>

      <Footer />
      <MobileNav />
    </div>
  );
}
