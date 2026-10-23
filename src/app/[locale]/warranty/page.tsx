import { setRequestLocale } from "next-intl/server";
import { Metadata } from "next";
import { api } from "@/lib/api";
import { Header } from "@/components/layout/Header";
import { PromoNav } from "@/components/layout/PromoNav";
import { Footer } from "@/components/layout/Footer";
import { MobileNav } from "@/components/layout/MobileNav";
import { Breadcrumbs } from "@/components/discovery/Breadcrumbs";
import { BreadcrumbJsonLd } from "@/components/seo/BreadcrumbJsonLd";
import {
  ShieldCheck,
  RotateCcw,
  Award,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  HelpCircle,
  PackageCheck,
  Clock,
  Wrench,
  Scale,
  PhoneCall,
  Send,
} from "lucide-react";
import { Link } from "@/i18n/routing";

interface WarrantyPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({
  params,
}: WarrantyPageProps): Promise<Metadata> {
  const { locale } = await params;
  const isUz = locale === "uz";

  const title = isUz
    ? "Kafolat va mahsulotni qaytarish siyosati — Sora.uz"
    : "Гарантия и условия возврата товара — Sora.uz";

  const description = isUz
    ? "Sora.uz rasmiy kafolati va 10 kunlik qaytarish siyosati. Tovarni kuryer oldida tekshirish qoidalari, almashtirish shartlari va rasmiy servis xizmati."
    : "Официальная 10-дневная гарантия и правила возврата в магазине Sora.uz. Проверка при курьере, условия обмена и сервисный центр.";

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

  const [categoriesData, brandsData] = await Promise.all([
    api.getCategories(),
    api.getBrands(),
  ]);

  const breadcrumbs = [
    {
      name: isUz ? "Kafolat va qaytarish" : "Гарантия и возврат",
      href: "/warranty",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col">
      <Header
        tree={categoriesData.tree}
        categories={categoriesData.categories}
        brands={brandsData.data.brands}
      />
      <PromoNav />

      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-10">
        <BreadcrumbJsonLd items={breadcrumbs} locale={locale} />
        <Breadcrumbs items={breadcrumbs} />

        {/* 1. HERO BANNER */}
        <section className="rounded-3xl bg-linear-to-r from-sora-800 via-indigo-900 to-slate-950 text-white p-8 sm:p-12 shadow-xl space-y-5 relative overflow-hidden">
          <div className="absolute -right-10 -bottom-10 w-72 h-72 bg-sora-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sora-500/20 text-sora-200 text-xs font-bold border border-sora-400/30 backdrop-blur-xs">
            <Award className="w-4 h-4 text-amber-400" />
            <span>
              {isUz
                ? "10 kunlik kafolat va qonuniy himoya"
                : "10-дневная гарантия и законная защита"}
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
            {isUz
              ? "Qaytarish va kafolat siyosati"
              : "Политика возврата и гарантии"}
          </h1>
          <p className="text-slate-200 max-w-2xl text-sm sm:text-base leading-relaxed">
            {isUz
              ? "Sora.uz do'konida mijozlar ishonchi va mahsulot sifati oliy o'rinda turadi. Har bir xarid O'zbekiston Respublikasining «Iste'molchilarning huquqlarini himoya qilish to'g'risida»gi Qonuni normalari asosida kafolatlanadi."
              : "В интернет-магазине Sora.uz доверие клиентов и качество продукции стоят на первом месте. Каждая покупка защищена Законом Республики Узбекистан «О защите прав потребителей»."}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3">
            <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10">
              <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
              <span className="text-xs sm:text-sm font-semibold">
                {isUz ? "10 kunlik kafolat" : "Гарантия 10 дней"}
              </span>
            </div>
            <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10">
              <PackageCheck className="w-5 h-5 text-amber-400 shrink-0" />
              <span className="text-xs sm:text-sm font-semibold">
                {isUz ? "Kuryer oldida bepul tekshirish" : "Бесплатная проверка при курьере"}
              </span>
            </div>
            <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10">
              <Scale className="w-5 h-5 text-sora-400 shrink-0" />
              <span className="text-xs sm:text-sm font-semibold">
                {isUz ? "Qonuniy 100% himoya" : "100% законная защита"}
              </span>
            </div>
          </div>
        </section>

        {/* 2. OLTIN QOIDA: KURYER VA TOPSHIRISH PUNKTI (Golden Rule Callout) */}
        <section className="p-6 sm:p-7 rounded-3xl bg-amber-50 dark:bg-amber-950/30 border-2 border-amber-300 dark:border-amber-800/60 shadow-xs space-y-3">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div className="space-y-1.5">
              <h2 className="text-base sm:text-lg font-black text-amber-900 dark:text-amber-200">
                {isUz
                  ? "Eng muhim qoida: Tovarni topshirish punktida yoki kuryer oldida tekshiring!"
                  : "Главное правило: Проверяйте товар в пункте выдачи или при курьере!"}
              </h2>
              <p className="text-xs sm:text-sm text-amber-900/80 dark:text-amber-300/80 leading-relaxed">
                {isUz
                  ? "Buyurtmani qabul qilib olayotganingizda, uni darhol topshirish punktida yoki yetkazib bergan kuryerning oldida to‘liq ko‘zdan kechiring. Agar tovar sizga yoqmasa yoki shubha uyg‘otsa, uni o‘sha joyning o‘zida olmasdan qoldirishingiz mumkin — bu mutlaqo bepul! Buyurtmani qabul qilib olib ketganingizdan so‘ng esa, qaytarish faqat tovar bilan bog‘liq ishlab chiqarish nuqsoni (defekti) bo‘lsagina amalga oshiriladi."
                  : "При получении заказа обязательно осмотрите его на месте — в пункте выдачи (ПВЗ) или в присутствии курьера. Если товар вам не понравился или возникли сомнения, вы можете сразу отказаться от него — это абсолютно бесплатно! После того как вы приняли и забрали заказ, возврат возможен только при наличии подтверждённого производственного брака (дефекта)."}
              </p>
            </div>
          </div>
        </section>

        {/* 3. TEZ-TEZ BERILADIGAN SAVOLLAR (FAQ) */}
        <section className="space-y-4">
          <div className="flex items-center gap-2.5">
            <HelpCircle className="w-6 h-6 text-sora-600 dark:text-sora-400" />
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              {isUz
                ? "Tez-tez beriladigan savollar"
                : "Часто задаваемые вопросы"}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2.5">
              <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-sora-100 dark:bg-sora-950 text-sora-600 dark:text-sora-400 text-xs font-black flex items-center justify-center shrink-0">
                  1
                </span>
                <span>
                  {isUz
                    ? "Nimaga tovarni shunchaki — nuqsoni bo‘lmasa qaytarib bo‘lmaydi?"
                    : "Почему нельзя вернуть исправный товар без дефекта?"}
                </span>
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed pl-8">
                {isUz
                  ? "Chunki amaldagi qonunchilikka binoan qaytarib bo‘lmaydigan tovarlar ro‘yxati mavjud. Bularga murakkab texnika va elektronika, shaxsiy gigiyena vositalari, kosmetika, oziq-ovqat mahsulotlari, tibbiyot buyumlari va boshqa maxsus tovarlar kiradi."
                  : "По действующему законодательству существует утверждённый перечень товаров, не подлежащих возврату. Сюда входят сложная техника, средства гигиены, медицинские и пищевые изделия, а также упакованные расходные материалы надлежащего качества."}
              </p>
            </div>

            <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2.5">
              <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-sora-100 dark:bg-sora-950 text-sora-600 dark:text-sora-400 text-xs font-black flex items-center justify-center shrink-0">
                  2
                </span>
                <span>
                  {isUz
                    ? "Agar menga tovar yoqmagan yoki to‘g‘ri kelmagan bo‘lsa-chi?"
                    : "Что делать, если товар просто не подошел или не понравился?"}
                </span>
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed pl-8">
                {isUz
                  ? "Uni darhol topshirish punktida yoki kuryer oldida qoldiring. Bunda tovarning sotuvga yaroqli ko‘rinishini, butun qadog‘i va zavod yorliqlarini saqlab qolish kerak. Bu mutlaqo bepul. Agar buyurtmani qabul qilib olib ketsangiz, uni asossiz qaytarib bo‘lmaydi."
                  : "Откажитесь от него сразу в момент получения у курьера или на пункте выдачи, сохранив товарный вид и упаковку. Это абсолютно бесплатно. После того как вы приняли заказ и забрали его, необоснованный возврат не допускается."}
              </p>
            </div>
          </div>
        </section>

        {/* 4. QAY HOLLARDA TOVAR ALMASHTIRIB BERILADI (Positive Conditions) */}
        <section className="space-y-4">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              {isUz
                ? "Qay hollarda tovar almashtirib beriladi?"
                : "В каких случаях осуществляется обмен товара?"}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* A: Maqbul sifatli tovar */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-950/60 shadow-xs space-y-4">
              <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-bold text-base">
                <RotateCcw className="w-5 h-5 shrink-0" />
                <span>
                  {isUz
                    ? "A) Maqbul sifatli (nuqsonsiz) tovar almashtirilishi"
                    : "А) Обмен товара надлежащего качества"}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                {isUz
                  ? "Iste'molchi maqbul sifatli nooziq-ovqat tovarini xarid qilgan kundan e'tiboran 10 kun ichida ayni shunday tovarga almashtirishni, bunday tovar mavjud bo‘lmasa, to‘langan pulini qaytarishni talab qilishga haqli."
                  : "Потребитель вправе в течение 10 дней с момента покупки обменять непродовольственный товар надлежащего качества на аналогичный, а при его отсутствии — потребовать возврат денежных средств."}
              </p>

              <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 space-y-2">
                <span className="text-xs font-bold text-emerald-900 dark:text-emerald-300 block">
                  {isUz
                    ? "Quyidagi shartlar bir vaqtda to‘liq bajarilishi shart:"
                    : "Условия должны выполняться одновременно:"}
                </span>
                <ul className="text-xs text-slate-700 dark:text-slate-300 space-y-1.5 list-disc pl-4">
                  <li>
                    {isUz
                      ? "Tovardan umuman foydalanilmagan bo‘lishi;"
                      : "Товар не был в употреблении и не имеет следов эксплуатации;"}
                  </li>
                  <li>
                    {isUz
                      ? "Tovar shikastlanmagan bo‘lishi (tirnalish, sinish yo‘qligi);"
                      : "Товар не поврежден, нет механических дефектов;"}
                  </li>
                  <li>
                    {isUz
                      ? "Iste'mol xususiyatlari to‘liq saqlangan bo‘lishi;"
                      : "Сохранены все потребительские свойства;"}
                  </li>
                  <li>
                    {isUz
                      ? "Tovar o‘zining asl zavod qadog‘i va yorliqlari bilan qaytarilishi;"
                      : "Возвращается в полной заводской упаковке и с пломбами;"}
                  </li>
                  <li>
                    {isUz
                      ? "Sora.uz do‘konidan xarid qilinganligini tasdiqlovchi kassa cheki yoki elektron buyurtma hujjati mavjud bo‘lishi."
                      : "Имеется документ, подтверждающий покупку в магазине Sora.uz (чек, накладная или номер заказа)."}
                  </li>
                </ul>
              </div>
            </div>

            {/* B: Nuqsonli tovar */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-sora-200 dark:border-sora-950/60 shadow-xs space-y-4">
              <div className="flex items-center gap-2 text-sora-700 dark:text-sora-400 font-bold text-base">
                <Wrench className="w-5 h-5 shrink-0" />
                <span>
                  {isUz
                    ? "B) Nuqsonli (defektli) tovar almashtirilishi"
                    : "Б) Обмен товара с производственным браком"}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                {isUz
                  ? "Agar tovarda ishlab chiqarish, tuzilish, tarkib yoki boshqa zavod nuqsonlari aniqlansa, iste'molchi ayni shunday markadagi sifatli tovarga almashtirishni talab qilishga haqli."
                  : "При обнаружении производственных, конструктивных или заводских дефектов покупатель имеет право на замену товара на качественный аналогичной марки."}
              </p>

              <div className="p-4 rounded-2xl bg-sora-50/60 dark:bg-sora-950/30 border border-sora-100 dark:border-sora-900/40 space-y-2">
                <span className="text-xs font-bold text-sora-900 dark:text-sora-300 block flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  <span>
                    {isUz
                      ? "Sotuvchi tomonidan almashtirish muddatlari:"
                      : "Сроки обмена со стороны продавца:"}
                  </span>
                </span>
                <ul className="text-xs text-slate-700 dark:text-slate-300 space-y-1.5 list-disc pl-4">
                  <li>
                    <strong>{isUz ? "7 kun ichida" : "В течение 7 дней"}</strong> —{" "}
                    {isUz
                      ? "standart holatda ayni shunday tovar bilan almashtirib beriladi;"
                      : "стандартная замена на аналогичный товар;"}
                  </li>
                  <li>
                    <strong>{isUz ? "10 kun ichida" : "В течение 10 дней"}</strong> —{" "}
                    {isUz
                      ? "qo‘shimcha texnik tekshiruv (ekspertiza) zarur bo‘lgan hollarda;"
                      : "при необходимости дополнительной технической экспертизы качества;"}
                  </li>
                  <li>
                    <strong>{isUz ? "40 kun ichida" : "До 40 дней"}</strong> —{" "}
                    {isUz
                      ? "ayni shunday tovar omborda vaqtincha mavjud bo‘lmasa (ko‘pi bilan 40 kun);"
                      : "если аналогичный товар временно отсутствует на складе (максимум 40 дней);"}
                  </li>
                  <li>
                    {isUz
                      ? "Kafolat muddati belgilanmagan tovarlar bo‘yicha nuqson xarid kundan boshlab 10 kun mobaynida aniqlangan bo‘lishi lozim."
                      : "Если гарантийный срок не установлен, дефект должен быть выявлен в течение 10 дней со дня покупки."}
                  </li>
                </ul>
              </div>

              {/* Ishlab chiqaruvchi kafolati */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-1.5">
                <span className="text-xs font-bold text-slate-900 dark:text-white block">
                  {isUz ? "Ishlab chiqaruvchi servisi:" : "Сервис производителя:"}
                </span>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  {isUz
                    ? "Orgtexnika va apparatlarga qadoqda ko‘rsatilgan kafolat muddati davomida ishlab chiqaruvchining O‘zbekistondagi rasmiy avtorizatsiyalangan servis markazi orqali xizmat ko‘rsatiladi. Agar ishlab chiqaruvchi chet elda bo‘lib, O‘zbekistonda rasmiy servisi bo‘lmasa, kafolat cheklangan tartibda taqdim etiladi."
                    : "На технику и оборудование в течение гарантийного срока обслуживание предоставляется через авторизованные сервисные центры производителя в Узбекистане. При отсутствии официального сервиса производителя в РУз гарантия носит ограниченный характер."}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 5. QAY HOLLARDA ALMASHTIRIB BERILMAYDI / RAD ETILADI (Restrictions) */}
        <section className="space-y-4">
          <div className="flex items-center gap-2.5">
            <XCircle className="w-6 h-6 text-rose-600 dark:text-rose-400" />
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              {isUz
                ? "Qay hollarda almashtirish yoki qaytarish rad etiladi?"
                : "В каких случаях обмен или возврат не производятся?"}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Rad etish: Maqbul sifatli tovar */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-950/60 shadow-xs space-y-3">
              <h3 className="font-bold text-sm sm:text-base text-rose-700 dark:text-rose-400 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>
                  {isUz
                    ? "Maqbul sifatli tovar bo‘yicha rad etish:"
                    : "По товарам надлежащего качества:"}
                </span>
              </h3>
              <ul className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 space-y-2 list-none">
                <li className="flex items-start gap-2">
                  <span className="text-rose-500 font-bold shrink-0">✕</span>
                  <span>
                    {isUz
                      ? "10 kunlik qonuniy muddat o‘tib ketgan bo‘lsa;"
                      : "Истёк установленный законом 10-дневный срок;"}
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-500 font-bold shrink-0">✕</span>
                  <span>
                    {isUz
                      ? "Tovardan foydalanilgan yoki ishlatish asoratlari bo‘lsa;"
                      : "Товар был в использовании или имеет следы эксплуатации;"}
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-500 font-bold shrink-0">✕</span>
                  <span>
                    {isUz
                      ? "Tovar shikastlangan, tirnalgan yoki korpusi singan bo‘lsa;"
                      : "Товар повреждён, поцарапан или имеет сколы;"}
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-500 font-bold shrink-0">✕</span>
                  <span>
                    {isUz
                      ? "Iste'mol xususiyatlari yo‘qolgan bo‘lsa;"
                      : "Утрачены потребительские свойства товара;"}
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-500 font-bold shrink-0">✕</span>
                  <span>
                    {isUz
                      ? "Asl zavod qadog‘i yoki komplektatsiyasi bilan qaytarilmasa;"
                      : "Отсутствует оригинальная заводская упаковка или комплектация;"}
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-500 font-bold shrink-0">✕</span>
                  <span>
                    {isUz
                      ? "Sora.uz dan xarid qilinganligini tasdiqlovchi asoslar mavjud bo‘lmasa."
                      : "Отсутствуют подтверждающие документы о покупке в Sora.uz."}
                  </span>
                </li>
              </ul>
            </div>

            {/* Rad etish: Nuqsonli tovar (Sotuvchi javobgar bo'lmagan holatlar) */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-950/60 shadow-xs space-y-3">
              <h3 className="font-bold text-sm sm:text-base text-amber-700 dark:text-amber-400 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>
                  {isUz
                    ? "Nuqsonli tovar bo‘yicha sotuvchi javobgar bo‘lmagan hollar:"
                    : "Освобождение от ответственности по дефектам:"}
                </span>
              </h3>
              <ul className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 space-y-2 list-none">
                <li className="flex items-start gap-2">
                  <span className="text-amber-500 font-bold shrink-0">⚠️</span>
                  <span>
                    {isUz
                      ? "Nuqson iste'molchi tomonidan foydalanish qoidalari buzilgani oqibatida yuzaga kelganligi isbotlansa;"
                      : "Дефект возник вследствие нарушения покупателем правил эксплуатации изделия;"}
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-500 font-bold shrink-0">⚠️</span>
                  <span>
                    {isUz
                      ? "Nuqson saqlash qoidalari buzilgani (namlik, harorat, chang) oqibatida kelib chiqqani isbotlansa;"
                      : "Дефект вызван неправильным хранением (влага, перепады температур, загрязнение);"}
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-500 font-bold shrink-0">⚠️</span>
                  <span>
                    {isUz
                      ? "Nuqson iste'molchi tomonidan noto‘g‘ri tashish va tushirib yuborish oqibatida yuzaga kelgani isbotlansa;"
                      : "Повреждение возникло при транспортировке и механическом воздействии со стороны покупателя;"}
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-500 font-bold shrink-0">⚠️</span>
                  <span>
                    {isUz
                      ? "Kafolat muddati belgilanmagan tovar bo‘yicha nuqson xariddan keyin 3 kundan ortiq muddat o‘tgach bildirilgan bo‘lsa."
                      : "По товару без гарантийного срока дефект заявлен спустя более чем 3 дня после покупки."}
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* 6. MUHIM QONUNIY ESLATMA (Legal Disclaimer Note) */}
        <section className="p-6 rounded-3xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
          <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-sm">
            <Scale className="w-4 h-4 text-sora-600" />
            <span>{isUz ? "Muhim qonuniy eslatma:" : "Важное юридическое примечание:"}</span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 italic leading-relaxed">
            {isUz
              ? "«Sotuvchi (ishlab chiqaruvchi, ijrochi) zarar foydalanish, saqlash yoki tashishning belgilangan qoidalari iste'molchi tomonidan buzilishi oqibatida yuzaga kelganligini isbotlasa, javobgarlikdan ozod etiladi» (O‘zbekiston Respublikasining «Iste’molchilarning huquqlarini himoya qilish to‘g‘risida»gi Qonuni)."
              : "«Продавец (изготовитель, исполнитель) освобождается от ответственности, если докажет, что вред возник вследствие нарушения потребителем установленных правил использования, хранения или транспортировки» (Закон Республики Узбекистан «О защите прав потребителей»)."}
          </p>
        </section>

        {/* 7. BOG'LANISH VA MIJOZLAR XIZMATI (Support CTA) */}
        <section className="p-6 sm:p-8 rounded-3xl bg-linear-to-r from-slate-900 to-sora-950 text-white space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h3 className="text-lg sm:text-xl font-black">
                {isUz
                  ? "Kafolat bo‘yicha savolingiz bormi?"
                  : "Есть вопросы по гарантии или возврату?"}
              </h3>
              <p className="text-xs sm:text-sm text-slate-300">
                {isUz
                  ? "Bizning mijozlarni qo‘llab-quvvatlash xizmati sizga tezkor yordam beradi."
                  : "Служба заботы о клиентах Sora.uz всегда готова помочь вам."}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <a
                href="tel:+998903264757"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-slate-900 hover:bg-slate-100 font-bold text-xs transition-colors shadow-xs"
              >
                <PhoneCall className="w-4 h-4 text-sora-600" />
                <span>+998 (90) 326-47-57</span>
              </a>
              <a
                href="https://t.me/sora_uz"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sora-600 hover:bg-sora-700 text-white font-bold text-xs transition-colors shadow-xs"
              >
                <Send className="w-4 h-4" />
                <span>{isUz ? "Telegram orqali bog'lanish" : "Связаться в Telegram"}</span>
              </a>
            </div>
          </div>
        </section>
      </main>

      <Footer />
      <MobileNav />
    </div>
  );
}
