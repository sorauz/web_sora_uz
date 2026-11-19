import { setRequestLocale } from "next-intl/server";
import { notFound, redirect } from "next/navigation";
import { Metadata } from "next";
import { api } from "@/lib/api";
import { getProductLocalized } from "@/lib/schemas/product";
import { calculateProductPrice } from "@/lib/utils/price";
import { getValidMpn, resolveProductImageUrl } from "@/lib/utils/merchant";
import { Header } from "@/components/layout/Header";
import { PromoNav } from "@/components/layout/PromoNav";
import { Footer } from "@/components/layout/Footer";
import { Breadcrumbs } from "@/components/discovery/Breadcrumbs";
import { findCategoryBySlug, getCategoryBreadcrumb } from "@/lib/utils/category-tree";
import { ProductGallery } from "@/components/pdp/ProductGallery";
import { ProductActions } from "@/components/pdp/ProductActions";
import { ProductTabs } from "@/components/pdp/ProductTabs";
import { MobileStickyCTA } from "@/components/pdp/MobileStickyCTA";
import { ProductJsonLd } from "@/components/seo/ProductJsonLd";
import { FaqJsonLd } from "@/components/seo/FaqJsonLd";
import { resolveProductFaqs } from "@/lib/utils/faq-resolver";
import { ProductCard } from "@/components/discovery/ProductCard";
import { Star, ShieldCheck, Layers } from "lucide-react";
import { Link } from "@/i18n/routing";

interface ProductPageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export const revalidate = 86400;

