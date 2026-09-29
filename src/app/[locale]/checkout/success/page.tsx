import { setRequestLocale } from "next-intl/server";
import { Metadata } from "next";
import { api } from "@/lib/api";
import { Header } from "@/components/layout/Header";
import { PromoNav } from "@/components/layout/PromoNav";
import { Footer } from "@/components/layout/Footer";
import { MobileNav } from "@/components/layout/MobileNav";
import { OrderSuccessView } from "@/components/checkout/OrderSuccessView";

interface SuccessPageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ orderId?: string }>;
}

export async function generateMetadata({
  params,
}: SuccessPageProps): Promise<Metadata> {
  const { locale } = await params;
  const isUz = locale === "uz";

  return {
    title: isUz
      ? "Buyurtma qabul qilindi — Sora.uz"
      : "Заказ успешно оформлен — Sora.uz",
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default async function CheckoutSuccessPage({
  params,
  searchParams,
}: SuccessPageProps) {
  const { locale } = await params;
  const { orderId } = await searchParams;
  const currentLocale = (locale === "ru" ? "ru" : "uz") as "uz" | "ru";
  setRequestLocale(currentLocale);

  const [{ tree, categories }, brandsRes, allProdsRes] = await Promise.all([
    api.getCategories(),
    api.getBrands(),
    api.getAllProducts(),
  ]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/50 dark:bg-slate-950 pb-20 md:pb-0">
      <Header
        tree={tree}
        categories={categories}
        brands={brandsRes.data.brands}
        products={allProdsRes.products}
      />
      <PromoNav />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <OrderSuccessView orderIdParam={orderId} locale={currentLocale} />
      </main>

      <Footer />
      <MobileNav />
    </div>
  );
}
