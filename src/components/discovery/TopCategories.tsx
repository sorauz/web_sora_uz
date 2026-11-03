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

  // Map 1C Category Tree by ID for real-time slug synchronization with 1C ERP
  const liveNodesMap = useMemo(() => {
    const map = new Map<string, CategoryTreeNode>();
    function traverse(node: CategoryTreeNode) {
      map.set(node.id, node);
      if (node.children && node.children.length > 0) {
        for (const child of node.children) {
          traverse(child);
        }
      }
    }
    for (const root of categories) {
      traverse(root);
    }
    return map;
  }, [categories]);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-5">
      {TOP_CATEGORIES_DATA.map((cat) => {
        const liveNode = liveNodesMap.get(cat.oneCId);
        const dynamicCount =
          countsMap.get(cat.oneCId) ||
          countsMap.get(cat.slugUz) ||
          countsMap.get(cat.slugRu);

        const categoryWithLiveSlugs = liveNode
          ? {
              ...cat,
              slugUz: liveNode.group_slug_uz || cat.slugUz,
              slugRu: liveNode.group_slug_ru || cat.slugRu,
            }
          : cat;

        return (
          <CategoryVisualCard
            key={cat.id}
            category={categoryWithLiveSlugs}
            locale={locale}
            count={dynamicCount && dynamicCount > 0 ? dynamicCount : cat.defaultCount}
          />
        );
      })}
    </div>
  );
}