export async function generateStaticParams() {
  const { products } = await api.getAllProducts();
  const params: { locale: string; slug: string }[] = [];
  for (const p of products.slice(0, 60)) {
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
      title: isUz ? "Mahsulot topilmadi" : "Товар не найден",
    };
  }

  const expectedSlug = isUz ? product.uz.slug_uz : product.ru.slug_ru;
  const loc = getProductLocalized(product, isUz ? "uz" : "ru");
  const titleSuffix = isUz ? "— narxi, xususiyatlari" : "— цена, характеристики";
  const title = `${loc.title || loc.name} ${titleSuffix}`;
  const description =
    loc.meta_description ||
    loc.short_description ||
    (isUz
      ? `${loc.name} arzon narxda va kafolat bilan Toshkentda xarid qiling.`
      : `Купить ${loc.name} по доступной цене с официальной гарантией в Ташкенте.`);

  const ogImageUrl = resolveProductImageUrl(product.main_picture, {
    updatedAt: product.updated_at,
  });

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
      types: {
        "text/markdown": `https://sora.uz/${locale}/products/${expectedSlug}.md`,
      },
    },
    openGraph: {
      title,
      description,
      url: `https://sora.uz/${locale}/products/${expectedSlug}`,
      siteName: "Sora.uz",
      locale: isUz ? "uz_UZ" : "ru_RU",
      type: "website",
      images: [
        {
          url: ogImageUrl,
          alt: loc.name,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImageUrl],
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
  const priceInfo = calculateProductPrice(product.price);

  // Fetch categories, brands, all products, live reviews, and FAQs
  const [{ tree, categories }, brandsRes, allProdsRes, reviewsRes, faqsRes] =
    await Promise.all([
      api.getCategories(),
      api.getBrands(),
      api.getAllProducts(),
      api.getReviewsByProductId(product.id),
      api.getFaqs(),
    ]);
  const allProducts = allProdsRes.products;
  const { reviews, stats } = reviewsRes;

  // 1. O'xshash mahsulotlar (Up-sell / Down-sell: 1C recommended_products ichida xuddi shu toifadagi o'xshash mahsulotlar keladi)
  let relatedProducts: typeof allProducts = [];
  if (product.recommended_products && product.recommended_products.length > 0) {
    const matchedList: typeof allProducts = [];
    for (const rec of product.recommended_products) {
      const targetId = rec.recommended_products_id || rec.id;
      const found = allProducts.find(
        (p) =>
          (targetId && p.id === targetId) ||
          (rec.slug_uz && p.uz?.slug_uz === rec.slug_uz) ||
          (rec.slug_ru && p.ru?.slug_ru === rec.slug_ru) ||
          (rec.name_uz && p.uz?.name_uz === rec.name_uz)
      );
      if (
        found &&
        found.id !== product.id &&
        !matchedList.some((m) => m.id === found.id)
      ) {
        matchedList.push(found);
      }
    }
    relatedProducts = matchedList;
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

  // 2. Bilan birga xarid qilinadi (Cross-sell: 1C related_products ichida birga xarid qilinadigan yondosh mahsulotlar keladi)
  let recommendedProducts: typeof allProducts = [];
  if (product.related_products && product.related_products.length > 0) {
    const matchedList: typeof allProducts = [];
    for (const r of product.related_products) {
      const targetId = r.related_products_id || r.id;
      const found = allProducts.find(
        (p) =>
          (targetId && p.id === targetId) ||
          (r.slug_uz && p.uz?.slug_uz === r.slug_uz) ||
          (r.slug_ru && p.ru?.slug_ru === r.slug_ru) ||
          (r.name_uz && p.uz?.name_uz === r.name_uz)
      );
      if (
        found &&
        found.id !== product.id &&
        !relatedProducts.some((rel) => rel.id === found.id) &&
        !matchedList.some((m) => m.id === found.id)
      ) {
        matchedList.push(found);
      }
    }
    recommendedProducts = matchedList;
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

  // Resolve full category hierarchy breadcrumb (e.g. Katalog -> Qog'oz mahsulotlari -> Chop etish uchun qog'oz -> Mahsulot nomi)
  const matchedCategory = loc.category_slug
    ? findCategoryBySlug(tree, loc.category_slug, currentLocale) ||
      findCategoryBySlug(tree, loc.category_slug, "uz") ||
      findCategoryBySlug(tree, loc.category_slug, "ru")
    : null;

  const categoryPath = matchedCategory
    ? getCategoryBreadcrumb(categories, matchedCategory.id)
    : [];

  const categoryBreadcrumbs =
    categoryPath.length > 0
      ? categoryPath.map((c) => ({
          name: currentLocale === "uz" ? c.group_uz : c.group_ru,
          href: `/category/${currentLocale === "uz" ? c.group_slug_uz : c.group_slug_ru}`,
        }))
      : loc.category
      ? [
          {
            name: loc.category,
            href: `/category/${loc.category_slug}`,
          },
        ]
      : [];

  const breadcrumbItems = [
    {
      name: currentLocale === "uz" ? "Katalog" : "Каталог",
      href: "/catalog",
    },
    ...categoryBreadcrumbs,
    {
      name: loc.name,
    },
  ];

  const productFaqs = resolveProductFaqs(faqsRes.faqs, {
    product,
    categories,
    brands: brandsRes.data.brands,
    categoryId: matchedCategory?.id,
    locale: currentLocale,
  });

  const resolvedOgImage = resolveProductImageUrl(product.main_picture, {
    updatedAt: product.updated_at,
  });
  const validMpn = getValidMpn(product.product_sku);

  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-900 pb-20 md:pb-0">
      {/* OpenGraph E-Commerce Product Metadata */}
      <meta property="og:type" content="product" />
      <meta property="og:site_name" content="Sora.uz" />
      <meta property="og:title" content={loc.title || loc.name} />
      <meta property="og:description" content={loc.meta_description || loc.short_description || loc.name} />
      <meta property="og:url" content={`https://sora.uz/${currentLocale}/products/${expectedSlug}`} />
      <meta property="og:image" content={resolvedOgImage} />
      {priceInfo.price > 0 && (
        <>
          <meta property="product:price:amount" content={priceInfo.price.toString()} />
          <meta property="product:price:currency" content="UZS" />
        </>
      )}
      <meta property="product:availability" content={product.price?.stock !== "OutOfStock" ? "in stock" : "out of stock"} />
      {product.brand && <meta property="product:brand" content={product.brand} />}
      {validMpn && <meta property="product:retailer_item_id" content={validMpn} />}
      <ProductJsonLd
        product={product}
        locale={currentLocale}
        reviews={reviews}
        stats={stats}
        breadcrumbItems={breadcrumbItems}
      />
      <FaqJsonLd items={productFaqs} />
      <Header
        tree={tree}
        categories={categories}
        brands={brandsRes.data.brands}
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
                      <span>{currentLocale === "uz" ? "100% Original" : "100% Оригинал"}</span>
                    </span>
                  </div>

                  {/* Rating & Reviews summary (Only shown when real reviews exist) */}
                  {stats && stats.reviewCount > 0 && (
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <div className="flex items-center text-amber-400">
                        <Star className="w-4 h-4 fill-current" />
                        <span className="ml-1 font-bold text-slate-800 dark:text-slate-200">
                          {stats.averageRating}
                        </span>
                      </div>
                      <span>•</span>
                      <span className="text-slate-500">
                        {`${stats.reviewCount} ${currentLocale === "uz" ? "sharh" : "отзыва"}`}
                      </span>
                    </div>
                  )}
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
          faqs={productFaqs}
        />

        {/* Distinct Section 1: Related Products (Substitute / Up-sell / Down-sell) */}
        {relatedProducts.length > 0 && (
          <section className="space-y-4 pt-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                  {currentLocale === "uz"
                    ? "O'xshash mahsulotlar"
                    : "Похожие товары"}
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                  {currentLocale === "uz"
                    ? "Ushbu toifadagi xaridorgir muqobil modellar"
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
                    ? "Bilan birga xarid qilinadi"
                    : "С этим товаром также покупают"}
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

      {/* Mobile Sticky CTA bar (Yagona pastki xarid paneli - MobileNav bilan ustma-ust tushmasligi uchun) */}
      <MobileStickyCTA product={product} locale={currentLocale} />

      <Footer />
    </div>
  );
}
