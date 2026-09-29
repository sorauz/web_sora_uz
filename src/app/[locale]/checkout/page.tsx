import { setRequestLocale } from "next-intl/server";
import { Metadata } from "next";
import { api } from "@/lib/api";
import { Header } from "@/components/layout/Header";
import { PromoNav } from "@/components/layout/PromoNav";
import { Footer } from "@/components/layout/Footer";
import { MobileNav } from "@/components/layout/MobileNav";
import { Breadcrumbs } from "@/components/discovery/Breadcrumbs";
import { CheckoutForm } from "@/components/checkout/CheckoutForm";

interface CheckoutPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({
  params,
}: CheckoutPageProps): Promise<Metadata> {
  const { locale } = await params;
  const isUz = locale === "uz";

  return {
    title: isUz
      ? "Buyurtmani rasmiylashtirish — Sora.uz"
      : "Оформление заказа — Sora.uz",
    description: isUz
      ? "Sora.uz platformasida buyurtmani tez va oson rasmiylashtiring. O'zbekiston bo'ylab tezkor yetkazib berish."
      : "Быстрое и удобное оформление заказа на Sora.uz. Быстрая доставка по всему Узбекистану.",
    robots: {
      index: false,
      follow: false,
    },
    alternates: {
      canonical: `/${locale}/checkout`,
    },
  };
}

export default async function CheckoutPage({ params }: CheckoutPageProps) {
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
      name: currentLocale === "uz" ? "Savatcha" : "Корзина",
      href: "/cart",
    },
    {
      name: currentLocale === "uz" ? "Buyurtma berish" : "Оформление заказа",
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
        <CheckoutForm locale={currentLocale} />
      </main>

      <Footer />
      <MobileNav />
    </div>
  );
}
