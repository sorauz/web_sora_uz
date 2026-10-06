import { Product, getProductLocalized } from "@/lib/schemas/product";
import { Category } from "@/lib/schemas/category";
import { Brand } from "@/lib/schemas/brand";

/**
 * Cyrillic to Latin conversion table (Uzbek & Russian)
 */
const CYR_TO_LAT_MAP: Record<string, string> = {
  а: "a",
  б: "b",
  в: "v",
  г: "g",
  д: "d",
  е: "e",
  ё: "yo",
  ж: "j",
  з: "z",
  и: "i",
  й: "y",
  к: "k",
  л: "l",
  м: "m",
  н: "n",
  о: "o",
  п: "p",
  р: "r",
  с: "s",
  т: "t",
  у: "u",
  ф: "f",
  х: "x",
  ц: "ts",
  ч: "ch",
  ш: "sh",
  щ: "sh",
  ъ: "'",
  ы: "i",
  ь: "",
  э: "e",
  ю: "yu",
  я: "ya",
  ў: "o'",
  ғ: "g'",
  қ: "q",
  ҳ: "h",
};

/**
 * Latin compound letters to Cyrillic
 */
const LAT_COMPOUNDS: [string, string][] = [
  ["ch", "ч"],
  ["sh", "ш"],
  ["yo", "ё"],
  ["yu", "ю"],
  ["ya", "я"],
  ["ts", "ц"],
  ["o'", "ў"],
  ["o‘", "ў"],
  ["o’", "ў"],
  ["o`", "ў"],
  ["g'", "ғ"],
  ["g‘", "ғ"],
  ["g’", "ғ"],
  ["g`", "ғ"],
];

const LAT_TO_CYR_MAP: Record<string, string> = {
  a: "а",
  b: "б",
  d: "д",
  e: "е",
  f: "ф",
  g: "г",
  h: "ҳ",
  i: "и",
  j: "ж",
  k: "к",
  l: "л",
  m: "м",
  n: "н",
  o: "о",
  p: "п",
  q: "қ",
  r: "р",
  s: "с",
  t: "т",
  u: "у",
  v: "в",
  x: "х",
  y: "й",
  z: "з",
  "'": "ъ",
};

/**
 * Standardize Uzbek apostrophes and whitespace
 */
