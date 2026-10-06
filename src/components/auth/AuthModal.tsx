"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useAuthStore } from "@/lib/store/auth";
import {
  X,
  User,
  Phone,
  Lock,
  Eye,
  EyeOff,
  Building2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowRight,
} from "lucide-react";

interface AuthModalProps {
  locale?: "uz" | "ru";
}

export function AuthModal({ locale = "uz" }: AuthModalProps) {
  const isUz = locale === "uz";
  const {
    isModalOpen,
    modalTab,
    modalType,
    isLoading,
    closeModal,
    setModalTab,
    setModalType,
    login,
    register,
  } = useAuthStore();

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Form states
  const [phone, setPhone] = useState("+998 ");
  const [inn, setInn] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");

  // Reset form when modal opens or tab changes
  useEffect(() => {
    if (isModalOpen) {
      setErrorMessage("");
      setSuccessMessage("");
      setPassword("");
    }
  }, [isModalOpen, modalTab, modalType]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeModal();
    };
    if (isModalOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isModalOpen, closeModal]);

  if (!isModalOpen || !mounted) return null;

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    const res = await login({
      type: modalType,
      phone: modalType === "B2C" ? phone : undefined,
      inn: modalType === "B2B" ? inn : undefined,
      password,
    });

    if (!res.success) {
      setErrorMessage(res.error || (isUz ? "Xatolik yuz berdi" : "Произошла ошибка"));
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    const res = await register({
      type: "B2C",
      name,
      phone1: phone,
      password,
    });

    if (!res.success) {
      if (res.isConflict) {
        setErrorMessage(
          isUz
            ? "Ushbu raqam bazada mavjud! Iltimos, Kirish bo'limidan parolingizni kiriting."
            : "Этот номер уже зарегистрирован! Пожалуйста, войдите с паролем."
        );
        // Switch to login tab after small delay or prompt
        setTimeout(() => {
          setModalTab("login");
          setModalType("B2C");
        }, 1500);
      } else {
        setErrorMessage(res.error || (isUz ? "Xatolik yuz berdi" : "Произошла ошибка"));
      }
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Close */}
        <div className="flex items-center justify-between p-6 pb-4 border-b border-slate-100 dark:border-slate-800/80">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
              {modalTab === "login"
                ? isUz
                  ? "Tizimga kirish"
                  : "Вход в систему"
                : isUz
                ? "Ro'yxatdan o'tish"
                : "Регистрация"}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {modalTab === "login"
                ? isUz
                  ? "Shaxsiy kabinet va buyurtmalaringizni boshqaring"
                  : "Управляйте заказами и личным кабинетом"
                : isUz
                ? "Tez va oson hisob yarating"
                : "Создайте аккаунт быстро и просто"}
            </p>
          </div>
          <button
            onClick={closeModal}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Yopish"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher: Kirish / Ro'yxatdan o'tish */}
        <div className="flex p-2 mx-6 mt-4 bg-slate-100 dark:bg-slate-800/60 rounded-2xl">
          <button
            type="button"
            onClick={() => setModalTab("login")}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
              modalTab === "login"
                ? "bg-white dark:bg-slate-900 text-sora-600 dark:text-sora-400 shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            {isUz ? "Kirish" : "Войти"}
          </button>
          <button
            type="button"
            onClick={() => setModalTab("register")}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
              modalTab === "register"
                ? "bg-white dark:bg-slate-900 text-sora-600 dark:text-sora-400 shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            {isUz ? "Ro'yxatdan o'tish" : "Регистрация"}
          </button>
        </div>

        {/* Alert Notifications */}
        {errorMessage && (
          <div className="mx-6 mt-4 p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span className="leading-snug">{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="mx-6 mt-4 p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-emerald-700 dark:text-emerald-300 text-xs flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
            <span className="leading-snug">{successMessage}</span>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-6 pt-4">
          {modalTab === "login" ? (
            /* --- LOGIN FORM --- */
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              {/* Type Switcher for Login: B2C vs B2B */}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setModalType("B2C")}
                  className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-semibold border flex items-center justify-center gap-1.5 transition-all ${
                    modalType === "B2C"
                      ? "border-sora-500 bg-sora-50/50 dark:bg-sora-950/40 text-sora-700 dark:text-sora-300 font-bold"
                      : "border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-50"
                  }`}
                >
                  <User className="w-3.5 h-3.5" />
                  <span>{isUz ? "Jismoniy shaxs" : "Физ. лицо"}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setModalType("B2B")}
                  className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-semibold border flex items-center justify-center gap-1.5 transition-all ${
                    modalType === "B2B"
                      ? "border-amber-500 bg-amber-50/50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 font-bold"
                      : "border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-50"
                  }`}
                >
                  <Building2 className="w-3.5 h-3.5" />
                  <span>{isUz ? "Yuridik shaxs (INN)" : "Юр. лицо (ИНН)"}</span>
                </button>
              </div>

              {/* Identifier Input */}
              {modalType === "B2C" ? (
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    {isUz ? "Telefon raqami" : "Номер телефона"}
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+998 90 123 45 67"
                      required
                      className="w-full h-11 pl-10 pr-4 text-sm rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-900 focus:outline-hidden focus:border-sora-500 focus:ring-2 focus:ring-sora-500/20 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    {isUz ? "Tashkilot STIR (INN)" : "ИНН организации (9 цифр)"}
                  </label>
                  <div className="relative">
                    <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
                    <input
                      type="text"
                      maxLength={9}
                      value={inn}
                      onChange={(e) => setInn(e.target.value)}
                      placeholder="123456789"
                      required
                      className="w-full h-11 pl-10 pr-4 text-sm rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-900 focus:outline-hidden focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 text-slate-900 dark:text-white font-mono"
                    />
                  </div>
                </div>
              )}

              {/* Password Input */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  {isUz ? "Parol" : "Пароль"}
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full h-11 pl-10 pr-11 text-sm rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-900 focus:outline-hidden focus:border-sora-500 focus:ring-2 focus:ring-sora-500/20 text-slate-900 dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 mt-2 rounded-2xl bg-sora-600 hover:bg-sora-700 active:scale-[0.98] text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <span>{isUz ? "Kirish" : "Войти"}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          ) : (
            /* --- REGISTRATION FORM (B2C First) --- */
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  {isUz ? "Ism-sharifingiz" : "Ваше имя и фамилия"}
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={isUz ? "Jasur Karimov" : "Жасур Каримов"}
                    required
                    className="w-full h-11 pl-10 pr-4 text-sm rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-900 focus:outline-hidden focus:border-sora-500 focus:ring-2 focus:ring-sora-500/20 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  {isUz ? "Telefon raqamingiz" : "Номер телефона"}
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+998 90 123 45 67"
                    required
                    className="w-full h-11 pl-10 pr-4 text-sm rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-900 focus:outline-hidden focus:border-sora-500 focus:ring-2 focus:ring-sora-500/20 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  {isUz ? "Parol yarating" : "Придумайте пароль"}
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={isUz ? "Kamida 6 ta belgi" : "Минимум 6 символов"}
                    required
                    minLength={4}
                    className="w-full h-11 pl-10 pr-11 text-sm rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-900 focus:outline-hidden focus:border-sora-500 focus:ring-2 focus:ring-sora-500/20 text-slate-900 dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* B2B Explanatory Note */}
              <div className="p-3 rounded-2xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/40 text-[11px] text-amber-800 dark:text-amber-300 leading-relaxed flex items-start gap-2">
                <Building2 className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <span>
                  {isUz
                    ? "Tashkilot (B2B) nomidan xarid qilmoqchimisiz? Ro'yxatdan o'tgach, buyurtma berish jarayonida STIR (INN) kiritib yuridik shaxs sifatida rasmiylashtirishingiz mumkin."
                    : "Покупаете от имени организации (B2B)? После регистрации при оформлении заказа вы сможете указать ИНН и оформить покупку на юр. лицо."}
                </span>
              </div>

              {/* Register Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 mt-2 rounded-2xl bg-sora-600 hover:bg-sora-700 active:scale-[0.98] text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <span>{isUz ? "Ro'yxatdan o'tish" : "Зарегистрироваться"}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
