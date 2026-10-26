"use client";

import { useState } from "react";
import { Link } from "@/i18n/routing";
import { ChevronDown, ChevronUp, Search, Folder } from "lucide-react";
import { useMobileSearchStore } from "@/lib/store/mobileSearch";

export interface SubcategoryChipItem {
  id: string;
  name: string;
  slug: string;
  count?: number;
}

interface SubcategoryChipsProps {
  items: SubcategoryChipItem[];
  locale: "uz" | "ru";
  initialLimit?: number;
}

export function SubcategoryChips({
  items,
  locale,
  initialLimit = 3,
}: SubcategoryChipsProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { openSearch } = useMobileSearchStore();
  const isUz = locale === "uz";

  if (!items || items.length === 0) {
    return null;
  }

  // Agar toifalar soni 4 tadan kam yoki teng bo'lsa, yig'ish/ochish tugmasisiz to'liq ko'rsatiladi
  const needsToggle = items.length > 4;
  const visibleItems = needsToggle && !isExpanded ? items.slice(0, initialLimit) : items;
  const remainingCount = items.length - initialLimit;

  return (
    <div className="space-y-2 pt-1">
      <div className="flex flex-wrap gap-2 items-center">
        {visibleItems.map((item, index) => {
          const isNewlyRevealed = needsToggle && isExpanded && index >= initialLimit;
          return (
            <Link
              key={item.id}
              href={`/category/${item.slug}`}
              className={`group inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-slate-100/90 hover:bg-slate-200/90 dark:bg-slate-800/80 dark:hover:bg-slate-700/80 border border-transparent hover:border-sora-300 dark:hover:border-sora-700 text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 transition-all active:scale-95 shadow-2xs ${
                isNewlyRevealed ? "animate-in fade-in zoom-in-95 duration-200" : ""
              }`}
            >
              <Folder className="w-3.5 h-3.5 text-sora-600 dark:text-sora-400 group-hover:scale-110 transition-transform shrink-0" />
              <span>{item.name}</span>
              {typeof item.count === "number" && item.count > 0 && (
                <span className="text-[11px] font-normal text-slate-400 dark:text-slate-400 ml-0.5">
                  {item.count}
                </span>
              )}
            </Link>
          );
        })}

        {/* Collapsible Trigger Chip: "Yana N ta ∨" (faqat yig'ilgan holatda) */}
        {needsToggle && !isExpanded && (
          <button
            type="button"
            onClick={() => setIsExpanded(true)}
            aria-expanded={false}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-slate-200/80 hover:bg-slate-300/80 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 border border-slate-300/60 dark:border-slate-700 transition-all active:scale-95 cursor-pointer shadow-2xs"
          >
            <span>{isUz ? `Yana ${remainingCount} ta` : `Ещё ${remainingCount}`}</span>
            <ChevronDown className="w-4 h-4 text-slate-600 dark:text-slate-400" />
          </button>
        )}

        {/* Expanded Bottom Action Bar: "Qidiruv" va "Yig'ish ∧" */}
        {needsToggle && isExpanded && (
          <div className="w-full flex items-center gap-2 pt-1 animate-in fade-in duration-200">
            <button
              type="button"
              onClick={openSearch}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-all active:scale-95 cursor-pointer shadow-2xs"
            >
              <Search className="w-3.5 h-3.5 text-slate-500" />
              <span>{isUz ? "Qidiruv" : "Искать везде"}</span>
            </button>

            <button
              type="button"
              onClick={() => setIsExpanded(false)}
              aria-expanded={true}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-slate-200/80 hover:bg-slate-300/80 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 border border-slate-300/60 dark:border-slate-700 transition-all active:scale-95 cursor-pointer shadow-2xs"
            >
              <span>{isUz ? "Yig'ish" : "Свернуть"}</span>
              <ChevronUp className="w-4 h-4 text-slate-600 dark:text-slate-400" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
