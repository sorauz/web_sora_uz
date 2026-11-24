"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/routing";
import {
  useState,
  useRef,
  useEffect,
  useTransition,
  useId,
  useCallback,
} from "react";
import { createPortal } from "react-dom";
import { ChevronDown, Check, Loader2 } from "lucide-react";

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

interface MenuCoords {
  top: number;
  right: number;
}

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const [isOpen, setIsOpen] = useState(false);
  const [switchingTo, setSwitchingTo] = useState<"uz" | "ru" | null>(null);
  const [menuCoords, setMenuCoords] = useState<MenuCoords | null>(null);

  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const updateMenuPosition = useCallback(() => {
    const el = triggerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setMenuCoords({
      top: Math.max(8, rect.bottom + 6),
      right: Math.max(8, window.innerWidth - rect.right),
    });
  }, []);

  // Keep portal menu anchored to trigger on scroll & resize
  useEffect(() => {
    if (!isOpen) return;

    const handleReposition = () => updateMenuPosition();
    window.addEventListener("resize", handleReposition);
    window.addEventListener("scroll", handleReposition, { passive: true, capture: true });

    return () => {
      window.removeEventListener("resize", handleReposition);
      window.removeEventListener("scroll", handleReposition, true);
    };
  }, [isOpen, updateMenuPosition]);

  // Close dropdown on outside pointerdown (checks BOTH trigger & portal menu)
  useEffect(() => {
    if (!isOpen) return;

    const handleOutsidePointerDown = (event: PointerEvent) => {
      const target = event.target as Node | null;
      if (!target) return;
      if (triggerRef.current?.contains(target)) return;
      if (menuRef.current?.contains(target)) return;
      setIsOpen(false);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    };

    document.addEventListener("pointerdown", handleOutsidePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handleOutsidePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const handleToggleOpen = () => {
    if (isOpen) {
      setIsOpen(false);
      return;
    }
    updateMenuPosition();
    setIsOpen(true);
  };

  const toggleLocale = (nextLocale: "uz" | "ru") => {
    setIsOpen(false);
    if (nextLocale === locale) return;

    setSwitchingTo(nextLocale);
    const search =
      typeof window !== "undefined" ? window.location.search : "";
    let targetPath = search ? `${pathname}${search}` : pathname;

    // On localized product/category pages, prefer canonical alternate hreflang URL
    // to avoid an extra cross-locale server redirect round-trip.
    if (
      typeof document !== "undefined" &&
      (pathname.startsWith("/products/") || pathname.startsWith("/category/"))
    ) {
      const altLink = document.querySelector<HTMLLinkElement>(
        `link[rel="alternate"][hreflang="${nextLocale}"]`,
      );
      if (altLink?.href) {
        try {
          const altUrl = new URL(altLink.href, window.location.origin);
          const localePrefix = `/${nextLocale}`;
          if (altUrl.pathname.startsWith(`${localePrefix}/`)) {
            const routeWithoutLocale = altUrl.pathname.slice(
              localePrefix.length,
            );
            const expectedSection = pathname.startsWith("/products/")
              ? "/products/"
              : "/category/";
            if (routeWithoutLocale.startsWith(expectedSection)) {
              targetPath = search
                ? `${routeWithoutLocale}${search}`
                : routeWithoutLocale;
            }
          }
        } catch {
          // Keep default pathname fallback
        }
      }
    }

    startTransition(() => {
      router.replace(targetPath, { locale: nextLocale });
    });
  };

  const activeSwitchingLocale =
    isPending && switchingTo && switchingTo !== locale ? switchingTo : null;
  const displayedLocale = activeSwitchingLocale ?? (locale === "ru" ? "ru" : "uz");
  const isUz = displayedLocale === "uz";

  return (
    <div className="relative inline-block text-left">
      {/* Trigger Button */}
      <button
        ref={triggerRef}
        type="button"
        onClick={handleToggleOpen}
        data-testid="language-switcher-trigger"
        aria-label={isUz ? "Tilni tanlash: O‘zbekcha" : "Выбор языка: Русский"}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-busy={Boolean(activeSwitchingLocale)}
        disabled={Boolean(activeSwitchingLocale)}
        className={`h-9 sm:h-10 px-2.5 sm:px-3 rounded-xl bg-slate-100 hover:bg-slate-200/80 dark:bg-slate-800 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700 flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 transition-colors cursor-pointer select-none focus:outline-none focus:ring-2 focus:ring-sora-500/40 ${
          activeSwitchingLocale ? "opacity-80 cursor-wait" : ""
        }`}
      >
        {isUz ? (
          <UzbekFlagIcon className="w-4 h-4 sm:w-5 sm:h-5" />
        ) : (
          <RussianFlagIcon className="w-4 h-4 sm:w-5 sm:h-5" />
        )}
        <span className="truncate max-w-[84px] sm:max-w-none">
          {isUz ? "O‘zbekcha" : "Русский"}
        </span>
        {activeSwitchingLocale ? (
          <Loader2 className="w-3.5 h-3.5 text-sora-600 animate-spin shrink-0" />
        ) : (
          <ChevronDown
            className={`w-3.5 h-3.5 text-slate-500 transition-transform duration-200 shrink-0 ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        )}
      </button>

      {/* Portal Dropdown Menu — immune to header overflow/backdrop-filter clipping on all browsers */}
      {isOpen &&
        menuCoords &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            ref={menuRef}
            aria-label="Tillar ro'yxati"
            style={{
              position: "fixed",
              top: `${menuCoords.top}px`,
              right: `${menuCoords.right}px`,
            }}
            onPointerDown={(e) => e.stopPropagation()}
            className="w-48 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl p-1.5 z-[9999] space-y-1"
          >
            {/* Option 1: Russian */}
            <button
              type="button"
              aria-current={locale === "ru" ? "true" : undefined}
              onClick={() => toggleLocale("ru")}
              disabled={Boolean(activeSwitchingLocale)}
              className={`w-full min-h-[44px] flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm transition-colors cursor-pointer select-none text-left touch-manipulation ${
                locale === "ru"
                  ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold"
                  : "text-slate-700 dark:text-slate-200 hover:bg-sora-50 dark:hover:bg-slate-800/80 active:bg-sora-100 font-medium"
              }`}
            >
              <span className="flex items-center gap-2.5">
                <RussianFlagIcon className="w-5 h-5" />
                <span>Русский</span>
              </span>
              {locale === "ru" && (
                <Check className="w-4 h-4 text-sora-600 dark:text-sora-400 shrink-0" />
              )}
            </button>

            {/* Option 2: Uzbek */}
            <button
              type="button"
              aria-current={locale === "uz" ? "true" : undefined}
              onClick={() => toggleLocale("uz")}
              disabled={Boolean(activeSwitchingLocale)}
              className={`w-full min-h-[44px] flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm transition-colors cursor-pointer select-none text-left touch-manipulation ${
                locale === "uz"
                  ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold"
                  : "text-slate-700 dark:text-slate-200 hover:bg-sora-50 dark:hover:bg-slate-800/80 active:bg-sora-100 font-medium"
              }`}
            >
              <span className="flex items-center gap-2.5">
                <UzbekFlagIcon className="w-5 h-5" />
                <span>O‘zbekcha</span>
              </span>
              {locale === "uz" && (
                <Check className="w-4 h-4 text-sora-600 dark:text-sora-400 shrink-0" />
              )}
            </button>
          </div>,
          document.body
        )}
    </div>
  );
}
