"use client";

import { Slider } from "@base-ui/react";
import { useState, useEffect, useId } from "react";

interface DualRangeSliderProps {
  min: number;
  max: number;
  step?: number;
  value: [number, number];
  onValueChange?: (val: [number, number]) => void;
  onValueCommit?: (val: [number, number]) => void;
  className?: string;
  disabled?: boolean;
}

export function DualRangeSlider({
  min,
  max,
  step = 1000,
  value,
  onValueChange,
  onValueCommit,
  className = "",
  disabled = false,
}: DualRangeSliderProps) {
  // Ensure min < max to satisfy Slider component requirements
  const safeMin = Math.min(min, max);
  const safeMax = Math.max(min, max) === safeMin ? safeMin + 1000 : Math.max(min, max);

  // Clamp values inside bounds
  const clamp = (v: number) => Math.min(safeMax, Math.max(safeMin, v));
  const initialVal: [number, number] = [
    clamp(value[0] ?? safeMin),
    clamp(value[1] ?? safeMax),
  ];

  const [localValue, setLocalValue] = useState<[number, number]>(initialVal);

  useEffect(() => {
    setLocalValue([
      clamp(value[0] ?? safeMin),
      clamp(value[1] ?? safeMax),
    ]);
  }, [value[0], value[1], safeMin, safeMax]);

  const handleChange = (newVal: number | readonly number[]) => {
    if (Array.isArray(newVal) && newVal.length >= 2) {
      const pair: [number, number] = [newVal[0], newVal[1]];
      setLocalValue(pair);
      onValueChange?.(pair);
    }
  };

  const handleCommit = (newVal: number | readonly number[]) => {
    if (Array.isArray(newVal) && newVal.length >= 2) {
      const pair: [number, number] = [newVal[0], newVal[1]];
      setLocalValue(pair);
      onValueCommit?.(pair);
    }
  };

  const formatPrice = (n: number) => n.toLocaleString("ru-RU");

  return (
    <div className={`space-y-1.5 ${className}`}>
      {/* Live Value Labels */}
      <div className="flex items-center justify-between text-[11px] font-bold text-slate-700 dark:text-slate-300 select-none">
        <span className="font-mono bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-[10.5px]">
          {formatPrice(localValue[0])} so&apos;m
        </span>
        <span className="text-slate-400 font-normal text-[10px]">—</span>
        <span className="font-mono bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-[10.5px]">
          {formatPrice(localValue[1])} so&apos;m
        </span>
      </div>

      {/* Base UI Dual Range Slider */}
      <Slider.Root
        value={localValue}
        min={safeMin}
        max={safeMax}
        step={step}
        disabled={disabled}
        thumbCollisionBehavior="push"
        onValueChange={handleChange}
        onValueCommitted={handleCommit}
        className="relative w-full py-2 select-none touch-none cursor-pointer"
      >
        <Slider.Control className="relative flex w-full items-center h-5 cursor-pointer touch-none select-none">
          <Slider.Track className="relative h-2 w-full grow rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden shadow-inner">
            <Slider.Indicator className="absolute h-full rounded-full bg-sora-600 dark:bg-sora-500 transition-colors" />
          </Slider.Track>

          {/* Left Thumb (Min) */}
          <Slider.Thumb
            index={0}
            aria-label="Minimal narx"
            className="block w-5 h-5 rounded-full bg-white dark:bg-slate-900 border-2 border-sora-600 dark:border-sora-400 shadow-md ring-offset-2 ring-sora-400 focus:outline-hidden focus-visible:ring-2 hover:scale-110 active:scale-95 transition-transform cursor-grab active:cursor-grabbing z-10"
          />

          {/* Right Thumb (Max) */}
          <Slider.Thumb
            index={1}
            aria-label="Maksimal narx"
            className="block w-5 h-5 rounded-full bg-white dark:bg-slate-900 border-2 border-sora-600 dark:border-sora-400 shadow-md ring-offset-2 ring-sora-400 focus:outline-hidden focus-visible:ring-2 hover:scale-110 active:scale-95 transition-transform cursor-grab active:cursor-grabbing z-10"
          />
        </Slider.Control>
      </Slider.Root>
    </div>
  );
}
