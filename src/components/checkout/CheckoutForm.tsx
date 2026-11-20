"use client";

import { useEffect, useState, useRef, useSyncExternalStore } from "react";
import { Link, useRouter } from "@/i18n/routing";
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
  Loader2,
  MessageSquareCode,
} from "lucide-react";
import {
  LocationPickerModal,
  formatOneCGeolocationUrl,
} from "@/components/checkout/LocationPickerModal";
import { CheckoutOtpModal } from "@/components/checkout/CheckoutOtpModal";
import {
  formatInnInput,
  formatOptionalUzPhoneInput,
  formatUzPhoneInput,
  isValidUzPhone,
  normalizeUzPhone,
} from "@/lib/utils/phone";

type CheckoutFieldKey =
  | "companyName"
  | "companyInn"
  | "fullName"
  | "phone"
  | "altPhone"
  | "email"
  | "address";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface CheckoutFormProps {
  locale: "uz" | "ru";
}

export function CheckoutForm({ locale }: CheckoutFormProps) {
  const t = useTranslations("checkout");
  const cartT = useTranslations("cart");
  const common = useTranslations("common");
  const router = useRouter();

  const { items, getTotalPrice } = useCartStore();

  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [syncedUserId, setSyncedUserId] = useState<string | null>(null);

  // Form Fields
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("+998 ");
  const [altPhone, setAltPhone] = useState("");
  const [email, setEmail] = useState("");

  const [deliveryMethod, setDeliveryMethod] = useState<"courier" | "pickup">("courier");
  const region = locale === "uz" ? "Toshkent shahri" : "г. Ташкент";
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
  const [submitErrorStatus, setSubmitErrorStatus] = useState<number | null>(null);
  const [submitErrorRetryable, setSubmitErrorRetryable] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<CheckoutFieldKey, string>>
  >({});

  // Mandatory Checkout SMS OTP state
  const [verifiedPhone, setVerifiedPhone] = useState("");
  const [verifiedPhoneToken, setVerifiedPhoneToken] = useState("");
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [otpCooldown, setOtpCooldown] = useState(0);
  const [otpDevCode, setOtpDevCode] = useState("");
  const [submitOrderAfterOtp, setSubmitOrderAfterOtp] = useState(false);

  // Input refs for scroll + focus on validation error
  const companyNameRef = useRef<HTMLInputElement>(null);
  const companyInnRef = useRef<HTMLInputElement>(null);
  const fullNameRef = useRef<HTMLInputElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);
  const altPhoneRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const addressRef = useRef<HTMLInputElement>(null);

  const { user, openModal, sendOtp, verifyOtp } = useAuthStore();

  const trackedCheckoutRef = useRef(false);
  useEffect(() => {
    if (!trackedCheckoutRef.current && items.length > 0) {
      trackedCheckoutRef.current = true;
      reachGoal("START_CHECKOUT", {
        items_count: items.length,
        total: getTotalPrice(),
      });
    }
  }, [items.length, getTotalPrice]);

  if (user && user.id && user.id !== syncedUserId) {
    setSyncedUserId(user.id);
    if (user.name && !fullName) setFullName(user.name);
    if (user.phone && phone === "+998 ") {
      setPhone(formatUzPhoneInput(user.phone));
    }
    if (user.type === "B2B") {
      setOrderType("B2B");
      if (user.inn && !companyInn) setCompanyInn(formatInnInput(user.inn));
      if (user.name && !companyName) setCompanyName(user.name);
    }
  }

  useEffect(() => {
    if (mounted && items.length === 0 && !hasSubmitted) {
      router.push("/cart");
    }
  }, [mounted, items.length, hasSubmitted, router]);

  if (!mounted || (items.length === 0 && !hasSubmitted)) {
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

  const isUz = locale === "uz";
  const normalizedPhone = normalizeUzPhone(phone);
  const isPhoneComplete = isValidUzPhone(phone);
  const isPhoneVerified =
    isPhoneComplete &&
    ((!!user?.phone && normalizeUzPhone(user.phone) === normalizedPhone) ||
      (!!verifiedPhoneToken && verifiedPhone === normalizedPhone));

  const finalCustomerType: "B2C" | "B2B" =
    orderType === "B2B" || paymentMethod === "b2b" ? "B2B" : "B2C";

  const clearFieldError = (field: CheckoutFieldKey) => {
    setFieldErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
    if (submitError) setSubmitError("");
  };

  const focusFirstErrorField = (
    errors: Partial<Record<CheckoutFieldKey, string>>
  ) => {
    const order: Array<{
      key: CheckoutFieldKey;
      ref: React.RefObject<HTMLInputElement | null>;
    }> = [
      { key: "companyName", ref: companyNameRef },
      { key: "companyInn", ref: companyInnRef },
      { key: "fullName", ref: fullNameRef },
      { key: "phone", ref: phoneRef },
      { key: "altPhone", ref: altPhoneRef },
      { key: "email", ref: emailRef },
      { key: "address", ref: addressRef },
    ];
    for (const entry of order) {
      if (errors[entry.key] && entry.ref.current) {
        entry.ref.current.scrollIntoView({ behavior: "smooth", block: "center" });
        entry.ref.current.focus({ preventScroll: true });
        return;
      }
    }
  };

  const validateCheckoutForm = (): boolean => {
    const errors: Partial<Record<CheckoutFieldKey, string>> = {};
    const missingLabels: string[] = [];

    if (finalCustomerType === "B2B") {
      if (companyName.trim().length < 2) {
        errors.companyName = isUz
          ? "Tashkilot nomini kiriting"
          : "Введите название организации";
        missingLabels.push(isUz ? "Tashkilot nomi" : "Название компании");
      }
      const cleanInn = formatInnInput(companyInn);
      if (cleanInn.length !== 9) {
        errors.companyInn = isUz
          ? "Tashkilotning 9 xonali STIR (INN) raqamini to‘liq kiriting"
          : "Введите 9-значный ИНН организации";
        missingLabels.push(isUz ? "STIR (INN)" : "ИНН");
      }
    }

    if (fullName.trim().length < 2) {
      errors.fullName = isUz
        ? "Ism-sharifingizni kiriting (kamida 2 ta harf)"
        : "Введите ваше имя и фамилию (минимум 2 буквы)";
      missingLabels.push(t("fullName"));
    }

    if (!isValidUzPhone(phone)) {
      errors.phone = isUz
        ? "Telefon raqamingizni to‘liq kiriting (+998 XX XXX-XX-XX)"
        : "Введите полный номер телефона (+998 XX XXX-XX-XX)";
      missingLabels.push(t("phone"));
    }

    if (altPhone.trim().length > 0 && !isValidUzPhone(altPhone)) {
      errors.altPhone = isUz
        ? "Qo‘shimcha telefon raqamini to‘liq (9 ta raqam) kiriting yoki bo‘sh qoldiring"
        : "Введите дополнительный номер полностью (9 цифр) или оставьте пустым";
      missingLabels.push(t("altPhone"));
    }

    if (email.trim().length > 0 && !EMAIL_RE.test(email.trim())) {
      errors.email = isUz
        ? "Email manzilini to‘g‘ri formatda kiriting"
        : "Введите корректный адрес электронной почты";
      missingLabels.push(t("email"));
    }

    if (deliveryMethod === "courier" && address.trim().length < 3) {
      errors.address = isUz
        ? "Yetkazib berish manzilini kiriting"
        : "Укажите адрес доставки";
      missingLabels.push(t("address"));
    }

    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) {
      setSubmitError(
        isUz
          ? `Quyidagi majburiy maydonlarni to‘g‘ri to‘ldiring: ${missingLabels.join(", ")}`
          : `Пожалуйста, заполните обязательные поля: ${missingLabels.join(", ")}`
      );
      focusFirstErrorField(errors);
      return false;
    }

    setSubmitError("");
    return true;
  };

  const initiateCheckoutOtp = async (autoSubmitAfter: boolean) => {
    if (!isValidUzPhone(phone)) {
      const phoneErr = isUz
        ? "SMS kod olish uchun telefon raqamingizni to‘liq kiriting (+998 XX XXX-XX-XX)"
        : "Введите полный номер телефона для получения СМС-кода";
      setFieldErrors((prev) => ({ ...prev, phone: phoneErr }));
      phoneRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      phoneRef.current?.focus({ preventScroll: true });
      return;
    }

    setIsSendingOtp(true);
    setSubmitError("");
    setSubmitOrderAfterOtp(autoSubmitAfter);

    const cleanInn = formatInnInput(companyInn);
    const res = await sendOtp({
      phone: normalizedPhone,
      type: finalCustomerType,
      inn: finalCustomerType === "B2B" && cleanInn.length === 9 ? cleanInn : undefined,
      locale,
    });

    setIsSendingOtp(false);

    if (res.success) {
      setOtpCooldown(res.cooldown ?? 60);
      setOtpDevCode(res.isTestMode && res.devCode ? res.devCode : "");
      setIsOtpModalOpen(true);
      return;
    }

    // If cooldown is still running from a recent SMS to the same number, still open the modal so user can enter it
    if (res.retryAfter && res.retryAfter > 0) {
      setOtpCooldown(res.retryAfter);
      setIsOtpModalOpen(true);
      return;
    }

    setSubmitError(
      res.error ||
        (isUz
          ? "SMS kod yuborishda xatolik yuz berdi. Qaytadan urinib ko‘ring."
          : "Ошибка при отправке СМС-кода. Попробуйте снова.")
    );
  };

  const submitOrderRequest = async (overrideToken?: string) => {
    setHasSubmitted(true);
    setIsSubmitting(true);
    setSubmitError("");
    setSubmitErrorStatus(null);
    setSubmitErrorRetryable(false);

    const activeToken =
      overrideToken ||
      (verifiedPhone === normalizedPhone ? verifiedPhoneToken : "");

    try {
      const res = await fetch("/api/order/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customerType: finalCustomerType,
          fullName: fullName.trim(),
          phone: normalizedPhone,
          altPhone: altPhone.trim() ? normalizeUzPhone(altPhone) : undefined,
          email: email.trim() || undefined,
          deliveryMethod,
          region: undefined,
          district:
            deliveryMethod === "courier" && district && !address.includes(district)
              ? district
              : undefined,
          address: deliveryMethod === "courier" ? address.trim() : undefined,
          landmark: landmark.trim() || undefined,
          geolocation: deliveryMethod === "courier" ? geolocation : "",
          orderComment: orderComment.trim() || undefined,
          paymentMethod,
          companyName:
            finalCustomerType === "B2B" ? companyName.trim() : undefined,
          companyInn:
            finalCustomerType === "B2B" ? formatInnInput(companyInn) : undefined,
          verifiedPhoneToken: activeToken || undefined,
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

      if (res.status === 401 || resData.code === "PHONE_VERIFICATION_REQUIRED") {
        setVerifiedPhoneToken("");
        setVerifiedPhone("");
        setIsSubmitting(false);
        setHasSubmitted(false);
        await initiateCheckoutOtp(true);
        return;
      }

      if (!res.ok) {
        const isRetryable =
          Boolean(resData.retryable) || res.status >= 500;
        setSubmitErrorStatus(res.status);
        setSubmitErrorRetryable(isRetryable);
        setSubmitError(
          resData.error ||
            (isRetryable
              ? isUz
                ? "Server vaqtincha band, iltimos 'Buyurtmani tasdiqlash' tugmasini qayta bosing."
                : "Сервер временно занят, пожалуйста, нажмите «Подтвердить заказ» ещё раз."
              : isUz
              ? "Buyurtma ma'lumotlarida xatolik yuz berdi"
              : "Ошибка в данных заказа")
        );
        setIsSubmitting(false);
        setHasSubmitted(false);
        return;
      }

      const orderId = resData.order_id || "SORA-ORDER";
      const orderNumber = resData.order_number || orderId;
      const posted = resData.posted !== false;
      const statusCode =
        typeof resData.status_code === "string" && resData.status_code
          ? resData.status_code
          : posted
          ? "CONFIRMED"
          : "PENDING";
      const statusText =
        typeof resData.status === "string" && resData.status
          ? resData.status
          : posted
          ? "Qabul qilindi / Tasdiqlandi"
          : "Tekshirilmoqda";
      const serverMessage =
        typeof resData.message === "string" ? resData.message : "";
      const productsTotal =
        typeof resData.total_amount === "number" &&
        Number.isFinite(resData.total_amount)
          ? resData.total_amount
          : subtotal;
      const officialTotal = productsTotal + deliveryFee;

      const orderData = {
        orderId,
        orderNumber,
        createdAt: new Date().toISOString(),
        statusCode,
        statusText,
        posted,
        serverMessage,
        fullName: fullName.trim(),
        phone: normalizedPhone,
        altPhone: altPhone.trim() ? normalizeUzPhone(altPhone) : "",
        email: email.trim(),
        deliveryMethod,
        region,
        district,
        address: address.trim(),
        landmark: landmark.trim(),
        orderComment: orderComment.trim(),
        paymentMethod,
        companyName: companyName.trim(),
        companyInn: formatInnInput(companyInn),
        items,
        subtotal: productsTotal,
        totalAmount1C: productsTotal,
        deliveryFee,
        total: officialTotal,
        currency: "UZS",
      };

      try {
        localStorage.setItem("sora_last_order", JSON.stringify(orderData));
      } catch {
        // Ignore localStorage errors
      }

      // Yandex Metrika Goal & Ecommerce event (using 1C's rounded official total_amount)
      reachGoal("PURCHASE_SUCCESS", {
        orderId,
        orderNumber,
        total: officialTotal,
        totalAmount1C: productsTotal,
        posted,
        statusCode,
        currency: "UZS",
        items_count: items.length,
      });
      sendEcommerceEvent("purchase", {
        actionField: {
          id: orderNumber,
          revenue: productsTotal,
          currency: "UZS",
        },
        products: items.map((i) => ({
          id: i.id,
          name: i.name,
          price: i.price,
          quantity: i.quantity,
        })),
      });

      // Redirect directly without retrying (both posted: true and posted: false are saved in 1C)
      router.push(
        `/checkout/success?orderId=${encodeURIComponent(orderId)}&orderNumber=${encodeURIComponent(orderNumber)}`
      );
    } catch {
      setSubmitErrorStatus(503);
      setSubmitErrorRetryable(true);
      setSubmitError(
        isUz
          ? "Server bilan aloqada xatolik yuz berdi. Savatchangiz saqlandi — 'Buyurtmani tasdiqlash' tugmasini qayta bosing."
          : "Ошибка соединения с сервером. Корзина сохранена — нажмите «Подтвердить заказ» ещё раз."
      );
      setHasSubmitted(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting || isSendingOtp) return;

    if (!validateCheckoutForm()) {
      return;
    }

    if (!isPhoneVerified) {
      await initiateCheckoutOtp(true);
      return;
    }

    await submitOrderRequest();
  };

  const inputBorderClass = (field: CheckoutFieldKey, defaultBorder: string) =>
    fieldErrors[field]
      ? "border-rose-500 ring-2 ring-rose-500/20 focus:ring-rose-500"
      : `${defaultBorder} focus:ring-sora-500`;

  return (
    <form
      noValidate
      onSubmit={handleSubmitOrder}
      className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
    >
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
                    ref={companyNameRef}
                    type="text"
                    required={orderType === "B2B"}
                    aria-invalid={!!fieldErrors.companyName}
                    value={companyName}
                    onChange={(e) => {
                      setCompanyName(e.target.value);
                      clearFieldError("companyName");
                    }}
                    placeholder={locale === "uz" ? "«Navruz International» MCHJ" : "ООО «Навруз»"}
                    data-metrika-noindex="true"
                    className={`w-full px-3.5 py-2 bg-white dark:bg-slate-800 border rounded-xl text-sm focus:outline-none focus:ring-2 dark:text-white ym-disable-keys ${inputBorderClass("companyName", "border-amber-200 dark:border-slate-700")}`}
                  />
                  {fieldErrors.companyName && (
                    <p role="alert" className="mt-1 text-[11px] font-medium text-rose-600 dark:text-rose-400 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{fieldErrors.companyName}</span>
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {locale === "uz" ? "STIR (INN, 9 xonali)" : "ИНН (9 цифр)"} *
                  </label>
                  <input
                    ref={companyInnRef}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    required={orderType === "B2B"}
                    aria-invalid={!!fieldErrors.companyInn}
                    value={companyInn}
                    onChange={(e) => {
                      setCompanyInn(formatInnInput(e.target.value));
                      clearFieldError("companyInn");
                    }}
                    placeholder="204393073"
                    data-metrika-noindex="true"
                    className={`w-full px-3.5 py-2 bg-white dark:bg-slate-800 border rounded-xl text-sm font-mono focus:outline-none focus:ring-2 dark:text-white ym-disable-keys ${inputBorderClass("companyInn", "border-amber-200 dark:border-slate-700")}`}
                  />
                  {fieldErrors.companyInn && (
                    <p role="alert" className="mt-1 text-[11px] font-medium text-rose-600 dark:text-rose-400 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{fieldErrors.companyInn}</span>
                    </p>
                  )}
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
                  ref={fullNameRef}
                  type="text"
                  required
                  aria-invalid={!!fieldErrors.fullName}
                  value={fullName}
                  onChange={(e) => {
                    setFullName(e.target.value);
                    clearFieldError("fullName");
                  }}
                  placeholder={t("fullNamePlaceholder")}
                  data-metrika-noindex="true"
                  className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl text-sm focus:outline-none focus:ring-2 dark:text-white ym-disable-keys ${inputBorderClass("fullName", "border-slate-200 dark:border-slate-700")}`}
                />
              </div>
              {fieldErrors.fullName && (
                <p role="alert" className="mt-1 text-[11px] font-medium text-rose-600 dark:text-rose-400 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{fieldErrors.fullName}</span>
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                {t("phone")} *
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  ref={phoneRef}
                  type="tel"
                  inputMode="numeric"
                  required
                  aria-invalid={!!fieldErrors.phone}
                  value={phone}
                  onChange={(e) => {
                    const formatted = formatUzPhoneInput(e.target.value);
                    setPhone(formatted);
                    clearFieldError("phone");
                  }}
                  placeholder={t("phonePlaceholder")}
                  data-metrika-noindex="true"
                  className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl text-sm font-mono focus:outline-none focus:ring-2 dark:text-white ym-disable-keys ${inputBorderClass("phone", "border-slate-200 dark:border-slate-700")}`}
                />
              </div>
              {fieldErrors.phone && (
                <p role="alert" className="mt-1 text-[11px] font-medium text-rose-600 dark:text-rose-400 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{fieldErrors.phone}</span>
                </p>
              )}
              <div className="mt-1.5 flex items-center justify-between gap-2">
                {isPhoneVerified ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                    <span>
                      {isUz ? "SMS orqali tasdiqlangan" : "Номер подтверждён по СМС"}
                    </span>
                  </span>
                ) : (
                  <>
                    <span className="text-[11px] text-amber-700 dark:text-amber-400 font-medium">
                      {isUz
                        ? "Buyurtma uchun SMS tasdiqlash talab etiladi"
                        : "Для заказа требуется подтверждение по СМС"}
                    </span>
                    <button
                      type="button"
                      disabled={!isPhoneComplete || isSendingOtp}
                      onClick={() => void initiateCheckoutOtp(false)}
                      className="shrink-0 inline-flex items-center gap-1 rounded-lg bg-sora-50 dark:bg-sora-950/50 border border-sora-200 dark:border-sora-800 px-2.5 py-1 text-[11px] font-bold text-sora-700 dark:text-sora-300 hover:bg-sora-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                    >
                      {isSendingOtp ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <MessageSquareCode className="w-3 h-3" />
                      )}
                      <span>{isUz ? "SMS kod olish" : "Получить СМС"}</span>
                    </button>
                  </>
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                {t("altPhone")}
              </label>
              <div className="relative">
                <Smartphone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  ref={altPhoneRef}
                  type="tel"
                  inputMode="numeric"
                  aria-invalid={!!fieldErrors.altPhone}
                  value={altPhone}
                  onChange={(e) => {
                    setAltPhone(formatOptionalUzPhoneInput(e.target.value));
                    clearFieldError("altPhone");
                  }}
                  placeholder={t("altPhonePlaceholder")}
                  data-metrika-noindex="true"
                  className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl text-sm font-mono focus:outline-none focus:ring-2 dark:text-white ym-disable-keys ${inputBorderClass("altPhone", "border-slate-200 dark:border-slate-700")}`}
                />
              </div>
              {fieldErrors.altPhone && (
                <p role="alert" className="mt-1 text-[11px] font-medium text-rose-600 dark:text-rose-400 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{fieldErrors.altPhone}</span>
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                {t("email")}
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  ref={emailRef}
                  type="email"
                  aria-invalid={!!fieldErrors.email}
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    clearFieldError("email");
                  }}
                  placeholder={t("emailPlaceholder")}
                  data-metrika-noindex="true"
                  className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl text-sm focus:outline-none focus:ring-2 dark:text-white ym-disable-keys ${inputBorderClass("email", "border-slate-200 dark:border-slate-700")}`}
                />
              </div>
              {fieldErrors.email && (
                <p role="alert" className="mt-1 text-[11px] font-medium text-rose-600 dark:text-rose-400 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{fieldErrors.email}</span>
                </p>
              )}
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
                    ref={addressRef}
                    type="text"
                    required
                    aria-invalid={!!fieldErrors.address}
                    value={address}
                    onChange={(e) => {
                      setAddress(e.target.value);
                      clearFieldError("address");
                    }}
                    placeholder={t("addressPlaceholder")}
                    className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl text-sm focus:outline-none focus:ring-2 dark:text-white ${inputBorderClass("address", "border-slate-200 dark:border-slate-700")}`}
                  />
                </div>
                {fieldErrors.address && (
                  <p role="alert" className="mt-1 text-[11px] font-medium text-rose-600 dark:text-rose-400 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{fieldErrors.address}</span>
                  </p>
                )}
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
                        aria-invalid={!!fieldErrors.companyName}
                        value={companyName}
                        onChange={(e) => {
                          setCompanyName(e.target.value);
                          clearFieldError("companyName");
                        }}
                        placeholder='«Navruz International» MCHJ'
                        className={`w-full px-3 py-2 bg-white dark:bg-slate-800 border rounded-lg text-xs focus:outline-none focus:ring-2 dark:text-white ${inputBorderClass("companyName", "border-slate-200 dark:border-slate-700")}`}
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
                        required={paymentMethod === "b2b"}
                        aria-invalid={!!fieldErrors.companyInn}
                        value={companyInn}
                        onChange={(e) => {
                          setCompanyInn(formatInnInput(e.target.value));
                          clearFieldError("companyInn");
                        }}
                        placeholder="204393073"
                        className={`w-full px-3 py-2 bg-white dark:bg-slate-800 border rounded-lg text-xs font-mono focus:outline-none focus:ring-2 dark:text-white ${inputBorderClass("companyInn", "border-slate-200 dark:border-slate-700")}`}
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

            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-1">
              <div className="flex items-baseline justify-between">
                <span className="text-sm font-bold text-slate-900 dark:text-white">
                  {cartT("total")}
                </span>
                <span className="text-2xl font-black text-sora-600 dark:text-sora-400">
                  {total.toLocaleString("ru-RU")} {common("currency")}
                </span>
              </div>
              <p className="text-[11px] text-right text-emerald-600 dark:text-emerald-400 font-medium">
                {cartT("vatIncluded")}
              </p>
            </div>
          </div>

          <p className="text-[11px] text-slate-400 leading-tight">
            {t("agreeTerms")}
          </p>

          {submitError && (
            <div
              role="alert"
              className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300 space-y-2"
            >
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600 dark:text-rose-400" />
                <div className="space-y-1">
                  <p className="font-semibold">{submitError}</p>
                  {submitErrorRetryable && (
                    <p className="text-[11px] text-rose-600/90 dark:text-rose-300/90">
                      {isUz
                        ? "Savatchangiz saqlandi — birozdan so‘ng «Buyurtmani tasdiqlash» tugmasini qayta bosing."
                        : "Ваша корзина сохранена — нажмите «Подтвердить заказ» ещё раз."}
                    </p>
                  )}
                </div>
              </div>
              {(submitErrorStatus === 400 || submitErrorStatus === 404) && (
                <div className="pl-6">
                  <Link
                    href="/cart"
                    className="inline-flex items-center gap-1 font-bold underline hover:no-underline text-rose-700 dark:text-rose-300"
                  >
                    <span>
                      {isUz ? "Savatchaga qaytish" : "Вернуться в корзину"}
                    </span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* Confirm Button */}
          <button
            type="submit"
            disabled={isSubmitting || isSendingOtp}
            className="w-full flex items-center justify-center gap-2 py-4 px-6 rounded-2xl bg-sora-600 hover:bg-sora-700 active:scale-[0.98] text-white font-bold text-sm shadow-md shadow-sora-500/25 transition-all disabled:opacity-50 cursor-pointer"
          >
            {isSubmitting || isSendingOtp ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>
                  {isSendingOtp
                    ? isUz
                      ? "SMS kod yuborilmoqda..."
                      : "Отправка СМС-кода..."
                    : t("processing")}
                </span>
              </>
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
          if (detectedDistrict) {
            setDistrict(detectedDistrict);
          }
          const fullAddress = [detectedDistrict, detectedAddress]
            .filter(Boolean)
            .join(", ");
          if (fullAddress) {
            setAddress(fullAddress);
            clearFieldError("address");
          }
        }}
      />

      {/* Mandatory Checkout SMS OTP Verification Modal */}
      {isOtpModalOpen && (
      <CheckoutOtpModal
        isOpen={isOtpModalOpen}
        locale={locale}
        formattedPhone={phone}
        normalizedPhone={normalizedPhone}
        customerType={finalCustomerType}
        companyInn={formatInnInput(companyInn)}
        initialCooldown={otpCooldown}
        devCode={otpDevCode}
        isSubmittingOrderAfterVerify={submitOrderAfterOtp}
        onClose={() => {
          setIsOtpModalOpen(false);
          setSubmitOrderAfterOtp(false);
        }}
        onResend={async () => {
          const cleanInn = formatInnInput(companyInn);
          const res = await sendOtp({
            phone: normalizedPhone,
            type: finalCustomerType,
            inn:
              finalCustomerType === "B2B" && cleanInn.length === 9
                ? cleanInn
                : undefined,
            locale,
          });
          return {
            success: res.success,
            cooldown: res.cooldown ?? res.retryAfter,
            devCode: res.isTestMode ? res.devCode : undefined,
            error: res.error,
          };
        }}
        onVerify={async (code) => {
          const cleanInn = formatInnInput(companyInn);
          const res = await verifyOtp({
            phone: normalizedPhone,
            code,
            type: finalCustomerType,
            inn:
              finalCustomerType === "B2B" && cleanInn.length === 9
                ? cleanInn
                : undefined,
            locale,
          });
          if (res.success) {
            const token = res.verifiedToken || "";
            setVerifiedPhone(normalizedPhone);
            setVerifiedPhoneToken(token);
            setIsOtpModalOpen(false);
            clearFieldError("phone");
            if (submitOrderAfterOtp) {
              setSubmitOrderAfterOtp(false);
              await submitOrderRequest(token);
            }
          }
          return {
            success: res.success,
            verifiedToken: res.verifiedToken,
            user: res.user,
            error: res.error,
          };
        }}
      />
      )}
    </form>
  );
}
