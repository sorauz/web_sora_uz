"use client";

import { useMemo } from "react";
import { CategoryTreeNode } from "@/lib/schemas/category";
import { TOP_CATEGORIES_DATA } from "@/lib/data/category-visuals";
import { CategoryVisualCard } from "./CategoryVisualCard";

interface TopCategoriesProps {
  categories?: CategoryTreeNode[];
  locale: "uz" | "ru";
}

export function TopCategories({ categories = [], locale }: TopCategoriesProps) {
  // Map 1C Category Tree to find real-time product counts if available
  const countsMap = useMemo(() => {
    const map = new Map<string, number>();

    function traverse(node: CategoryTreeNode): number {
      let total = 0;
      if (node.children && node.children.length > 0) {
        for (const child of node.children) {
          total += traverse(child);
        }
      }
      map.set(node.id, total);
      if (node.group_slug_uz) map.set(node.group_slug_uz, total);
      if (node.group_slug_ru) map.set(node.group_slug_ru, total);
      return total;
    }

    for (const root of categories) {
      traverse(root);
    }

    return map;
  }, [categories]);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-5">
      {TOP_CATEGORIES_DATA.map((cat) => {
        const dynamicCount =
          countsMap.get(cat.oneCId) ||
          countsMap.get(cat.slugUz) ||
          countsMap.get(cat.slugRu);

        return (
          <CategoryVisualCard
            key={cat.id}
            category={cat}
            locale={locale}
            count={dynamicCount && dynamicCount > 0 ? dynamicCount : cat.defaultCount}
          />
        );
      })}
    </div>
  );
}
