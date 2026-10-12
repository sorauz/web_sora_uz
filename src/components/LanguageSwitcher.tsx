"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/routing";
import { useState, useRef, useEffect, useTransition, useId } from "react";
import { ChevronDown, Check } from "lucide-react";

/**
 * Circular flag badge for the Russian Federation
 */
export function RussianFlagIcon({ className = "w-5 h-5" }: { className?: string }) {
  const clipId = useId();
  return (
    <svg
      viewBox="0 0 32 32"
      className={`shrink-0 rounded-full shadow-xs ${className}`}
      aria-hidden="true"
    >
      <defs>
        <clipPath id={clipId}>
          <circle cx="16" cy="16" r="16" />
        </clipPath>
      </defs>
      <g clipPath={`url(#${clipId})`}>
        {/* White top stripe */}
        <rect x="0" y="0" width="32" height="10.67" fill="#FFFFFF" />
        {/* Blue middle stripe */}
        <rect x="0" y="10.67" width="32" height="10.67" fill="#0039A6" />
        {/* Red bottom stripe */}
        <rect x="0" y="21.33" width="32" height="10.67" fill="#D52B1E" />
      </g>
      <circle
        cx="16"
        cy="16"
        r="15.5"
        fill="none"
        stroke="currentColor"
        strokeOpacity="0.15"
        strokeWidth="1"
      />
    </svg>
  );
}

/**
 * Circular flag badge for the Republic of Uzbekistan
 */
export function UzbekFlagIcon({ className = "w-5 h-5" }: { className?: string }) {
  const clipId = useId();
  return (
    <svg
      viewBox="0 0 32 32"
      className={`shrink-0 rounded-full shadow-xs ${className}`}
      aria-hidden="true"
    >
      <defs>
        <clipPath id={clipId}>
          <circle cx="16" cy="16" r="16" />
        </clipPath>
      </defs>
      <g clipPath={`url(#${clipId})`}>
        {/* Cyan/Blue top stripe */}
        <rect x="0" y="0" width="32" height="10" fill="#1E98D7" />
        {/* Red separator 1 */}
        <rect x="0" y="10" width="32" height="1" fill="#CE1126" />
        {/* White middle stripe */}
        <rect x="0" y="11" width="32" height="10" fill="#FFFFFF" />
        {/* Red separator 2 */}
        <rect x="0" y="21" width="32" height="1" fill="#CE1126" />
        {/* Green bottom stripe */}
        <rect x="0" y="22" width="32" height="10" fill="#2E9E44" />

        {/* Crescent moon in top-left blue stripe */}
        <circle cx="6.8" cy="5" r="2.7" fill="#FFFFFF" />
        <circle cx="7.8" cy="5" r="2.2" fill="#1E98D7" />

        {/* 12 stars */}
        <circle cx="12" cy="3.5" r="0.5" fill="#FFFFFF" />
        <circle cx="13.7" cy="3.5" r="0.5" fill="#FFFFFF" />
        <circle cx="15.4" cy="3.5" r="0.5" fill="#FFFFFF" />

        <circle cx="10.5" cy="5.1" r="0.5" fill="#FFFFFF" />
        <circle cx="12.2" cy="5.1" r="0.5" fill="#FFFFFF" />
        <circle cx="13.9" cy="5.1" r="0.5" fill="#FFFFFF" />
        <circle cx="15.6" cy="5.1" r="0.5" fill="#FFFFFF" />

        <circle cx="9" cy="6.7" r="0.5" fill="#FFFFFF" />
        <circle cx="10.7" cy="6.7" r="0.5" fill="#FFFFFF" />
        <circle cx="12.4" cy="6.7" r="0.5" fill="#FFFFFF" />
        <circle cx="14.1" cy="6.7" r="0.5" fill="#FFFFFF" />
        <circle cx="15.8" cy="6.7" r="0.5" fill="#FFFFFF" />
      </g>
      <circle
        cx="16"
        cy="16"
        r="15.5"
        fill="none"
        stroke="currentColor"
        strokeOpacity="0.15"
        strokeWidth="1"
      />
    </svg>
  );
}

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const toggleLocale = (nextLocale: "uz" | "ru") => {
    setIsOpen(false);
    if (nextLocale === locale) return;
    startTransition(() => {
      router.replace(pathname, { locale: nextLocale });
    });
  };

  const isUz = locale === "uz";

  return (
    <div className="relative inline-block text-left" ref={containerRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        data-testid="language-switcher-trigger"
        aria-label={isUz ? "Tilni tanlash: O‘zbekcha" : "Выбор языка: Русский"}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        disabled={isPending}
        className="h-9 sm:h-10 px-2 sm:px-3 rounded-xl bg-slate-100 hover:bg-slate-200/80 dark:bg-slate-800 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700 flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 transition-colors cursor-pointer select-none focus:outline-none focus:ring-2 focus:ring-sora-500/40"
      >
        {isUz ? (
          <UzbekFlagIcon className="w-4 h-4 sm:w-5 sm:h-5" />
        ) : (
          <RussianFlagIcon className="w-4 h-4 sm:w-5 sm:h-5" />
        )}
        <span className="truncate max-w-[80px] sm:max-w-none">
          {isUz ? "O‘zbekcha" : "Русский"}
        </span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-slate-500 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Vertical Dropdown Menu (Matches reference layout) */}
      {isOpen && (
        <div
          aria-label="Tillar ro'yxati"
          className="absolute right-0 top-full mt-1.5 w-44 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-100 space-y-1"
        >
          {/* Option 1: Russian (Top row as in reference image) */}
          <button
            type="button"
            onClick={() => toggleLocale("ru")}
            disabled={isPending}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs sm:text-sm transition-all cursor-pointer select-none text-left ${
              locale === "ru"
                ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold shadow-xs"
                : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 font-medium"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <RussianFlagIcon className="w-5 h-5" />
              <span>Русский</span>
            </div>
            {locale === "ru" && (
              <Check className="w-4 h-4 text-sora-600 dark:text-sora-400 shrink-0" />
            )}
          </button>

          {/* Option 2: Uzbek (Bottom row as in reference image) */}
          <button
            type="button"
            onClick={() => toggleLocale("uz")}
            disabled={isPending}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs sm:text-sm transition-all cursor-pointer select-none text-left ${
              locale === "uz"
                ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold shadow-xs"
                : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 font-medium"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <UzbekFlagIcon className="w-5 h-5" />
              <span>O‘zbekcha</span>
            </div>
            {locale === "uz" && (
              <Check className="w-4 h-4 text-sora-600 dark:text-sora-400 shrink-0" />
            )}
          </button>
        </div>
      )}
    </div>
  );
}
