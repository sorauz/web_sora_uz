import { setRequestLocale } from "next-intl/server";
import { notFound, redirect } from "next/navigation";
import { api } from "@/lib/api";
import { Header } from "@/components/layout/Header";
import { PromoNav } from "@/components/layout/PromoNav";
import { Footer } from "@/components/layout/Footer";
import { MobileNav } from "@/components/layout/MobileNav";
import { Breadcrumbs } from "@/components/discovery/Breadcrumbs";
import { BreadcrumbJsonLd } from "@/components/seo/BreadcrumbJsonLd";
import { ItemListJsonLd } from "@/components/seo/ItemListJsonLd";
import { ProductCard } from "@/components/discovery/ProductCard";
import { FacetedFilter } from "@/components/discovery/FacetedFilter";
import { SortSelect } from "@/components/discovery/SortSelect";
import { ActiveFilterChips } from "@/components/discovery/ActiveFilterChips";
import { findCategoryBySlug, getCategoryBreadcrumb, getAllCategorySlugs } from "@/lib/utils/category-tree";
import { getProductLocalized } from "@/lib/schemas/product";
import { calculateProductPrice } from "@/lib/utils/price";
import { Link } from "@/i18n/routing";
import { Pagination } from "@/components/discovery/Pagination";
import { SubcategoryChips } from "@/components/discovery/SubcategoryChips";
import { Metadata } from "next";
import { getCategoryOgImage } from "@/lib/seo/category-og";
import { BookOpen, PackageX } from "lucide-react";
import { FaqAccordion } from "@/components/discovery/FaqAccordion";
import { FaqJsonLd } from "@/components/seo/FaqJsonLd";
import { resolveCategoryFaqs } from "@/lib/utils/faq-resolver";

