"use client";

import { CategoryTreeNode, Category } from "@/lib/schemas/category";
import { Brand } from "@/lib/schemas/brand";
import { Product } from "@/lib/schemas/product";
import { Link } from "@/i18n/routing";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { MegaMenu } from "@/components/discovery/MegaMenu";
import { SearchAutocomplete } from "@/components/discovery/SearchAutocomplete";
import { Heart, ShoppingBag, User, LogOut, Package, Scale } from "lucide-react";
import { useCartStore } from "@/lib/store/cart";
import { useFavoritesStore } from "@/lib/store/favorites";
import { useCompareStore } from "@/lib/store/compare";
import { useAuthStore } from "@/lib/store/auth";
import { AuthModal } from "@/components/auth/AuthModal";
import { OrderTrackerModal } from "@/components/checkout/OrderTrackerModal";
import { useEffect, useState, useRef } from "react";
import { useTranslations } from "next-intl";

interface HeaderProps {
  tree: CategoryTreeNode[];
  categories: Category[];
  brands: Brand[];
  products: Product[];
}

export function Header({ tree, categories, brands, products }: HeaderProps) {
  const t = useTranslations("common");
  const { getTotalItems } = useCartStore();
  const { getCount } = useFavoritesStore();
  const { getCount: getCompareCount } = useCompareStore();
  const { user, openModal, logout, checkAuth } = useAuthStore();

  const [mounted, setMounted] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [trackerOpen, setTrackerOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    checkAuth();
  }, [checkAuth]);

  // Click outside to close user dropdown
  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  const cartCount = mounted ? getTotalItems() : 0;
  const favCount = mounted ? getCount() : 0;
  const compareCount = mounted ? getCompareCount() : 0;

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4">
        {/* Logo - Matching logo.png */}
        <Link href="/" className="flex flex-col shrink-0 group">
          <span className="text-2xl sm:text-3xl font-black tracking-tight text-sora-600 dark:text-sora-400 leading-none">
            SORAUZ
          </span>
          <span className="text-[9.5px] font-bold tracking-tight text-slate-800 dark:text-slate-300 leading-tight mt-0.5">
            Sizga mos ishonchli tanlov
          </span>
        </Link>

        {/* Mega Menu Trigger */}
        <div className="hidden md:block">
          <MegaMenu tree={tree} brands={brands} />
        </div>

        {/* Search Input with Autocomplete */}
        <div className="flex-1 max-w-xl mx-2 hidden sm:block">
          <SearchAutocomplete
            products={products}
            categories={categories}
            brands={brands}
          />
        </div>

        {/* Actions (Favorites, Compare, Cart, User, Language) */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Compare */}
          <Link
            href="/compare"
            aria-label={t("compare")}
            className="relative p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors"
          >
            <Scale className="w-5 h-5" />
            {compareCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-sora-600 text-white text-[10px] font-bold flex items-center justify-center">
                {compareCount}
              </span>
            )}
          </Link>

          {/* Favorites */}
          <Link
            href="/favorites"
            aria-label={t("favorites")}
            className="relative p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors"
          >
            <Heart className="w-5 h-5" />
            {favCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center">
                {favCount}
              </span>
            )}
          </Link>

          {/* Cart */}
          <Link
            href="/cart"
            aria-label={t("cart")}
            className="relative p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors"
          >
            <ShoppingBag className="w-5 h-5" />
            {cartCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-sora-600 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                {cartCount}
              </span>
            )}
          </Link>

          {/* User Account / Login */}
          <div className="relative" ref={userMenuRef}>
            {user ? (
              <button
                type="button"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer border border-slate-200 dark:border-slate-800"
                title={user.name}
              >
                <div className="w-6 h-6 rounded-lg bg-sora-100 dark:bg-sora-950/60 text-sora-600 dark:text-sora-400 font-bold text-xs flex items-center justify-center">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span className="hidden lg:inline text-xs font-bold max-w-28 truncate">
                  {user.name.split(" ")[0]}
                </span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => openModal({ tab: "login" })}
                className="p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
                title="Kirish / Ro'yxatdan o'tish"
                aria-label="Kirish"
              >
                <User className="w-5 h-5" />
              </button>
            )}

            {/* User Dropdown */}
            {user && userMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl p-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                <div className="p-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    {user.name}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    {user.type === "B2B" ? `INN: ${user.inn}` : user.phone}
                  </div>
                  <div className="mt-1">
                    <span className="inline-block px-2 py-0.5 rounded-md text-[10px] font-bold bg-sora-50 dark:bg-sora-950/60 text-sora-600 dark:text-sora-400 border border-sora-200 dark:border-sora-800">
                      {user.type === "B2B" ? "Yuridik shaxs (B2B)" : "Jismoniy shaxs (B2C)"}
                    </span>
                  </div>
                </div>

                <div className="pt-1 border-t border-slate-100 dark:border-slate-800 space-y-1">
                  <button
                    onClick={() => {
                      setUserMenuOpen(false);
                      setTrackerOpen(true);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    <Package className="w-3.5 h-3.5 text-sora-600 dark:text-sora-400" />
                    <span>Buyurtma holati</span>
                  </button>
                  <button
                    onClick={() => {
                      setUserMenuOpen(false);
                      logout();
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Chiqish</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Language Switcher */}
          <LanguageSwitcher />
        </div>
      </div>

      {/* Mobile Search Bar Row */}
      <div className="sm:hidden px-4 pb-3">
        <SearchAutocomplete
          products={products}
          categories={categories}
          brands={brands}
        />
      </div>

      {/* Auth Modal */}
      <AuthModal />

      {/* Order Tracker Modal */}
      <OrderTrackerModal
        isOpen={trackerOpen}
        onClose={() => setTrackerOpen(false)}
      />
    </header>
  );
}
