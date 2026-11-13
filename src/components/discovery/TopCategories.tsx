import { CategoryTreeNode } from "@/lib/schemas/category";
import { TOP_CATEGORIES_DATA } from "@/lib/data/category-visuals";
import { CategoryVisualCard } from "./CategoryVisualCard";
import { Product } from "@/lib/schemas/product";
import { findCategoryBySlug, getAllCategorySlugs } from "@/lib/utils/category-tree";

interface TopCategoriesProps {
  categories?: CategoryTreeNode[];
  products?: Product[];
  locale: "uz" | "ru";
}

export function TopCategories({
  categories = [],
  products = [],
  locale,
}: TopCategoriesProps) {
  // Map 1C Category Tree by ID for real-time slug synchronization with 1C ERP
  const liveNodesMap = new Map<string, CategoryTreeNode>();
  function traverseNodes(node: CategoryTreeNode) {
    liveNodesMap.set(node.id, node);
    if (node.children && node.children.length > 0) {
      for (const child of node.children) {
        traverseNodes(child);
      }
    }
  }
  for (const root of categories) {
    traverseNodes(root);
  }

  // Pre-calculate real-time dynamic product counts from 1C products list
  const dynamicCountsMap = new Map<string, number>();

  if (products && products.length > 0) {
    for (const cat of TOP_CATEGORIES_DATA) {
      const liveNode =
        liveNodesMap.get(cat.oneCId) ||
        findCategoryBySlug(categories, cat.slugUz, "uz") ||
        findCategoryBySlug(categories, cat.slugRu, "ru");

      const matchingSlugs = liveNode
        ? getAllCategorySlugs(liveNode)
        : new Set<string>([cat.slugUz, cat.slugRu]);

      let count = 0;
      for (const p of products) {
        const slugUz = p.uz?.category_slug_uz;
        const slugRu = p.ru?.category_slug_ru;
        if (
          (slugUz && matchingSlugs.has(slugUz)) ||
          (slugRu && matchingSlugs.has(slugRu))
        ) {
          count++;
        }
      }

      if (count > 0) {
        dynamicCountsMap.set(cat.id, count);
      }
    }
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-5">
      {TOP_CATEGORIES_DATA.map((cat) => {
        const liveNode =
          liveNodesMap.get(cat.oneCId) ||
          findCategoryBySlug(categories, cat.slugUz, "uz") ||
          findCategoryBySlug(categories, cat.slugRu, "ru");

        const dynamicCount = dynamicCountsMap.get(cat.id);
        const finalCount =
          dynamicCount && dynamicCount > 0 ? dynamicCount : cat.defaultCount;

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
            count={finalCount}
          />
        );
      })}
    </div>
  );
}
