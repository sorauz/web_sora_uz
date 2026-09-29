import "server-only";
import {
  Category,
  CategoriesResponseSchema,
  CategoryTreeNode,
} from "../schemas/category";
import { Unit, UnitsResponseSchema } from "../schemas/unit";
import { BrandsResponse, BrandsResponseSchema } from "../schemas/brand";
import {
  PricesResponseSchema,
  ProductPriceStock,
} from "../schemas/price";
import {
  Product,
  ProductSchema,
  AllProductsResponseSchema,
} from "../schemas/product";
import { buildCategoryTree } from "../utils/category-tree";
import {
  FIXTURE_CATEGORIES,
  FIXTURE_UNITS,
  FIXTURE_BRANDS,
  FIXTURE_PRICES,
  FIXTURE_PRODUCTS,
} from "./fixtures";

interface FetchOptions {
  tags?: string[];
  revalidate?: number;
}

class SoraApiClient {
  private baseUrl: string;
  private authHeader: string;
  private timeoutMs: number;

  constructor() {
    this.baseUrl =
      process.env.SORA_API_BASE_URL || "http://sora.uz:777/SORA/hs/for_msp";
    const username = process.env.SORA_API_USERNAME || "web_user";
    const password = process.env.SORA_API_PASSWORD || "977540910";
    this.authHeader = `Basic ${Buffer.from(`${username}:${password}`).toString(
      "base64"
    )}`;
    this.timeoutMs = Number(process.env.SORA_API_TIMEOUT_MS) || 8000;
  }

  private async request<T>(
    endpoint: string,
    options?: FetchOptions
  ): Promise<{ data: T | null; isFallback: boolean; error?: string }> {
    const url = `${this.baseUrl}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: this.authHeader,
          Accept: "application/json",
          "Content-Type": "application/json; charset=utf-8",
        },
        signal: controller.signal,
        next: {
          tags: options?.tags,
          revalidate: options?.revalidate ?? 3600,
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        return {
          data: null,
          isFallback: true,
          error: `HTTP ${response.status} ${response.statusText}`,
        };
      }

      const json = await response.json();
      return { data: json as T, isFallback: false };
    } catch (err: unknown) {
      clearTimeout(timeoutId);
      const message = err instanceof Error ? err.message : String(err);
      return {
        data: null,
        isFallback: true,
        error: message,
      };
    }
  }

  /**
   * Fetches all categories, validates schema, and builds recursive tree.
   */
  async getCategories(options?: FetchOptions): Promise<{
    categories: Category[];
    tree: CategoryTreeNode[];
    isFallback: boolean;
  }> {
    const res = await this.request<{ categories?: Category[] }>(
      "/categories",
      options
    );

    let list: Category[] = FIXTURE_CATEGORIES;
    let isFallback = true;

    if (!res.isFallback && res.data) {
      const parsed = CategoriesResponseSchema.safeParse(res.data);
      if (parsed.success && parsed.data.categories.length > 0) {
        list = parsed.data.categories;
        isFallback = false;
      }
    }

    return {
      categories: list,
      tree: buildCategoryTree(list),
      isFallback,
    };
  }

  /**
   * Fetches measurement units (dona, kg, o'ram, etc.).
   */
  async getUnits(
    options?: FetchOptions
  ): Promise<{ units: Unit[]; isFallback: boolean }> {
    const res = await this.request<{ units?: Unit[] }>("/units", options);
    if (!res.isFallback && res.data) {
      const parsed = UnitsResponseSchema.safeParse(res.data);
      if (parsed.success && parsed.data.units.length > 0) {
        return { units: parsed.data.units, isFallback: false };
      }
    }
    return { units: FIXTURE_UNITS, isFallback: true };
  }

  /**
   * Fetches brands, manufacturers, and countries.
   */
  async getBrands(
    options?: FetchOptions
  ): Promise<{ data: BrandsResponse; isFallback: boolean }> {
    const res = await this.request<BrandsResponse>("/brands", options);
    if (!res.isFallback && res.data) {
      const parsed = BrandsResponseSchema.safeParse(res.data);
      if (parsed.success) {
        return { data: parsed.data, isFallback: false };
      }
    }
    return { data: FIXTURE_BRANDS, isFallback: true };
  }

  /**
   * Fetches latest prices and stock availability.
   */
  async getPrices(
    options?: FetchOptions
  ): Promise<{
    priceMap: Record<string, ProductPriceStock>;
    isFallback: boolean;
  }> {
    const res = await this.request<{ products?: ProductPriceStock[] }>(
      "/price",
      options
    );
    if (!res.isFallback && res.data) {
      const parsed = PricesResponseSchema.safeParse(res.data);
      if (parsed.success && parsed.data.products.length > 0) {
        const map: Record<string, ProductPriceStock> = {};
        for (const item of parsed.data.products) {
          map[item.id] = item;
        }
        return { priceMap: map, isFallback: false };
      }
    }
    return { priceMap: FIXTURE_PRICES, isFallback: true };
  }

  /**
   * Fetches all products.
   */
  async getAllProducts(
    options?: FetchOptions
  ): Promise<{ products: Product[]; isFallback: boolean }> {
    const res = await this.request<unknown[]>("/all_product", options);
    if (!res.isFallback && res.data) {
      const parsed = AllProductsResponseSchema.safeParse(res.data);
      if (parsed.success && parsed.data.length > 0) {
        return { products: parsed.data, isFallback: false };
      }
    }
    return { products: FIXTURE_PRODUCTS, isFallback: true };
  }

  /**
   * Fetches single detailed product by UUID with price and stock attached.
   */
  async getProductById(
    id: string,
    options?: FetchOptions
  ): Promise<{ product: Product | null; isFallback: boolean }> {
    const res = await this.request<unknown>(`/product?id=${id}`, options);
    if (!res.isFallback && res.data) {
      const parsed = ProductSchema.safeParse(res.data);
      if (parsed.success) {
        const product = parsed.data;
        // Optionally attach latest price
        const prices = await this.getPrices();
        if (prices.priceMap[product.id]) {
          product.price = prices.priceMap[product.id];
        }
        return { product, isFallback: false };
      }
    }

    const found = FIXTURE_PRODUCTS.find((p) => p.id === id);
    if (found) {
      const copy = { ...found };
      if (FIXTURE_PRICES[copy.id]) {
        copy.price = FIXTURE_PRICES[copy.id];
      }
      return { product: copy, isFallback: true };
    }

    return { product: null, isFallback: true };
  }

  /**
   * Helper to find a product by localized slug.
   */
  async getProductBySlug(
    slug: string,
    locale: "uz" | "ru" = "uz"
  ): Promise<{ product: Product | null; isFallback: boolean }> {
    const all = await this.getAllProducts();
    const found = all.products.find((p) =>
      locale === "uz" ? p.uz.slug_uz === slug : p.ru.slug_ru === slug
    );
    if (found) {
      const prices = await this.getPrices();
      if (prices.priceMap[found.id]) {
        found.price = prices.priceMap[found.id];
      }
      return { product: found, isFallback: all.isFallback };
    }
    return { product: null, isFallback: all.isFallback };
  }
}

export const api = new SoraApiClient();
