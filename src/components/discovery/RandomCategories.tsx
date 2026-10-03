"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { CategoryTreeNode } from "@/lib/schemas/category";
import { CategoryCard } from "./CategoryCard";
import { Shuffle } from "lucide-react";

interface RandomCategoriesProps {
  categories: CategoryTreeNode[];
  locale: "uz" | "ru";
}

/**
 * Rotates categories by picking 4 items, prioritizing items not currently shown
 */
function pickNextFour(
  all: CategoryTreeNode[],
  currentIds: string[]
): CategoryTreeNode[] {
  if (all.length <= 4) return all;

  // Prefer items not currently in view
  const unselected = all.filter((c) => !currentIds.includes(c.id));
  const shuffledUnselected = [...unselected].sort(() => Math.random() - 0.5);

  if (shuffledUnselected.length >= 4) {
    return shuffledUnselected.slice(0, 4);
  }

  // If fewer than 4 remain unselected, pick all unselected and fill remainder from current
  const needed = 4 - shuffledUnselected.length;
  const shuffledCurrent = [...all.filter((c) => currentIds.includes(c.id))].sort(
    () => Math.random() - 0.5
  );

  return [...shuffledUnselected, ...shuffledCurrent.slice(0, needed)];
}

export function RandomCategories({ categories, locale }: RandomCategoriesProps) {
  // Safe SSR initial state: first 4 items (ensures 100% hydration match)
  const [displayed, setDisplayed] = useState<CategoryTreeNode[]>(() =>
    categories.slice(0, 4)
  );
  const [isFading, setIsFading] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const isPausedRef = useRef(false);
  isPausedRef.current = isPaused;

  const currentIds = displayed.map((c) => c.id);

  // Transition to a new random 4
  const rotateToNewFour = useCallback(() => {
    if (categories.length <= 4) return;
    setIsFading(true);
    setTimeout(() => {
      setDisplayed((prev) => pickNextFour(categories, prev.map((c) => c.id)));
      setIsFading(false);
    }, 200);
  }, [categories]);

  // Mount effect: pick a random 4 right after hydration so each page load is distinct
  useEffect(() => {
    if (categories.length > 4) {
      // Small delay after hydration to avoid synchronous mismatch
      const timer = setTimeout(() => {
        setDisplayed(pickNextFour(categories, []));
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [categories]);

  // Periodic rotation (every 7 seconds) if not hovered/paused
  useEffect(() => {
    if (categories.length <= 4) return;

    const interval = setInterval(() => {
      if (!isPausedRef.current && typeof document !== "undefined" && !document.hidden) {
        rotateToNewFour();
      }
    }, 7000);

    return () => clearInterval(interval);
  }, [categories, rotateToNewFour]);

  const isUz = locale === "uz";

  return (
    <div
      className="space-y-3"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="flex items-center justify-between text-xs text-slate-500">
        <span className="inline-flex items-center gap-1.5 font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          {isUz ? "Har 7 soniyada aylanuvchi 4 toifa" : "4 категории с авторотацией"}
        </span>

        {categories.length > 4 && (
          <button
            type="button"
            onClick={rotateToNewFour}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-slate-600 dark:text-slate-400 hover:text-sora-600 dark:hover:text-sora-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title={isUz ? "Boshqa 4 ta toifani ko'rish" : "Показать другие 4 категории"}
            aria-label={isUz ? "Boshqa toifalar" : "Сменить категории"}
          >
            <Shuffle className={`w-3.5 h-3.5 ${isFading ? "animate-spin" : ""}`} />
            <span className="font-semibold">{isUz ? "Almashtirish" : "Сменить"}</span>
          </button>
        )}
      </div>

      <div
        className={`grid grid-cols-2 md:grid-cols-4 gap-4 transition-all duration-300 ease-in-out ${
          isFading ? "opacity-30 scale-[0.99]" : "opacity-100 scale-100"
        }`}
      >
        {displayed.map((cat) => (
          <CategoryCard key={cat.id} category={cat} locale={locale} />
        ))}
      </div>
    </div>
  );
}
