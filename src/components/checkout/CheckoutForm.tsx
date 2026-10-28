"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "@/i18n/routing";
import Image from "next/image";
import { useCartStore } from "@/lib/store/cart";
import { useAuthStore } from "@/lib/store/auth";
import { useTranslations } from "next-intl";
import { reachGoal, sendEcommerceEvent } from "@/lib/analytics/yandex";
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
  CheckCircle2,
  Clock,
  ArrowRight,
  AlertCircle,
  Navigation,
  Sparkles,
  QrCode,
} from "lucide-react";
import {
  LocationPickerModal,
  formatOneCGeolocationUrl,
} from "@/components/checkout/LocationPickerModal";

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
  const [geolocation, setGeolocation] = useState("");
  const [isLocating, setIsLocating] = useState(false);
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const [orderComment, setOrderComment] = useState("");

  const [paymentMethod, setPaymentMethod] = useState<"cash" | "uzqr" | "payme" | "click" | "card" | "b2b">("cash");
  const [orderType, setOrderType] = useState<"B2C" | "B2B">("B2C");
  const [companyName, setCompanyName] = useState("");
  const [companyInn, setCompanyInn] = useState("");
  const [submitError, setSubmitError] = useState("");

  const { user, openModal } = useAuthStore();

  useEffect(() => {
    setMounted(true);
    if (items.length > 0) {
      reachGoal("START_CHECKOUT", {
        items_count: items.length,
        total: getTotalPrice(),
      });
    }
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

  const handleSelectOrderType = (type: "B2C" | "B2B") => {
    setOrderType(type);
    if (type === "B2B") {
      setPaymentMethod("b2b");
    } else if (type === "B2C" && paymentMethod === "b2b") {
      setPaymentMethod("cash");
    }
  };

  const handleSelectPaymentMethod = (method: "cash" | "uzqr" | "payme" | "click" | "card" | "b2b") => {
    if (method === "payme" || method === "click") return;
    setPaymentMethod(method);
    if (method === "b2b") {
      setOrderType("B2B");
    }
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || phone.trim().length < 9 || !fullName.trim()) return;

    const finalCustomerType =
      orderType === "B2B" || paymentMethod === "b2b" ? "B2B" : "B2C";

    if (finalCustomerType === "B2B") {
      if (!companyName.trim()) {
        setSubmitError(
          locale === "uz"
            ? "Tashkilot nomi kiritilishi shart!"
            : "Название организации обязательно!"
        );
        return;
      }
      const cleanInn = companyInn.replace(/\D/g, "");
      if (cleanInn.length !== 9) {
        setSubmitError(
          locale === "uz"
            ? "Tashkilotning 9 xonali STIR (INN) raqami kiritilishi shart!"
            : "ИНН организации должен состоять ровно из 9 цифр!"
        );
        return;
      }
    }

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
          customerType: finalCustomerType,
          fullName,
          phone,
          altPhone: altPhone || undefined,
          email: email || undefined,
          deliveryMethod,
          region: deliveryMethod === "courier" ? region : undefined,
          district: deliveryMethod === "courier" ? district : undefined,
          address: deliveryMethod === "courier" ? address : undefined,
          landmark: landmark || undefined,
          geolocation: deliveryMethod === "courier" ? geolocation : "",
          orderComment: orderComment || undefined,
          paymentMethod,
          companyName: finalCustomerType === "B2B" ? companyName.trim() : undefined,
          companyInn: finalCustomerType === "B2B" ? companyInn.trim() : undefined,
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

      // Yandex Metrika Goal & Ecommerce event
      reachGoal("PURCHASE_SUCCESS", {
        orderId,
        orderNumber,
        total,
        currency: "UZS",
        items_count: items.length,
      });
      sendEcommerceEvent("purchase", {
        actionField: { id: orderNumber, revenue: total, currency: "UZS" },
        products: items.map((i) => ({
          id: i.id,
          name: i.name,
          price: i.price,
          quantity: i.quantity,
        })),
      });

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
              onClick={() => handleSelectOrderType("B2C")}
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
              onClick={() => handleSelectOrderType("B2B")}
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
                    data-metrika-noindex="true"
                    className="w-full px-3.5 py-2 bg-white dark:bg-slate-800 border border-amber-200 dark:border-slate-700 rounded-xl text-sm dark:text-white ym-disable-keys"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {locale === "uz" ? "STIR (INN, 9 xonali)" : "ИНН (9 цифр)"} *
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={9}
                    required={orderType === "B2B"}
                    value={companyInn}
                    onChange={(e) => setCompanyInn(e.target.value)}
                    placeholder="204393073"
                    data-metrika-noindex="true"
                    className="w-full px-3.5 py-2 bg-white dark:bg-slate-800 border border-amber-200 dark:border-slate-700 rounded-xl text-sm font-mono dark:text-white ym-disable-keys"
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
                  data-metrika-noindex="true"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sora-500 dark:text-white ym-disable-keys"
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
                  inputMode="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder={t("phonePlaceholder")}
                  data-metrika-noindex="true"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sora-500 dark:text-white ym-disable-keys"
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
                  type="tel"
                  inputMode="tel"
                  value={altPhone}
                  onChange={(e) => setAltPhone(e.target.value)}
                  placeholder={t("altPhonePlaceholder")}
                  data-metrika-noindex="true"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sora-500 dark:text-white ym-disable-keys"
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
                  data-metrika-noindex="true"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sora-500 dark:text-white ym-disable-keys"
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
              <div className="space-y-1.5 flex-1">
                <div className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Truck className="w-4 h-4 text-sora-600 dark:text-sora-400" />
                  <span>{t("deliveryCourier")}</span>
                </div>
                <div>
                  {isFreeDelivery ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{t("freeDelivery")}</span>
                    </span>
                  ) : (
                    <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300">
                      <span className="font-bold text-slate-900 dark:text-white">
                        {t("paidDelivery")}
                      </span>
                      <span className="text-[11px] text-slate-400 dark:text-slate-500">
                        ({t("freeDeliveryThreshold")})
                      </span>
                    </div>
                  )}
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
              <div className="space-y-1.5 flex-1">
                <div className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-emerald-600" />
                  <span>{t("deliveryPickup")}</span>
                </div>
                <div>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{t("alwaysFree")}</span>
                  </span>
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

              {/* HERO INTERACTIVE MAP PICKER CARD */}
              <div
                onClick={() => setIsMapModalOpen(true)}
                className={`p-4 sm:p-5 rounded-2xl border-2 transition-all cursor-pointer group ${
                  geolocation
                    ? "bg-emerald-50/80 dark:bg-emerald-950/30 border-emerald-500 shadow-xs"
                    : "bg-linear-to-r from-sora-50/80 via-white to-blue-50/60 dark:from-sora-950/30 dark:via-slate-900 dark:to-blue-950/30 border-sora-300 dark:border-sora-700 hover:border-sora-500 hover:shadow-md"
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
                  <div className="flex items-start gap-3.5">
                    <div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 ${
                        geolocation
                          ? "bg-emerald-600 text-white shadow-emerald-500/25 shadow-md"
                          : "bg-sora-600 text-white shadow-sora-500/25 shadow-md"
                      }`}
                    >
                      <MapPin className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                          {geolocation
                            ? t("mapPickerSelectedTitle")
                            : t("mapPickerTitle")}
                        </h4>
                        {geolocation && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>{locale === "uz" ? "Aniq nuqta saqlandi" : "Точка сохранена"}</span>
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                        {geolocation
                          ? (address || (locale === "uz" ? "Koordinatalar biriktirildi" : "Координаты привязаны"))
                          : t("mapPickerSubtitle")}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsMapModalOpen(true);
                      }}
                      className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
                        geolocation
                          ? "bg-white dark:bg-slate-800 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 hover:bg-emerald-50 shadow-2xs"
                          : "bg-sora-600 hover:bg-sora-700 text-white shadow-md shadow-sora-600/30 active:scale-[0.98]"
                      }`}
                    >
                      <MapPin className="w-4 h-4" />
                      <span>
                        {geolocation ? t("mapPickerChangeBtn") : t("mapPickerOpenBtn")}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (typeof navigator === "undefined" || !navigator.geolocation) {
                          setIsMapModalOpen(true);
                          return;
                        }
                        setIsLocating(true);
                        navigator.geolocation.getCurrentPosition(
                          (pos) => {
                            setGeolocation(
                              formatOneCGeolocationUrl(
                                pos.coords.latitude,
                                pos.coords.longitude
                              )
                            );
                            setIsLocating(false);
                          },
                          () => {
                            setIsLocating(false);
                            setIsMapModalOpen(true);
                          },
                          { enableHighAccuracy: true, timeout: 8000 }
                        );
                      }}
                      title={
                        locale === "uz"
                          ? "Joriy GPS joylashuvni aniqlash"
                          : "Определить текущую GPS-локацию"
                      }
                      className="px-3 py-2.5 rounded-xl text-xs font-bold border bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <Navigation className={`w-3.5 h-3.5 text-sora-600 ${isLocating ? "animate-spin" : ""}`} />
                      <span>{isLocating ? "GPS..." : "GPS"}</span>
                    </button>
                  </div>
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
                onChange={() => handleSelectPaymentMethod("cash")}
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

            {/* UzQR Universal QR Payment */}
            <label
              className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-start gap-3.5 ${
                paymentMethod === "uzqr"
                  ? "border-emerald-600 bg-emerald-50/40 dark:bg-emerald-950/20 shadow-xs"
                  : "border-slate-200 dark:border-slate-800 hover:border-slate-300"
              }`}
            >
              <input
                type="radio"
                name="paymentMethod"
                checked={paymentMethod === "uzqr"}
                onChange={() => handleSelectPaymentMethod("uzqr")}
                className="mt-1"
              />
              <div className="flex-1">
                <div className="font-bold text-sm text-slate-900 dark:text-white flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-md bg-emerald-600 text-white flex items-center justify-center shrink-0">
                      <QrCode className="w-3.5 h-3.5" />
                    </div>
                    <span>{t("payUzQR")}</span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300">
                    {t("badgeUzQR")}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {t("payUzQRDesc")}
                </p>
                {paymentMethod === "uzqr" && (
                  <div className="mt-2.5 p-2.5 rounded-xl bg-white dark:bg-slate-800/80 border border-emerald-200/60 dark:border-emerald-800/50 text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                    <QrCode className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{t("payUzQRNote")}</span>
                  </div>
                )}
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
                onChange={() => handleSelectPaymentMethod("card")}
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

            {/* Payme (Vaqtincha o'chirilgan) */}
            <div
              className="p-4 rounded-2xl border-2 border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/40 opacity-60 cursor-not-allowed transition-all flex items-start gap-3.5 select-none"
            >
              <input
                type="radio"
                name="paymentMethodDisabledPayme"
                disabled
                checked={false}
                className="mt-1 cursor-not-allowed opacity-40"
              />
              <div className="flex-1">
                <div className="font-bold text-sm text-slate-600 dark:text-slate-400 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-4 h-4 rounded-full bg-slate-400 flex items-center justify-center text-white text-[10px] font-black">
                      P
                    </span>
                    <span>{t("payPayme")}</span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                    {t("comingSoon")}
                  </span>
                </div>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                  {t("payPaymeDesc")} <span className="font-medium text-amber-600 dark:text-amber-400">({t("integrationInProgress")})</span>
                </p>
              </div>
            </div>

            {/* Click Up (Vaqtincha o'chirilgan) */}
            <div
              className="p-4 rounded-2xl border-2 border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/40 opacity-60 cursor-not-allowed transition-all flex items-start gap-3.5 select-none"
            >
              <input
                type="radio"
                name="paymentMethodDisabledClick"
                disabled
                checked={false}
                className="mt-1 cursor-not-allowed opacity-40"
              />
              <div className="flex-1">
                <div className="font-bold text-sm text-slate-600 dark:text-slate-400 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-slate-400 fill-current" />
                    <span>{t("payClick")}</span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                    {t("comingSoon")}
                  </span>
                </div>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                  {t("payClickDesc")} <span className="font-medium text-amber-600 dark:text-amber-400">({t("integrationInProgress")})</span>
                </p>
              </div>
            </div>

            {/* B2B Invoicing */}
            <label
              className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-start gap-3.5 ${
                paymentMethod === "b2b"
                  ? "border-amber-500 bg-amber-50/40 dark:bg-amber-950/20"
                  : "border-slate-200 dark:border-slate-800 hover:border-slate-300"
              }`}
            >
              <input
                type="radio"
                name="paymentMethod"
                checked={paymentMethod === "b2b"}
                onChange={() => handleSelectPaymentMethod("b2b")}
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
                    <div className="sm:col-span-2 flex items-center gap-1.5 text-xs font-semibold text-amber-700 dark:text-amber-400 bg-amber-50/70 dark:bg-amber-950/40 p-2 rounded-lg border border-amber-200/50 dark:border-amber-900/30">
                      <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span>{t("b2bAutoSwitched")}</span>
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        {t("companyName")} *
                      </label>
                      <input
                        type="text"
                        required={paymentMethod === "b2b"}
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        placeholder='«Navruz International» MCHJ'
                        className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        {t("companyInn")} (9 xonali STIR) *
                      </label>
                      <input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={9}
                        required={paymentMethod === "b2b"}
                        value={companyInn}
                        onChange={(e) => setCompanyInn(e.target.value)}
                        placeholder="204393073"
                        className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-mono dark:text-white"
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

      {/* Interactive Map Picker Modal (Works on Desktop & Mobile without GPS) */}
      <LocationPickerModal
        isOpen={isMapModalOpen}
        onClose={() => setIsMapModalOpen(false)}
        locale={locale}
        initialRegion={region}
        initialGeolocation={geolocation}
        onConfirm={({ geolocationUrl, detectedDistrict, detectedAddress }) => {
          setGeolocation(geolocationUrl);
          if (detectedDistrict && !district.trim()) {
            setDistrict(detectedDistrict);
          }
          if (detectedAddress) {
            setAddress(detectedAddress);
          }
        }}
      />
    </form>
  );
}