export function normalizeText(text: string): string {
  if (!text) return "";
  return text
    .toLowerCase()
    .replace(/[ʻʼ‘’`´]/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Transliterates Cyrillic text to Latin
 */
export function cyrillicToLatin(text: string): string {
  const norm = normalizeText(text);
  let res = "";
  for (let i = 0; i < norm.length; i++) {
    const ch = norm[i];
    res += CYR_TO_LAT_MAP[ch] !== undefined ? CYR_TO_LAT_MAP[ch] : ch;
  }
  return res;
}

/**
 * Transliterates Latin text to Cyrillic
 */
export function latinToCyrillic(text: string): string {
  let norm = normalizeText(text);

  // Replace compounds first
  for (const [compound, cyr] of LAT_COMPOUNDS) {
    norm = norm.replaceAll(compound, cyr);
  }

  let res = "";
  for (let i = 0; i < norm.length; i++) {
    const ch = norm[i];
    res += LAT_TO_CYR_MAP[ch] !== undefined ? LAT_TO_CYR_MAP[ch] : ch;
  }
  return res;
}

/**
 * Checks whether text contains Cyrillic characters
 */
export function isCyrillic(text: string): boolean {
  return /[\u0400-\u04FF]/.test(text);
}

/**
 * Generates transliterated and normalized variants for a search token
 */
export function expandTokenVariants(token: string): string[] {
  const norm = normalizeText(token);
  if (!norm) return [];

  const variants = new Set<string>();
  variants.add(norm);

  // Variant without apostrophe (e.g. qog'oz -> qogoz)
  if (norm.includes("'")) {
    variants.add(norm.replace(/'/g, ""));
  }

  if (isCyrillic(norm)) {
    const lat = cyrillicToLatin(norm);
    if (lat) {
      variants.add(lat);
      if (lat.includes("'")) variants.add(lat.replace(/'/g, ""));
    }
  } else {
    const cyr = latinToCyrillic(norm);
    if (cyr) variants.add(cyr);
  }

  return Array.from(variants);
}

/**
 * Computes Levenshtein edit distance between two strings
 */
export function levenshteinDistance(a: string, b: string): number {
  if (a === b) return 0;
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  if (Math.abs(a.length - b.length) > 2) {
    return Math.abs(a.length - b.length);
  }

  const matrix: number[][] = [];

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }

  return matrix[b.length][a.length];
}

/**
 * Checks if a token matches against target words (exact, substring, or fuzzy)
 */
function matchTokenInWords(
  tokenVariants: string[],
  targetWords: string[],
  targetRaw: string
): { matched: boolean; score: number } {
  // 1. Direct substring match with any variant in raw target string
  for (const v of tokenVariants) {
    if (targetRaw.includes(v)) {
      return { matched: true, score: 30 };
    }
  }

  // 2. Word-level check (prefix or fuzzy)
  for (const v of tokenVariants) {
    for (const w of targetWords) {
      if (w === v) {
        return { matched: true, score: 35 };
      }
      if (w.startsWith(v) || v.startsWith(w)) {
        return { matched: true, score: 25 };
      }

      // Fuzzy matching for words with length >= 4
      if (v.length >= 4 && w.length >= 4) {
        const dist = levenshteinDistance(v, w);
        if (dist === 1) {
          return { matched: true, score: 20 };
        }
        if (dist === 2 && v.length >= 7 && w.length >= 7) {
          return { matched: true, score: 15 };
        }
      }
    }
  }

  return { matched: false, score: 0 };
}

/**
 * Breaks a query into tokens and provides expanded variants for each token
 */
export function parseQueryTokens(query: string): string[][] {
  const norm = normalizeText(query);
  if (!norm) return [];

  const rawTokens = norm.split(/\s+/).filter((t) => t.length > 0);
  return rawTokens.map((t) => expandTokenVariants(t));
}

/**
 * Searches and ranks products using Multi-word tokenization,
 * Latin/Cyrillic transliteration, and Fuzzy matching (imlo xatolarini kechirish).
 */
export function searchProducts(
  products: Product[],
  query: string,
  locale: "uz" | "ru" = "uz"
): Product[] {
  const normQuery = normalizeText(query);
  if (!normQuery) return products;

  const tokenGroups = parseQueryTokens(normQuery);
  if (tokenGroups.length === 0) return products;

  const isUz = locale === "uz";
  const scoredProducts: { product: Product; score: number }[] = [];

  for (const product of products) {
    let score = 0;
    let matchedTokenCount = 0;

    const loc = getProductLocalized(product, isUz ? "uz" : "ru");
    const nameUz = normalizeText(product.uz?.name_uz || "");
    const nameRu = normalizeText(product.ru?.name_ru || "");
    const sku = normalizeText(product.product_sku || "");
    const brand = normalizeText(product.brand || "");
    const barcode = normalizeText(product.barcode || "");
    const categoryUz = normalizeText(product.uz?.category_uz || "");
    const categoryRu = normalizeText(product.ru?.category_ru || "");
    const desc = normalizeText(loc.short_description || loc.meta_description || "");

    const allNamesRaw = `${nameUz} ${nameRu} ${sku} ${brand} ${barcode}`;
    const allWords = allNamesRaw.split(/[\s,–—\-\(\)\[\]\.\/]+/).filter(Boolean);

    // Exact SKU or Barcode match (instant top priority)
    for (const variants of tokenGroups) {
      if (variants.some((v) => v === sku || v === barcode)) {
        score += 150;
      }
    }

    // Check each token group against the product
    for (const variants of tokenGroups) {
      const match = matchTokenInWords(variants, allWords, allNamesRaw);
      if (match.matched) {
        matchedTokenCount++;
        score += match.score;
      } else {
        // Fallback: check category or description
        for (const v of variants) {
          if (categoryUz.includes(v) || categoryRu.includes(v)) {
            matchedTokenCount++;
            score += 15;
            break;
          } else if (desc.includes(v)) {
            matchedTokenCount++;
            score += 10;
            break;
          }
        }
      }
    }

    // If query has multiple tokens, reward products that match all or most tokens
    if (tokenGroups.length > 1) {
      if (matchedTokenCount === tokenGroups.length) {
        // All words matched
        score += 80;
      } else if (matchedTokenCount > 0) {
        // Partial token match ratio
        score += (matchedTokenCount / tokenGroups.length) * 30;
      }
    }

    if (matchedTokenCount > 0 && score > 0) {
      scoredProducts.push({ product, score });
    }
  }

  // Sort by score descending (most relevant first)
  scoredProducts.sort((a, b) => b.score - a.score);

  return scoredProducts.map((sp) => sp.product);
}

/**
 * Searches categories using transliteration and tokenization
 */
export function searchCategories(
  categories: Category[],
  query: string,
  locale: "uz" | "ru" = "uz"
): Category[] {
  const normQuery = normalizeText(query);
  if (!normQuery) return [];

  const tokenGroups = parseQueryTokens(normQuery);
  if (tokenGroups.length === 0) return [];

  const isUz = locale === "uz";
  const scored: { category: Category; score: number }[] = [];

  for (const cat of categories) {
    const groupUz = normalizeText(cat.group_uz || "");
    const groupRu = normalizeText(cat.group_ru || "");
    const targetRaw = isUz ? `${groupUz} ${groupRu}` : `${groupRu} ${groupUz}`;
    const targetWords = targetRaw.split(/[\s,–—\-\(\)\[\]\.\/]+/).filter(Boolean);

    let score = 0;
    let matchedCount = 0;

    for (const variants of tokenGroups) {
      const match = matchTokenInWords(variants, targetWords, targetRaw);
      if (match.matched) {
        matchedCount++;
        score += match.score;
      }
    }

    if (matchedCount > 0) {
      if (matchedCount === tokenGroups.length) score += 50;
      scored.push({ category: cat, score });
    }
  }

  scored.sort((a, b) => b.score - a.score);
  return scored.map((s) => s.category);
}

/**
 * Searches brands using transliteration and fuzzy matching
 */
export function searchBrands(brands: Brand[], query: string): Brand[] {
  const normQuery = normalizeText(query);
  if (!normQuery) return [];

  const tokenGroups = parseQueryTokens(normQuery);
  if (tokenGroups.length === 0) return [];

  const scored: { brand: Brand; score: number }[] = [];

  for (const b of brands) {
    const brandName = normalizeText(b.name || "");
    const targetWords = brandName.split(/[\s,–—\-\(\)\[\]\.\/]+/).filter(Boolean);

    let score = 0;
    let matchedCount = 0;

    for (const variants of tokenGroups) {
      const match = matchTokenInWords(variants, targetWords, brandName);
      if (match.matched) {
        matchedCount++;
        score += match.score;
      }
    }

    if (matchedCount > 0) {
      if (matchedCount === tokenGroups.length) score += 50;
      scored.push({ brand: b, score });
    }
  }

  scored.sort((a, b) => b.score - a.score);
  return scored.map((s) => s.brand);
}
