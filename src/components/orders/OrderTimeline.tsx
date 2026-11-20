"use client";

import { OneCOrderTimelineStep } from "@/lib/schemas/order";
import {
  formatOrderDate,
  getTimelineStepLabel,
} from "@/lib/utils/order-status";
import { Check, Clock, XCircle } from "lucide-react";

interface OrderTimelineProps {
  timeline: OneCOrderTimelineStep[];
  statusCode?: string | null;
  withoutDelivery?: boolean;
  locale: "uz" | "ru";
  compact?: boolean;
}

export function OrderTimeline({
  timeline,
  statusCode,
  withoutDelivery = false,
  locale,
  compact = false,
}: OrderTimelineProps) {
  const isUz = locale === "uz";
  const normalizedCode = (statusCode || "").trim().toUpperCase();
  const isPendingOrder = normalizedCode === "PENDING";

  if (!timeline || timeline.length === 0) {
    return null;
  }

  return (
    <div className={compact ? "space-y-2.5" : "space-y-4"}>
      {isPendingOrder && (
        <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-xs font-medium text-amber-800 dark:text-amber-300 flex items-center gap-2">
          <Clock className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400" />
          <span>
            {isUz
              ? "Buyurtma qabul qilindi va menejer tasdig'ida — tasdiqlangach bosqichlar faollashadi."
              : "Заказ принят и находится на проверке у менеджера — этапы активируются после подтверждения."}
          </span>
        </div>
      )}

      <ol
        className={
          compact
            ? "space-y-2"
            : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3"
        }
      >
        {timeline.map((step, index) => {
          const stepCode = step.code.trim().toUpperCase();
          const isCancelledStep = stepCode === "CANCELLED";
          const isCompleted = step.completed;
          const formattedDate = formatOrderDate(step.date, locale);
          const label = getTimelineStepLabel(step.code, {
            locale,
            withoutDelivery,
            fallbackTitle: step.title,
          });

          if (compact) {
            return (
              <li
                key={`${step.code}-${index}`}
                className="flex items-start justify-between gap-2 text-xs"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                      isCancelledStep
                        ? "bg-rose-100 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400"
                        : isCompleted
                        ? "bg-emerald-600 text-white"
                        : "bg-slate-200 dark:bg-slate-700 text-slate-400"
                    }`}
                  >
                    {isCancelledStep ? (
                      <XCircle className="w-3 h-3" />
                    ) : isCompleted ? (
                      <Check className="w-3 h-3" />
                    ) : (
                      <span className="text-[10px] font-bold">{index + 1}</span>
                    )}
                  </span>
                  <span
                    className={`truncate ${
                      isCancelledStep
                        ? "font-bold text-rose-600 dark:text-rose-400"
                        : isCompleted
                        ? "font-semibold text-slate-900 dark:text-white"
                        : "text-slate-400 dark:text-slate-500"
                    }`}
                  >
                    {label}
                  </span>
                </div>
                {formattedDate && (
                  <span className="text-[11px] text-slate-400 shrink-0 font-mono">
                    {formattedDate}
                  </span>
                )}
              </li>
            );
          }

          return (
            <li
              key={`${step.code}-${index}`}
              className={`p-3.5 rounded-2xl border transition-colors ${
                isCancelledStep
                  ? "bg-rose-50/70 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800/70"
                  : isCompleted
                  ? "bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/60"
                  : "bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/70"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span
                  className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                    isCancelledStep
                      ? "bg-rose-600 text-white"
                      : isCompleted
                      ? "bg-emerald-600 text-white"
                      : "bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-300"
                  }`}
                >
                  {isCancelledStep ? (
                    <XCircle className="w-4 h-4" />
                  ) : isCompleted ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    index + 1
                  )}
                </span>
                <div className="min-w-0">
                  <div
                    className={`text-xs font-bold leading-snug ${
                      isCancelledStep
                        ? "text-rose-700 dark:text-rose-300"
                        : isCompleted
                        ? "text-slate-900 dark:text-white"
                        : "text-slate-500 dark:text-slate-400"
                    }`}
                  >
                    {label}
                  </div>
                  {formattedDate && (
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 font-mono">
                      {formattedDate}
                    </div>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
