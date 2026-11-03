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
 * Known legacy slugs, transliteration aliases, and fixture mappings to 1C canonical slugs.
 * Ensures backward compatibility, external backlink stability, and SEO preservation.
 */
export const CATEGORY_SLUG_ALIASES: Record<string, string> = {
  // Paper products: transliteration variation & legacy slugs
  "bumazhnaya-produkciya": "bumazhnaya-produktsiya",
  "bumaga-i-bloknoty": "bumazhnaya-produktsiya",

  // Office supplies legacy slugs
  "ofis-jihozlari-va-kanselyariya": "ofis-buyumlari",
  "ofisnaya-tekhnika-i-kancelyariya": "ofisnye-prinadlezhnosti",

  // Binding machines legacy slug
  "boglash-mashinalari": "perepletnye-mashiny",

  // Computer accessories transliteration variation
  "kompyuternye-aksessuary": "aksessuary-dlya-kompyuterov",

  // Smartphone accessories variation
  "aksessuary-dlya-telefonov": "aksessuary-dlya-smartfonov",

  // Household goods transliteration variations
  "xojalik-buyumlari": "xo-jalik-buyumlari",
  "hozyajstvennye-tovary": "xoz-tovary",
  "hoz-tovary": "xoz-tovary",
};

/**
 * Searches the category tree for a node matching a given slug in either uz or ru.
 * Includes support for slug aliases and transliteration fallbacks.
 */
export function findCategoryBySlug(
  tree: CategoryTreeNode[],
  slug: string,
  locale: "uz" | "ru" = "uz"
): CategoryTreeNode | null {
  const normalizedSlug = CATEGORY_SLUG_ALIASES[slug] || slug;

  function search(nodes: CategoryTreeNode[], targetSlug: string, loc: "uz" | "ru"): CategoryTreeNode | null {
    for (const node of nodes) {
      const nodeSlug = loc === "uz" ? node.group_slug_uz : node.group_slug_ru;
      if (nodeSlug === targetSlug) {
        return node;
      }
      const foundInChild = search(node.children, targetSlug, loc);
      if (foundInChild) {
        return foundInChild;
      }
    }
    return null;
  }

  function searchAny(nodes: CategoryTreeNode[], targetSlug: string): CategoryTreeNode | null {
    for (const node of nodes) {
      if (node.group_slug_uz === targetSlug || node.group_slug_ru === targetSlug) {
        return node;
      }
      const foundInChild = searchAny(node.children, targetSlug);
      if (foundInChild) {
        return foundInChild;
      }
    }
    return null;
  }

  // 1. Try matching normalized slug in requested locale
  const exactNormalized = search(tree, normalizedSlug, locale);
  if (exactNormalized) return exactNormalized;

  // 1b. If slug was aliased, try raw slug in requested locale
  if (normalizedSlug !== slug) {
    const exactRaw = search(tree, slug, locale);
    if (exactRaw) return exactRaw;
  }

  // 2. Fallback: match across any locale slug (e.g. after language switcher URL transition)
  const anyNormalized = searchAny(tree, normalizedSlug);
  if (anyNormalized) return anyNormalized;

  if (normalizedSlug !== slug) {
    const anyRaw = searchAny(tree, slug);
    if (anyRaw) return anyRaw;
  }

  // 3. Fallback: automatic transliteration variant (c <-> ts)
  if (slug.includes("c") || slug.includes("ts")) {
    const tsVariant = slug.includes("ts")
      ? slug.replace(/ts/g, "c")
      : slug.replace(/c/g, "ts");
    const translitMatch = searchAny(tree, tsVariant);
    if (translitMatch) return translitMatch;
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

/**
 * Recursively collects all category slugs (both UZ and RU) for a given category node and all of its descendants.
 * This guarantees that multi-level hierarchies in 1C ERP (parent_id depth >= 2) correctly include all products
 * assigned to leaf and intermediate subcategories.
 */
export function getAllCategorySlugs(node: CategoryTreeNode): Set<string> {
  const slugs = new Set<string>();

  function collect(curr: CategoryTreeNode) {
    if (curr.group_slug_uz) slugs.add(curr.group_slug_uz);
    if (curr.group_slug_ru) slugs.add(curr.group_slug_ru);
    if (curr.children && curr.children.length > 0) {
      for (const child of curr.children) {
        collect(child);
      }
    }
  }

  collect(node);
  return slugs;
}

/**
 * Recursively collects all category IDs for a given category node and all of its descendants.
 */
export function getAllCategoryDescendantIds(node: CategoryTreeNode): string[] {
  const ids: string[] = [];

  function collect(curr: CategoryTreeNode) {
    ids.push(curr.id);
    if (curr.children && curr.children.length > 0) {
      for (const child of curr.children) {
        collect(child);
      }
    }
  }

  collect(node);
  return ids;
}
