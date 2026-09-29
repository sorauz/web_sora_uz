import { setRequestLocale } from "next-intl/server";
import { Metadata } from "next";
import { api } from "@/lib/api";
import { Header } from "@/components/layout/Header";
import { PromoNav } from "@/components/layout/PromoNav";
import { Footer } from "@/components/layout/Footer";
import { MobileNav } from "@/components/layout/MobileNav";
import { Breadcrumbs } from "@/components/discovery/Breadcrumbs";
import { BreadcrumbJsonLd } from "@/components/seo/BreadcrumbJsonLd";
import { Sparkles, Users, Award, ShieldCheck, CheckCircle2, TrendingUp } from "lucide-react";

interface AboutPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: AboutPageProps): Promise<Metadata> {
  const { locale } = await params;
  const isUz = locale === "uz";

  const title = isUz
    ? "Biz haqimizda — Sora.uz internet do'koni tarixi va missiyasi"
    : "О нас — История и миссия интернет-магазина Sora.uz";

  const description = isUz
    ? "Sora.uz — O'zbekistonda kanselyariya, maktab qurollari va ofis anjomlarining ishonchli yetkazib beruvchisi. 1C ERP integratsiyasi va 10 000+ tovarlar."
    : "Sora.uz — ведущий поставщик канцелярских и офисных товаров в Узбекистане с интеграцией 1С ERP и ассортиментом более 10 000 товаров.";

  return {
    title,
    description,
    alternates: {
      canonical: `https://sora.uz/${locale}/about`,
      languages: {
        uz: "https://sora.uz/uz/about",
        ru: "https://sora.uz/ru/about",
        "x-default": "https://sora.uz/uz/about",
      },
    },
  };
}

export default async function AboutPage({ params }: AboutPageProps) {
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
      name: isUz ? "Biz haqimizda" : "О нас",
      href: "/about",
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

      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-10">
        <BreadcrumbJsonLd items={breadcrumbs} locale={locale} />
        <Breadcrumbs items={breadcrumbs} />

        {/* Hero */}
        <div className="rounded-3xl bg-linear-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-8 sm:p-12 shadow-lg space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/30 text-blue-200 text-xs font-semibold border border-blue-400/30">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>{isUz ? "Zamonaviy E-Commerce Platformasi" : "Современная E-Commerce платформа"}</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
            {isUz ? "Sora.uz — Ofisingiz va Ta'limingiz Uchun Eng Yaxshisi" : "Sora.uz — Лучшее для вашего офиса и учебы"}
          </h1>
          <p className="text-blue-100 max-w-2xl text-sm sm:text-base leading-relaxed">
            {isUz
              ? "Bizning maqsadimiz — O'zbekistondagi har bir korxona, maktab va xonadonni eng sifatli kanselyariya, ofis jihozlari va qog'oz mahsulotlari bilan hamyonbop narxlarda ta'minlashdir."
              : "Наша цель — обеспечить каждый офис, образовательное учреждение и дом в Узбекистане качественной канцелярией и офисной техникой по лучшим ценам."}
          </p>
        </div>

        {/* Key Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 text-center shadow-xs">
            <p className="text-2xl sm:text-3xl font-black text-blue-600 dark:text-blue-400">10 000+</p>
            <p className="text-xs text-slate-500 mt-1">{isUz ? "Mahsulotlar soni" : "Товаров в каталоге"}</p>
          </div>
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 text-center shadow-xs">
            <p className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400">5 000+</p>
            <p className="text-xs text-slate-500 mt-1">{isUz ? "Mamnun mijozlar" : "Довольных клиентов"}</p>
          </div>
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 text-center shadow-xs">
            <p className="text-2xl sm:text-3xl font-black text-purple-600 dark:text-purple-400">24 Soat</p>
            <p className="text-xs text-slate-500 mt-1">{isUz ? "Tezkor yetkazish" : "Быстрая доставка"}</p>
          </div>
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 text-center shadow-xs">
            <p className="text-2xl sm:text-3xl font-black text-amber-500">100%</p>
            <p className="text-xs text-slate-500 mt-1">{isUz ? "Rasmiy kafolat" : "Оригинальная продукция"}</p>
          </div>
        </div>

        {/* Story & Advantages */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4 shadow-xs">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              {isUz ? "Nega aynan Sora.uz?" : "Почему выбирают Sora.uz?"}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {isUz
                ? "Sora.uz to'g'ridan-to'g'ri 1C ERP korporativ boshqaruv tizimiga ulangan. Bu sizga saytda ko'rinayotgan har bir narx va ombordagi qoldiq 100% haqiqiy ekanligini kafolatlaydi."
                : "Sora.uz напрямую синхронизирован с корпоративной системой 1С ERP. Это гарантирует 100% актуальность цен и остатков на складе в режиме реального времени."}
            </p>
            <ul className="space-y-2 text-xs sm:text-sm text-slate-600 dark:text-slate-300 pt-2">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>{isUz ? "Rasmiy xalqaro brendlar (Deli, Linc, Comix)" : "Официальные бренды (Deli, Linc, Comix)"}</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>{isUz ? "Yuridik shaxslar uchun elektron hisob-faktura" : "Электронные счет-фактуры для юрлиц (ЭСФ)"}</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>{isUz ? "Toshkent bo'ylab 500 000 so'mdan bepul yetkazib berish" : "Бесплатная доставка по Ташкенту от 500 000 сум"}</span>
              </li>
            </ul>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4 shadow-xs">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              {isUz ? "B2B Korporativ Xizmatlar" : "Корпоративным клиентам"}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {isUz
                ? "Katta va kichik korxonalar, banklar, ta'lim markazlari uchun qulay shartlar asosida shartnomaviy ta'minot. Maxsus ulgurji narxlar, shaxsiy menejer va kechiktirilgan to'lov imkoniyati."
                : "Комплексное снабжение офисов, банков и учебных центров канцелярией и бумагой. Оптовые цены, персональный менеджер и отсрочка платежа."}
            </p>
            <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900/60">
              <p className="text-xs font-semibold text-blue-900 dark:text-blue-200">
                {isUz
                  ? "B2B buyurtmalar uchun: +998 (71) 200-00-00 yoki info@sora.uz"
                  : "Отдел корпоративных продаж: +998 (71) 200-00-00 или info@sora.uz"}
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
      <MobileNav />
    </div>
  );
}
