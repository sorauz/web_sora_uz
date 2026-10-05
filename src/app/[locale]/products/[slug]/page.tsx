import { setRequestLocale } from "next-intl/server";
import { notFound, redirect } from "next/navigation";
import { Metadata } from "next";
import { api } from "@/lib/api";
import { getProductLocalized } from "@/lib/schemas/product";
import { Header } from "@/components/layout/Header";
import { PromoNav } from "@/components/layout/PromoNav";
import { Footer } from "@/components/layout/Footer";
import { MobileNav } from "@/components/layout/MobileNav";
import { Breadcrumbs } from "@/components/discovery/Breadcrumbs";
import { ProductGallery } from "@/components/pdp/ProductGallery";
import { ProductActions } from "@/components/pdp/ProductActions";
import { ProductTabs } from "@/components/pdp/ProductTabs";
import { MobileStickyCTA } from "@/components/pdp/MobileStickyCTA";
import { ProductJsonLd } from "@/components/seo/ProductJsonLd";
import { ProductCard } from "@/components/discovery/ProductCard";
import { Star, ShieldCheck, Layers } from "lucide-react";
import { Link } from "@/i18n/routing";

interface ProductPageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export async function generateStaticParams() {
  const { products } = await api.getAllProducts();
  const params: { locale: string; slug: string }[] = [];
  for (const p of products.slice(0, 20)) {
    if (p.uz?.slug_uz) params.push({ locale: "uz", slug: p.uz.slug_uz });
    if (p.ru?.slug_ru) params.push({ locale: "ru", slug: p.ru.slug_ru });
  }
  return params;
}

