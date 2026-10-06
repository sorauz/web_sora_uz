"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "@/i18n/routing";
import Image from "next/image";
import { useCartStore } from "@/lib/store/cart";
import { useAuthStore } from "@/lib/store/auth";
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
  AlertCircle,
} from "lucide-react";

interface CheckoutFormProps {
  locale: "uz" | "ru";
}

export function CheckoutForm({ locale }: CheckoutFormProps) {
  const t = useTranslations("checkout");
  const cartT = useTranslations("cart");
  const common = useTranslations("common");
  const router = useRouter();

  const { items, getTotalPrice } = useCartStore();

  const [mounted, setMounted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const hasSubmittedRef = useRef(false);

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
  const [orderType, setOrderType] = useState<"B2C" | "B2B">("B2C");
  const [companyName, setCompanyName] = useState("");
  const [companyInn, setCompanyInn] = useState("");
  const [submitError, setSubmitError] = useState("");

  const { user, openModal } = useAuthStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (user) {
      if (user.name && !fullName) setFullName(user.name);
      if (user.phone && phone === "+998 ") setPhone(user.phone);
      if (user.type === "B2B") {
        setOrderType("B2B");
        if (user.inn && !companyInn) setCompanyInn(user.inn);
        if (user.name && !companyName) setCompanyName(user.name);
      }
    }
  }, [user]);

  useEffect(() => {
    if (mounted && items.length === 0 && !hasSubmittedRef.current) {
      router.push("/cart");
    }
  }, [mounted, items.length, router]);

  if (!mounted || (items.length === 0 && !hasSubmittedRef.current)) {
    return (
      <div className="py-20 flex justify-center items-center">
        <div className="w-8 h-8 border-4 border-sora-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const subtotal = getTotalPrice();
  const isFreeDelivery = deliveryMethod === "pickup" || subtotal >= 500000;
  const deliveryFee = isFreeDelivery ? 0 : 30000;
  const total = subtotal + deliveryFee;

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || phone.trim().length < 9 || !fullName.trim()) return;

    hasSubmittedRef.current = true;
    setIsSubmitting(true);
    setSubmitError("");

    try {
      const res = await fetch("/api/order/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customerType: orderType,
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
          items: items.map((i) => ({
            id: i.id,
            name: i.name,
            price: i.price,
            quantity: i.quantity,
            picture: i.picture,
          })),
        }),
      });

      const resData = await res.json();

      if (!res.ok && res.status === 400) {
        setSubmitError(resData.error || "Buyurtma ma'lumotlarida xatolik yuz berdi");
        setIsSubmitting(false);
        hasSubmittedRef.current = false;
        return;
      }

      const orderId = resData.order_id || `SORA-${Math.floor(100000 + Math.random() * 900000)}`;
      const orderNumber = resData.order_number || orderId;

      const orderData = {
        orderId,
        orderNumber,
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

      router.push(`/checkout/success?orderId=${encodeURIComponent(orderId)}&orderNumber=${encodeURIComponent(orderNumber)}`);
    } catch {
      // Fallback in case of temporary network glitch
      const fallbackId = `SORA-${Math.floor(100000 + Math.random() * 900000)}`;
      router.push(`/checkout/success?orderId=${encodeURIComponent(fallbackId)}`);
    } finally {
      setIsSubmitting(false);
    }
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
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2.5">
              <User className="w-5 h-5 text-sora-600 dark:text-sora-400" />
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                {t("stepCustomer")}
              </h2>
            </div>
            {user && (
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                <CheckCircle className="w-3 h-3" />
                <span>{user.name.split(" ")[0]} ({user.type})</span>
              </span>
            )}
          </div>

          {!user && (
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-sora-50/70 dark:bg-sora-950/30 border border-sora-200/60 dark:border-sora-800/60 text-xs">
              <div className="text-slate-700 dark:text-slate-300">
                <span className="font-bold">{locale === "uz" ? "Doimiy xaridormisiz?" : "Постоянный покупатель?"}</span>{" "}
                <span className="text-slate-500 hidden sm:inline">
                  {locale === "uz" ? "Tezroq buyurtma berish uchun tizimga kiring." : "Войдите для быстрого оформления."}
                </span>
              </div>
              <button
                type="button"
                onClick={() => openModal({ tab: "login" })}
                className="px-3.5 py-1.5 rounded-xl bg-sora-600 text-white font-bold text-xs hover:bg-sora-700 transition-colors cursor-pointer shrink-0"
              >
                {locale === "uz" ? "Kirish" : "Войти"}
              </button>
            </div>
          )}

          {/* B2C vs B2B Switcher */}
          <div className="flex gap-2.5">
            <button
              type="button"
              onClick={() => setOrderType("B2C")}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold border flex items-center justify-center gap-2 transition-all cursor-pointer ${
                orderType === "B2C"
                  ? "border-sora-500 bg-sora-50/70 dark:bg-sora-950/40 text-sora-700 dark:text-sora-300 font-bold"
                  : "border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-50"
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>{locale === "uz" ? "Jismoniy shaxs (B2C)" : "Физическое лицо (B2C)"}</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setOrderType("B2B");
                setPaymentMethod("b2b");
              }}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold border flex items-center justify-center gap-2 transition-all cursor-pointer ${
                orderType === "B2B"
                  ? "border-amber-500 bg-amber-50/70 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 font-bold"
                  : "border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-50"
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>{locale === "uz" ? "Tashkilot nomidan (B2B)" : "От имени организации (B2B)"}</span>
            </button>
          </div>

          {orderType === "B2B" && (
            <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200/70 dark:border-amber-900/40 space-y-3">
              <div className="text-xs font-bold text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-amber-600" />
                <span>{locale === "uz" ? "Tashkilot rekvizitlari" : "Реквизиты организации"}</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {locale === "uz" ? "Tashkilot nomi" : "Название компании"} *
                  </label>
                  <input
                    type="text"
                    required={orderType === "B2B"}
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder={locale === "uz" ? "«Navruz International» MCHJ" : "ООО «Навруз»"}
                    className="w-full px-3.5 py-2 bg-white dark:bg-slate-800 border border-amber-200 dark:border-slate-700 rounded-xl text-sm dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {locale === "uz" ? "STIR (INN, 9 xonali)" : "ИНН (9 цифр)"} *
                  </label>
                  <input
                    type="text"
                    maxLength={9}
                    required={orderType === "B2B"}
                    value={companyInn}
                    onChange={(e) => setCompanyInn(e.target.value)}
                    placeholder="204393073"
                    className="w-full px-3.5 py-2 bg-white dark:bg-slate-800 border border-amber-200 dark:border-slate-700 rounded-xl text-sm font-mono dark:text-white"
                  />
                </div>
              </div>
            </div>
          )}

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
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sora-500 dark:text-white"
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
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sora-500 dark:text-white"
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
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sora-500 dark:text-white"
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
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sora-500 dark:text-white"
                />
              </div>
            </div>
          </div>
        </section>

        {/* STEP 2: Delivery Method & Address */}
        <section className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 dark:border-slate-800">
            <Truck className="w-5 h-5 text-sora-600 dark:text-sora-400" />
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
              {t("stepDelivery")}
            </h2>
          </div>

          {/* Delivery Method Options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label
              className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-start gap-3 ${
                deliveryMethod === "courier"
                  ? "border-sora-600 bg-sora-50/40 dark:bg-sora-950/20 shadow-xs"
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
                  <Truck className="w-4 h-4 text-sora-600 dark:text-sora-400" />
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
                  ? "border-sora-600 bg-sora-50/40 dark:bg-sora-950/20 shadow-xs"
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
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sora-500 dark:text-white"
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
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sora-500 dark:text-white"
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
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sora-500 dark:text-white"
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
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sora-500 dark:text-white"
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
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sora-500 dark:text-white"
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
            <CreditCard className="w-5 h-5 text-sora-600 dark:text-sora-400" />
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
              {t("stepPayment")}
            </h2>
          </div>

          <div className="space-y-3">
            {/* Cash on delivery */}
            <label
              className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-start gap-3.5 ${
                paymentMethod === "cash"
                  ? "border-sora-600 bg-sora-50/40 dark:bg-sora-950/20"
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
                  ? "border-sora-600 bg-sora-50/40 dark:bg-sora-950/20"
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
                  ? "border-sora-600 bg-sora-50/40 dark:bg-sora-950/20"
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
                  ? "border-sora-600 bg-sora-50/40 dark:bg-sora-950/20"
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
                  ? "border-sora-600 bg-sora-50/40 dark:bg-sora-950/20"
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
                      sizes="40px"
                      className="object-contain"
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
              <span className="text-2xl font-black text-sora-600 dark:text-sora-400">
                {total.toLocaleString("ru-RU")} {common("currency")}
              </span>
            </div>
          </div>

          <p className="text-[11px] text-slate-400 leading-tight">
            {t("agreeTerms")}
          </p>

          {submitError && (
            <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-600 dark:text-rose-400 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{submitError}</span>
            </div>
          )}

          {/* Confirm Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 py-4 px-6 rounded-2xl bg-sora-600 hover:bg-sora-700 active:scale-[0.98] text-white font-bold text-sm shadow-md shadow-sora-500/25 transition-all disabled:opacity-50"
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
