"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  FileText,
  Sliders,
  Truck,
  Star,
  HelpCircle,
  CheckCircle,
  ThumbsUp,
  ChevronDown,
} from "lucide-react";
import { Product, getProductLocalized } from "@/lib/schemas/product";

interface ProductTabsProps {
  product: Product;
  locale: "uz" | "ru";
}

type TabType = "desc" | "specs" | "delivery" | "reviews" | "faq";

export function ProductTabs({ product, locale }: ProductTabsProps) {
  const t = useTranslations("pdp");
  const common = useTranslations("common");
  const [activeTab, setActiveTab] = useState<TabType>("desc");
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const loc = getProductLocalized(product, locale);

  const tabs: { id: TabType; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: "desc", label: t("descTab"), icon: FileText },
    { id: "specs", label: t("specsTab"), icon: Sliders },
    { id: "delivery", label: t("deliveryTab"), icon: Truck },
    { id: "reviews", label: `${t("reviewsTab")} (4.8)`, icon: Star },
    { id: "faq", label: t("faqTab"), icon: HelpCircle },
  ];

  // Sample verified reviews
  const mockReviews = [
    {
      id: 1,
      author: locale === "uz" ? "Otabek S." : "Отабек С.",
      rating: 5,
      date: locale === "uz" ? "3 kun oldin" : "3 дня назад",
      comment:
        locale === "uz"
          ? "Sifati a'lo darajada! 1C dagi xarakteristikalari to'liq mos keldi, tezda yetkazib berishdi."
          : "Отличное качество! Полностью соответствует характеристикам из 1С, доставили очень быстро.",
      likes: 12,
    },
    {
      id: 2,
      author: locale === "uz" ? "Dilshod M." : "Дильшод М.",
      rating: 5,
      date: locale === "uz" ? "1 hafta oldin" : "1 неделю назад",
      comment:
        locale === "uz"
          ? "Kompaniyamiz uchun o'rnatdik, original tovar va rasmiy kafolati bor. Tavsiya qilaman."
          : "Установили для нашего офиса, оригинальный товар с официальной гарантией. Рекомендую.",
      likes: 7,
    },
    {
      id: 3,
      author: locale === "uz" ? "Azizbek R." : "Азизбек Р.",
      rating: 4,
      date: locale === "uz" ? "2 hafta oldin" : "2 недели назад",
      comment:
        locale === "uz"
          ? "Mahsulot juda yaxshi, faqat yetkazib berish vaqti kechga surildi, ammo kuryer ogohlantirdi."
          : "Товар отличный, доставка немного задержалась к вечеру, но курьер предупредил заранее.",
      likes: 4,
    },
  ];

  const faqs = [
    {
      q:
        locale === "uz"
          ? "Mahsulotning rasmiy kafolat muddati qancha?"
          : "Каков официальный гарантийный срок товара?",
      a:
        locale === "uz"
          ? "Ushbu mahsulotga rasmiy ishlab chiqaruvchi va Sora.uz tomonidan 12 oylik rasmiy kafolat beriladi."
          : "На данный товар предоставляется официальная гарантия 12 месяцев от производителя и Sora.uz.",
    },
    {
      q:
        locale === "uz"
          ? "Toshkent shahri va viloyatlarga yetkazib berish shartlari qanday?"
          : "Каковы условия доставки по Ташкенту и в регионы?",
      a:
        locale === "uz"
          ? "Toshkent shahri bo'ylab buyurtmalar 24 soat ichida yetkaziladi. Viloyat markazlariga esa 1-3 ish kunida kuryerlik xizmati orqali yetkazib beriladi."
          : "По Ташкенту доставка осуществляется в течение 24 часов. В областные центры — в течение 1–3 рабочих дней курьерской службой.",
    },
    {
      q:
        locale === "uz"
          ? "Yuridik shaxslar uchun to'lov va hisob-faktura (shartnoma) mumkinmi?"
          : "Возможна ли оплата для юридических лиц по договору и счет-фактуре?",
      a:
        locale === "uz"
          ? "Ha, albatta! Barcha tovarlarimiz uchun QQS (NDS) bilan elektron hisob-faktura rasmiylashtiriladi."
          : "Да, конечно! Для юридических лиц оформляется полный пакет документов с НДС через ЭДО.",
    },
  ];

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
      {/* Tab Navigation */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 overflow-x-auto scrollbar-none bg-slate-50/50 dark:bg-slate-900/50">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-4 text-sm font-semibold border-b-2 transition-all whitespace-nowrap ${
                isActive
                  ? "border-blue-600 text-blue-600 dark:text-blue-400 bg-white dark:bg-slate-900"
                  : "border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Contents */}
      <div className="p-6 sm:p-8">
        {/* Description Tab */}
        {activeTab === "desc" && (
          <div className="space-y-6 max-w-4xl">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              {loc.title || loc.name}
            </h3>
            <div className="prose dark:prose-invert max-w-none text-slate-700 dark:text-slate-300 leading-relaxed text-sm sm:text-base space-y-4">
              <p>
                {loc.product_description || loc.short_description || (
                  locale === "uz"
                    ? "Ushbu mahsulot yuqori sifatli xomashyolardan tayyorlangan bo'lib, xalqaro sifat standartlariga to'liq javob beradi. Zamonaviy dizayn va mustahkam konstruksiya uzoq yillik ishonchli xizmatni ta'minlaydi."
                    : "Данный товар изготовлен из высококачественных материалов и полностью соответствует международным стандартам качества. Надежная конструкция гарантирует долгий срок службы."
                )}
              </p>
              {loc.short_description && loc.product_description && (
                <p className="text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                  {loc.short_description}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Specs / Attributes Tab */}
        {activeTab === "specs" && (
          <div className="space-y-6 max-w-4xl">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              {t("specsTab")}
            </h3>
            <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800">
              <table className="w-full text-left text-sm">
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  <tr className="bg-slate-50/50 dark:bg-slate-900/50">
                    <td className="py-3 px-4 font-medium text-slate-500 dark:text-slate-400 w-1/3">
                      {t("sku")}
                    </td>
                    <td className="py-3 px-4 font-mono font-semibold text-slate-900 dark:text-white">
                      {product.product_sku}
                    </td>
                  </tr>
                  {product.barcode && (
                    <tr>
                      <td className="py-3 px-4 font-medium text-slate-500 dark:text-slate-400">
                        {t("barcode")}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-900 dark:text-white">
                        {product.barcode}
                      </td>
                    </tr>
                  )}
                  <tr className="bg-slate-50/50 dark:bg-slate-900/50">
                    <td className="py-3 px-4 font-medium text-slate-500 dark:text-slate-400">
                      {t("brand")}
                    </td>
                    <td className="py-3 px-4 font-semibold text-blue-600 dark:text-blue-400">
                      {product.brand}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-medium text-slate-500 dark:text-slate-400">
                      {t("manufacturer")}
                    </td>
                    <td className="py-3 px-4 text-slate-900 dark:text-white">
                      {product.manufacturer}
                    </td>
                  </tr>
                  <tr className="bg-slate-50/50 dark:bg-slate-900/50">
                    <td className="py-3 px-4 font-medium text-slate-500 dark:text-slate-400">
                      {t("country")}
                    </td>
                    <td className="py-3 px-4 text-slate-900 dark:text-white">
                      {product.country}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-medium text-slate-500 dark:text-slate-400">
                      {t("unit")}
                    </td>
                    <td className="py-3 px-4 text-slate-900 dark:text-white">
                      {loc.unit}
                    </td>
                  </tr>
                  {/* Dynamic 1C Attributes */}
                  {product.attributes && product.attributes.map((attr, idx) => (
                    <tr
                      key={idx}
                      className={idx % 2 === 0 ? "bg-slate-50/50 dark:bg-slate-900/50" : ""}
                    >
                      <td className="py-3 px-4 font-medium text-slate-500 dark:text-slate-400">
                        {locale === "uz" ? attr.property_uz : attr.property_ru}
                      </td>
                      <td className="py-3 px-4 text-slate-900 dark:text-white font-medium">
                        {locale === "uz" ? attr.value_uz : attr.value_ru}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Delivery & Payment Tab */}
        {activeTab === "delivery" && (
          <div className="space-y-6 max-w-4xl">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              {t("deliveryTab")}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-5 rounded-2xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40 space-y-3">
                <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-bold">
                  <Truck className="w-5 h-5" />
                  <span>{locale === "uz" ? "Yetkazib berish xizmati" : "Служба доставки"}</span>
                </div>
                <ul className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 space-y-2 list-disc list-inside">
                  <li>{locale === "uz" ? "Toshkent shahri: 24 soat ichida eshikkacha yetkazib berish." : "Город Ташкент: доставка до двери в течение 24 часов."}</li>
                  <li>{locale === "uz" ? "O'zbekiston viloyatlari: BTS, Fargo yoki pochta orqali 1-3 ish kunida." : "Регионы Узбекистана: через курьерские службы BTS, Fargo в течение 1–3 дней."}</li>
                  <li>{locale === "uz" ? "Katta hajmli yuklar uchun maxsus transport va yuk tushirish xizmati." : "Спецтранспорт для крупногабаритных заказов."}</li>
                </ul>
              </div>

              <div className="p-5 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40 space-y-3">
                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold">
                  <CheckCircle className="w-5 h-5" />
                  <span>{locale === "uz" ? "To'lov turlari va Kafolat" : "Способы оплаты и Гарантия"}</span>
                </div>
                <ul className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 space-y-2 list-disc list-inside">
                  <li>{locale === "uz" ? "Onlayn: Uzcard, Humo, Payme, Click." : "Онлайн: Uzcard, Humo, Payme, Click."}</li>
                  <li>{locale === "uz" ? "Naqd pul yoki tovar qabul qilinganda terminal orqali." : "Наличными или картой при получении товара."}</li>
                  <li>{locale === "uz" ? "Yuridik shaxslar uchun: QQS bilan bank shartnomasi va hisob-faktura." : "Для юридических лиц: безналичный расчет с НДС."}</li>
                  <li>{locale === "uz" ? "12 oylik to'liq rasmiy kafolat sertifikati." : "Официальный гарантийный талон на 12 месяцев."}</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Reviews Tab */}
        {activeTab === "reviews" && (
          <div className="space-y-8 max-w-4xl">
            {/* Rating Summary Card */}
            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center gap-8">
              <div className="text-center sm:text-left space-y-1">
                <div className="text-5xl font-black text-slate-900 dark:text-white">
                  4.8
                </div>
                <div className="flex items-center justify-center sm:justify-start gap-1 text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  24 {t("reviewsCount")}
                </p>
              </div>

              {/* Progress bars */}
              <div className="flex-1 w-full space-y-1.5 text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-12 text-slate-500">5 {locale === "uz" ? "yulduz" : "звезд"}</span>
                  <div className="flex-1 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div className="w-[85%] h-full bg-amber-400 rounded-full"></div>
                  </div>
                  <span className="w-8 text-right font-medium text-slate-600 dark:text-slate-300">85%</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-12 text-slate-500">4 {locale === "uz" ? "yulduz" : "звезд"}</span>
                  <div className="flex-1 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div className="w-[12%] h-full bg-amber-400 rounded-full"></div>
                  </div>
                  <span className="w-8 text-right font-medium text-slate-600 dark:text-slate-300">12%</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-12 text-slate-500">3 {locale === "uz" ? "yulduz" : "звезд"}</span>
                  <div className="flex-1 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div className="w-[3%] h-full bg-amber-400 rounded-full"></div>
                  </div>
                  <span className="w-8 text-right font-medium text-slate-600 dark:text-slate-300">3%</span>
                </div>
              </div>

              <div>
                <button
                  type="button"
                  onClick={() => alert(locale === "uz" ? "Sharh qoldirish uchun xaridni amalga oshirishingiz lozim." : "Для оставления отзыва необходимо совершить покупку.")}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-colors whitespace-nowrap"
                >
                  {t("writeReview")}
                </button>
              </div>
            </div>

            {/* Reviews List */}
            <div className="space-y-4">
              {mockReviews.map((rev) => (
                <div
                  key={rev.id}
                  className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 font-bold flex items-center justify-center text-xs">
                        {rev.author[0]}
                      </div>
                      <div>
                        <div className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                          {rev.author}
                          <span className="inline-flex items-center gap-1 text-[11px] font-normal text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full">
                            <CheckCircle className="w-3 h-3" />
                            {t("verifiedBuyer")}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {rev.date}
                        </div>
                      </div>
                    </div>
                    <div className="flex text-amber-400">
                      {[...Array(rev.rating)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-current" />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                    {rev.comment}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <button className="flex items-center gap-1 hover:text-blue-600 transition-colors">
                      <ThumbsUp className="w-3.5 h-3.5" />
                      <span>{rev.likes}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* FAQ Tab */}
        {activeTab === "faq" && (
          <div className="space-y-4 max-w-4xl">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
              {t("faqTab")}
            </h3>
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div
                  key={index}
                  className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : index)}
                    className="w-full flex items-center justify-between p-4 sm:p-5 text-left font-semibold text-slate-900 dark:text-white bg-slate-50/50 dark:bg-slate-900/50 hover:bg-slate-100/50 transition-colors"
                  >
                    <span className="text-sm sm:text-base">{faq.q}</span>
                    <ChevronDown
                      className={`w-5 h-5 text-slate-400 transition-transform duration-200 ${
                        isOpen ? "rotate-180 text-blue-600" : ""
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="p-4 sm:p-5 text-sm text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 leading-relaxed">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
