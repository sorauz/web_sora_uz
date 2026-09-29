import { setRequestLocale } from "next-intl/server";
import { Metadata } from "next";
import { api } from "@/lib/api";
import { Header } from "@/components/layout/Header";
import { PromoNav } from "@/components/layout/PromoNav";
import { Footer } from "@/components/layout/Footer";
import { MobileNav } from "@/components/layout/MobileNav";
import { Breadcrumbs } from "@/components/discovery/Breadcrumbs";
import { BreadcrumbJsonLd } from "@/components/seo/BreadcrumbJsonLd";
import { Building2, FileText, CheckCircle2, Phone, Mail, Percent, Truck } from "lucide-react";

interface B2BPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: B2BPageProps): Promise<Metadata> {
  const { locale } = await params;
  const isUz = locale === "uz";

  const title = isUz
    ? "B2B Korporativ ta'minot va ulgurji xaridlar | Sora.uz"
    : "B2B Корпоративное обслуживание и оптовые закупки | Sora.uz";

  const description = isUz
    ? "Korxonalar va ofislar uchun kanselyariya, qog'oz va ofis jihozlarini ulgurji yetkazib berish. Shartnoma, Didox orqali elektron hisob-faktura va qulay to'lov shartlari."
    : "Комплексное снабжение офисов и предприятий канцелярскими товарами и бумагой. Договора, ЭСФ через Didox, индивидуальные условия.";

  return {
    title,
    description,
    alternates: {
      canonical: `https://sora.uz/${locale}/b2b`,
      languages: {
        uz: "https://sora.uz/uz/b2b",
        ru: "https://sora.uz/ru/b2b",
        "x-default": "https://sora.uz/uz/b2b",
      },
    },
  };
}

export default async function B2BPage({ params }: B2BPageProps) {
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
      name: isUz ? "Korporativ mijozlarga (B2B)" : "Корпоративным клиентам",
      href: "/b2b",
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

        {/* Hero */}
        <div className="rounded-3xl bg-linear-to-r from-slate-900 via-blue-950 to-indigo-950 text-white p-8 sm:p-12 shadow-lg space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/30 text-blue-200 text-xs font-semibold border border-blue-400/30">
            <Building2 className="w-4 h-4 text-amber-400" />
            <span>{isUz ? "B2B Korporativ Hamkorlik" : "B2B Корпоративное партнерство"}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight">
            {isUz
              ? "Korxonangizni Sifatli Kanselyariya Bilan Ta'minlaymiz"
              : "Комплексное снабжение вашего офиса канцелярией"}
          </h1>
          <p className="text-blue-100 max-w-2xl text-sm sm:text-base leading-relaxed">
            {isUz
              ? "Sora.uz banklar, IT-kompaniyalar, ta'lim markazlari va davlat tashkilotlari uchun doimiy ofis ta'minotini kafolatlaydi."
              : "Индивидуальный подход, оптовые скидки, полный пакет закрывающих документов и доставка до склада или офиса."}
          </p>
        </div>

        {/* Advantages */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
            <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 flex items-center justify-center font-bold">
              <Percent className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-slate-900 dark:text-white">
              {isUz ? "Maxsus Ulgurji Narxlar" : "Специальные оптовые цены"}
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              {isUz
                ? "Muntazam va yirik buyurtmalar uchun chakana narxdan 15% gacha arzon maxsus narxlar ro'yxati (Preyskurant)."
                : "Индивидуальный прайс-лист со скидками до 15% для постоянных корпоративных клиентов."}
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center font-bold">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-slate-900 dark:text-white">
              {isUz ? "Didox / Elektron Hujjatlar" : "ЭСФ и полный документооборот"}
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              {isUz
                ? "Shartnoma, hisob-faktura va ishonchnomalar Didox yoki boshqa elektron hujjat tizimlari orqali 5 daqiqada rasmiylashtiriladi."
                : "Быстрое оформление договоров, спецификаций и электронных счетов-фактур через Didox."}
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
            <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-950 text-purple-600 flex items-center justify-center font-bold">
              <Truck className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-slate-900 dark:text-white">
              {isUz ? "Ofisingizgacha Bepul Yetkazish" : "Бесплатная доставка до кабинета"}
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              {isUz
                ? "Korporativ buyurtmalar to'g'ridan-to'g'ri ofisingiz qavatigacha bepul olib kirib beriladi."
                : "Бережная доставка и подъем заказа непосредственно в ваш офис или на склад."}
            </p>
          </div>
        </div>

        {/* CTA Contact Form / Details */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 space-y-4">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            {isUz ? "Korporativ bo'lim bilan bog'lanish" : "Свяжитесь с корпоративным отделом"}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
            {isUz
              ? "Tashkilotingiz uchun tijoriy taklif (KP) olishni istaysizmi? Bizning korporativ menejerlarimizga qo'ng'iroq qiling yoki rekvizitlaringizni yuboring:"
              : "Хотите получить коммерческое предложение для вашей компании? Свяжитесь с нашими специалистами:"}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 pt-2">
            <a
              href="tel:+998712000000"
              className="px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-xs transition-all flex items-center justify-center gap-2"
            >
              <Phone className="w-4 h-4" />
              <span>+998 (71) 200-00-00</span>
            </a>
            <a
              href="mailto:b2b@sora.uz"
              className="px-6 py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-semibold text-xs sm:text-sm transition-all flex items-center justify-center gap-2"
            >
              <Mail className="w-4 h-4" />
              <span>b2b@sora.uz</span>
            </a>
          </div>
        </div>
      </main>

      <Footer />
      <MobileNav />
    </div>
  );
}
