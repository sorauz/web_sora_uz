import { setRequestLocale } from "next-intl/server";
import { Metadata } from "next";
import { Suspense } from "react";
import { api } from "@/lib/api";
import { Header } from "@/components/layout/Header";
import { PromoNav } from "@/components/layout/PromoNav";
import { Footer } from "@/components/layout/Footer";
import { MobileNav } from "@/components/layout/MobileNav";
import { OrdersHistoryClient } from "@/components/orders/OrdersHistoryClient";
import { CatalogProductMap } from "@/lib/types/catalog-summary";

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

  const [{ tree, categories }, brandsRes, productsRes] = await Promise.all([
    api.getCategories(),
    api.getBrands(),
    api.getAllProducts(),
  ]);

  const productsMap: CatalogProductMap = {};
  for (const p of productsRes.products || []) {
    if (p.id) {
      productsMap[p.id] = {
        id: p.id,
        sku: p.product_sku || "",
        name_uz: p.uz?.name_uz || "",
        name_ru: p.ru?.name_ru || "",
        slug_uz: p.uz?.slug_uz || "",
        slug_ru: p.ru?.slug_ru || "",
        picture: p.main_picture || "",
        price:
          typeof p.price === "object" && p.price
            ? p.price.retail_price
            : undefined,
        unit_uz: p.uz?.unit_uz || "dona",
        unit_ru: p.ru?.unit_ru || "шт",
      };
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/40 dark:bg-slate-950 text-slate-900 pb-20 md:pb-0">
      <Header
        tree={tree}
        categories={categories}
        brands={brandsRes.data.brands}
        products={productsRes.products}
      />
      <PromoNav />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Suspense
          fallback={
            <div className="max-w-4xl mx-auto py-8 space-y-4">
              <div className="h-8 w-56 bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse" />
              <div className="h-28 bg-slate-100 dark:bg-slate-800/60 rounded-3xl animate-pulse" />
              <div className="h-28 bg-slate-100 dark:bg-slate-800/60 rounded-3xl animate-pulse" />
            </div>
          }
        >
          <OrdersHistoryClient
            locale={currentLocale}
            productsMap={productsMap}
          />
        </Suspense>
      </main>

      <Footer />
      <MobileNav />
    </div>
  );
}