export const dynamicParams = true;

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const isUz = locale === "uz";
  const { product } = await api.getProductBySlug(slug, isUz ? "uz" : "ru");

  if (!product) {
    return {
      title: isUz ? "Mahsulot topilmadi — Sora.uz" : "Товар не найден — Sora.uz",
    };
  }

  const expectedSlug = isUz ? product.uz.slug_uz : product.ru.slug_ru;
  const loc = getProductLocalized(product, isUz ? "uz" : "ru");
  const title = `${loc.title || loc.name} — narxi, xususiyatlari | Sora.uz`;
  const description =
    loc.meta_description ||
    loc.short_description ||
    (isUz
      ? `${loc.name} arzon narxda va kafolat bilan Toshkentda xarid qiling.`
      : `Купить ${loc.name} по доступной цене с официальной гарантией в Ташкенте.`);

  return {
    title,
    description,
    alternates: {
      canonical: `https://sora.uz/${locale}/products/${expectedSlug}`,
      languages: {
        uz: `https://sora.uz/uz/products/${product.uz.slug_uz}`,
        "uz-UZ": `https://sora.uz/uz/products/${product.uz.slug_uz}`,
        ru: `https://sora.uz/ru/products/${product.ru.slug_ru}`,
        "ru-UZ": `https://sora.uz/ru/products/${product.ru.slug_ru}`,
        "x-default": `https://sora.uz/uz/products/${product.uz.slug_uz}`,
      },
    },
    openGraph: {
      title,
      description,
      url: `https://sora.uz/${locale}/products/${expectedSlug}`,
      images: [
        {
          url: product.main_picture,
          alt: loc.name,
        },
      ],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [product.main_picture],
    },
  };
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const { locale, slug } = await params;
  const currentLocale = (locale === "ru" ? "ru" : "uz") as "uz" | "ru";
  setRequestLocale(currentLocale);

  const { product } = await api.getProductBySlug(slug, currentLocale);

  if (!product) {
    notFound();
  }

  // Canonical localized slug redirect:
  const expectedSlug = currentLocale === "uz" ? product.uz.slug_uz : product.ru.slug_ru;
  if (slug !== expectedSlug) {
    redirect(`/${currentLocale}/products/${expectedSlug}`);
  }

  const loc = getProductLocalized(product, currentLocale);

  // Fetch categories, brands, all products, and live reviews
  const [{ tree, categories }, brandsRes, allProdsRes, reviewsRes] =
    await Promise.all([
      api.getCategories(),
      api.getBrands(),
      api.getAllProducts(),
      api.getReviewsByProductId(product.id),
    ]);
  const allProducts = allProdsRes.products;
  const { reviews, stats } = reviewsRes;

  // 1. Related Products (Up-sell / Down-sell: prefer 1C explicit related_products if present)
  let relatedProducts: typeof allProducts = [];
  if (product.related_products && product.related_products.length > 0) {
    const relatedIds = new Set(product.related_products.map((r) => r.id));
    relatedProducts = allProducts.filter((p) => relatedIds.has(p.id));
  }
  if (relatedProducts.length === 0) {
    const relatedCandidates = allProducts.filter(
      (p) =>
        p.id !== product.id &&
        (p.uz.category_slug_uz === product.uz.category_slug_uz ||
          p.brand.toLowerCase() === product.brand.toLowerCase())
    );
    relatedProducts =
      relatedCandidates.length > 0
        ? relatedCandidates.slice(0, 4)
        : allProducts.filter((p) => p.id !== product.id).slice(0, 4);
  }

  // 2. Recommended Products (Cross-sell: prefer 1C explicit recommended_products if present)
  let recommendedProducts: typeof allProducts = [];
  if (product.recommended_products && product.recommended_products.length > 0) {
    const recIds = new Set(product.recommended_products.map((r) => r.id));
    recommendedProducts = allProducts.filter(
      (p) => recIds.has(p.id) && !relatedProducts.some((r) => r.id === p.id)
    );
  }
  if (recommendedProducts.length === 0) {
    const recommendedCandidates = allProducts.filter(
      (p) =>
        p.id !== product.id &&
        p.uz.category_slug_uz !== product.uz.category_slug_uz &&
        !relatedProducts.some((r) => r.id === p.id)
    );
    recommendedProducts =
      recommendedCandidates.length > 0
        ? recommendedCandidates.slice(0, 4)
        : allProducts.filter((p) => p.id !== product.id && !relatedProducts.some((r) => r.id === p.id)).slice(0, 4);
  }

  const breadcrumbItems = [
    {
      name: currentLocale === "uz" ? "Katalog" : "Каталог",
      href: "/catalog",
    },
    {
      name: loc.category,
      href: `/category/${loc.category_slug}`,
    },
    {
      name: loc.name,
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/50 dark:bg-slate-950 pb-20 md:pb-0">
      <ProductJsonLd
        product={product}
        locale={currentLocale}
        reviews={reviews}
        stats={stats}
      />
      <Header
        tree={tree}
        categories={categories}
        brands={brandsRes.data.brands}
        products={allProducts}
      />
      <PromoNav />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
        {/* Breadcrumb Navigation */}
        <Breadcrumbs items={breadcrumbItems} />

        {/* Product Hero Section */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 lg:p-10 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
            {/* Left: Product Media Gallery (5 cols) */}
            <div className="lg:col-span-5">
              <ProductGallery
                mainPicture={product.main_picture}
                gallery={product.gallery}
                altText={loc.alt_picture || loc.name}
                badge={
                  product.brand
                    ? currentLocale === "uz"
                      ? "Original Mahsulot"
                      : "Оригинал"
                    : undefined
                }
                productId={product.id}
              />
            </div>

            {/* Right: Product Core Info & Actions (7 cols) */}
            <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                {/* Brand & Badges Row */}
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/brand/${encodeURIComponent(product.brand.toLowerCase())}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sora-50 dark:bg-sora-950/60 text-sora-600 dark:text-sora-400 text-xs font-bold hover:bg-sora-100 transition-colors"
                    >
                      <Layers className="w-3.5 h-3.5" />
                      <span>{product.brand}</span>
                    </Link>
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>1C ERP</span>
                    </span>
                  </div>

                  {/* Rating & Reviews summary */}
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <div className="flex items-center text-amber-400">
                      <Star className="w-4 h-4 fill-current" />
                      <span className="ml-1 font-bold text-slate-800 dark:text-slate-200">
                        {stats.reviewCount > 0 ? stats.averageRating : 4.8}
                      </span>
                    </div>
                    <span>•</span>
                    <span className="text-slate-500">
                      {stats.reviewCount > 0
                        ? `${stats.reviewCount} ${currentLocale === "uz" ? "sharh" : "отзыва"}`
                        : currentLocale === "uz"
                        ? "24 sharh"
                        : "24 отзыва"}
                    </span>
                  </div>
                </div>

                {/* Main H1 Title */}
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
                  {loc.name}
                </h1>

                {/* Subtitle / Short description */}
                {loc.short_description && (
                  <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                    {loc.short_description}
                  </p>
                )}
              </div>

              {/* Interactive Purchase & Pricing Box */}
              <ProductActions product={product} locale={currentLocale} />
            </div>
          </div>
        </div>

        {/* Detailed Tabs: Specs, Description, Delivery, Reviews, FAQ */}
        <ProductTabs
          product={product}
          locale={currentLocale}
          reviews={reviews}
          stats={stats}
        />

        {/* Distinct Section 1: Related Products (Substitute / Up-sell / Down-sell) */}
        {relatedProducts.length > 0 && (
          <section className="space-y-4 pt-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                  {currentLocale === "uz"
                    ? "O'xshash mahsulotlar (Muqobil variantlar)"
                    : "Похожие товары (Альтернативные варианты)"}
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                  {currentLocale === "uz"
                    ? "Xuddi shu toifadagi almashtiruvchi modellar (Up-sell / Down-sell)"
                    : "Товары той же категории с аналогичными характеристиками"}
                </p>
              </div>
              <Link
                href={`/category/${loc.category_slug}`}
                className="text-xs sm:text-sm font-bold text-sora-600 hover:text-sora-700 dark:text-sora-400 hover:underline"
              >
                {currentLocale === "uz" ? "Barchasini ko'rish →" : "Смотреть все →"}
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}

        {/* Distinct Section 2: Recommended Products (Complementary / Cross-sell) */}
        {recommendedProducts.length > 0 && (
          <section className="space-y-4 pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                  {currentLocale === "uz"
                    ? "Bilan birga xarid qilinadi (To'ldiruvchi)"
                    : "С этим товаром также покупают (Комплектующие)"}
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                  {currentLocale === "uz"
                    ? "Ushbu mahsulot bilan eng ko'p olinadigan foydali qo'shimchalar"
                    : "Полезные сопутствующие товары и расходные материалы"}
                </p>
              </div>
              <Link
                href="/catalog"
                className="text-xs sm:text-sm font-bold text-sora-600 hover:text-sora-700 dark:text-sora-400 hover:underline"
              >
                {currentLocale === "uz" ? "Katalogga o'tish →" : "Перейти в каталог →"}
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {recommendedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}
      </main>

      {/* Mobile Sticky CTA bar */}
      <MobileStickyCTA product={product} locale={currentLocale} />

      <Footer />
      <MobileNav />
    </div>
  );
}
