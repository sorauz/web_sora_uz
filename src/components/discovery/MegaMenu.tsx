"use client";

import { useState, useRef, useEffect } from "react";
import { CategoryTreeNode } from "@/lib/schemas/category";
import { Brand } from "@/lib/schemas/brand";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { Grid, ChevronDown, ChevronRight, Sparkles, Folder } from "lucide-react";

interface MegaMenuProps {
  tree: CategoryTreeNode[];
  brands: Brand[];
}

export function MegaMenu({ tree, brands }: MegaMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeRootId, setActiveRootId] = useState<string>(tree[0]?.id || "");
  const locale = useLocale();
  const t = useTranslations("common");
  const isUz = locale === "uz";
  const menuRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const activeCategory = tree.find((c) => c.id === activeRootId) || tree[0];

  return (
    <div ref={menuRef} className="relative">
      {/* Katalog Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="h-11 px-4 sm:px-5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm rounded-2xl flex items-center gap-2 shadow-xs transition-colors shrink-0"
      >
        <Grid className="w-4 h-4" />
        <span>{t("catalog")}</span>
        <ChevronDown
          className={`w-4 h-4 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Mega Menu Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-[85vw] max-w-4xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl z-50 overflow-hidden animate-in fade-in-50 zoom-in-95 duration-150">
          <div className="flex h-[420px]">
            {/* Left: Main Categories List */}
            <div className="w-1/3 bg-slate-50/80 dark:bg-slate-800/40 p-4 border-r border-slate-100 dark:border-slate-800 overflow-y-auto space-y-1">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-3 py-1 mb-1">
                {t("allCategories")}
              </div>
              {tree.map((cat) => {
                const isActive = cat.id === activeCategory?.id;
                const name = isUz ? cat.group_uz : cat.group_ru;
                return (
                  <button
                    key={cat.id}
                    onMouseEnter={() => setActiveRootId(cat.id)}
                    onClick={() => setActiveRootId(cat.id)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold text-left transition-all ${
                      isActive
                        ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs"
                        : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80"
                    }`}
                  >
                    <span className="truncate">{name}</span>
                    <ChevronRight
                      className={`w-3.5 h-3.5 shrink-0 ${
                        isActive ? "text-blue-600" : "text-slate-400"
                      }`}
                    />
                  </button>
                );
              })}
            </div>

            {/* Right: Subcategories & Top Brands */}
            <div className="w-2/3 p-6 overflow-y-auto flex flex-col justify-between">
              {activeCategory ? (
                <div className="space-y-6">
                  {/* Category Header Link */}
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                    <Link
                      href={`/category/${
                        isUz
                          ? activeCategory.group_slug_uz
                          : activeCategory.group_slug_ru
                      }`}
                      onClick={() => setIsOpen(false)}
                      className="text-base font-bold text-slate-900 dark:text-slate-100 hover:text-blue-600 dark:hover:text-blue-400 flex items-center gap-2"
                    >
                      <span>
                        {isUz
                          ? activeCategory.group_uz
                          : activeCategory.group_ru}
                      </span>
                      <ChevronRight className="w-4 h-4 text-blue-600" />
                    </Link>
                    <span className="text-xs text-slate-400">
                      {activeCategory.children.length} {isUz ? "bo'lim" : "разделов"}
                    </span>
                  </div>

                  {/* Subcategories Grid */}
                  <div>
                    <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-3">
                      {isUz ? "Ichki toifalar" : "Подкатегории"}
                    </h4>
                    {activeCategory.children.length > 0 ? (
                      <div className="grid grid-cols-2 gap-2.5">
                        {activeCategory.children.map((sub) => (
                          <Link
                            key={sub.id}
                            href={`/category/${
                              isUz ? sub.group_slug_uz : sub.group_slug_ru
                            }`}
                            onClick={() => setIsOpen(false)}
                            className="flex items-center gap-2 p-2 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-blue-600 transition-colors"
                          >
                            <Folder className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                            <span className="truncate">
                              {isUz ? sub.group_uz : sub.group_ru}
                            </span>
                          </Link>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400">
                        {isUz
                          ? "Ushbu toifaning barcha tovarlari umumiy ro'yxatda."
                          : "Все товары категории в общем списке."}
                      </p>
                    )}
                  </div>

                  {/* Featured Brands */}
                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                    <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2.5 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      <span>{isUz ? "Ommabop brendlar" : "Популярные бренды"}</span>
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {brands.slice(0, 6).map((b) => (
                        <Link
                          key={b.id}
                          href={`/brand/${b.name.toLowerCase()}`}
                          onClick={() => setIsOpen(false)}
                          className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-blue-950/40 hover:text-blue-600 transition-colors"
                        >
                          {b.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              ) : null}

              {/* Bottom Quick Link */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-right">
                <Link
                  href="/catalog"
                  onClick={() => setIsOpen(false)}
                  className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
                >
                  {isUz
                    ? "Butun katalogni to'liq ko'rish →"
                    : "Смотреть весь каталог полностью →"}
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
