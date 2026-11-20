import { setRequestLocale } from "next-intl/server";
import { Metadata } from "next";
import { api } from "@/lib/api";
import { Header } from "@/components/layout/Header";
import { PromoNav } from "@/components/layout/PromoNav";
import { Footer } from "@/components/layout/Footer";
import { MobileNav } from "@/components/layout/MobileNav";
import { OrdersHistoryClient } from "@/components/orders/OrdersHistoryClient";

interface OrdersPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({
  params,
}: OrdersPageProps): Promise<Metadata> {
  const { locale } = await params;
  const isUz = locale === "uz";

  return {
    title: isUz ? "Mening buyurtmalarim | Sora.uz" : "Мои заказы | Sora.uz",
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default async function OrdersPage({ params }: OrdersPageProps) {
  const { locale } = await params;
  const currentLocale = (locale === "ru" ? "ru" : "uz") as "uz" | "ru";
  setRequestLocale(currentLocale);

  const [{ tree, categories }, brandsRes] = await Promise.all([
    api.getCategories(),
    api.getBrands(),
  ]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/40 dark:bg-slate-950 text-slate-900 pb-20 md:pb-0">
      <Header
        tree={tree}
        categories={categories}
        brands={brandsRes.data.brands}
      />
      <PromoNav />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <OrdersHistoryClient locale={currentLocale} />
      </main>

      <Footer />
      <MobileNav />
    </div>
  );
}
