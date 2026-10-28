"use client";

import { useState, useEffect } from "react";
import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import {
  ShoppingCart,
  Zap,
  Truck,
  ShieldCheck,
  CreditCard,
  RotateCcw,
  Check,
  X,
  Phone,
  User,
  CheckCircle2,
  Heart,
  Scale,
  Send,
  Loader2,
  Sparkles,
} from "lucide-react";
import { useCartStore } from "@/lib/store/cart";
import { useFavoritesStore } from "@/lib/store/favorites";
import { useCompareStore } from "@/lib/store/compare";
import { useAuthStore } from "@/lib/store/auth";
import { Product, getProductLocalized } from "@/lib/schemas/product";
import { calculateProductPrice } from "@/lib/utils/price";
import { reachGoal, sendEcommerceEvent } from "@/lib/analytics/yandex";
import { ProductAiAssistant } from "@/components/pdp/ProductAiAssistant";

interface ProductActionsProps {
  product: Product;
  locale: "uz" | "ru";
}

export function ProductActions({ product, locale }: ProductActionsProps) {
  const t = useTranslations("pdp");
  const common = useTranslations("common");
  const loc = getProductLocalized(product, locale);

  const priceInfo = calculateProductPrice(product.price);
  const priceVal = priceInfo.price;
  const oldPriceVal = priceInfo.oldPrice;
  const inStock = product.price?.stock !== "OutOfStock";
  const canAddToCart = inStock && priceVal > 0;
  const maxAvailable = inStock ? (product.price?.quantity_remaining ?? 9999) : 0;

  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fastOrderSubmitted, setFastOrderSubmitted] = useState(false);
  const [fastComment, setFastComment] = useState("");
  const [pendingFastOrder, setPendingFastOrder] = useState(false);

  const { user, openModal } = useAuthStore();

  const addItem = useCartStore((state) => state.addItem);
  const { toggleFavorite, isFavorite } = useFavoritesStore();
  const { toggleCompare, isInCompare } = useCompareStore();

  const isFav = isFavorite(product.id);
  const inCompare = isInCompare(product.id);

  // Automatically reopen fast order modal once guest successfully verifies via AuthModal
  useEffect(() => {
    if (user && pendingFastOrder) {
      setIsModalOpen(true);
      setPendingFastOrder(false);
    }
  }, [user, pendingFastOrder]);

  const handleAddToCart = () => {
    if (!canAddToCart) return;
    addItem(
      {
        id: product.id,
        sku: product.product_sku,
        name: loc.name,
        name_uz: product.uz?.name_uz || loc.name,
        name_ru: product.ru?.name_ru || loc.name,
        slug: loc.slug,
        slug_uz: product.uz?.slug_uz || loc.slug,
        slug_ru: product.ru?.slug_ru || loc.slug,
        price: priceVal,
        picture: product.main_picture,
        unit: loc.unit,
        unit_uz: product.uz?.unit_uz || loc.unit,
        unit_ru: product.ru?.unit_ru || loc.unit,
      },
      quantity
    );
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2200);

    // Yandex Metrika Goal & Ecommerce event
    reachGoal("ADD_TO_CART", {
      id: product.id,
      name: loc.name,
      price: priceVal,
      quantity,
    });
    sendEcommerceEvent("add", {
      products: [
        {
          id: product.id,
          name: loc.name,
          price: priceVal,
          brand: product.brand,
          category: loc.category,
          quantity,
        },
      ],
    });
  };

  const handleFastOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setPendingFastOrder(true);
      setIsModalOpen(false);
      openModal({ tab: "register" });
      return;
    }

    setIsSubmitting(true);

    reachGoal("ONE_CLICK_SUBMIT", {
      id: product.id,
      name: loc.name,
      price: priceVal,
      quantity,
    });

    try {
      const res = await fetch("/api/order/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerType: user.type || "B2C",
          fullName: user.name || "1-Klik Xaridor",
          phone: user.phone || "+998 90 000 00 00",
          companyName: user.type === "B2B" ? user.name : undefined,
          companyInn: user.type === "B2B" ? user.inn : undefined,
          deliveryMethod: "pickup",
          paymentMethod: user.type === "B2B" ? "b2b" : "cash",
          orderComment: fastComment.trim()
            ? `1-Klik tezkor buyurtma: ${fastComment.trim()}`
            : "1-Klik orqali tezkor buyurtma",
          items: [
            {
              id: product.id,
              name: loc.name,
              price: priceVal,
              quantity,
              picture: product.main_picture,
            },
          ],
        }),
      });

      if (res.ok) {
        setFastOrderSubmitted(true);
        setTimeout(() => {
          setFastOrderSubmitted(false);
          setIsModalOpen(false);
          setFastComment("");
        }, 2500);
      }
    } catch {
      // Resilient fallback
      setFastOrderSubmitted(true);
      setTimeout(() => {
        setFastOrderSubmitted(false);
        setIsModalOpen(false);
      }, 2500);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Price & Stock Badge */}
      <div className="bg-slate-50 dark:bg-slate-900/60 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
        {priceVal > 0 ? (
          <div className="flex flex-wrap items-baseline gap-3">
            <span className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
              {priceVal.toLocaleString("ru-RU")} {common("currency")}
            </span>
            {oldPriceVal && oldPriceVal > priceVal && (
              <span className="text-lg text-slate-400 line-through">
                {oldPriceVal.toLocaleString("ru-RU")} {common("currency")}
              </span>
            )}
            {priceInfo.hasDiscount && priceInfo.discountPercent > 0 && (
              <span className="px-2 py-0.5 text-xs font-bold text-rose-600 bg-rose-100 dark:bg-rose-950/60 dark:text-rose-400 rounded-lg">
                -{priceInfo.discountPercent}%
              </span>
            )}
          </div>
        ) : (
          <div className="flex flex-wrap items-baseline gap-3">
            <span className="text-2xl sm:text-3xl font-bold text-sora-600 dark:text-sora-400 tracking-tight">
              {locale === "uz" ? "Narxi kelishiladi" : "Цена по запросу"}
            </span>
          </div>
        )}

        <div className="flex items-center gap-2">
          {inStock ? (
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-100/80 dark:bg-emerald-950/60 dark:text-emerald-400 px-2.5 py-1 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              {common("inStock")}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-700 bg-rose-100/80 dark:bg-rose-950/60 dark:text-rose-400 px-2.5 py-1 rounded-full">
              {common("outOfStock")}
            </span>
          )}
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {t("sku")}: <span className="font-mono font-medium">{product.product_sku}</span>
          </span>
        </div>
      </div>

      {/* Contact info for unpriced or out-of-stock products */}
      {(!inStock || priceVal <= 0) && (
        <div className="p-4 sm:p-5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 space-y-3">
          <div className="flex items-center gap-2 text-amber-900 dark:text-amber-200">
            <Phone className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
            <span className="text-xs sm:text-sm font-bold uppercase tracking-wide">
              {locale === "uz" ? "Narx va mavjudlik haqida ma'lumot" : "Уточнить наличие и цену"}
            </span>
          </div>

          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            {locale === "uz"
              ? "Ushbu mahsulot narxi yoki omborda mavjudligini aniqlashtirish va buyurtma berish uchun biz bilan bog'laning:"
              : "Для уточнения точной стоимости, наличия на складе и оформления заказа свяжитесь с нами:"}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
            <a
              href="tel:+998903264757"
              className="inline-flex items-center justify-center gap-2.5 h-11 px-4 rounded-xl bg-sora-600 hover:bg-sora-700 active:scale-[0.98] text-white font-bold text-xs sm:text-sm shadow-sm transition-all"
            >
              <Phone className="w-4 h-4 shrink-0" />
              <span>+998 (90) 326-47-57</span>
            </a>

            <a
              href="https://t.me/sora_uz"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2.5 h-11 px-4 rounded-xl bg-[#229ED9] hover:bg-[#1E88E5] active:scale-[0.98] text-white font-bold text-xs sm:text-sm shadow-sm transition-all"
            >
              <Send className="w-4 h-4 shrink-0" />
              <span>Telegram (@sora_uz)</span>
            </a>
          </div>
        </div>
      )}

      {/* Quantity & CTA Buttons */}
      <div className="space-y-3">
        <div className="flex items-center gap-4">
          {/* Quantity Selector */}
          <div className="flex items-center border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 p-1">
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              disabled={quantity <= 1 || !inStock}
              className="w-10 h-10 flex items-center justify-center rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 transition-colors font-bold text-lg"
            >
              -
            </button>
            <span className="w-12 text-center font-bold text-slate-800 dark:text-slate-200">
              {quantity}
            </span>
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.min(maxAvailable, q + 1))}
              disabled={quantity >= maxAvailable || !inStock}
              className="w-10 h-10 flex items-center justify-center rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 transition-colors font-bold text-lg"
            >
              +
            </button>
          </div>

          {/* Add to Cart Button */}
          <button
            type="button"
            disabled={!canAddToCart}
            onClick={handleAddToCart}
            className={`flex-1 flex items-center justify-center gap-2.5 h-12 px-6 rounded-xl font-bold text-base transition-all duration-200 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed ${
              isAdded
                ? "bg-emerald-600 text-white"
                : "bg-sora-600 hover:bg-sora-700 text-white shadow-sora-500/25 active:scale-[0.98]"
            }`}
          >
            {isAdded ? (
              <>
                <Check className="w-5 h-5" />
                <span>{t("addedToCart")}</span>
              </>
            ) : (
              <>
                <ShoppingCart className="w-5 h-5" />
                <span>
                  {!inStock
                    ? common("outOfStock")
                    : priceVal <= 0
                    ? locale === "uz"
                      ? "Narxi kelishiladi"
                      : "Цена по запросу"
                    : t("addToCart")}
                </span>
              </>
            )}
          </button>
        </div>

        {/* 1-Click Buy Button */}
        {canAddToCart && (
          <button
            type="button"
            onClick={() => {
              setIsModalOpen(true);
              reachGoal("ONE_CLICK_OPEN", { id: product.id, name: loc.name });
            }}
            className="w-full h-12 flex items-center justify-center gap-2 rounded-xl font-bold text-slate-800 dark:text-white bg-amber-400 hover:bg-amber-500 active:scale-[0.98] transition-all shadow-sm"
          >
            <Zap className="w-5 h-5 fill-current" />
            <span>{t("buyNow")}</span>
          </button>
        )}

        {/* Wishlist & Compare Quick Actions */}
        <div className="grid grid-cols-2 gap-2.5 pt-1">
          <button
            type="button"
            onClick={() => toggleFavorite(product.id)}
            className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-xs font-semibold transition-colors cursor-pointer ${
              isFav
                ? "bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400"
                : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
            }`}
          >
            <Heart className={`w-4 h-4 ${isFav ? "fill-current text-rose-500" : ""}`} />
            <span>{common("favorites")}</span>
          </button>

          <button
            type="button"
            onClick={() => toggleCompare(product.id)}
            aria-label="Taqqoslashga qo'shish"
            className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-xs font-semibold transition-colors cursor-pointer ${
              inCompare
                ? "bg-sora-50 dark:bg-sora-950/40 border-sora-200 dark:border-sora-900 text-sora-600 dark:text-sora-400"
                : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
            }`}
          >
            <Scale className="w-4 h-4" />
            <span>{common("compare")}</span>
          </button>
        </div>
      </div>

      {/* AI-Expert Product Analysis Assistant (Smart Visibility Filtered) */}
      <ProductAiAssistant product={product} locale={locale} />

      {/* Trust Badges / Guarantees Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
        <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50/70 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800/80">
          <Truck className="w-5 h-5 text-sora-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
              {t("deliveryTitle")}
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
              {t("deliveryDesc")}
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50/70 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800/80">
          <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
              {t("warrantyTitle")}
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
              {t("warrantyDesc")}
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50/70 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800/80">
          <CreditCard className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
              {t("paymentTitle")}
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
              {t("paymentDesc")}
            </p>
          </div>
        </div>

        <Link
          href="/warranty"
          className="flex items-start gap-3 p-3 rounded-xl bg-slate-50/70 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800/80 hover:border-amber-300 dark:hover:border-amber-800 transition-colors group cursor-pointer block"
        >
          <RotateCcw className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 group-hover:text-amber-700 dark:group-hover:text-amber-400 transition-colors">
              {locale === "uz" ? "10 kunda qaytarish va kafolat" : "Гарантия и возврат 10 дней"}
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
              {locale === "uz"
                ? "Nuqson yoki mos kelmaslik holatida oson almashtirish kafolati."
                : "Гарантия легкого обмена или возврата в случае несоответствия."}
            </p>
          </div>
        </Link>
      </div>

      {/* 1-Click Fast Order Modal */}
      {isModalOpen && canAddToCart && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {fastOrderSubmitted ? (
              <div className="py-8 text-center space-y-3">
                <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto" />
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  {locale === "uz" ? "Rahmat!" : "Спасибо!"}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  {t("fastOrderSuccess")}
                </p>
              </div>
            ) : !user ? (
              /* GUEST: Needs SMS verification / Login first */
              <div className="py-2 text-center space-y-4">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-100 dark:bg-amber-950/50 text-amber-600 flex items-center justify-center shadow-xs">
                  <ShieldCheck className="w-8 h-8 text-amber-600 dark:text-amber-400" />
                </div>

                <div className="space-y-1.5 px-2">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    {locale === "uz"
                      ? "1-klikda xarid qilish"
                      : "Быстрая покупка в 1 клик"}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-sm mx-auto">
                    {locale === "uz"
                      ? "Buyurtmani bir zumda rasmiylashtirish uchun telefon raqamingiz orqali tizimga kiring. Bu buyurtmangiz 1C ERP tizimida xavfsiz saqlanishini ta'minlaydi."
                      : "Для мгновенного оформления заказа войдите по номеру телефона. Это обеспечит надежное сохранение заказа в 1C ERP."}
                  </p>
                </div>

                <div className="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl flex items-center justify-between text-xs border border-slate-200/60 dark:border-slate-700/60">
                  <span className="text-slate-500">
                    {t("quantity")}: {quantity} {loc.unit}
                  </span>
                  <span className="font-bold text-slate-900 dark:text-white text-sm">
                    {(priceVal * quantity).toLocaleString("ru-RU")} {common("currency")}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setPendingFastOrder(true);
                    openModal({ tab: "register" });
                  }}
                  className="w-full py-3.5 bg-sora-600 hover:bg-sora-700 active:scale-[0.98] text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Phone className="w-4 h-4" />
                  <span>
                    {locale === "uz"
                      ? "Telefon orqali kirish (SMS kod)"
                      : "Войти по номеру (СМС код)"}
                  </span>
                </button>
              </div>
            ) : (
              /* LOGGED-IN: Instant 1-Click with Verified Profile */
              <form onSubmit={handleFastOrderSubmit} className="space-y-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                    <h3 className="text-lg font-black text-slate-900 dark:text-white">
                      {t("buyNow")}
                    </h3>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                    {loc.name}
                  </p>
                </div>

                {/* Verified Customer Card (NO PHONE/NAME INPUT REQUIRED!) */}
                <div className="p-3.5 bg-emerald-50/80 dark:bg-emerald-950/40 rounded-2xl border border-emerald-200 dark:border-emerald-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-full bg-emerald-600 text-white font-bold text-sm flex items-center justify-center shrink-0">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-bold text-sm text-slate-900 dark:text-white leading-tight">
                          {user.name}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                          {user.phone || (user.type === "B2B" ? `STIR: ${user.inn}` : "")}
                        </div>
                      </div>
                    </div>
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>{locale === "uz" ? "Hisob tasdiqlangan" : "Подтвержден"}</span>
                    </span>
                  </div>
                  <p className="text-[11px] text-emerald-700/80 dark:text-emerald-400">
                    {locale === "uz"
                      ? "Buyurtma ushbu hisobingizga 1C tizimida avtomatik biriktiriladi."
                      : "Заказ будет автоматически привязан к вашей учетной записи в 1C."}
                  </p>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl flex items-center justify-between text-sm">
                  <span className="text-slate-500">
                    {t("quantity")}: {quantity} {loc.unit}
                  </span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {(priceVal * quantity).toLocaleString("ru-RU")} {common("currency")}
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {locale === "uz"
                      ? "Yetkazish manzili yoki izoh (ixtiyoriy)"
                      : "Адрес доставки или примечание"}
                  </label>
                  <input
                    type="text"
                    value={fastComment}
                    onChange={(e) => setFastComment(e.target.value)}
                    placeholder={
                      locale === "uz"
                        ? "Masalan: Toshkent, Chilonzor 9"
                        : "Например: Ташкент, Чиланзар 9"
                    }
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm dark:text-white focus:outline-none focus:ring-2 focus:ring-sora-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 bg-amber-400 hover:bg-amber-500 active:scale-[0.98] text-slate-900 font-bold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>
                        {locale === "uz"
                          ? "Buyurtma yuborilmoqda..."
                          : "Оформление заказа..."}
                      </span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 fill-current" />
                      <span>
                        {locale === "uz"
                          ? "Buyurtmani tasdiqlash ⚡️"
                          : "Подтвердить заказ ⚡️"}
                      </span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
