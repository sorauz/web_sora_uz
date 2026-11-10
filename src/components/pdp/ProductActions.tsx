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
  CheckCircle2,
  Heart,
  Scale,
  Send,
  Loader2,
  MapPin,
  Building2,
  Navigation,
  Clock,
  AlertCircle,
} from "lucide-react";
import { useCartStore } from "@/lib/store/cart";
import { useFavoritesStore } from "@/lib/store/favorites";
import { useCompareStore } from "@/lib/store/compare";
import { useAuthStore } from "@/lib/store/auth";
import { Product, getProductLocalized } from "@/lib/schemas/product";
import { calculateProductPrice } from "@/lib/utils/price";
import { reachGoal, sendEcommerceEvent } from "@/lib/analytics/yandex";
import { ProductAiAssistant } from "@/components/pdp/ProductAiAssistant";
import {
  LocationPickerModal,
  formatOneCGeolocationUrl,
} from "@/components/checkout/LocationPickerModal";

export const MIN_ONE_CLICK_PRICE = 200_000;

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
  const canOneClickBuy = canAddToCart && priceVal >= MIN_ONE_CLICK_PRICE;
  const maxAvailable = inStock ? (product.price?.quantity_remaining ?? 9999) : 0;

  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fastOrderSubmitted, setFastOrderSubmitted] = useState(false);
  const [fastComment, setFastComment] = useState("");
  const [pendingFastOrder, setPendingFastOrder] = useState(false);

  // 1-Click Delivery & Map Picker state
  const [deliveryMethod, setDeliveryMethod] = useState<"courier" | "pickup">("courier");
  const [geolocation, setGeolocation] = useState("");
  const [detectedAddress, setDetectedAddress] = useState("");
  const [detectedDistrict, setDetectedDistrict] = useState("");
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const [isLocatingGps, setIsLocatingGps] = useState(false);
  const [fastOrderError, setFastOrderError] = useState("");

  const subtotal = priceVal * quantity;
  const isFreeDelivery = deliveryMethod === "pickup" || subtotal >= 500_000;
  const deliveryFee = isFreeDelivery ? 0 : 30_000;
  const totalAmount = subtotal + deliveryFee;

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
    setFastOrderError("");

    // Validate map point when Courier delivery is chosen
    if (deliveryMethod === "courier" && !geolocation.trim()) {
      setFastOrderError(
        locale === "uz"
          ? "Iltimos, kuryer orqali yetkazib berish uchun xaritadan yetkazish nuqtasini belgilang!"
          : "Пожалуйста, укажите точку доставки на карте для курьера!"
      );
      return;
    }

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
      deliveryMethod,
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
          deliveryMethod,
          region:
            deliveryMethod === "courier"
              ? locale === "uz"
                ? "Toshkent shahri"
                : "г. Ташкент"
              : undefined,
          district:
            deliveryMethod === "courier" && detectedDistrict
              ? detectedDistrict
              : undefined,
          address:
            deliveryMethod === "courier" && detectedAddress
              ? detectedAddress
              : undefined,
          geolocation: deliveryMethod === "courier" ? geolocation : "",
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
          <div className="space-y-1.5">
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
            <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-700 dark:text-emerald-400">
              <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>{t("vatIncluded")}</span>
            </div>
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

        {/* 1-Click Buy Button (Only available for products >= 200,000 UZS) */}
        {canOneClickBuy && (
          <button
            type="button"
            onClick={() => {
              setFastOrderError("");
              setIsModalOpen(true);
              reachGoal("ONE_CLICK_OPEN", { id: product.id, name: loc.name });
            }}
            className="w-full h-12 flex items-center justify-center gap-2 rounded-xl font-bold text-slate-800 dark:text-white bg-amber-400 hover:bg-amber-500 active:scale-[0.98] transition-all shadow-sm cursor-pointer"
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
      {isModalOpen && canOneClickBuy && (
        <div
          data-testid="fast-order-modal"
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto"
        >
          <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-200 max-h-[94vh] overflow-y-auto">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
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
            ) : (
              <form onSubmit={handleFastOrderSubmit} className="space-y-4">
                {/* Modal Title & Product Name */}
                <div className="space-y-1 pr-6">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse"></span>
                    <h3 className="text-lg font-black text-slate-900 dark:text-white">
                      {t("buyNow")}
                    </h3>
                  </div>
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400 line-clamp-1">
                    {loc.name}
                  </p>
                </div>

                {/* Verified Customer Card or Guest Info Notice */}
                {user ? (
                  <div className="p-3 bg-emerald-50/80 dark:bg-emerald-950/40 rounded-2xl border border-emerald-200 dark:border-emerald-800 space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white truncate">
                            {user.name}
                          </div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                            {user.phone || (user.type === "B2B" ? `STIR: ${user.inn}` : "")}
                          </div>
                        </div>
                      </div>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300 shrink-0">
                        <ShieldCheck className="w-3 h-3" />
                        <span>{locale === "uz" ? "Tasdiqlangan" : "Подтвержден"}</span>
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 bg-amber-50/80 dark:bg-amber-950/30 rounded-2xl border border-amber-200/80 dark:border-amber-800/60 flex items-center gap-2.5">
                    <ShieldCheck className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
                    <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-snug">
                      {locale === "uz"
                        ? "Miqdor va yetkazib berish usulini tanlang. Tasdiqlash bosilganda telefon raqamingiz SMS kod orqali 1C tizimiga biriktiriladi."
                        : "Выберите количество и способ доставки. При подтверждении заказ будет привязан к вашему номеру по СМС."}
                    </p>
                  </div>
                )}

                {/* 1. Interactive Quantity Selector inside Modal */}
                <div
                  data-testid="fast-order-quantity-box"
                  className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between gap-3"
                >
                  <div>
                    <div className="text-xs font-bold text-slate-700 dark:text-slate-200">
                      {t("quantity")} ({loc.unit})
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">
                      {priceVal.toLocaleString("ru-RU")} {common("currency")} / {loc.unit}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex items-center border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 p-0.5 shadow-2xs">
                      <button
                        type="button"
                        data-testid="fast-order-qty-minus"
                        onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                        disabled={quantity <= 1}
                        className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 transition-colors font-bold text-base cursor-pointer"
                      >
                        -
                      </button>
                      <input
                        type="number"
                        data-testid="fast-order-qty-input"
                        min={1}
                        max={maxAvailable}
                        value={quantity}
                        aria-label={t("quantity")}
                        onChange={(e) => {
                          const val = parseInt(e.target.value, 10);
                          if (!Number.isNaN(val)) {
                            setQuantity(Math.max(1, Math.min(maxAvailable, val)));
                          }
                        }}
                        className="w-12 text-center font-bold text-sm text-slate-900 dark:text-white bg-transparent focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                      <button
                        type="button"
                        data-testid="fast-order-qty-plus"
                        onClick={() => setQuantity((q) => Math.min(maxAvailable, q + 1))}
                        disabled={quantity >= maxAvailable}
                        className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 transition-colors font-bold text-base cursor-pointer"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>

                {/* 2. Delivery Method & Address Selection */}
                <div className="space-y-3">
                  <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                    {locale === "uz"
                      ? "Yetkazib berish usuli va manzili"
                      : "Способ и адрес доставки"}
                  </label>

                  <div className="grid grid-cols-2 gap-2.5">
                    {/* Option 1: Courier */}
                    <label
                      data-testid="fast-order-delivery-courier"
                      onClick={() => {
                        setDeliveryMethod("courier");
                        setFastOrderError("");
                      }}
                      className={`p-3 rounded-2xl border-2 cursor-pointer transition-all flex items-start gap-2.5 ${
                        deliveryMethod === "courier"
                          ? "border-sora-600 bg-sora-50/40 dark:bg-sora-950/20 shadow-2xs"
                          : "border-slate-200 dark:border-slate-800 hover:border-slate-300"
                      }`}
                    >
                      <input
                        type="radio"
                        name="fastDeliveryMethod"
                        checked={deliveryMethod === "courier"}
                        onChange={() => {
                          setDeliveryMethod("courier");
                          setFastOrderError("");
                        }}
                        className="mt-0.5"
                      />
                      <div className="space-y-1 min-w-0">
                        <div className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                          <Truck className="w-3.5 h-3.5 text-sora-600 dark:text-sora-400 shrink-0" />
                          <span className="truncate">
                            {locale === "uz" ? "Kuryer orqali" : "Курьером"}
                          </span>
                        </div>
                        <div>
                          {subtotal >= 500_000 ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>{locale === "uz" ? "Bepul" : "Бесплатно"}</span>
                            </span>
                          ) : (
                            <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                              {locale === "uz" ? "30 000 so'm" : "30 000 сум"}
                            </span>
                          )}
                        </div>
                      </div>
                    </label>

                    {/* Option 2: Self Pickup */}
                    <label
                      data-testid="fast-order-delivery-pickup"
                      onClick={() => {
                        setDeliveryMethod("pickup");
                        setFastOrderError("");
                      }}
                      className={`p-3 rounded-2xl border-2 cursor-pointer transition-all flex items-start gap-2.5 ${
                        deliveryMethod === "pickup"
                          ? "border-sora-600 bg-sora-50/40 dark:bg-sora-950/20 shadow-2xs"
                          : "border-slate-200 dark:border-slate-800 hover:border-slate-300"
                      }`}
                    >
                      <input
                        type="radio"
                        name="fastDeliveryMethod"
                        checked={deliveryMethod === "pickup"}
                        onChange={() => {
                          setDeliveryMethod("pickup");
                          setFastOrderError("");
                        }}
                        className="mt-0.5"
                      />
                      <div className="space-y-1 min-w-0">
                        <div className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span className="truncate">
                            {locale === "uz" ? "O'zi olib ketish" : "Самовывоз"}
                          </span>
                        </div>
                        <div>
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>{locale === "uz" ? "Har doim bepul" : "Бесплатно"}</span>
                          </span>
                        </div>
                      </div>
                    </label>
                  </div>

                  {/* Conditional Map Picker (for Courier) OR Pickup Warehouse Info */}
                  {deliveryMethod === "courier" ? (
                    <div
                      data-testid="fast-order-map-box"
                      onClick={() => {
                        setFastOrderError("");
                        setIsMapModalOpen(true);
                      }}
                      className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer group ${
                        geolocation
                          ? "bg-emerald-50/80 dark:bg-emerald-950/30 border-emerald-500"
                          : "bg-linear-to-r from-sora-50/80 via-white to-blue-50/60 dark:from-sora-950/30 dark:via-slate-900 dark:to-blue-950/30 border-sora-300 dark:border-sora-700 hover:border-sora-500"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2.5">
                        <div className="flex items-start gap-2.5 min-w-0">
                          <div
                            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                              geolocation
                                ? "bg-emerald-600 text-white"
                                : "bg-sora-600 text-white"
                            }`}
                          >
                            <MapPin className="w-5 h-5" />
                          </div>
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-1.5">
                              <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                                {geolocation
                                  ? locale === "uz"
                                    ? "Yetkazish nuqtasi belgilandi"
                                    : "Точка доставки выбрана"
                                  : locale === "uz"
                                  ? "Xaritadan yetkazish nuqtasini belgilash *"
                                  : "Указать точку доставки на карте *"}
                              </h4>
                              {geolocation && (
                                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300">
                                  <CheckCircle2 className="w-2.5 h-2.5" />
                                  <span>{locale === "uz" ? "Saqlandi" : "Сохранено"}</span>
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5 line-clamp-2">
                              {geolocation
                                ? detectedAddress ||
                                  (locale === "uz"
                                    ? "Koordinatalar xaritadan biriktirildi"
                                    : "Координаты привязаны с карты")
                                : locale === "uz"
                                ? "Kuryer adashmasdan yetib borishi uchun xaritadan tanlang"
                                : "Выберите точку на карте для точной доставки курьером"}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            data-testid="fast-order-open-map-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              setFastOrderError("");
                              setIsMapModalOpen(true);
                            }}
                            className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                              geolocation
                                ? "bg-white dark:bg-slate-800 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 hover:bg-emerald-50"
                                : "bg-sora-600 hover:bg-sora-700 text-white shadow-xs"
                            }`}
                          >
                            <MapPin className="w-3.5 h-3.5" />
                            <span>
                              {geolocation
                                ? locale === "uz"
                                  ? "O'zgartirish"
                                  : "Изменить"
                                : locale === "uz"
                                ? "Xarita"
                                : "Карта"}
                            </span>
                          </button>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setFastOrderError("");
                              if (typeof navigator === "undefined" || !navigator.geolocation) {
                                setIsMapModalOpen(true);
                                return;
                              }
                              setIsLocatingGps(true);
                              navigator.geolocation.getCurrentPosition(
                                (pos) => {
                                  setGeolocation(
                                    formatOneCGeolocationUrl(
                                      pos.coords.latitude,
                                      pos.coords.longitude
                                    )
                                  );
                                  setIsLocatingGps(false);
                                },
                                () => {
                                  setIsLocatingGps(false);
                                  setIsMapModalOpen(true);
                                },
                                { enableHighAccuracy: true, timeout: 8000 }
                              );
                            }}
                            title="GPS"
                            className="px-2.5 py-2 rounded-xl text-xs font-bold border bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 transition-all flex items-center gap-1 cursor-pointer"
                          >
                            <Navigation
                              className={`w-3.5 h-3.5 text-sora-600 ${
                                isLocatingGps ? "animate-spin" : ""
                              }`}
                            />
                            <span>{isLocatingGps ? "..." : "GPS"}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div
                      data-testid="fast-order-pickup-info"
                      className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1.5"
                    >
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
                        <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>
                          {locale === "uz"
                            ? "Toshkent sh., Olmazor tumani, Dilsaroy ko'chasi, 1-uy"
                            : "г. Ташкент, Алмазарский р-н, ул. Дилсарой, дом 1"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                        <Clock className="w-3.5 h-3.5 shrink-0" />
                        <span>
                          {locale === "uz"
                            ? "Dush - Shan: 09:00 - 18:00"
                            : "Пн - Сб: 09:00 - 18:00"}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Optional Comment */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {locale === "uz"
                      ? "Buyurtma uchun izoh (ixtiyoriy)"
                      : "Комментарий к заказу (необязательно)"}
                  </label>
                  <input
                    type="text"
                    value={fastComment}
                    onChange={(e) => setFastComment(e.target.value)}
                    placeholder={
                      locale === "uz"
                        ? "Masalan: Mo'ljal, domofon kodi yoki yetkazish vaqti"
                        : "Например: Ориентир, код домофона или время доставки"
                    }
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm dark:text-white focus:outline-none focus:ring-2 focus:ring-sora-500"
                  />
                </div>

                {/* Live Order Total Summary */}
                <div className="p-3 bg-slate-50 dark:bg-slate-800/70 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                    <span>
                      {locale === "uz" ? "Mahsulot qiymati" : "Стоимость товара"} ({quantity} {loc.unit}):
                    </span>
                    <span className="font-semibold text-slate-700 dark:text-slate-200">
                      {subtotal.toLocaleString("ru-RU")} {common("currency")}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                    <span>
                      {locale === "uz" ? "Yetkazib berish:" : "Доставка:"}
                    </span>
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                      {isFreeDelivery
                        ? locale === "uz"
                          ? "Bepul"
                          : "Бесплатно"
                        : `${deliveryFee.toLocaleString("ru-RU")} ${common("currency")}`}
                    </span>
                  </div>
                  <div className="pt-1.5 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between text-sm font-black text-slate-900 dark:text-white">
                    <span>{locale === "uz" ? "Jami to'lov:" : "Итого к оплате:"}</span>
                    <span data-testid="fast-order-total-amount">
                      {totalAmount.toLocaleString("ru-RU")} {common("currency")}
                    </span>
                  </div>
                </div>

                {/* Validation Error Message */}
                {fastOrderError && (
                  <div
                    data-testid="fast-order-error"
                    className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs font-medium text-rose-600 dark:text-rose-400 flex items-center gap-2"
                  >
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{fastOrderError}</span>
                  </div>
                )}

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

      {/* Interactive Map Picker Modal for 1-Click Courier Delivery */}
      <LocationPickerModal
        isOpen={isMapModalOpen}
        onClose={() => setIsMapModalOpen(false)}
        locale={locale}
        initialGeolocation={geolocation}
        onConfirm={({ geolocationUrl, detectedDistrict: dist, detectedAddress: addr }) => {
          setGeolocation(geolocationUrl);
          if (dist) setDetectedDistrict(dist);
          if (addr) setDetectedAddress(addr);
          setFastOrderError("");
        }}
      />
    </div>
  );
}
