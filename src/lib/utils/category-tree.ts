import { Category, CategoryTreeNode } from "../schemas/category";

/**
 * Transforms a flat list of 1C categories into a nested tree structure.
 * Categories with empty parent_id ("") or non-existent parent_id become root nodes.
 */
export function buildCategoryTree(categories: Category[]): CategoryTreeNode[] {
  const categoryMap = new Map<string, CategoryTreeNode>();
  const rootNodes: CategoryTreeNode[] = [];

  // Initialize nodes with empty children arrays
  for (const cat of categories) {
    categoryMap.set(cat.id, {
      ...cat,
      children: [],
    });
  }

  // Connect children to parents
  for (const cat of categories) {
    const node = categoryMap.get(cat.id)!;
    const parentId = cat.parent_id?.trim();

    if (parentId && categoryMap.has(parentId)) {
      const parent = categoryMap.get(parentId)!;
      parent.children.push(node);
    } else {
      rootNodes.push(node);
    }
  }

  return rootNodes;
}

/**
 * Searches the category tree for a node matching a given slug in either uz or ru.
 */
export function findCategoryBySlug(
  tree: CategoryTreeNode[],
  slug: string,
  locale: "uz" | "ru" = "uz"
): CategoryTreeNode | null {
  // 1. Try matching the exact requested locale slug
  for (const node of tree) {
    const nodeSlug = locale === "uz" ? node.group_slug_uz : node.group_slug_ru;
    if (nodeSlug === slug) {
      return node;
    }
    const foundInChild = findCategoryBySlug(node.children, slug, locale);
    if (foundInChild) {
      return foundInChild;
    }
  }

  // 2. Fallback: match across any locale slug (e.g. after language switcher URL transition)
  for (const node of tree) {
    if (node.group_slug_uz === slug || node.group_slug_ru === slug) {
      return node;
    }
    for (const child of node.children) {
      const foundInAny = findCategoryBySlug([child], slug, locale === "uz" ? "ru" : "uz");
      if (foundInAny) {
        return foundInAny;
      }
    }
  }

  return null;
}

/**
 * Returns the breadcrumb path of categories from root to the target category.
 */
export function getCategoryBreadcrumb(
  flatCategories: Category[],
  targetId: string
): Category[] {
  const categoryMap = new Map(flatCategories.map((c) => [c.id, c]));
  const breadcrumb: Category[] = [];

  let current = categoryMap.get(targetId);
  while (current) {
    breadcrumb.unshift(current);
    if (current.parent_id && categoryMap.has(current.parent_id)) {
      current = categoryMap.get(current.parent_id);
    } else {
      break;
    }
  }

  return breadcrumb;
}