interface CategoryPageProps {
  params: Promise<{ locale: string; slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export async function generateMetadata({
  params,
  searchParams,
}: CategoryPageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const sParams = await searchParams;
  const isUz = locale === "uz";

  const { tree, categories } = await api.getCategories();
  const category = findCategoryBySlug(tree, slug, isUz ? "uz" : "ru");

  if (!category) {
    return { title: isUz ? "Kategoriya topilmadi" : "Категория не найдена" };
  }

  const ogImage = getCategoryOgImage(category, categories, isUz ? "uz" : "ru");

  const canonicalSlug = isUz ? category.group_slug_uz : category.group_slug_ru;
  const name = isUz ? category.group_uz : category.group_ru;
  const pageNum = typeof sParams.page === "string" ? parseInt(sParams.page, 10) : 1;
  const isPage = !isNaN(pageNum) && pageNum > 1;
  const pageTitleSuffix = isPage ? (isUz ? ` (${pageNum}-sahifa)` : ` (Страница ${pageNum})`) : "";
  const canonicalUrl = `https://sora.uz/${locale}/category/${canonicalSlug}`;
  const hasFilterParams = Object.keys(sParams).some((k) =>
    ["brand", "minPrice", "maxPrice", "inStock", "sort"].includes(k)
  );

  const pageTitle = isUz
    ? `${name} — narxi, yetkazib berish bilan xarid qilish${pageTitleSuffix} | Sora.uz`
    : `${name} — цены, купить с доставкой по Ташкенту и Узбекистану${pageTitleSuffix} | Sora.uz`;

  const pageDescription = isUz
    ? `${name} mahsulotlari arzon narxlarda, sifat kafolati va Toshkent bo'ylab 24 soat ichida yetkazib berish bilan Sora.uz internet do'konida. Ofis, maktab va biznes uchun keng tanlov.`
    : `Широкий ассортимент товаров в категории ${name} по доступным ценам в Ташкенте и Узбекистане. Быстрая доставка, официальная гарантия и оплата с НДС в Sora.uz.`;

  return {
    title: pageTitle,
    description: pageDescription,
    alternates: {
      canonical: canonicalUrl,
      languages: {
        uz: `https://sora.uz/uz/category/${category.group_slug_uz}`,
        "uz-UZ": `https://sora.uz/uz/category/${category.group_slug_uz}`,
        ru: `https://sora.uz/ru/category/${category.group_slug_ru}`,
        "ru-UZ": `https://sora.uz/ru/category/${category.group_slug_ru}`,
        "x-default": `https://sora.uz/uz/category/${category.group_slug_uz}`,
      },
      types: {
        "text/markdown": `https://sora.uz/${locale}/category/${canonicalSlug}.md`,
      },
    },
    openGraph: {
      title: pageTitle,
      description: pageDescription,
      url: canonicalUrl,
      type: "website",
      images: [
        {
          url: ogImage.url,
          width: ogImage.width,
          height: ogImage.height,
          alt: ogImage.alt,
          type: ogImage.type,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: pageTitle,
      description: pageDescription,
      images: [ogImage.url],
    },
    // Crawl budget & index protection: noindex for deep pagination (?page > 1) and faceted filters
    robots:
      isPage || hasFilterParams
        ? { index: false, follow: true }
        : { index: true, follow: true },
  };
}

export default async function CategoryPage({
  params,
  searchParams,
}: CategoryPageProps) {
  const { locale, slug } = await params;
  const query = await searchParams;
  setRequestLocale(locale);
  const isUz = locale === "uz";

  const [categoriesData, brandsData, productsData, faqsData] = await Promise.all([
    api.getCategories(),
    api.getBrands(),
    api.getAllProducts(),
    api.getFaqs(),
  ]);

  const { tree, categories } = categoriesData;
  const currentCategory = findCategoryBySlug(tree, slug, isUz ? "uz" : "ru");

  if (!currentCategory) {
    notFound();
  }

  // Language switch / canonical redirect: ensure URL matches the active locale's slug
  const canonicalSlug = isUz ? currentCategory.group_slug_uz : currentCategory.group_slug_ru;
  if (slug !== canonicalSlug) {
    const sParams = new URLSearchParams();
    Object.entries(query).forEach(([k, v]) => {
      if (v !== undefined) {
        if (Array.isArray(v)) {
          v.forEach((val) => sParams.append(k, val));
        } else {
          sParams.set(k, v);
        }
      }
    });
    const qs = sParams.toString();
    redirect(`/${locale}/category/${canonicalSlug}${qs ? `?${qs}` : ""}`);
  }

  const categoryName = isUz ? currentCategory.group_uz : currentCategory.group_ru;
  const breadcrumbList = [
    {
      name: isUz ? "Katalog" : "Каталог",
      href: "/catalog",
    },
    ...getCategoryBreadcrumb(categories, currentCategory.id).map((c) => ({
      name: isUz ? c.group_uz : c.group_ru,
      href: `/category/${isUz ? c.group_slug_uz : c.group_slug_ru}`,
    })),
  ];

  // Filter products by category (recursively matching this category and all its descendant subcategories)
  const matchingSlugs = getAllCategorySlugs(currentCategory);

  // Subcategories with matching product count for progressive disclosure chips
  const subcategoryChips = currentCategory.children.map((sub) => {
    const subSlugs = getAllCategorySlugs(sub);
    const count = productsData.products.filter((p) => {
      const slugUz = p.uz?.category_slug_uz;
      const slugRu = p.ru?.category_slug_ru;
      const locSlug = getProductLocalized(p, isUz ? "uz" : "ru").category_slug;
      return (
        (slugUz && subSlugs.has(slugUz)) ||
        (slugRu && subSlugs.has(slugRu)) ||
        (locSlug && subSlugs.has(locSlug))
      );
    }).length;

    return {
      id: sub.id,
      name: isUz ? sub.group_uz : sub.group_ru,
      slug: isUz ? sub.group_slug_uz : sub.group_slug_ru,
      count,
    };
  });

  const categoryProducts = productsData.products.filter((p) => {
    const slugUz = p.uz?.category_slug_uz;
    const slugRu = p.ru?.category_slug_ru;
    const locSlug = getProductLocalized(p, isUz ? "uz" : "ru").category_slug;
    return (
      (slugUz && matchingSlugs.has(slugUz)) ||
      (slugRu && matchingSlugs.has(slugRu)) ||
      (locSlug && matchingSlugs.has(locSlug))
    );
  });

  // Compute brands available in this specific category with accurate product counts
  const categoryBrandsMap = new Map<string, number>();
  for (const p of categoryProducts) {
    if (p.brand && p.brand.trim()) {
      categoryBrandsMap.set(p.brand, (categoryBrandsMap.get(p.brand) || 0) + 1);
    }
  }

  const categoryBrands = Array.from(categoryBrandsMap.entries())
    .map(([name, count]) => ({
      id: name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      name,
      count,
    }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));

  // Compute dynamic price range and smart presets for this category
  const validPrices = categoryProducts
    .map((p) => calculateProductPrice(p.price).price)
    .filter((p) => p > 0);

  const minCategoryPrice = validPrices.length > 0 ? Math.min(...validPrices) : 0;
  const maxCategoryPrice = validPrices.length > 0 ? Math.max(...validPrices) : 2000000;

  // Counts for quick switches
  const inStockCount = categoryProducts.filter((p) => p.price?.stock === "InStock").length;
  const discountCount = categoryProducts.filter(
    (p) => calculateProductPrice(p.price).hasDiscount
  ).length;

  // Extract dynamic attributes for this category
  const attrMap = new Map<string, Map<string, number>>();
  for (const p of categoryProducts) {
    if (p.attributes && Array.isArray(p.attributes)) {
      for (const attr of p.attributes) {
        const propName =
          (isUz ? attr.property_uz : attr.property_ru) ||
          attr.property_uz ||
          attr.property_ru;
        const valName =
          (isUz ? attr.value_uz : attr.value_ru) ||
          attr.value_uz ||
          attr.value_ru;
        if (propName && propName.trim() && valName && valName.trim()) {
          const pKey = propName.trim();
          const vKey = valName.trim();
          if (!attrMap.has(pKey)) {
            attrMap.set(pKey, new Map<string, number>());
          }
          const valMap = attrMap.get(pKey)!;
          valMap.set(vKey, (valMap.get(vKey) || 0) + 1);
        }
      }
    }
  }

  const categoryAttributes = Array.from(attrMap.entries())
    .map(([name, vals]) => ({
      name,
      values: Array.from(vals.entries())
        .map(([value, count]) => ({ value, count }))
        .sort((a, b) => b.count - a.count || a.value.localeCompare(b.value)),
    }))
    .filter((a) => a.values.length > 0)
    .sort((a, b) => {
      const sumA = a.values.reduce((s, v) => s + v.count, 0);
      const sumB = b.values.reduce((s, v) => s + v.count, 0);
      return sumB - sumA;
    })
    .slice(0, 5);

  // Generate dynamic, category-relevant presets
  let dynamicPricePresets: { label: string; min: string; max: string }[] = [];
  if (maxCategoryPrice <= 60000) {
    dynamicPricePresets = [
      { label: isUz ? "15 minggacha" : "До 15 тыс.", min: "", max: "15000" },
      { label: isUz ? "15 – 30 ming" : "15 – 30 тыс.", min: "15000", max: "30000" },
      { label: isUz ? "30 – 50 ming" : "30 – 50 тыс.", min: "30000", max: "50000" },
      { label: isUz ? "50 mingdan yuqori" : "От 50 тыс.", min: "50000", max: "" },
    ];
  } else if (maxCategoryPrice <= 250000) {
    dynamicPricePresets = [
      { label: isUz ? "50 minggacha" : "До 50 тыс.", min: "", max: "50000" },
      { label: isUz ? "50 – 100 ming" : "50 – 100 тыс.", min: "50000", max: "100000" },
      { label: isUz ? "100 – 180 ming" : "100 – 180 тыс.", min: "100000", max: "180000" },
      { label: isUz ? "180 mingdan yuqori" : "От 180 тыс.", min: "180000", max: "" },
    ];
  } else if (maxCategoryPrice <= 1000000) {
    dynamicPricePresets = [
      { label: isUz ? "100 minggacha" : "До 100 тыс.", min: "", max: "100000" },
      { label: isUz ? "100 – 300 ming" : "100 – 300 тыс.", min: "100000", max: "300000" },
      { label: isUz ? "300 – 600 ming" : "300 – 600 тыс.", min: "300000", max: "600000" },
      { label: isUz ? "600 mingdan yuqori" : "От 600 тыс.", min: "600000", max: "" },
    ];
  } else {
    dynamicPricePresets = [
      { label: isUz ? "500 minggacha" : "До 500 тыс.", min: "", max: "500000" },
      { label: isUz ? "500 ming – 1.5 mln" : "500 тыс. – 1.5 млн", min: "500000", max: "1500000" },
      { label: isUz ? "1.5 – 3 mln" : "1.5 – 3 млн", min: "1500000", max: "3000000" },
      { label: isUz ? "3 mlndan yuqori" : "От 3 млн", min: "3000000", max: "" },
    ];
  }

  let filtered = [...categoryProducts];

  // Faceted query filters from searchParams
  const brandFilter = typeof query.brand === "string" ? query.brand.split(",") : [];
  if (brandFilter.length > 0) {
    filtered = filtered.filter((p) => brandFilter.includes(p.brand));
  }

  const minP = typeof query.minPrice === "string" ? Number(query.minPrice) : null;
  if (minP !== null && !isNaN(minP)) {
    filtered = filtered.filter(
      (p) => calculateProductPrice(p.price).price >= minP
    );
  }

  const maxP = typeof query.maxPrice === "string" ? Number(query.maxPrice) : null;
  if (maxP !== null && !isNaN(maxP)) {
    filtered = filtered.filter(
      (p) => calculateProductPrice(p.price).price <= maxP
    );
  }

  if (query.inStock === "1") {
    filtered = filtered.filter((p) => p.price?.stock === "InStock");
  }

  if (query.discount === "1") {
    filtered = filtered.filter((p) => calculateProductPrice(p.price).hasDiscount);
  }

  // Parse and apply attrs filter (e.g. Format:A4;Rangi:Ko'k)
  if (typeof query.attrs === "string" && query.attrs.trim()) {
    const requiredAttrs = query.attrs
      .split(";")
      .map((item) => {
        const idx = item.indexOf(":");
        if (idx === -1) return null;
        return {
          prop: item.slice(0, idx).trim().toLowerCase(),
          val: item.slice(idx + 1).trim().toLowerCase(),
        };
      })
      .filter(
        (item): item is { prop: string; val: string } =>
          item !== null && !!item.prop && !!item.val
      );

    const propMap = new Map<string, string[]>();
    for (const r of requiredAttrs) {
      if (!propMap.has(r.prop)) {
        propMap.set(r.prop, []);
      }
      propMap.get(r.prop)!.push(r.val);
    }

    if (propMap.size > 0) {
      filtered = filtered.filter((p) => {
        if (!p.attributes || !Array.isArray(p.attributes)) return false;
        for (const [reqProp, reqVals] of propMap.entries()) {
          const match = p.attributes.some((attr) => {
            const pName = (
              (isUz ? attr.property_uz : attr.property_ru) ||
              attr.property_uz ||
              attr.property_ru ||
              ""
            ).toLowerCase();
            const vName = (
              (isUz ? attr.value_uz : attr.value_ru) ||
              attr.value_uz ||
              attr.value_ru ||
              ""
            ).toLowerCase();
            return pName === reqProp && reqVals.includes(vName);
          });
          if (!match) return false;
        }
        return true;
      });
    }
  }

  // Sorting
  const sort = typeof query.sort === "string" ? query.sort : "popular";
  if (sort === "price_asc") {
    filtered.sort(
      (a, b) => calculateProductPrice(a.price).price - calculateProductPrice(b.price).price
    );
  } else if (sort === "price_desc") {
    filtered.sort(
      (a, b) => calculateProductPrice(b.price).price - calculateProductPrice(a.price).price
    );
  } else if (sort === "newest") {
    filtered.sort((a, b) => {
      if (a.updated_at && b.updated_at && a.updated_at !== b.updated_at) {
        return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
      }
      const numA = parseInt(a.id.replace(/\D/g, ""), 10);
      const numB = parseInt(b.id.replace(/\D/g, ""), 10);
      if (!isNaN(numA) && !isNaN(numB) && numA !== numB) {
        return numB - numA;
      }
      return b.id.localeCompare(a.id);
    });
  }

  // Pagination (24 items per page for optimal grid layout across all screen sizes)
  const PAGE_SIZE = 24;
  const rawPage = Number(query.page);
  const currentPage = !isNaN(rawPage) && rawPage > 0 ? Math.floor(rawPage) : 1;
  const totalMatchedCount = filtered.length;
  const totalPages = Math.ceil(totalMatchedCount / PAGE_SIZE);

  // Optimized lightweight card representation to prevent leaking heavy 1C raw data to Client Components
  function toCardProduct(p: (typeof productsData.products)[number]) {
    return {
      id: p.id,
      product_sku: p.product_sku,
      package: p.package,
      barcode: p.barcode,
      brand: p.brand || "",
      manufacturer: p.manufacturer || "",
      country: p.country || "",
      video_url: "",
      main_picture: p.main_picture,
      updated_at: p.updated_at || "",
      price: p.price,
      uz: {
        unit_uz: p.uz?.unit_uz || "dona",
        category_uz: p.uz?.category_uz || "",
        category_slug_uz: p.uz?.category_slug_uz || "",
        alt_picture_uz: p.uz?.alt_picture_uz || "",
        name_uz: p.uz?.name_uz || "",
        slug_uz: p.uz?.slug_uz || "",
        title_uz: p.uz?.title_uz || "",
        meta_description_uz: "",
        short_description_uz: "",
        product_description_uz: "",
      },
      ru: {
        unit_ru: p.ru?.unit_ru || "шт",
        category_ru: p.ru?.category_ru || "",
        category_slug_ru: p.ru?.category_slug_ru || "",
        alt_picture_ru: p.ru?.alt_picture_ru || "",
        name_ru: p.ru?.name_ru || "",
        slug_ru: p.ru?.slug_ru || "",
        title_ru: p.ru?.title_ru || "",
        meta_description_ru: "",
        short_description_ru: "",
        product_description_ru: "",
      },
      attributes: [],
      related_products: [],
      recommended_products: [],
    };
  }

  const paginatedProducts = filtered
    .slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)
    .map(toCardProduct);

  const categoryFaqs = resolveCategoryFaqs(faqsData.faqs, {
    categoryId: currentCategory.id,
    categories,
    locale: locale as "uz" | "ru",
  });

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col">
      <Header
        tree={tree}
        categories={categories}
        brands={brandsData.data.brands}
      />
      <PromoNav />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full space-y-6">
        {/* Breadcrumb & Structured Data */}
        <BreadcrumbJsonLd items={breadcrumbList} locale={locale} />
        <ItemListJsonLd
          name={currentPage > 1 ? `${categoryName} (${currentPage}-sahifa)` : categoryName}
          description={
            isUz
              ? `Sora.uz do'konida ${categoryName} bo'yicha sifatli mahsulotlar to'plami.`
              : `Список качественных товаров в категории ${categoryName} в интернет-магазине Sora.uz.`
          }
          products={paginatedProducts}
          locale={locale as "uz" | "ru"}
          currentPage={currentPage}
          pageSize={PAGE_SIZE}
        />
        {/* FAQPage Structured Data (1C /faq + Category Resolution) */}
        <FaqJsonLd items={categoryFaqs} />
        <Breadcrumbs items={breadcrumbList} />

        {/* Category Header */}
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            {categoryName}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-2xl leading-relaxed">
            {isUz
              ? `Sora.uz do'konida ${categoryName} bo'yicha sifatli va keng assortimentdagi mahsulotlar. Butun O'zbekiston bo'ylab tezkor yetkazib berish va rasmiy kafolat bilan.`
              : `Широкий ассортимент качественных товаров в категории ${categoryName} в интернет-магазине Sora.uz с официальной гарантией.`}
          </p>
        </div>

        {/* Subcategories Progressive Disclosure Chips */}
        {subcategoryChips.length > 0 && (
          <SubcategoryChips
            items={subcategoryChips}
            locale={locale as "uz" | "ru"}
            initialLimit={3}
          />
        )}

        {/* Main Content: Filter Sidebar + Products Grid */}
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-8 pt-2 sm:pt-4">
          {/* Faceted Filter Sidebar (Desktop) & 50/50 Filter+Sort Toolbar + Bottom Sheet (Mobile) */}
          <FacetedFilter
            brands={categoryBrands}
            attributes={categoryAttributes}
            minPossiblePrice={minCategoryPrice}
            maxPossiblePrice={maxCategoryPrice}
            totalMatchedCount={totalMatchedCount}
            pricePresets={dynamicPricePresets}
            discountCount={discountCount}
            inStockCount={inStockCount}
          />

          {/* Products Column */}
          <div className="flex-1 space-y-4 sm:space-y-6">
            {/* Top Toolbar (Count + Desktop Sort) */}
            <div className="flex items-center justify-between pb-2 sm:pb-3 border-b border-slate-200 dark:border-slate-800">
              <span className="text-xs font-semibold text-slate-500">
                {totalMatchedCount > PAGE_SIZE
                  ? `${(currentPage - 1) * PAGE_SIZE + 1}–${Math.min(currentPage * PAGE_SIZE, totalMatchedCount)} / ${totalMatchedCount} ${isUz ? "ta mahsulot" : "товаров"}`
                  : `${totalMatchedCount} ${isUz ? "ta mahsulot topildi" : "товаров найдено"}`}
              </span>
              <div className="hidden lg:block">
                <SortSelect />
              </div>
            </div>

            {/* Active Filter Chips */}
            <ActiveFilterChips />

            {/* Product Grid or Clean Empty States */}
            {categoryProducts.length === 0 ? (
              <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                  <PackageX className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    {isUz
                      ? "Ushbu toifada hozircha mahsulotlar mavjud emas"
                      : "В этой категории пока нет товаров"}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
                    {isUz
                      ? "Yaqin orada yangi mahsulotlar qo'shiladi. Boshqa toifalar bilan tanishishingiz yoki qidiruv orqali kerakli mahsulotni topishingiz mumkin."
                      : "Скоро здесь появятся новые поступления. Вы можете посмотреть другие разделы каталога или воспользоваться поиском."}
                  </p>
                </div>
                <div className="pt-2">
                  <Link
                    href="/catalog"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sora-600 hover:bg-sora-700 text-white font-semibold text-xs transition-colors shadow-xs"
                  >
                    <span>{isUz ? "Katalogga o'tish" : "Перейти в каталог"}</span>
                  </Link>
                </div>
              </div>
            ) : paginatedProducts.length > 0 ? (
              <div className="space-y-6">
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-5">
                  {paginatedProducts.map((prod) => (
                    <ProductCard
                      key={prod.id}
                      product={prod}
                    />
                  ))}
                </div>

                {/* Pagination Controls */}
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={totalMatchedCount}
                  pageSize={PAGE_SIZE}
                  searchParams={query}
                />
              </div>
            ) : (
              <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
                <div className="space-y-1">
                  <p className="text-base font-bold text-slate-800 dark:text-slate-200">
                    {isUz ? "Ushbu parametrlar bo'yicha mahsulot topilmadi" : "По данным параметрам товары не найдены"}
                  </p>
                  <p className="text-xs text-slate-500">
                    {isUz ? "Filtr parametrlarini tozalab qayta urinib ko'ring." : "Попробуйте сбросить фильтры."}
                  </p>
                </div>
                <div className="pt-2">
                  <Link
                    href={`/category/${canonicalSlug}`}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold text-xs transition-colors"
                  >
                    <span>{isUz ? "Filtrlarni tozalash" : "Сбросить фильтры"}</span>
                  </Link>
                </div>
              </div>
            )}

            {/* Buying Guide Section (Semantic Content & SEO) */}
            <section className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 space-y-4 mt-12">
              <div className="flex items-center gap-2 text-sora-600 dark:text-sora-400">
                <BookOpen className="w-5 h-5" />
                <h3 className="text-base sm:text-lg font-bold">
                  {isUz ? `${categoryName} qanday tanlanadi?` : `Как выбрать ${categoryName}?`}
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                {isUz
                  ? `To'g'ri tanlov qilish uchun birinchi navbatda mahsulotning turi, o'lchami, material sifati va foydalanish maqsadiga (ofis, o'qish yoki kundalik ishlar) e'tibor qaratish zarur. Sora.uz do'konida taqdim etilgan barcha mahsulotlar to'liq sifat nazoratidan o'tgan bo'lib, eng maqbul narxlarda taqdim etiladi.`
                  : `Для правильного выбора обратите внимание на тип, размеры, качество материалов и назначение (офис, учеба или повседневные задачи). Все представленные в магазине Sora.uz товары сертифицированы и предлагаются по выгодным ценам.`}
              </p>
            </section>

            {/* FAQ Accordion Section (1C API) */}
            <FaqAccordion
              items={categoryFaqs}
              columns={1}
              defaultOpenFirst
              title={
                isUz
                  ? "Tez-tez beriladigan savollar"
                  : "Часто задаваемые вопросы"
              }
            />
          </div>
        </div>
      </main>

      <Footer />
      <MobileNav />
    </div>
  );
}
