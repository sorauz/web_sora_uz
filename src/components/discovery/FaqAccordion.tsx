"use client";

import { useState } from "react";
import { HelpCircle, Plus, Minus } from "lucide-react";
import type { ResolvedFaqItem } from "@/lib/utils/faq-resolver";

export interface FaqAccordionProps {
  items: ResolvedFaqItem[];
  columns?: 1 | 2;
  title?: string;
  subtitle?: string;
  headerAlign?: "left" | "center";
  defaultOpenFirst?: boolean;
  variant?: "section" | "plain";
  className?: string;
}

export function FaqAccordion({
  items,
  columns = 1,
  title,
  subtitle,
  headerAlign = "left",
  defaultOpenFirst = false,
  variant = "section",
  className = "",
}: FaqAccordionProps) {
  const [openIds, setOpenIds] = useState<string[]>(() =>
    defaultOpenFirst && items.length > 0 ? [items[0].id] : []
  );

  if (!items || items.length === 0) {
    return null;
  }

  const toggleItem = (id: string) => {
    setOpenIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const renderCard = (item: ResolvedFaqItem) => {
    const isOpen = openIds.includes(item.id);
    const triggerId = `faq-trigger-${item.id}`;
    const panelId = `faq-panel-${item.id}`;

    return (
      <div
        key={item.id}
        data-testid="faq-item"
        className={`rounded-2xl border transition-colors duration-200 overflow-hidden ${
          isOpen
            ? "border-sora-200 dark:border-sora-800/80 bg-white dark:bg-slate-900 shadow-xs"
            : "border-slate-200/90 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/50 hover:border-slate-300 dark:hover:border-slate-700"
        }`}
      >
        <button
          id={triggerId}
          type="button"
          aria-expanded={isOpen}
          aria-controls={panelId}
          onClick={() => toggleItem(item.id)}
          className="w-full flex items-center justify-between gap-3 p-4 sm:p-5 text-left cursor-pointer select-none group"
        >
          <span
            className={`text-sm sm:text-[15px] font-bold leading-snug transition-colors ${
              isOpen
                ? "text-sora-700 dark:text-sora-300"
                : "text-slate-900 dark:text-slate-100 group-hover:text-sora-600 dark:group-hover:text-sora-400"
            }`}
          >
            {item.question}
          </span>
          <span
            className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
              isOpen
                ? "bg-sora-600 text-white"
                : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 group-hover:border-sora-300 group-hover:text-sora-600"
            }`}
          >
            {isOpen ? (
              <Minus className="w-4 h-4" />
            ) : (
              <Plus className="w-4 h-4" />
            )}
          </span>
        </button>

        {/* CSS-driven collapse keeps all answer paragraphs in SSR HTML DOM for search bots */}
        <div
          id={panelId}
          role="region"
          aria-labelledby={triggerId}
          className={`grid transition-[grid-template-rows] duration-200 ease-out ${
            isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
          }`}
        >
          <div className="overflow-hidden">
            <div className="px-4 sm:px-5 pb-4 sm:pb-5 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 bg-white dark:bg-slate-900 space-y-2.5 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {item.paragraphs.map((paragraph, pIdx) => (
                <p key={pIdx}>{paragraph}</p>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Split into 2 independent vertical stacks on desktop so opening a card never shifts neighbor row height
  const useTwoCols = columns === 2 && items.length > 1;
  const midPoint = useTwoCols ? Math.ceil(items.length / 2) : items.length;
  const leftItems = items.slice(0, midPoint);
  const rightItems = useTwoCols ? items.slice(midPoint) : [];

  const body = useTwoCols ? (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5 sm:gap-4 items-start">
      <div className="space-y-3.5 sm:space-y-4">{leftItems.map(renderCard)}</div>
      <div className="space-y-3.5 sm:space-y-4">{rightItems.map(renderCard)}</div>
    </div>
  ) : (
    <div className="space-y-3 sm:space-y-3.5">{items.map(renderCard)}</div>
  );

  if (variant === "plain") {
    return (
      <div data-testid="faq-accordion" className={`space-y-4 ${className}`}>
        {title && (
          <div
            className={
              headerAlign === "center" ? "text-center space-y-1.5" : "space-y-1"
            }
          >
            <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
              {title}
            </h3>
            {subtitle && (
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                {subtitle}
              </p>
            )}
          </div>
        )}
        {body}
      </div>
    );
  }

  return (
    <section
      data-testid="faq-accordion"
      className={`bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-8 border border-slate-200 dark:border-slate-800 space-y-5 sm:space-y-6 ${className}`}
    >
      {title && (
        <div
          className={
            headerAlign === "center"
              ? "text-center max-w-2xl mx-auto space-y-2"
              : "flex items-start gap-3"
          }
        >
          {headerAlign === "center" ? (
            <>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sora-50 dark:bg-sora-950/60 text-sora-600 dark:text-sora-400 text-xs font-bold">
                <HelpCircle className="w-3.5 h-3.5" />
                <span>FAQ</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                {title}
              </h2>
              {subtitle && (
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                  {subtitle}
                </p>
              )}
            </>
          ) : (
            <>
              <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                <HelpCircle className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h2 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                  {title}
                </h2>
                {subtitle && (
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                    {subtitle}
                  </p>
                )}
              </div>
            </>
          )}
        </div>
      )}

      {body}
    </section>
  );
}
