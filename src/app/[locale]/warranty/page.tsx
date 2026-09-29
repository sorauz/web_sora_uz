import { setRequestLocale } from "next-intl/server";
import { Metadata } from "next";
import { api } from "@/lib/api";
import { Header } from "@/components/layout/Header";
import { PromoNav } from "@/components/layout/PromoNav";
import { Footer } from "@/components/layout/Footer";
import { MobileNav } from "@/components/layout/MobileNav";
import { Breadcrumbs } from "@/components/discovery/Breadcrumbs";
import { BreadcrumbJsonLd } from "@/components/seo/BreadcrumbJsonLd";
import { ShieldCheck, RotateCcw, Award, CheckCircle, FileText } from "lucide-react";

interface WarrantyPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: WarrantyPageProps): Promise<Metadata> {
  const { locale } = await params;
  const isUz = locale === "uz";

  const title = isUz
    ? "Kafolat va mahsulotni qaytarish siyosati | Sora.uz"
    : "Гарантия и условия возврата товара | Sora.uz";

  const description = isUz
    ? "Sora.uz rasmiy kafolati va 14 kunlik qaytarish siyosati. Rasmiy ishlab chiqaruvchilar sertifikati va tovar sifatini kafolatlash."
    : "Официальная гарантия и условия возврата в течение 14 дней в магазине Sora.uz. Сертификаты оригинальной продукции.";

  return {
    title,
    description,
    alternates: {
      canonical: `https://sora.uz/${locale}/warranty`,
      languages: {
        uz: "https://sora.uz/uz/warranty",
        ru: "https://sora.uz/ru/warranty",
        "x-default": "https://sora.uz/uz/warranty",
      },
    },
  };
}

export default async function WarrantyPage({ params }: WarrantyPageProps) {
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
      name: isUz ? "Kafolat va qaytarish" : "Гарантия и возврат",
      href: "/warranty",
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
        <div className="rounded-3xl bg-linear-to-r from-purple-800 to-indigo-950 text-white p-8 sm:p-12 shadow-lg space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/30 text-purple-200 text-xs font-semibold border border-purple-400/30">
            <Award className="w-4 h-4" />
            <span>{isUz ? "100% Rasmiy Kafolat" : "100% Официальная гарантия"}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
            {isUz ? "Kafolat va tovarni qaytarish" : "Гарантия и возврат товара"}
          </h1>
          <p className="text-purple-100 max-w-2xl text-sm sm:text-base leading-relaxed">
            {isUz
              ? "Sora.uz do'konidagi har bir mahsulot sifat nazoratidan o'tgan va qonuniy me'yorlar asosida kafolatlanadi."
              : "Каждый товар в магазине Sora.uz сертифицирован и обеспечивается гарантией в строгом соответствии с законодательством."}
          </p>
        </div>

        {/* 3 Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
            <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-950 text-purple-600 flex items-center justify-center font-bold">
              <RotateCcw className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-slate-900 dark:text-white">
              {isUz ? "14 kunlik qaytarish" : "Возврат в течение 14 дней"}
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              {isUz
                ? "Agar xarid qilingan tovar sizga ma'qul kelmasa, uning asl qadog'i va kassa chekini taqdim etgan holda 14 kun ichida almashtirishingiz yoki qaytarishingiz mumkin."
                : "Вы можете вернуть или обменять товар надлежащего качества в течение 14 дней при сохранении товарного вида и упаковки."}
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center font-bold">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-slate-900 dark:text-white">
              {isUz ? "Zavod kafolati" : "Заводская гарантия"}
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              {isUz
                ? "Deli, Linc va boshqa brendlarning texnik mahsulotlariga (shredderlar, laminatorlar, kalkulyatorlar) 1 yilgacha rasmiy kafolat beriladi."
                : "На всю офисную технику и электронику предоставляется гарантия производителя сроком от 6 месяцев до 1 года."}
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
            <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 flex items-center justify-center font-bold">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-slate-900 dark:text-white">
              {isUz ? "Qonuniy himoya" : "Законность и защита"}
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              {isUz
                ? "Barcha jarayonlar O'zbekiston Respublikasi «Iste'molchilarning huquqlarini himoya qilish to'g'risida»gi qonuniga 100% muvofiq tartibda amalga oshiriladi."
                : "Все условия регулируются Законом Республики Узбекистан «О защите прав потребителей»."}
            </p>
          </div>
        </div>
      </main>

      <Footer />
      <MobileNav />
    </div>
  );
}
