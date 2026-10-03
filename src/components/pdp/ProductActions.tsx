"use client";

import { useState } from "react";
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
} from "lucide-react";
import { useCartStore } from "@/lib/store/cart";
import { Product, getProductLocalized } from "@/lib/schemas/product";
import { calculateProductPrice } from "@/lib/utils/price";

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
  const stockQty = product.price?.quantity_remaining ?? (product.price?.stock !== "OutOfStock" ? 10 : 0);
  const inStock = product.price?.stock !== "OutOfStock" && stockQty > 0;
  const canAddToCart = inStock && priceVal > 0;
  const maxAvailable = inStock ? (stockQty > 0 ? stockQty : 10) : 0;

  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [fastOrderSubmitted, setFastOrderSubmitted] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("+998 ");

  const addItem = useCartStore((state) => state.addItem);

  const handleAddToCart = () => {
    if (!canAddToCart) return;
    addItem(
      {
        id: product.id,
        sku: product.product_sku,
        name: loc.name,
        price: priceVal,
        picture: product.main_picture,
        unit: loc.unit,
      },
      quantity
    );
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2200);
  };

  const handleFastOrderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerPhone || customerPhone.length < 9) return;
    setFastOrderSubmitted(true);
    setTimeout(() => {
      setFastOrderSubmitted(false);
      setIsModalOpen(false);
      setCustomerName("");
      setCustomerPhone("+998 ");
    }, 2500);
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
              {common("inStock")} ({maxAvailable} {loc.unit})
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
        <button
          type="button"
          disabled={!inStock}
          onClick={() => setIsModalOpen(true)}
          className="w-full h-12 flex items-center justify-center gap-2 rounded-xl font-bold text-slate-800 dark:text-white bg-amber-400 hover:bg-amber-500 active:scale-[0.98] transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Zap className="w-5 h-5 fill-current" />
          <span>{t("buyNow")}</span>
        </button>
      </div>

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

        <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50/70 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800/80">
          <RotateCcw className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
              {locale === "uz" ? "14 kunda qaytarish" : "Возврат 14 дней"}
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
              {locale === "uz"
                ? "Nuqson yoki mos kelmaslik holatida oson almashtirish kafolati."
                : "Гарантия легкого обмена или возврата в случае несоответствия."}
            </p>
          </div>
        </div>
      </div>

      {/* 1-Click Fast Order Modal */}
      {isModalOpen && (
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
            ) : (
              <form onSubmit={handleFastOrderSubmit} className="space-y-4">
                <div className="space-y-1">
                  <h3 className="text-xl font-black text-slate-900 dark:text-white">
                    {t("buyNow")}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                    {loc.name}
                  </p>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl flex items-center justify-between text-sm">
                  <span className="text-slate-500">{t("quantity")}: {quantity} {loc.unit}</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {(priceVal * quantity).toLocaleString("ru-RU")} {common("currency")}
                  </span>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      {locale === "uz" ? "Ismingiz" : "Ваше имя"}
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder={locale === "uz" ? "Masalan: Jasur" : "Например: Жасур"}
                        className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sora-500 dark:text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      {locale === "uz" ? "Telefon raqamingiz" : "Ваш телефон"}
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="tel"
                        required
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        placeholder="+998 90 123 45 67"
                        className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sora-500 dark:text-white"
                      />
                    </div>
                  </div>
                </div>

                <p className="text-[11px] text-slate-400 dark:text-slate-500 leading-tight">
                  {locale === "uz"
                    ? "Tugmani bosish orqali siz shaxsiy ma'lumotlarni qayta ishlash shartlariga rozilik bildirasiz."
                    : "Нажимая кнопку, вы соглашаетесь на обработку персональных данных."}
                </p>

                <button
                  type="submit"
                  className="w-full py-3 bg-sora-600 hover:bg-sora-700 text-white font-bold rounded-xl shadow-md transition-colors"
                >
                  {locale === "uz" ? "Buyurtmani tasdiqlash" : "Подтвердить заказ"}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
