"use client";

import { useEffect, useState } from "react";
import { useRouter } from "@/i18n/routing";
import Image from "next/image";
import { useCartStore } from "@/lib/store/cart";
import { useTranslations } from "next-intl";
import {
  User,
  Phone,
  Mail,
  MapPin,
  Truck,
  Building2,
  CreditCard,
  Banknote,
  Zap,
  Smartphone,
  ShieldCheck,
  CheckCircle,
  Clock,
  ArrowRight,
} from "lucide-react";

interface CheckoutFormProps {
  locale: "uz" | "ru";
}

export function CheckoutForm({ locale }: CheckoutFormProps) {
  const t = useTranslations("checkout");
  const cartT = useTranslations("cart");
  const common = useTranslations("common");
  const router = useRouter();

  const { items, getTotalPrice, clearCart } = useCartStore();

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Form Fields
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("+998 ");
  const [altPhone, setAltPhone] = useState("");
  const [email, setEmail] = useState("");

  const [deliveryMethod, setDeliveryMethod] = useState<"courier" | "pickup">("courier");
  const [region, setRegion] = useState(locale === "uz" ? "Toshkent shahri" : "г. Ташкент");
  const [district, setDistrict] = useState("");
  const [address, setAddress] = useState("");
  const [landmark, setLandmark] = useState("");
  const [orderComment, setOrderComment] = useState("");

  const [paymentMethod, setPaymentMethod] = useState<"cash" | "payme" | "click" | "card" | "b2b">("cash");
  const [companyName, setCompanyName] = useState("");
  const [companyInn, setCompanyInn] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!mounted) {
    return (
      <div className="py-20 flex justify-center items-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (items.length === 0) {
    router.push("/cart");
    return null;
  }

  const subtotal = getTotalPrice();
  const isFreeDelivery = deliveryMethod === "pickup" || subtotal >= 500000;
  const deliveryFee = isFreeDelivery ? 0 : 30000;
  const total = subtotal + deliveryFee;

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || phone.trim().length < 9 || !fullName.trim()) return;

    setIsSubmitting(true);

    const orderId = `SORA-${Math.floor(100000 + Math.random() * 900000)}`;

    const orderData = {
      orderId,
      createdAt: new Date().toISOString(),
      fullName,
      phone,
      altPhone,
      email,
      deliveryMethod,
      region,
      district,
      address,
      landmark,
      orderComment,
      paymentMethod,
      companyName,
      companyInn,
      items,
      subtotal,
      deliveryFee,
      total,
      currency: "UZS",
    };

    try {
      localStorage.setItem("sora_last_order", JSON.stringify(orderData));
    } catch {
      // Ignore localStorage errors
    }

    // Clear cart and redirect to success page
    setTimeout(() => {
      clearCart();
      router.push(`/checkout/success?orderId=${orderId}`);
    }, 600);
  };

  const regionsList = [
    locale === "uz" ? "Toshkent shahri" : "г. Ташкент",
    locale === "uz" ? "Toshkent viloyati" : "Ташкентская область",
    locale === "uz" ? "Samarqand viloyati" : "Самаркандская область",
    locale === "uz" ? "Buxoro viloyati" : "Бухарская область",
    locale === "uz" ? "Andijon viloyati" : "Андижанская область",
    locale === "uz" ? "Farg'ona viloyati" : "Ферганская область",
    locale === "uz" ? "Namangan viloyati" : "Наманганская область",
    locale === "uz" ? "Qashqadaryo viloyati" : "Кашкадарьинская область",
    locale === "uz" ? "Surxondaryo viloyati" : "Сурхандарьинская область",
    locale === "uz" ? "Xorazm viloyati" : "Хорезмская область",
    locale === "uz" ? "Navoiy viloyati" : "Навоийская область",
    locale === "uz" ? "Jizzax viloyati" : "Джизакская область",
    locale === "uz" ? "Sirdaryo viloyati" : "Сырдарьинская область",
    locale === "uz" ? "Qoraqalpog'iston Respublikasi" : "Республика Каракалпакстан",
  ];

  return (
    <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Left: Checkout Steps (8 cols) */}
      <div className="lg:col-span-8 space-y-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            {t("title")}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {t("subtitle")}
          </p>
        </div>

        {/* STEP 1: Customer Details */}
        <section className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 dark:border-slate-800">
            <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
              {t("stepCustomer")}
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                {t("fullName")} *
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder={t("fullNamePlaceholder")}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                {t("phone")} *
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder={t("phonePlaceholder")}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                {t("altPhone")}
              </label>
              <div className="relative">
                <Smartphone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={altPhone}
                  onChange={(e) => setAltPhone(e.target.value)}
                  placeholder={t("altPhonePlaceholder")}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                {t("email")}
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t("emailPlaceholder")}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                />
              </div>
            </div>
          </div>
        </section>

        {/* STEP 2: Delivery Method & Address */}
        <section className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 dark:border-slate-800">
            <Truck className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
              {t("stepDelivery")}
            </h2>
          </div>

          {/* Delivery Method Options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label
              className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-start gap-3 ${
                deliveryMethod === "courier"
                  ? "border-blue-600 bg-blue-50/40 dark:bg-blue-950/20 shadow-xs"
                  : "border-slate-200 dark:border-slate-800 hover:border-slate-300"
              }`}
            >
              <input
                type="radio"
                name="deliveryMethod"
                checked={deliveryMethod === "courier"}
                onChange={() => setDeliveryMethod("courier")}
                className="mt-1"
              />
              <div className="space-y-1">
                <div className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Truck className="w-4 h-4 text-blue-600" />
                  <span>{t("deliveryCourier")}</span>
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  {isFreeDelivery ? t("freeDelivery") : `30 000 ${common("currency")}`}
                </div>
              </div>
            </label>

            <label
              className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-start gap-3 ${
                deliveryMethod === "pickup"
                  ? "border-blue-600 bg-blue-50/40 dark:bg-blue-950/20 shadow-xs"
                  : "border-slate-200 dark:border-slate-800 hover:border-slate-300"
              }`}
            >
              <input
                type="radio"
                name="deliveryMethod"
                checked={deliveryMethod === "pickup"}
                onChange={() => setDeliveryMethod("pickup")}
                className="mt-1"
              />
              <div className="space-y-1">
                <div className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-emerald-600" />
                  <span>{t("deliveryPickup")}</span>
                </div>
                <div className="text-xs text-emerald-600 font-semibold">
                  {t("freeDelivery")}
                </div>
              </div>
            </label>
          </div>

          {/* Conditional Delivery Inputs */}
          {deliveryMethod === "courier" ? (
            <div className="space-y-4 pt-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    {t("region")} *
                  </label>
                  <select
                    value={region}
                    onChange={(e) => setRegion(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                  >
                    {regionsList.map((r, idx) => (
                      <option key={idx} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    {t("district")} *
                  </label>
                  <input
                    type="text"
                    required
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    placeholder={t("districtPlaceholder")}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  {t("address")} *
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder={t("addressPlaceholder")}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    {t("landmark")}
                  </label>
                  <input
                    type="text"
                    value={landmark}
                    onChange={(e) => setLandmark(e.target.value)}
                    placeholder={t("landmarkPlaceholder")}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    {t("orderComment")}
                  </label>
                  <input
                    type="text"
                    value={orderComment}
                    onChange={(e) => setOrderComment(e.target.value)}
                    placeholder={t("orderCommentPlaceholder")}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
                <MapPin className="w-4 h-4 text-emerald-600" />
                <span>{t("pickupAddress")}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                <Clock className="w-3.5 h-3.5" />
                <span>Dush - Shan: 09:00 - 18:00</span>
              </div>
            </div>
          )}
        </section>

        {/* STEP 3: Payment Method */}
        <section className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 dark:border-slate-800">
            <CreditCard className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
              {t("stepPayment")}
            </h2>
          </div>

          <div className="space-y-3">
            {/* Cash on delivery */}
            <label
              className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-start gap-3.5 ${
                paymentMethod === "cash"
                  ? "border-blue-600 bg-blue-50/40 dark:bg-blue-950/20"
                  : "border-slate-200 dark:border-slate-800 hover:border-slate-300"
              }`}
            >
              <input
                type="radio"
                name="paymentMethod"
                checked={paymentMethod === "cash"}
                onChange={() => setPaymentMethod("cash")}
                className="mt-1"
              />
              <div>
                <div className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <Banknote className="w-4 h-4 text-emerald-600" />
                  <span>{t("payCash")}</span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {t("payCashDesc")}
                </p>
              </div>
            </label>

            {/* Payme */}
            <label
              className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-start gap-3.5 ${
                paymentMethod === "payme"
                  ? "border-blue-600 bg-blue-50/40 dark:bg-blue-950/20"
                  : "border-slate-200 dark:border-slate-800 hover:border-slate-300"
              }`}
            >
              <input
                type="radio"
                name="paymentMethod"
                checked={paymentMethod === "payme"}
                onChange={() => setPaymentMethod("payme")}
                className="mt-1"
              />
              <div>
                <div className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full bg-cyan-500 flex items-center justify-center text-white text-[10px] font-black">
                    P
                  </span>
                  <span>{t("payPayme")}</span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {t("payPaymeDesc")}
                </p>
              </div>
            </label>

            {/* Click Up */}
            <label
              className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-start gap-3.5 ${
                paymentMethod === "click"
                  ? "border-blue-600 bg-blue-50/40 dark:bg-blue-950/20"
                  : "border-slate-200 dark:border-slate-800 hover:border-slate-300"
              }`}
            >
              <input
                type="radio"
                name="paymentMethod"
                checked={paymentMethod === "click"}
                onChange={() => setPaymentMethod("click")}
                className="mt-1"
              />
              <div>
                <div className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <Zap className="w-4 h-4 text-blue-500 fill-current" />
                  <span>{t("payClick")}</span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {t("payClickDesc")}
                </p>
              </div>
            </label>

            {/* Humo / Uzcard */}
            <label
              className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-start gap-3.5 ${
                paymentMethod === "card"
                  ? "border-blue-600 bg-blue-50/40 dark:bg-blue-950/20"
                  : "border-slate-200 dark:border-slate-800 hover:border-slate-300"
              }`}
            >
              <input
                type="radio"
                name="paymentMethod"
                checked={paymentMethod === "card"}
                onChange={() => setPaymentMethod("card")}
                className="mt-1"
              />
              <div>
                <div className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-indigo-600" />
                  <span>{t("payCard")}</span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {t("payCardDesc")}
                </p>
              </div>
            </label>

            {/* B2B Invoicing */}
            <label
              className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-start gap-3.5 ${
                paymentMethod === "b2b"
                  ? "border-blue-600 bg-blue-50/40 dark:bg-blue-950/20"
                  : "border-slate-200 dark:border-slate-800 hover:border-slate-300"
              }`}
            >
              <input
                type="radio"
                name="paymentMethod"
                checked={paymentMethod === "b2b"}
                onChange={() => setPaymentMethod("b2b")}
                className="mt-1"
              />
              <div className="flex-1">
                <div className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-amber-600" />
                  <span>{t("payB2B")}</span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {t("payB2BDesc")}
                </p>

                {paymentMethod === "b2b" && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        {t("companyName")} *
                      </label>
                      <input
                        type="text"
                        required={paymentMethod === "b2b"}
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        placeholder='OOO "SORA ENTERPRISE"'
                        className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        {t("companyInn")} *
                      </label>
                      <input
                        type="text"
                        required={paymentMethod === "b2b"}
                        value={companyInn}
                        onChange={(e) => setCompanyInn(e.target.value)}
                        placeholder="123456789"
                        className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                      />
                    </div>
                  </div>
                )}
              </div>
            </label>
          </div>
        </section>
      </div>

      {/* Right: Sticky Order Summary & Confirm (4 cols) */}
      <div className="lg:col-span-4 space-y-6 sticky top-24">
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 space-y-6 shadow-xs">
          <h2 className="text-lg font-black text-slate-900 dark:text-white">
            {t("stepReview")}
          </h2>

          {/* Mini products preview */}
          <div className="space-y-3 max-h-60 overflow-y-auto pr-1 divide-y divide-slate-100 dark:divide-slate-800/80">
            {items.map((i) => (
              <div key={i.id} className="pt-2.5 first:pt-0 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="relative w-10 h-10 rounded-lg bg-slate-50 dark:bg-slate-800 p-1 shrink-0 overflow-hidden">
                    <Image
                      src={i.picture || "https://i.ibb.co/qLcGdmjh/Deli-E3871.jpg"}
                      alt={i.name}
                      fill
                      className="object-contain"
                      unoptimized
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-slate-800 dark:text-slate-200 truncate">
                      {i.name}
                    </p>
                    <span className="text-slate-400">
                      {i.quantity} × {i.price.toLocaleString("ru-RU")} {common("currency")}
                    </span>
                  </div>
                </div>
                <div className="font-bold text-slate-900 dark:text-white shrink-0">
                  {(i.price * i.quantity).toLocaleString("ru-RU")}
                </div>
              </div>
            ))}
          </div>

          {/* Pricing calculations */}
          <div className="space-y-2.5 pt-3 border-t border-slate-200 dark:border-slate-800 text-xs sm:text-sm">
            <div className="flex items-center justify-between text-slate-500">
              <span>{cartT("subtotal")}</span>
              <span className="font-semibold text-slate-900 dark:text-white">
                {subtotal.toLocaleString("ru-RU")} {common("currency")}
              </span>
            </div>

            <div className="flex items-center justify-between text-slate-500">
              <span>{cartT("delivery")}</span>
              <span className="font-semibold text-slate-900 dark:text-white">
                {deliveryFee === 0 ? (
                  <span className="text-emerald-600 font-bold">{cartT("freeDelivery")}</span>
                ) : (
                  `${deliveryFee.toLocaleString("ru-RU")} ${common("currency")}`
                )}
              </span>
            </div>

            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-baseline justify-between">
              <span className="text-sm font-bold text-slate-900 dark:text-white">
                {cartT("total")}
              </span>
              <span className="text-2xl font-black text-blue-600 dark:text-blue-400">
                {total.toLocaleString("ru-RU")} {common("currency")}
              </span>
            </div>
          </div>

          <p className="text-[11px] text-slate-400 leading-tight">
            {t("agreeTerms")}
          </p>

          {/* Confirm Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 py-4 px-6 rounded-2xl bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-bold text-sm shadow-md shadow-blue-500/25 transition-all disabled:opacity-50"
          >
            {isSubmitting ? (
              <span>{t("processing")}</span>
            ) : (
              <>
                <span>{t("confirmOrder")}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400 pt-1">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>100% xavfsiz to&apos;lov va rasmiy kafolat</span>
          </div>
        </div>
      </div>
    </form>
  );
}
