"use client";

import { useState } from "react";
import Image from "next/image";
import { Heart, Maximize2 } from "lucide-react";
import { useFavoritesStore } from "@/lib/store/favorites";

interface ProductGalleryProps {
  mainPicture: string;
  altText: string;
  badge?: string;
  productId: string;
}

export function ProductGallery({
  mainPicture,
  altText,
  badge,
  productId,
}: ProductGalleryProps) {
  const [selectedImage, setSelectedImage] = useState(mainPicture);
  const { toggleFavorite, isFavorite } = useFavoritesStore();
  const isFav = isFavorite(productId);

  // Gallery thumbnails list (using main picture and variations)
  const images = [mainPicture, mainPicture];

  return (
    <div className="space-y-4">
      {/* Main Large Image Container */}
      <div className="relative w-full aspect-square bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 flex items-center justify-center shadow-xs overflow-hidden group">
        {/* Badges */}
        <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
          {badge && (
            <span className="px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-xl bg-amber-500 text-white shadow-xs">
              {badge}
            </span>
          )}
        </div>

        {/* Favorite Button */}
        <button
          onClick={() => toggleFavorite(productId)}
          className={`absolute top-4 right-4 z-10 w-10 h-10 rounded-2xl flex items-center justify-center transition-all shadow-xs ${
            isFav
              ? "bg-rose-50 text-rose-500 dark:bg-rose-950/80 shadow-rose-200/50"
              : "bg-slate-100/80 dark:bg-slate-800/80 text-slate-400 hover:text-rose-500"
          }`}
        >
          <Heart className={`w-5 h-5 ${isFav ? "fill-current" : ""}`} />
        </button>

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
      </div>

      {/* Thumbnails */}
      <div className="flex items-center gap-3 overflow-x-auto pb-1">
        {images.map((img, idx) => (
          <button
            key={idx}
            onClick={() => setSelectedImage(img)}
            className={`relative w-18 h-18 rounded-2xl bg-white dark:bg-slate-900 border p-2 shrink-0 transition-all ${
              selectedImage === img
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
    </div>
  );
}
