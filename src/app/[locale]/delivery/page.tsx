import { setRequestLocale } from "next-intl/server";
import { Metadata } from "next";
import { api } from "@/lib/api";
import { Header } from "@/components/layout/Header";
import { PromoNav } from "@/components/layout/PromoNav";
import { Footer } from "@/components/layout/Footer";
import { MobileNav } from "@/components/layout/MobileNav";
import { Breadcrumbs } from "@/components/discovery/Breadcrumbs";
import { BreadcrumbJsonLd } from "@/components/seo/BreadcrumbJsonLd";
import { Truck, Clock, ShieldCheck, MapPin, CheckCircle, Package } from "lucide-react";

interface DeliveryPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: DeliveryPageProps): Promise<Metadata> {
  const { locale } = await params;
  const isUz = locale === "uz";

  const title = isUz
    ? "Yetkazib berish shartlari va muddatlari | Sora.uz"
    : "Условия и сроки доставки | Sora.uz";

  const description = isUz
    ? "Sora.uz internet do'konida yetkazib berish shartlari. Toshkent bo'ylab 500 000 so'mdan bepul yetkazib berish. Butun O'zbekiston viloyatlariga tezkor xizmat."
    : "Условия доставки интернет-магазина Sora.uz. Бесплатная доставка по Ташкенту от 500 000 сум. Быстрая доставка по всем регионам Узбекистана.";

  return {
    title,
    description,
    alternates: {
      canonical: `https://sora.uz/${locale}/delivery`,
      languages: {
        uz: "https://sora.uz/uz/delivery",
        ru: "https://sora.uz/ru/delivery",
        "x-default": "https://sora.uz/uz/delivery",
      },
    },
  };
}

export default async function DeliveryPage({ params }: DeliveryPageProps) {
  const { locale } = await params;
  const isUz = locale === "uz";
  setRequestLocale(locale);

  const [categoriesData, brandsData, productsData] = await Promise.all([
    api.getCategories(),
    api.getBrands(),
    api.getAllProducts(),
  ]);

  const breadcrumbs = [
    {
      name: isUz ? "Yetkazib berish" : "Доставка",
      href: "/delivery",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col">
      <Header
        tree={categoriesData.tree}
        categories={categoriesData.categories}
        brands={brandsData.data.brands}
        products={productsData.products}
      />
      <PromoNav />

      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8">
        <BreadcrumbJsonLd items={breadcrumbs} locale={locale} />
        <Breadcrumbs items={breadcrumbs} />

        {/* Hero Banner */}
        <div className="rounded-3xl bg-linear-to-r from-blue-700 to-indigo-900 text-white p-8 sm:p-12 shadow-lg space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/30 text-blue-200 text-xs font-semibold border border-blue-400/30">
            <Truck className="w-4 h-4" />
            <span>{isUz ? "Ishonchli va Tezkor Xizmat" : "Надежная и быстрая доставка"}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
            {isUz ? "Yetkazib berish shartlari" : "Условия доставки"}
          </h1>
          <p className="text-blue-100 max-w-2xl text-sm sm:text-base leading-relaxed">
            {isUz
              ? "Sora.uz orqali xarid qilingan barcha tovarlar xavfsiz qadoqlanadi va belgilangan manzilingizga tezkor yetkazib beriladi."
              : "Все заказы в Sora.uz тщательно упаковываются и доставляются курьером прямо до вашей двери или офиса."}
          </p>
        </div>

        {/* Delivery Options Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
            <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
              <Truck className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-slate-900 dark:text-white">
              {isUz ? "Toshkent shahri" : "По Ташкенту"}
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              {isUz
                ? "500 000 so'mdan oshgan barcha buyurtmalar BEPUL yetkaziladi. 500 000 so'mgacha bo'lgan buyurtmalar uchun — 30 000 so'm."
                : "Бесплатно при заказе от 500 000 сум. При заказе до 500 000 сум стоимость доставки составляет 30 000 сум."}
            </p>
            <div className="pt-2 text-xs font-semibold text-emerald-600 flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              <span>{isUz ? "Muddat: 24 soat ichida" : "Срок: в течение 24 часов"}</span>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
            <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
              <MapPin className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-slate-900 dark:text-white">
              {isUz ? "Viloyatlar bo'ylab" : "По регионам"}
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              {isUz
                ? "O'zbekistonning barcha 12 ta viloyati va Qoraqalpog'iston Respublikasiga ishonchli kuryerlik xizmatlari (BTS, Fargo, EMU) orqali yetkaziladi."
                : "Доставка в любые регионы Узбекистана через курьерские службы (BTS, Fargo, EMU) по официальным тарифам."}
            </p>
            <div className="pt-2 text-xs font-semibold text-amber-600 flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              <span>{isUz ? "Muddat: 1–3 ish kuni" : "Срок: 1–3 рабочих дня"}</span>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
              <Package className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-slate-900 dark:text-white">
              {isUz ? "O'zi olib ketish (Samovivoz)" : "Самовывоз"}
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              {isUz
                ? "Buyurtmangizni Toshkent shahridagi markaziy ombor-do'konimizdan istalgan qulay vaqtingizda mutlaqo bepul olib ketishingiz mumkin."
                : "Вы можете забрать свой заказ из нашего шоурума в Ташкенте абсолютно бесплатно в рабочее время."}
            </p>
            <div className="pt-2 text-xs font-semibold text-emerald-600 flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4" />
              <span>{isUz ? "Narxi: Mutlaqo bepul" : "Стоимость: Бесплатно"}</span>
            </div>
          </div>
        </div>

        {/* Detailed FAQ / Acceptance Rules */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 space-y-4">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            {isUz ? "Tovarni qabul qilish qoidalari" : "Правила получения товара"}
          </h2>
          <ul className="space-y-3 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
            <li className="flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
              <span>
                {isUz
                  ? "Kuryer mahsulotni yetkazib berganida, uning butunligi, qadog'i va to'liq jamlanganligini tekshirib oling."
                  : "При получении заказа внимательно осмотрите целостность упаковки и соответствие товаров чеку."}
              </span>
            </li>
            <li className="flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
              <span>
                {isUz
                  ? "Barcha tovarlar 1C hisob-faktura yoki kassa cheki bilan birga taqdim etiladi."
                  : "Все заказы сопровождаются чеком или товарной накладной 1C ERP для юридических лиц."}
              </span>
            </li>
          </ul>
        </div>
      </main>

      <Footer />
      <MobileNav />
    </div>
  );
}
