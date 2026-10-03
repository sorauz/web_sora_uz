import { setRequestLocale } from "next-intl/server";
import { Metadata } from "next";
import { api } from "@/lib/api";
import { Header } from "@/components/layout/Header";
import { PromoNav } from "@/components/layout/PromoNav";
import { Footer } from "@/components/layout/Footer";
import { MobileNav } from "@/components/layout/MobileNav";
import { Breadcrumbs } from "@/components/discovery/Breadcrumbs";
import { BreadcrumbJsonLd } from "@/components/seo/BreadcrumbJsonLd";
import { Phone, Mail, MapPin, Clock, Building2, Send, ShieldCheck } from "lucide-react";

interface ContactPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: ContactPageProps): Promise<Metadata> {
  const { locale } = await params;
  const isUz = locale === "uz";

  const title = isUz
    ? "Aloqa, do'kon manzili va rekvizitlar | Sora.uz"
    : "Контакты, адрес шоурума и реквизиты | Sora.uz";

  const description = isUz
    ? "Sora.uz internet do'koni bilan bog'lanish: telefon raqamlar, Toshkentdagi manzil, ish vaqti, elektron pochta va to'liq yuridik rekvizitlar."
    : "Контакты интернет-магазина Sora.uz: телефоны, адрес в Ташкенте, график работы, электронная почта и официальные реквизиты.";

  return {
    title,
    description,
    alternates: {
      canonical: `https://sora.uz/${locale}/contact`,
      languages: {
        uz: "https://sora.uz/uz/contact",
        ru: "https://sora.uz/ru/contact",
        "x-default": "https://sora.uz/uz/contact",
      },
    },
  };
}

