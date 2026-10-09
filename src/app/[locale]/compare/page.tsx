import { setRequestLocale } from "next-intl/server";
import { Metadata } from "next";
import { api } from "@/lib/api";
import { Header } from "@/components/layout/Header";
import { PromoNav } from "@/components/layout/PromoNav";
import { Footer } from "@/components/layout/Footer";
import { MobileNav } from "@/components/layout/MobileNav";
import { Breadcrumbs } from "@/components/discovery/Breadcrumbs";
import { CompareView } from "@/components/compare/CompareView";

interface ComparePageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({
  params,
}: ComparePageProps): Promise<Metadata> {
  const { locale } = await params;
  const isUz = locale === "uz";

  return {
    title: isUz
      ? "Mahsulotlarni taqqoslash — Sora.uz"
      : "Сравнение товаров — Sora.uz",
    description: isUz
      ? "Tanlangan mahsulotlarning narxlari va texnik xususiyatlarini o'zaro solishtiring."
      : "Сравнение цен и технических характеристик выбранных товаров.",
    robots: {
      index: false,
      follow: false,
    },
    alternates: {
      canonical: `/${locale}/compare`,
    },
  };
}

export default async function ComparePage({ params }: ComparePageProps) {
  const { locale } = await params;
  const currentLocale = (locale === "ru" ? "ru" : "uz") as "uz" | "ru";
  setRequestLocale(currentLocale);

  const [{ tree, categories }, brandsRes, allProdsRes] = await Promise.all([
    api.getCategories(),
    api.getBrands(),
    api.getAllProducts(),
  ]);

  const breadcrumbs = [
    {
      name: currentLocale === "uz" ? "Taqqoslash" : "Сравнение",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/50 dark:bg-slate-950 pb-20 md:pb-0">
      <Header
        tree={tree}
        categories={categories}
        brands={brandsRes.data.brands}
        products={allProdsRes.products}
      />
      <PromoNav />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <Breadcrumbs items={breadcrumbs} />
        <CompareView products={allProdsRes.products} locale={currentLocale} />
      </main>

      <Footer />
      <MobileNav />
    </div>
  );
}
