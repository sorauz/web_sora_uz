import { setRequestLocale } from "next-intl/server";
import { Metadata } from "next";
import { api } from "@/lib/api";
import { Header } from "@/components/layout/Header";
import { PromoNav } from "@/components/layout/PromoNav";
import { Footer } from "@/components/layout/Footer";
import { MobileNav } from "@/components/layout/MobileNav";
import { Breadcrumbs } from "@/components/discovery/Breadcrumbs";
import { BreadcrumbJsonLd } from "@/components/seo/BreadcrumbJsonLd";
import { CreditCard, Banknote, Smartphone, Building2, ShieldCheck, CheckCircle2 } from "lucide-react";

interface PaymentPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PaymentPageProps): Promise<Metadata> {
  const { locale } = await params;
  const isUz = locale === "uz";

  const title = isUz
    ? "To'lov usullari va shartlari | Sora.uz"
    : "Способы и условия оплаты | Sora.uz";

  const description = isUz
    ? "Sora.uz do'konida qulay to'lov usullari: Payme, Click, naqd pul, bank kartalari hamda yuridik shaxslar uchun B2B hisob-faktura."
    : "Способы оплаты в интернет-магазине Sora.uz: Payme, Click, наличные, банковские карты и безналичный расчет для юридических лиц.";

  return {
    title,
    description,
    alternates: {
      canonical: `https://sora.uz/${locale}/payment`,
      languages: {
        uz: "https://sora.uz/uz/payment",
        ru: "https://sora.uz/ru/payment",
        "x-default": "https://sora.uz/uz/payment",
      },
    },
  };
}

export default async function PaymentPage({ params }: PaymentPageProps) {
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
      name: isUz ? "To'lov usullari" : "Оплата",
      href: "/payment",
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
        <div className="rounded-3xl bg-linear-to-r from-emerald-700 to-teal-950 text-white p-8 sm:p-12 shadow-lg space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/30 text-emerald-200 text-xs font-semibold border border-emerald-400/30">
            <ShieldCheck className="w-4 h-4" />
            <span>{isUz ? "Xavfsiz va Qulay To'lovlar" : "Безопасные платежи"}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
            {isUz ? "To'lov usullari" : "Способы оплаты"}
          </h1>
          <p className="text-emerald-100 max-w-2xl text-sm sm:text-base leading-relaxed">
            {isUz
              ? "Sora.uz jismoniy va yuridik xaridorlar uchun O'zbekistonning barcha ommabop va qonuniy to'lov tizimlarini qo'llab-quvvatlaydi."
              : "Мы принимаем любые формы оплаты, удобные для физических и юридических лиц в Узбекистане."}
          </p>
        </div>

        {/* Payment Methods Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
            <div className="w-12 h-12 rounded-xl bg-cyan-50 dark:bg-cyan-950 text-cyan-600 flex items-center justify-center font-bold">
              <Smartphone className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-slate-900 dark:text-white">
              {isUz ? "Payme va Click" : "Payme и Click"}
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              {isUz
                ? "Ilovangiz orqali bir zumda to'lang. Qo'shimcha komissiya olinmaydi. Buyurtma tasdiqlangach QR-kod yoki to'lov havolasi beriladi."
                : "Мгновенная оплата через мобильные приложения Payme и Click без комиссии. Ссылка на оплату или QR-код."}
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center font-bold">
              <Banknote className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-slate-900 dark:text-white">
              {isUz ? "Naqd pul bilan" : "Наличными при получении"}
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              {isUz
                ? "Buyurtmani kuryerdan qabul qilib olganingizda yoki do'konimizdan samovivoz orqali olib ketayotganda naqd pulda to'lashingiz mumkin."
                : "Оплата наличными курьеру при передаче заказа или при самовывозе из нашего шоурума с выдачей фискального чека."}
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
            <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-950 text-purple-600 flex items-center justify-center font-bold">
              <CreditCard className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-slate-900 dark:text-white">
              {isUz ? "Bank kartalari (Uzcard / Humo / Visa)" : "Банковские карты"}
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              {isUz
                ? "Uzcard, Humo, Visa va Mastercard kartalari orqali onlayn yoki yetkazib berish paytida mobil POS-terminal orqali to'lov."
                : "Оплата картами Uzcard, Humo, Visa, Mastercard на сайте или через мобильный терминал курьера."}
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
            <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950 text-amber-600 flex items-center justify-center font-bold">
              <Building2 className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-slate-900 dark:text-white">
              {isUz ? "B2B / Yuridik shaxslar uchun" : "Безналичный расчет (B2B)"}
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              {isUz
                ? "Tashkilotlar uchun hisob-raqam orqali to'lov. Didox / E-hujjat orqali elektron shartnoma va to'liq hisob-faktura yuboriladi."
                : "Оплата по расчетному счету для юридических лиц с предоставлением договора и электронной счет-фактуры (ЭСФ)."}
            </p>
          </div>
        </div>

        {/* Notice: No Credit / Nasiya */}
        <div className="p-4 sm:p-5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-amber-900 dark:text-amber-200">
              {isUz ? "Muhim eslatma: Kredit va muddatli to'lov (nasiya)" : "Важное примечание: Кредит и рассрочка"}
            </h4>
            <p className="text-xs text-amber-800 dark:text-amber-300/90 leading-relaxed">
              {isUz
                ? "Sora.uz do'konida kredit va muddatli to'lov (nasiya savdo) xizmatlari mavjud emas. Barcha hisob-kitoblar to'liq to'lov asosida amalga oshiriladi."
                : "В интернет-магазине Sora.uz кредиты и покупки в рассрочку не предоставляются. Все расчеты производятся по 100% оплате выбранным способом."}
            </p>
          </div>
        </div>
      </main>

      <Footer />
      <MobileNav />
    </div>
  );
}