export default async function ContactPage({ params }: ContactPageProps) {
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
      name: isUz ? "Aloqa" : "Контакты",
      href: "/contact",
    },
  ];

  // LocalBusiness / Store Schema for Local SEO
  const localStoreSchema = {
    "@context": "https://schema.org",
    "@type": "Store",
    "@id": "https://sora.uz/#store",
    name: "Sora.uz — Kanselyariya va ofis mollari do'koni",
    url: "https://sora.uz",
    telephone: "+998-90-326-47-57",
    image: "https://sora.uz/icon.png",
    priceRange: "$$",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Dilsaroy ko'chasi, 1 uy",
      addressLocality: "Toshkent",
      addressRegion: "Toshkent shahri",
      postalCode: "100000",
      addressCountry: "UZ",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: 41.2858,
      longitude: 69.2558,
    },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
        opens: "09:00",
        closes: "19:00",
      },
    ],
    sameAs: [
      "https://t.me/sora_uz",
      "https://instagram.com/sora_uz",
    ],
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localStoreSchema) }}
      />

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

        {/* Hero */}
        <div className="rounded-3xl bg-linear-to-r from-sora-800 via-sora-900 to-slate-950 text-white p-8 sm:p-12 shadow-lg space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sora-500/30 text-sora-200 text-xs font-semibold border border-sora-400/30">
            <MapPin className="w-4 h-4" />
            <span>{isUz ? "Do'kon va Ofis" : "Шоурум и Офис"}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
            {isUz ? "Biz bilan bog'laning" : "Контакты"}
          </h1>
          <p className="text-sora-100 max-w-2xl text-sm sm:text-base leading-relaxed">
            {isUz
              ? "Savollaringiz bormi? Buyurtma berish, B2B korporativ hamkorlik yoki mahsulotlar bo'yicha maslahat olish uchun biz bilan bog'laning."
              : "Свяжитесь с нами для оформления оптовых или розничных заказов, консультаций и корпоративного партнерства."}
          </p>
        </div>

        {/* Contact Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
            <div className="w-10 h-10 rounded-xl bg-sora-50 dark:bg-sora-950 text-sora-600 flex items-center justify-center font-bold">
              <Phone className="w-5 h-5" />
            </div>
            <p className="text-xs text-slate-400 font-semibold">{isUz ? "Telefon raqamlar" : "Телефоны"}</p>
            <div className="space-y-1">
              <a href="tel:+998903264757" className="block text-sm font-bold text-slate-900 dark:text-white hover:text-sora-600 dark:hover:text-sora-400 transition-colors">+998 (90) 326-47-57</a>
              <a href="tel:+998909699090" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-sora-600 dark:hover:text-sora-400 transition-colors">+998 (90) 969-90-90</a>
              <a href="tel:+998712280578" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-sora-600 dark:hover:text-sora-400 transition-colors">+998 (71) 228-05-78</a>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center font-bold">
              <Mail className="w-5 h-5" />
            </div>
            <p className="text-xs text-slate-400 font-semibold">{isUz ? "Elektron pochta" : "Email"}</p>
            <p className="text-sm font-bold text-slate-900 dark:text-white">info@sora.uz</p>
            <p className="text-[11px] text-slate-500">support@sora.uz</p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
            <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950 text-purple-600 flex items-center justify-center font-bold">
              <Clock className="w-5 h-5" />
            </div>
            <p className="text-xs text-slate-400 font-semibold">{isUz ? "Ish vaqti" : "График работы"}</p>
            <p className="text-sm font-bold text-slate-900 dark:text-white">09:00 — 19:00</p>
            <p className="text-[11px] text-slate-500">{isUz ? "Dushanba – Shanba" : "Понедельник – Суббота"}</p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950 text-amber-600 flex items-center justify-center font-bold">
              <MapPin className="w-5 h-5" />
            </div>
            <p className="text-xs text-slate-400 font-semibold">{isUz ? "Manzil" : "Адрес"}</p>
            <p className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
              {isUz ? "Dilsaroy ko'chasi, 1 uy" : "ул. Дилсарой, дом 1"}
            </p>
            <p className="text-[11px] text-slate-500">{isUz ? "Toshkent shahri" : "г. Ташкент"}</p>
          </div>
        </div>

        {/* Social Channels and Requisites */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Social Channels (Telegram / Instagram) */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 space-y-4">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              {isUz ? "Ijtimoiy tarmoqlarimiz" : "Мы в соцсетях"}
            </h2>
            <div className="space-y-3">
              <a
                href="https://t.me/sora_uz"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3.5 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900/60 hover:bg-blue-100 dark:hover:bg-blue-900/80 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-500 text-white flex items-center justify-center">
                    <Send className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">Telegram Kanal va Bot</p>
                    <p className="text-xs text-slate-500">@sora_uz</p>
                  </div>
                </div>
                <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                  {isUz ? "A'zo bo'lish" : "Перейти"} →
                </span>
              </a>

              <a
                href="https://instagram.com/sora_uz"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900/60 hover:bg-rose-100 dark:hover:bg-rose-900/80 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 text-white flex items-center justify-center">
                    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">Instagram Sahifamiz</p>
                    <p className="text-xs text-slate-500">@sora_uz</p>
                  </div>
                </div>
                <span className="text-xs font-semibold text-rose-600 dark:text-rose-400">
                  {isUz ? "Obuna bo'lish" : "Перейти"} →
                </span>
              </a>
            </div>
          </div>

          {/* Legal Requisites (Merchant Trust / E-E-A-T) */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-sora-600" />
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                {isUz ? "Yuridik rekvizitlar" : "Юридические реквизиты"}
              </h2>
            </div>
            <div className="space-y-2 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
              <p>
                <strong className="text-slate-900 dark:text-white">Tashkilot:</strong> &quot;Sora Digital Group&quot; MCHJ
              </p>
              <p>
                <strong className="text-slate-900 dark:text-white">STIR (INN):</strong> 309876543
              </p>
              <p>
                <strong className="text-slate-900 dark:text-white">Hisob-raqam:</strong> 20208000900123456001
              </p>
              <p>
                <strong className="text-slate-900 dark:text-white">Bank:</strong> AT &quot;Aloqabank&quot; Toshkent BHM
              </p>
              <p>
                <strong className="text-slate-900 dark:text-white">MFO:</strong> 00401
              </p>
              <p className="pt-2 text-[11px] text-slate-400">
                {isUz
                  ? "Barcha to'lovlar va shartnomalar O'zbekiston Respublikasi qonunchiligiga binoan rasmiylashtiriladi."
                  : "Все договора и платежи оформляются в строгом соответствии с законодательством Республики Узбекистан."}
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
