"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import {
  Search,
  X,
  Package,
  CheckCircle2,
  Clock,
  XCircle,
  Loader2,
  AlertCircle,
} from "lucide-react";

interface OrderTrackerModalProps {
  isOpen: boolean;
  onClose: () => void;
  locale?: "uz" | "ru";
}

interface OrderStatusResult {
  order_id: string;
  order_number: string;
  order_date: string;
  status: string;
  without_delivery: boolean;
  total_amount: number;
}

export function OrderTrackerModal({
  isOpen,
  onClose,
  locale = "uz",
}: OrderTrackerModalProps) {
  const isUz = locale === "uz";
  const [orderId, setOrderId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<OrderStatusResult | null>(null);

  if (!isOpen) return null;

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId.trim()) return;

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch(
        `/api/order/status?orderId=${encodeURIComponent(orderId.trim())}`
      );
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || (isUz ? "Buyurtma topilmadi" : "Заказ не найден"));
      } else if (data.order) {
        setResult(data.order);
      }
    } catch {
      setError(
        isUz ? "Tarmoq xatosi yuz berdi" : "Произошла сетевая ошибка"
      );
    } finally {
      setLoading(false);
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden p-6 space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-sora-600 dark:text-sora-400" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {isUz ? "Buyurtma holatini tekshirish" : "Проверить статус заказа"}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleTrack} className="space-y-3">
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
            {isUz ? "1C Buyurtma ID (GUID) raqamini kiriting:" : "Введите ID заказа (GUID) из 1С:"}
          </label>
          <div className="relative">
            <input
              type="text"
              placeholder="e44c21a0-318a-11e8-812c-d43d7e011714"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              className="w-full h-11 pl-4 pr-11 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-sora-500 font-mono"
            />
            <button
              type="submit"
              disabled={loading || !orderId.trim()}
              className="absolute right-1.5 top-1.5 w-8 h-8 rounded-lg bg-sora-600 hover:bg-sora-700 text-white flex items-center justify-center disabled:opacity-40 transition-colors"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Search className="w-4 h-4" />
              )}
            </button>
          </div>
        </form>

        {error && (
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-600 dark:text-rose-400 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {result && (
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3 animate-in fade-in zoom-in-95 duration-200 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-700">
              <span className="font-bold text-slate-900 dark:text-white">
                {result.order_number}
              </span>
              <span
                className={`font-bold px-2 py-0.5 rounded-full text-[11px] flex items-center gap-1 ${
                  result.status === "Tasdiqlangan"
                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300"
                    : result.status === "Bekor qilingan"
                    ? "bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300"
                    : "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300"
                }`}
              >
                {result.status === "Tasdiqlangan" && <CheckCircle2 className="w-3 h-3" />}
                {result.status === "Bekor qilingan" && <XCircle className="w-3 h-3" />}
                {result.status === "Jarayonda" && <Clock className="w-3 h-3" />}
                {result.status}
              </span>
            </div>

            <div className="space-y-1.5 text-slate-600 dark:text-slate-300">
              <div className="flex justify-between">
                <span>{isUz ? "Sana:" : "Дата:"}</span>
                <span className="font-medium text-slate-900 dark:text-white">
                  {new Date(result.order_date).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span>{isUz ? "Yetkazib berish:" : "Доставка:"}</span>
                <span className="font-medium text-slate-900 dark:text-white">
                  {result.without_delivery
                    ? isUz ? "Do'kondan olib ketish" : "Самовывоз"
                    : isUz ? "Kuryer orqali" : "Курьер"}
                </span>
              </div>
              {result.total_amount > 0 && (
                <div className="flex justify-between pt-1 border-t border-slate-200 dark:border-slate-700 font-bold">
                  <span>{isUz ? "Jami summa:" : "Сумма:"}</span>
                  <span className="text-sora-600 dark:text-sora-400">
                    {result.total_amount.toLocaleString("ru-RU")} UZS
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
