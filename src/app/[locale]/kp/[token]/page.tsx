import { setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import { api } from "@/lib/api";
import { Header } from "@/components/layout/Header";
import { PromoNav } from "@/components/layout/PromoNav";
import { Footer } from "@/components/layout/Footer";
import { MobileNav } from "@/components/layout/MobileNav";
import { fetchSanitizedPublicKp } from "@/lib/kp/public-service";
import { KpPublicView } from "@/components/kp/KpPublicView";
import { buildCatalogProductMap } from "@/lib/types/catalog-summary";

export const dynamic = "force-dynamic";

interface PublicKpPageProps {
  params: Promise<{ locale: string; token: string }>;
}

export async function generateMetadata({
  params,
}: PublicKpPageProps): Promise<Metadata> {
  const { locale } = await params;
  const isUz = locale === "uz";

  return {
    title: isUz
      ? "Tijorat taklifi (Elektron pasport) | Sora.uz"
      : "Коммерческое предложение (Электронный паспорт) | Sora.uz",
    robots: {
      index: false,
      follow: false,
      nocache: true,
    },
  };
}

export default async function PublicKpPage({ params }: PublicKpPageProps) {
  const { locale, token } = await params;
  const currentLocale = (locale === "ru" ? "ru" : "uz") as "uz" | "ru";
  setRequestLocale(currentLocale);

  const [{ tree, categories }, brandsRes, productsRes, kpRes] =
    await Promise.all([
      api.getCategories(),
      api.getBrands(),
      api.getAllProducts(),
      fetchSanitizedPublicKp(token),
    ]);

  const productsMap = buildCatalogProductMap(productsRes.products);

  let publicKp = null;
  let expectedClientId: string | undefined;
  let initialError = "";

  if (kpRes.success) {
    const { client_id, ...rest } = kpRes.kp;
    expectedClientId = client_id;
    publicKp = rest;
  } else {
    initialError = kpRes.error;
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
        <KpPublicView
          locale={currentLocale}
          token={token}
          initialKp={publicKp}
          initialError={initialError}
          expectedClientId={expectedClientId}
          productsMap={productsMap}
        />
      </main>

      <Footer />
      <MobileNav />
    </div>
  );
}
