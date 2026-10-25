import { setRequestLocale } from "next-intl/server";
import { Metadata } from "next";
import { api } from "@/lib/api";
import { Header } from "@/components/layout/Header";
import { PromoNav } from "@/components/layout/PromoNav";
import { Footer } from "@/components/layout/Footer";
import { MobileNav } from "@/components/layout/MobileNav";
import { Breadcrumbs } from "@/components/discovery/Breadcrumbs";
import { CartView } from "@/components/cart/CartView";

interface CartPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({
  params,
}: CartPageProps): Promise<Metadata> {
  const { locale } = await params;
  const isUz = locale === "uz";

  return {
    title: isUz ? "Xaridlar savatchasi" : "Корзина покупок",
    description: isUz
      ? "Sora.uz internet do'konidagi xaridlaringiz savatchasi. Tezkor buyurtma va qulay to'lov."
      : "Корзина ваших покупок в интернет-магазине Sora.uz. Быстрое оформление и удобная оплата.",
    robots: {
      index: false,
      follow: false,
    },
    alternates: {
      canonical: `/${locale}/cart`,
    },
  };
}

export default async function CartPage({ params }: CartPageProps) {
  const { locale } = await params;
  const currentLocale = (locale === "ru" ? "ru" : "uz") as "uz" | "ru";
  setRequestLocale(currentLocale);

  const [{ tree, categories }, brandsRes, allProdsRes] = await Promise.all([
    api.getCategories(),
    api.getBrands(),
    api.getAllProducts(),
  ]);

  const localizationMap: Record<
    string,
    { name_uz: string; name_ru: string; slug_uz: string; slug_ru: string }
  > = {};
  for (const p of allProdsRes.products) {
    localizationMap[p.id] = {
      name_uz: p.uz?.name_uz || "",
      name_ru: p.ru?.name_ru || "",
      slug_uz: p.uz?.slug_uz || "",
      slug_ru: p.ru?.slug_ru || "",
    };
  }

  const breadcrumbs = [
    {
      name: currentLocale === "uz" ? "Savatcha" : "Корзина",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-900 pb-20 md:pb-0">
      <Header
        tree={tree}
        categories={categories}
        brands={brandsRes.data.brands}
      />
      <PromoNav />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <Breadcrumbs items={breadcrumbs} />
        <CartView localizationMap={localizationMap} />
      </main>

      <Footer />
      <MobileNav />
    </div>
  );
}
