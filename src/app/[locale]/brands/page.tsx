import { setRequestLocale } from "next-intl/server";
import { api } from "@/lib/api";
import { Header } from "@/components/layout/Header";
import { PromoNav } from "@/components/layout/PromoNav";
import { Footer } from "@/components/layout/Footer";
import { MobileNav } from "@/components/layout/MobileNav";
import { Breadcrumbs } from "@/components/discovery/Breadcrumbs";
import { BrandCard } from "@/components/discovery/BrandCard";
import { Metadata } from "next";

interface BrandsPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: BrandsPageProps): Promise<Metadata> {
  const { locale } = await params;
  const isUz = locale === "uz";
  return {
    title: isUz ? "Barcha Brendlar — Sora.uz" : "Все Бренды — Sora.uz",
    description: isUz
      ? "Sora.uz do'konidagi rasmiy ishlab chiqaruvchilar: DELI, Samsung, Logitech, Canon, HP va boshqalar."
      : "Официальные бренды магазина Sora.uz: DELI, Samsung, Logitech, Canon, HP и другие.",
    alternates: {
      canonical: `https://sora.uz/${locale}/brands`,
      languages: {
        uz: "https://sora.uz/uz/brands",
        "uz-UZ": "https://sora.uz/uz/brands",
        ru: "https://sora.uz/ru/brands",
        "ru-UZ": "https://sora.uz/ru/brands",
        "x-default": "https://sora.uz/uz/brands",
      },
    },
  };
}

export default async function BrandsPage({ params }: BrandsPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const isUz = locale === "uz";

  const [categoriesData, brandsData, productsData] = await Promise.all([
    api.getCategories(),
    api.getBrands(),
    api.getAllProducts(),
  ]);

  const { tree, categories } = categoriesData;
  const brands = brandsData.data.brands;

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
        <Breadcrumbs items={[{ name: isUz ? "Brendlar" : "Бренды" }]} />

        <div className="space-y-2">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            {isUz ? "Rasmiy brendlar katalogi" : "Каталог официальных брендов"}
          </h1>
          <p className="text-sm text-slate-500">
            {isUz
              ? "Biz faqat original va sertifikatlangan ishlab chiqaruvchilar bilan hamkorlik qilamiz."
              : "Мы работаем только с оригинальными и сертифицированными брендами."}
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {brands.map((b) => (
            <BrandCard key={b.id} brand={b} />
          ))}
        </div>
      </main>

      <Footer />
      <MobileNav />
    </div>
  );
}
