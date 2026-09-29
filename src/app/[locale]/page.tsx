import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { api } from "@/lib/api";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import {
  Layers,
  CheckCircle2,
  Box,
  ShieldCheck,
} from "lucide-react";
import Image from "next/image";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export default async function HomePage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("faza0");
  const tCommon = await getTranslations("common");
  const isUz = locale === "uz";

  // Fetch real/fixture data from 1C API layer
  const [categoriesData, unitsData, brandsData, productData] = await Promise.all([
    api.getCategories(),
    api.getUnits(),
    api.getBrands(),
    api.getProductById("70ee3bb2-cd83-11ea-96bb-50b7c370a30f"),
  ]);

  const { tree, categories, isFallback } = categoriesData;
  const product = productData.product;

  const productTitle = product
    ? isUz
      ? product.uz.title_uz
      : product.ru.title_ru
    : "";
  const productDesc = product
    ? isUz
      ? product.uz.short_description_uz
      : product.ru.short_description_ru
    : "";
  const productAlt = product
    ? isUz
      ? product.uz.alt_picture_uz
      : product.ru.alt_picture_ru
    : "";
  const productUnit = product
    ? isUz
      ? product.uz.unit_uz
      : product.ru.unit_ru
    : "dona";

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl font-black tracking-tight text-blue-600 dark:text-blue-400">
              SORA<span className="text-amber-500">.UZ</span>
            </span>
            <span className="hidden sm:inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300">
              FAZA 0 Active
            </span>
          </div>

          <div className="flex items-center gap-4">
            <LanguageSwitcher />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8">
        {/* Hero Section */}
        <section className="bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
          <div className="absolute -right-12 -top-12 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="max-w-3xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>{t("badge")}</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              {t("title")}
            </h1>
            <p className="text-slate-600 dark:text-slate-400 text-base sm:text-lg leading-relaxed">
              {t("subtitle")}
            </p>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
            <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
              <span className="text-xs text-slate-500 font-medium block">
                {isUz ? "Kategoriyalar soni" : "Количество категорий"}
              </span>
              <span className="text-xl font-bold text-blue-600 dark:text-blue-400">
                {categories.length} ta
              </span>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
              <span className="text-xs text-slate-500 font-medium block">
                {isUz ? "Brendlar" : "Бренды"}
              </span>
              <span className="text-xl font-bold text-amber-500">
                {brandsData.data.brands.length} ta
              </span>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
              <span className="text-xs text-slate-500 font-medium block">
                {isUz ? "O'lchov birliklari" : "Единицы измерения"}
              </span>
              <span className="text-xl font-bold text-purple-600 dark:text-purple-400">
                {unitsData.units.length} ta
              </span>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
              <span className="text-xs text-slate-500 font-medium block">
                {isUz ? "1C API Holati" : "Статус 1C API"}
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                {isFallback ? (isUz ? "Resilient Cache" : "Кеш-слой") : (isUz ? "Online (Jonli)" : "Онлайн")}
              </span>
            </div>
          </div>
        </section>

        {/* 2-Column Content: Categories Tree & Sample Product */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Categories Hierarchy */}
          <section className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <h2 className="text-lg font-bold">
                {t("categoriesTitle")}
              </h2>
            </div>
            <p className="text-xs text-slate-500">
              {isUz
                ? "API'dan kelgan yassi (flat) ma'lumotlar rekursiv tree-builder orqali ierarxik daraxtga aylantirildi:"
                : "Плоские данные из API собраны в иерархическую структуру через рекурсивный tree-builder:"}
            </p>

            <div className="space-y-3 pt-2">
              {tree.map((root) => (
                <div
                  key={root.id}
                  className="border border-slate-100 dark:border-slate-800 rounded-xl p-3.5 bg-slate-50/60 dark:bg-slate-800/40"
                >
                  <div className="flex items-center justify-between font-semibold text-sm">
                    <span className="text-slate-800 dark:text-slate-200">
                      📁 {isUz ? root.group_uz : root.group_ru}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      /{isUz ? root.group_slug_uz : root.group_slug_ru}
                    </span>
                  </div>

                  {root.children.length > 0 && (
                    <ul className="mt-2.5 ml-4 pl-3 border-l-2 border-blue-200 dark:border-blue-900 space-y-1.5">
                      {root.children.map((child) => (
                        <li
                          key={child.id}
                          className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 py-0.5"
                        >
                          <span>↳ {isUz ? child.group_uz : child.group_ru}</span>
                          <span className="text-slate-400 font-mono text-[11px]">
                            /{isUz ? child.group_slug_uz : child.group_slug_ru}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* Sample Product Detail View (Server Component) */}
          <section className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Box className="w-5 h-5 text-amber-500" />
                <h2 className="text-lg font-bold">
                  {t("sampleProductTitle")}
                </h2>
              </div>
              <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 text-xs font-semibold rounded-md">
                {tCommon("inStock")}
              </span>
            </div>

            {product ? (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row gap-6">
                  {/* Product Image */}
                  <div className="relative w-full sm:w-48 h-48 bg-slate-100 dark:bg-slate-800 rounded-xl overflow-hidden shrink-0 border border-slate-200 dark:border-slate-700 flex items-center justify-center">
                    <Image
                      src={product.main_picture}
                      alt={productAlt}
                      fill
                      className="object-contain p-2"
                      priority
                      unoptimized
                    />
                  </div>

                  {/* Product Meta & Price */}
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <span className="font-semibold text-blue-600 dark:text-blue-400">
                        {product.brand}
                      </span>
                      <span>•</span>
                      <span>{t("sku")}: {product.product_sku}</span>
                    </div>

                    <h3 className="text-xl font-bold text-slate-900 dark:text-white leading-snug">
                      {productTitle}
                    </h3>

                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {productDesc}
                    </p>

                    <div className="pt-2 flex items-baseline gap-3">
                      <span className="text-2xl font-black text-slate-900 dark:text-white">
                        {product.price
                          ? product.price.retail_price.toLocaleString()
                          : "1,150,000"}{" "}
                        <span className="text-sm font-normal text-slate-500">
                          {tCommon("currency")}
                        </span>
                      </span>
                      <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                        (1 {productUnit})
                      </span>
                    </div>

                    <div className="pt-2 flex flex-wrap gap-2">
                      <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors">
                        {tCommon("addToCart")}
                      </button>
                      <button className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors">
                        {tCommon("buyNow")}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Technical Specifications Table */}
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    {tCommon("specifications")} (1C Attributes)
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {product.attributes.map((attr, idx) => (
                      <div
                        key={idx}
                        className="flex justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800"
                      >
                        <span className="text-slate-500">
                          {isUz ? attr.property_uz : attr.property_ru}:
                        </span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                          {isUz ? attr.value_uz : attr.value_ru}
                        </span>
                      </div>
                    ))}
                    <div className="flex justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                      <span className="text-slate-500">{t("country")}:</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {product.country}
                      </span>
                    </div>
                    <div className="flex justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                      <span className="text-slate-500">{t("barcode")}:</span>
                      <span className="font-mono text-slate-700 dark:text-slate-300">
                        {product.barcode}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Related vs Recommended Showcase (Texnalogiya/Produkt.txt) */}
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-3 bg-blue-50/50 dark:bg-blue-950/20 rounded-xl border border-blue-100 dark:border-blue-900/50 space-y-1.5">
                    <span className="text-[11px] font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wide block">
                      🔄 {tCommon("relatedProducts")} (Substitute)
                    </span>
                    <p className="text-[11px] text-slate-500">
                      {isUz
                        ? "Xuddi shu toifadagi muqobil tanlov (Up-sell / Down-sell):"
                        : "Альтернативы из той же категории:"}
                    </p>
                    <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                      {product.related_products[0]?.name || "Deli E3870"}
                    </div>
                  </div>

                  <div className="p-3 bg-amber-50/50 dark:bg-amber-950/20 rounded-xl border border-amber-100 dark:border-amber-900/50 space-y-1.5">
                    <span className="text-[11px] font-bold text-amber-700 dark:text-amber-300 uppercase tracking-wide block">
                      ⚡ {tCommon("recommendedProducts")} (Complementary)
                    </span>
                    <p className="text-[11px] text-slate-500">
                      {isUz
                        ? "Bilan birga sotib olinadi (Cross-sell - AOV oshirish):"
                        : "Покупают вместе (Cross-sell):"}
                    </p>
                    <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                      {product.recommended_products[0]?.name || "Plastik prujinalar A4"}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-6 text-center text-slate-500 text-sm">
                {tCommon("empty")}
              </div>
            )}
          </section>
        </div>

        {/* Faza 0 Completion Checklist Card */}
        <section className="bg-gradient-to-r from-blue-900 to-indigo-950 text-white rounded-2xl p-6 sm:p-8 shadow-md">
          <div className="flex items-center gap-2 mb-4">
            <ShieldCheck className="w-6 h-6 text-emerald-400" />
            <h3 className="text-xl font-bold">
              {isUz ? "FAZA 0 Bajarilgan Vazifalar Tekshiruvi" : "Проверка выполненных задач ФАЗЫ 0"}
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs sm:text-sm">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Next.js 16.3 + React 19 + Tailwind 4 + Base UI sozlandi</span>
            </div>
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>next-intl (/uz va /ru) lokalizatsiyalangan marshrutlash ulangan</span>
            </div>
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>1C ERP Basic Auth client va server-only API arxitekturasi qurildi</span>
            </div>
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Zod schemas (Product, Category, Brand, Unit, Price) to'liq kiritildi</span>
            </div>
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Rekursiv Category Tree-Builder ishlab chiqildi va integratsiya qilindi</span>
            </div>
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Vercel Analytics va Speed Insights (CWV) ulangan</span>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-6 text-center text-xs text-slate-500">
        <p>© 2026 Sora.uz — {tCommon("siteDescription")}</p>
      </footer>
    </div>
  );
}
