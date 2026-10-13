"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { Heart, ChevronLeft, ChevronRight } from "lucide-react";
import { useFavoritesStore } from "@/lib/store/favorites";

interface ProductGalleryProps {
  mainPicture: string;
  gallery?: string[];
  altText: string;
  badge?: string;
  productId: string;
}

export function ProductGallery({
  mainPicture,
  gallery,
  altText,
  badge,
  productId,
}: ProductGalleryProps) {
  // Gallery thumbnails list (using main picture and live 1C gallery)
  const images = Array.from(
    new Set([mainPicture, ...(gallery || [])].filter(Boolean))
  );

  const [selectedIndex, setSelectedIndex] = useState(0);
  const { toggleFavorite, isFavorite } = useFavoritesStore();
  const isFav = isFavorite(productId);

  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  const selectedImage = images[selectedIndex] || mainPicture;

  const goPrev = () => {
    if (images.length <= 1) return;
    setSelectedIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const goNext = () => {
    if (images.length <= 1) return;
    setSelectedIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchEndX.current = null;
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (touchStartX.current === null || touchEndX.current === null) return;
    const distance = touchStartX.current - touchEndX.current;
    const minSwipeDistance = 35;

    if (distance > minSwipeDistance) {
      goNext();
    } else if (distance < -minSwipeDistance) {
      goPrev();
    }

    touchStartX.current = null;
    touchEndX.current = null;
  };

  return (
    <div className="space-y-4">
      {/* Main Large Image Container (Swipeable on Mobile) */}
      <div
        data-testid="product-gallery-main"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className="relative w-full aspect-square bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 flex items-center justify-center shadow-xs overflow-hidden group select-none"
      >
        {/* Badges */}
        <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
          {badge && (
            <span className="px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-xl bg-amber-500 text-white shadow-xs">
              {badge}
            </span>
          )}
        </div>

        {/* Favorite Button (44x44px touch target) */}
        <button
          type="button"
          onClick={() => toggleFavorite(productId)}
          aria-label="Sevimlilarga qo'shish"
          className={`absolute top-3.5 right-3.5 z-10 w-11 h-11 rounded-2xl flex items-center justify-center transition-all shadow-xs cursor-pointer ${
            isFav
              ? "bg-rose-50 text-rose-500 dark:bg-rose-950/80 shadow-rose-200/50"
              : "bg-slate-100/80 dark:bg-slate-800/80 text-slate-400 hover:text-rose-500"
          }`}
        >
          <Heart className={`w-5 h-5 ${isFav ? "fill-current" : ""}`} />
        </button>

        {/* Prev / Next Controls when multiple images exist */}
        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={goPrev}
              aria-label="Oldingi rasm"
              className="absolute left-2.5 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-white/85 dark:bg-slate-800/85 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center shadow-xs active:scale-95 transition-all cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={goNext}
              aria-label="Keyingi rasm"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-white/85 dark:bg-slate-800/85 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center shadow-xs active:scale-95 transition-all cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </>
        )}

        {/* Image Display */}
        <div className="relative w-full h-full">
          <Image
            src={selectedImage}
            alt={altText}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 600px"
            className="object-contain transition-transform duration-300 group-hover:scale-105"
            priority
          />
        </div>

        {/* Mobile Pagination Dots */}
        {images.length > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900/10 dark:bg-white/10 backdrop-blur-xs">
            {images.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setSelectedIndex(idx)}
                aria-label={`Rasm ${idx + 1}`}
                className={`h-1.5 rounded-full transition-all cursor-pointer ${
                  selectedIndex === idx
                    ? "w-4 bg-sora-600 dark:bg-sora-400"
                    : "w-1.5 bg-slate-400/70 dark:bg-slate-500"
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex items-center gap-3 overflow-x-auto pb-1 scrollbar-none">
          {images.map((img, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setSelectedIndex(idx)}
              className={`relative w-18 h-18 rounded-2xl bg-white dark:bg-slate-900 border p-2 shrink-0 transition-all cursor-pointer ${
                selectedIndex === idx
                  ? "border-sora-600 ring-2 ring-sora-500/20 shadow-xs"
                  : "border-slate-200 dark:border-slate-800 opacity-70 hover:opacity-100"
              }`}
            >
              <Image
                src={img}
                alt={`${altText} thumbnail ${idx + 1}`}
                fill
                sizes="72px"
                className="object-contain p-1.5"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
