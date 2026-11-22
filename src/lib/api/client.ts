import "server-only";
import { cache } from "react";
import http from "node:http";
import https from "node:https";
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
  ProductAttribute,
  ProductSchema,
  AllProductsResponseSchema,
  SubProductCard,
} from "../schemas/product";
import { OfferItem, OfferListResponseSchema } from "../schemas/offer";
import {
  Review,
  ReviewListResponseSchema,
  ReviewStats,
} from "../schemas/review";
import { FaqItem, FaqResponse, FaqResponseSchema } from "../schemas/faq";
import {
  OneCUserResponse,
  OneCUserResponseSchema,
} from "../schemas/auth";
import {
  OneCOrderActionRequest,
  OneCOrderActionResponse,
  OneCOrderActionResponseSchema,
  OneCOrderDetailResponse,
  OneCOrderDetailResponseSchema,
  OneCOrderHistoryResponse,
  OneCOrderHistoryResponseSchema,
  OneCOrderRequest,
  OneCOrderResponse,
  OneCOrderResponseSchema,
} from "../schemas/order";
import { buildCategoryTree } from "../utils/category-tree";
import { isOfferActive, offerItemToProduct } from "../utils/offer";
import { calculateReviewStats } from "../utils/review";
import {
  FIXTURE_CATEGORIES,
  FIXTURE_UNITS,
  FIXTURE_BRANDS,
  FIXTURE_PRICES,
  FIXTURE_PRODUCTS,
  FIXTURE_LOW_PRICE_GUARANTEE,
  FIXTURE_NEW_PRODUCTS,
  FIXTURE_POPULAR,
  FIXTURE_PROMOTIONS,
  FIXTURE_FAQS,
} from "./fixtures";

export interface FetchOptions {
  tags?: string[];
  revalidate?: number;
  noCache?: boolean;
}

export interface ProductSeoDetails {
  title_uz: string;
  meta_description_uz: string;
  short_description_uz: string;
  product_description_uz: string;
  title_ru: string;
  meta_description_ru: string;
  short_description_ru: string;
  product_description_ru: string;
  attributes: ProductAttribute[];
}

class SoraApiClient {
  private baseUrl: string;
  private authHeader: string;
  private timeoutMs: number;
  private inFlightRelationsPromise: Promise<{
    relationsMap: Record<
      string,
      {
        related_products: SubProductCard[];
        recommended_products: SubProductCard[];
      }
    >;
    isFallback: boolean;
  }> | null = null;
  private inFlightSeoDetailsPromise: Promise<{
    seoMap: Record<string, ProductSeoDetails>;
    isFallback: boolean;
  }> | null = null;

  constructor() {
    this.baseUrl =
      process.env.SORA_API_BASE_URL || "http://1cloud.uz:777/SORA/hs/for_msp";
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
      const fetchInit: RequestInit & {
        next?: { tags?: string[]; revalidate?: number };
      } = {
        method: "GET",
        headers: {
          Authorization: this.authHeader,
          Accept: "application/json",
          "Content-Type": "application/json; charset=utf-8",
        },
        signal: controller.signal,
      };

      if (options?.noCache) {
        fetchInit.cache = "no-store";
      } else {
        fetchInit.next = {
          tags: options?.tags,
          revalidate: options?.revalidate ?? 86400, // 24 hours default ISR cache
        };
      }

      const response = await fetch(url, fetchInit);

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
    if (!hasCustomFetchOptions(options)) {
      return cachedGetCategories(this);
    }
    return this.fetchCategoriesImpl(options);
  }

  /** @internal */
  async fetchCategoriesImpl(options?: FetchOptions): Promise<{
    categories: Category[];
    tree: CategoryTreeNode[];
    isFallback: boolean;
  }> {
    const res = await this.request<{ categories?: Category[] }>(
      "/categories",
      {
        tags: options?.tags ?? ["categories"],
        revalidate: options?.revalidate,
      }
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
    const res = await this.request<{ units?: Unit[] }>("/units", {
      tags: options?.tags ?? ["units"],
      revalidate: options?.revalidate,
    });
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
    if (!hasCustomFetchOptions(options)) {
      return cachedGetBrands(this);
    }
    return this.fetchBrandsImpl(options);
  }

  /** @internal */
  async fetchBrandsImpl(
    options?: FetchOptions
  ): Promise<{ data: BrandsResponse; isFallback: boolean }> {
    const res = await this.request<BrandsResponse>("/brands", {
      tags: options?.tags ?? ["brands"],
      revalidate: options?.revalidate,
    });
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
    if (!hasCustomFetchOptions(options)) {
      return cachedGetPrices(this);
    }
    return this.fetchPricesImpl(options);
  }

  /** @internal */
  async fetchPricesImpl(
    options?: FetchOptions
  ): Promise<{
    priceMap: Record<string, ProductPriceStock>;
    isFallback: boolean;
  }> {
    const res = await this.request<{ products?: ProductPriceStock[] }>(
      "/price",
      {
        tags: options?.noCache ? undefined : (options?.tags ?? ["prices"]),
        revalidate: options?.revalidate,
        noCache: options?.noCache,
      }
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
    if (!hasCustomFetchOptions(options)) {
      return cachedGetAllProducts(this);
    }
    return this.fetchAllProductsImpl(options);
  }

  /** @internal */
  async fetchAllProductsImpl(
    options?: FetchOptions
  ): Promise<{ products: Product[]; isFallback: boolean }> {
    const res = await this.request<unknown[]>("/all_product", {
      tags: options?.noCache
        ? undefined
        : (options?.tags ?? ["products", "all-products"]),
      revalidate: options?.revalidate,
      noCache: options?.noCache,
    });
    let list: Product[] = FIXTURE_PRODUCTS;
    let isFallback = true;

    if (!res.isFallback && res.data) {
      const parsed = AllProductsResponseSchema.safeParse(res.data);
      if (parsed.success && parsed.data.length > 0) {
        list = parsed.data;
        isFallback = false;
      }
    }

    // Filter out invalid or draft items that lack names and slugs
    const validProducts = list.filter(
      (p) =>
        (Boolean(p.uz?.name_uz?.trim()) || Boolean(p.ru?.name_ru?.trim())) &&
        (Boolean(p.uz?.slug_uz?.trim()) || Boolean(p.ru?.slug_ru?.trim()))
    );

    // Fetch live prices and attach to each product
    const prices = await this.getPrices(options);
    const enriched = validProducts.map((p) => {
      const copy = { ...p };
      if (prices.priceMap[p.id]) {
        copy.price = prices.priceMap[p.id];
      }
      return copy;
    });

    return { products: enriched, isFallback };
  }

  /**
   * Fetches single detailed product by UUID with price and stock attached.
   */
  async getProductById(
    id: string,
    options?: FetchOptions
  ): Promise<{ product: Product | null; isFallback: boolean }> {
    if (!hasCustomFetchOptions(options)) {
      return cachedGetProductById(this, id);
    }
    return this.fetchProductByIdImpl(id, options);
  }

  /** @internal */
  async fetchProductByIdImpl(
    id: string,
    options?: FetchOptions
  ): Promise<{ product: Product | null; isFallback: boolean }> {
    const res = await this.request<unknown>(`/product?id=${id}`, {
      tags: options?.noCache ? undefined : (options?.tags ?? ["products", `product-${id}`]),
      revalidate: options?.revalidate,
      noCache: options?.noCache,
    });
    if (!res.isFallback && res.data) {
      const parsed = ProductSchema.safeParse(res.data);
      if (parsed.success) {
        const product = parsed.data;
        // Attach latest price
        const prices = await this.getPrices(options);
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
   * Fetches compact related_products and recommended_products for a list of product IDs
   * in parallel using a native Node HTTP Keep-Alive Agent (~3.2s for all 1,532 products).
   * Bypasses Next.js patched globalThis.fetch overhead and deduplicates concurrent in-flight scans.
   */
  async fetchAllProductRelations(
    productIds: string[],
    options?: { concurrency?: number }
  ): Promise<{
    relationsMap: Record<
      string,
      {
        related_products: SubProductCard[];
        recommended_products: SubProductCard[];
      }
    >;
    isFallback: boolean;
  }> {
    if (this.inFlightRelationsPromise) {
      return this.inFlightRelationsPromise;
    }

    this.inFlightRelationsPromise = this.fetchAllProductDetailsBatch(
      productIds,
      options?.concurrency ?? 48,
      (raw) => {
        const rels = Array.isArray(raw.related_products)
          ? (raw.related_products as SubProductCard[])
          : [];
        const recs = Array.isArray(raw.recommended_products)
          ? (raw.recommended_products as SubProductCard[])
          : [];
        return {
          related_products: rels.map((r) => ({
            id: r.id,
            related_products_id: r.related_products_id,
            slug_uz: r.slug_uz,
            slug_ru: r.slug_ru,
          })),
          recommended_products: recs.map((rec) => ({
            id: rec.id,
            recommended_products_id: rec.recommended_products_id,
            slug_uz: rec.slug_uz,
            slug_ru: rec.slug_ru,
          })),
        };
      }
    )
      .then(({ map, isFallback }) => ({ relationsMap: map, isFallback }))
      .finally(() => {
        this.inFlightRelationsPromise = null;
      });

    return this.inFlightRelationsPromise;
  }

  /**
   * Fetches real SEO descriptions and attributes from `/product?id={ID}` across all products
   * in parallel using the shared HTTP Keep-Alive batch scanner (~3.5-4.7s).
   */
  async fetchAllProductSeoDetails(
    productIds: string[],
    options?: { concurrency?: number }
  ): Promise<{
    seoMap: Record<string, ProductSeoDetails>;
    isFallback: boolean;
  }> {
    if (this.inFlightSeoDetailsPromise) {
      return this.inFlightSeoDetailsPromise;
    }

    this.inFlightSeoDetailsPromise = this.fetchAllProductDetailsBatch(
      productIds,
      options?.concurrency ?? 48,
      (raw) => {
        const uz = (raw.uz && typeof raw.uz === "object"
          ? raw.uz
          : {}) as Record<string, unknown>;
        const ru = (raw.ru && typeof raw.ru === "object"
          ? raw.ru
          : {}) as Record<string, unknown>;
        const attrs = Array.isArray(raw.attributes)
          ? (raw.attributes as ProductAttribute[])
          : [];
        return {
          title_uz: typeof uz.title_uz === "string" ? uz.title_uz : "",
          meta_description_uz:
            typeof uz.meta_description_uz === "string"
              ? uz.meta_description_uz
              : "",
          short_description_uz:
            typeof uz.short_description_uz === "string"
              ? uz.short_description_uz
              : "",
          product_description_uz:
            typeof uz.product_description_uz === "string"
              ? uz.product_description_uz
              : "",
          title_ru: typeof ru.title_ru === "string" ? ru.title_ru : "",
          meta_description_ru:
            typeof ru.meta_description_ru === "string"
              ? ru.meta_description_ru
              : "",
          short_description_ru:
            typeof ru.short_description_ru === "string"
              ? ru.short_description_ru
              : "",
          product_description_ru:
            typeof ru.product_description_ru === "string"
              ? ru.product_description_ru
              : "",
          attributes: attrs,
        };
      }
    )
      .then(({ map, isFallback }) => ({ seoMap: map, isFallback }))
      .finally(() => {
        this.inFlightSeoDetailsPromise = null;
      });

    return this.inFlightSeoDetailsPromise;
  }

  /**
   * Fetches all live products enriched with real prices and deep `/product?id={ID}` SEO/attribute details.
   * Intended strictly for the private internal-audit dashboard & CSV export.
   */
  async getAllProductsWithAuditDetails(
    options?: FetchOptions
  ): Promise<{
    products: Product[];
    isFallback: boolean;
    checkedSeoIds: Set<string>;
  }> {
    const baseRes = await this.getAllProducts(options);
    if (baseRes.isFallback || baseRes.products.length === 0) {
      return {
        products: baseRes.products,
        isFallback: baseRes.isFallback,
        checkedSeoIds: new Set<string>(),
      };
    }

    const seoRes = await this.fetchAllProductSeoDetails(
      baseRes.products.map((p) => p.id),
      { concurrency: 48 }
    );

    if (seoRes.isFallback) {
      return {
        products: baseRes.products,
        isFallback: false,
        checkedSeoIds: new Set<string>(),
      };
    }

    const checkedSeoIds = new Set<string>();
    const enrichedProducts = baseRes.products.map((p) => {
      const seo = seoRes.seoMap[p.id];
      if (!seo) return p;
      checkedSeoIds.add(p.id);
      return {
        ...p,
        uz: {
          ...p.uz,
          title_uz: seo.title_uz || p.uz.title_uz,
          meta_description_uz: seo.meta_description_uz || p.uz.meta_description_uz,
          short_description_uz:
            seo.short_description_uz || p.uz.short_description_uz,
          product_description_uz:
            seo.product_description_uz || p.uz.product_description_uz,
        },
        ru: {
          ...p.ru,
          title_ru: seo.title_ru || p.ru.title_ru,
          meta_description_ru: seo.meta_description_ru || p.ru.meta_description_ru,
          short_description_ru:
            seo.short_description_ru || p.ru.short_description_ru,
          product_description_ru:
            seo.product_description_ru || p.ru.product_description_ru,
        },
        attributes: seo.attributes,
      };
    });

    return {
      products: enrichedProducts,
      isFallback: false,
      checkedSeoIds,
    };
  }

  private async fetchAllProductDetailsBatch<T>(
    productIds: string[],
    maxSockets: number,
    mapper: (raw: Record<string, unknown>) => T
  ): Promise<{ map: Record<string, T>; isFallback: boolean }> {
    const parsedBase = new URL(this.baseUrl);
    const isHttps = parsedBase.protocol === "https:";
    const transport = isHttps ? https : http;
    const agent = isHttps
      ? new https.Agent({ keepAlive: true, maxSockets })
      : new http.Agent({ keepAlive: true, maxSockets });

    const basePath = parsedBase.pathname.endsWith("/")
      ? parsedBase.pathname.slice(0, -1)
      : parsedBase.pathname;

    const fetchSingle = (id: string): Promise<{ id: string; value: T } | null> =>
      new Promise((resolve) => {
        const req = transport.get(
          {
            hostname: parsedBase.hostname,
            port: parsedBase.port || (isHttps ? 443 : 80),
            path: `${basePath}/product?id=${encodeURIComponent(id)}`,
            headers: {
              Authorization: this.authHeader,
              Accept: "application/json",
            },
            agent,
            timeout: this.timeoutMs,
          },
          (res) => {
            if (res.statusCode !== 200) {
              res.resume();
              return resolve(null);
            }
            const chunks: Buffer[] = [];
            res.on("data", (chunk: Buffer) => chunks.push(chunk));
            res.on("end", () => {
              try {
                const raw = JSON.parse(
                  Buffer.concat(chunks).toString("utf8")
                ) as Record<string, unknown>;
                resolve({ id, value: mapper(raw) });
              } catch {
                resolve(null);
              }
            });
          }
        );

        req.on("error", () => resolve(null));
        req.on("timeout", () => {
          req.destroy();
          resolve(null);
        });
      });

    try {
      const results: Array<{ id: string; value: T } | null> = new Array(
        productIds.length
      ).fill(null);
      let nextIndex = 0;
      const workerCount = Math.max(1, Math.min(maxSockets, productIds.length));

      await Promise.all(
        Array.from({ length: workerCount }, async () => {
          while (nextIndex < productIds.length) {
            const idx = nextIndex++;
            results[idx] = await fetchSingle(productIds[idx]);
          }
        })
      );

      const map: Record<string, T> = {};
      let successCount = 0;

      for (const item of results) {
        if (item) {
          successCount++;
          map[item.id] = item.value;
        }
      }

      return {
        map,
        isFallback: productIds.length > 0 && successCount === 0,
      };
    } finally {
      agent.destroy();
    }
  }

  /**
   * Helper to find a product by localized slug.
   * If not found under current locale, gracefully searches across other language slugs.
   */
  async getProductBySlug(
    slug: string,
    locale: "uz" | "ru" = "uz"
  ): Promise<{ product: Product | null; isFallback: boolean }> {
    return cachedGetProductBySlug(this, slug, locale);
  }

  /** @internal */
  async fetchProductBySlugImpl(
    slug: string,
    locale: "uz" | "ru" = "uz"
  ): Promise<{ product: Product | null; isFallback: boolean }> {
    const all = await this.getAllProducts();

    // 1. Try matching slug in requested locale
    let found = all.products.find((p) =>
      locale === "uz" ? p.uz.slug_uz === slug : p.ru.slug_ru === slug
    );

    // 2. If not found, match across any locale slug
    if (!found) {
      found = all.products.find(
        (p) => p.uz.slug_uz === slug || p.ru.slug_ru === slug
      );
    }

    if (found) {
      // Always enrich with full single-product details from 1C ERP (/product?id={id})
      // to ensure comprehensive descriptions, live attributes, multi-photo gallery, and latest stock/prices
      const detailed = await this.getProductById(found.id);
      if (detailed.product) {
        return { product: detailed.product, isFallback: detailed.isFallback };
      }
      return { product: found, isFallback: all.isFallback };
    }

    return { product: null, isFallback: all.isFallback };
  }

  /**
   * Fetches "Low price guarantee" products from 1C ERP.
   */
  async getLowPriceGuarantee(
    options?: FetchOptions
  ): Promise<{ items: OfferItem[]; isFallback: boolean }> {
    const res = await this.request<OfferItem[]>("/low_price_guarantee", {
      tags: options?.tags ?? ["offers", "low_price_guarantee"],
      revalidate: options?.revalidate ?? 86400,
    });
    if (!res.isFallback && res.data) {
      const parsed = OfferListResponseSchema.safeParse(res.data);
      if (parsed.success && parsed.data.length > 0) {
        return { items: parsed.data, isFallback: false };
      }
    }
    return { items: FIXTURE_LOW_PRICE_GUARANTEE, isFallback: true };
  }

  /**
   * Fetches "New products" from 1C ERP.
   */
  async getNewProducts(
    options?: FetchOptions
  ): Promise<{ items: OfferItem[]; isFallback: boolean }> {
    const res = await this.request<OfferItem[]>("/new_products", {
      tags: options?.tags ?? ["offers", "new_products"],
      revalidate: options?.revalidate ?? 86400,
    });
    if (!res.isFallback && res.data) {
      const parsed = OfferListResponseSchema.safeParse(res.data);
      if (parsed.success && parsed.data.length > 0) {
        return { items: parsed.data, isFallback: false };
      }
    }
    return { items: FIXTURE_NEW_PRODUCTS, isFallback: true };
  }

  /**
   * Fetches "Popular" products (hit sales) from 1C ERP.
   */
  async getPopular(
    options?: FetchOptions
  ): Promise<{ items: OfferItem[]; isFallback: boolean }> {
    const res = await this.request<OfferItem[]>("/popular", {
      tags: options?.tags ?? ["offers", "popular"],
      revalidate: options?.revalidate ?? 86400,
    });
    if (!res.isFallback && res.data) {
      const parsed = OfferListResponseSchema.safeParse(res.data);
      if (parsed.success && parsed.data.length > 0) {
        return { items: parsed.data, isFallback: false };
      }
    }
    return { items: FIXTURE_POPULAR, isFallback: true };
  }

  /**
   * Fetches "Promotions" (deals / discounts) from 1C ERP.
   */
  async getPromotions(
    options?: FetchOptions
  ): Promise<{ items: OfferItem[]; isFallback: boolean }> {
    const res = await this.request<OfferItem[]>("/promotions", {
      tags: options?.tags ?? ["offers", "promotions"],
      revalidate: options?.revalidate ?? 86400,
    });
    if (!res.isFallback && res.data) {
      const parsed = OfferListResponseSchema.safeParse(res.data);
      if (parsed.success && parsed.data.length > 0) {
        return { items: parsed.data, isFallback: false };
      }
    }
    return { items: FIXTURE_PROMOTIONS, isFallback: true };
  }

  /**
   * Aggregator: Fetches all 4 special offers in parallel, enriches each item
   * with live prices from /price, links full Product details, and verifies active time ranges.
   */
  async getSpecialOffers(options?: FetchOptions): Promise<{
    lowPrice: Product[];
    newProducts: Product[];
    popular: Product[];
    promotions: Product[];
    rawOffers: {
      lowPrice: OfferItem[];
      newProducts: OfferItem[];
      popular: OfferItem[];
      promotions: OfferItem[];
    };
    isFallback: boolean;
  }> {
    const [lowRes, newRes, popRes, promoRes, pricesRes, allProdsRes] =
      await Promise.all([
        this.getLowPriceGuarantee(options),
        this.getNewProducts(options),
        this.getPopular(options),
        this.getPromotions(options),
        this.getPrices(options),
        this.getAllProducts(options),
      ]);

    const isFallback =
      lowRes.isFallback ||
      newRes.isFallback ||
      popRes.isFallback ||
      promoRes.isFallback;

    // Fast product lookup map
    const productMap = new Map<string, Product>();
    for (const p of allProdsRes.products) {
      productMap.set(p.id, p);
    }

    const enrichItems = (items: OfferItem[]): Product[] => {
      return items
        .filter((item) => isOfferActive(item))
        .map((item) => {
          const existing = productMap.get(item.id);
          const price = pricesRes.priceMap[item.id] || existing?.price;
          if (existing) {
            return {
              ...existing,
              price: price || existing.price,
            };
          }
          return offerItemToProduct(item, price);
        });
    };

    return {
      lowPrice: enrichItems(lowRes.items),
      newProducts: enrichItems(newRes.items),
      popular: enrichItems(popRes.items),
      promotions: enrichItems(promoRes.items),
      rawOffers: {
        lowPrice: lowRes.items,
        newProducts: newRes.items,
        popular: popRes.items,
        promotions: promoRes.items,
      },
      isFallback,
    };
  }

  /**
   * Fetches product reviews by GUID from 1C ERP.
   */
  async getReviewsByProductId(
    productId: string,
    options?: FetchOptions
  ): Promise<{ reviews: Review[]; stats: ReviewStats; isFallback: boolean }> {
    // Validate GUID format to avoid sending malformed IDs (which trigger 400 Bad Request)
    const guidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!productId || !guidRegex.test(productId)) {
      return {
        reviews: [],
        stats: calculateReviewStats([]),
        isFallback: false,
      };
    }

    const res = await this.request<unknown[]>(`/review?productId=${productId}`, {
      tags: options?.tags ?? [
        "reviews",
        `reviews-${productId}`,
        `product-${productId}`,
      ],
      revalidate: options?.revalidate ?? 86400,
    });

    if (!res.isFallback && res.data && Array.isArray(res.data)) {
      const parsed = ReviewListResponseSchema.safeParse(res.data);
      if (parsed.success) {
        const approved = parsed.data.filter(
          (r) => r.permission_to_publish !== false
        );
        return {
          reviews: approved,
          stats: calculateReviewStats(approved),
          isFallback: false,
        };
      }
    }

    return {
      reviews: [],
      stats: calculateReviewStats([]),
      isFallback: res.isFallback,
    };
  }

  /**
   * Fetches all FAQ items and targeting rules from 1C ERP (/faq).
   * Cached with 24-hour ISR and "faq" revalidation tag.
   */
  async getFaqs(options?: FetchOptions): Promise<{
    faqs: FaqItem[];
    updatedAt: string;
    isFallback: boolean;
  }> {
    if (!hasCustomFetchOptions(options)) {
      return cachedGetFaqs(this);
    }
    return this.fetchFaqsImpl(options);
  }

  /** @internal */
  async fetchFaqsImpl(options?: FetchOptions): Promise<{
    faqs: FaqItem[];
    updatedAt: string;
    isFallback: boolean;
  }> {
    const res = await this.request<FaqResponse>("/faq", {
      tags: options?.noCache ? undefined : (options?.tags ?? ["faq"]),
      revalidate: options?.revalidate ?? 86400,
      noCache: options?.noCache,
    });

    if (!res.isFallback && res.data) {
      const parsed = FaqResponseSchema.safeParse(res.data);
      if (parsed.success) {
        return {
          faqs: parsed.data.faqs,
          updatedAt: parsed.data.updated_at,
          isFallback: false,
        };
      }
    }

    return {
      faqs: FIXTURE_FAQS,
      updatedAt: "",
      isFallback: true,
    };
  }

  /**
   * Safely parses 1C `/register` JSON responses, including B2B company names
   * that may contain unescaped inner double quotes (e.g. `"name": ""NAVRUZ" MCHJ"`).
   */
  private parseRegisterJson(text: string): Record<string, unknown> {
    try {
      return JSON.parse(text);
    } catch {
      const idMatch = text.match(/"id"\s*:\s*"([^"]+)"/);
      const typeMatch = text.match(/"type"\s*:\s*"(B2C|B2B)"/);
      const errorMatch = text.match(/"error"\s*:\s*"([^"]+)"/);
      const msgMatch = text.match(/"message"\s*:\s*"([^"]+)"/);
      const nameMatch = text.match(
        /"name"\s*:\s*"([\s\S]*?)"\s*(?:,\s*"(?:type|id|error|message)"|\s*\})/
      );
      if (idMatch || errorMatch || msgMatch || nameMatch) {
        return {
          ...(idMatch ? { id: idMatch[1] } : {}),
          ...(nameMatch ? { name: nameMatch[1].trim() } : {}),
          ...(typeMatch ? { type: typeMatch[1] } : {}),
          ...(errorMatch ? { error: errorMatch[1] } : {}),
          ...(msgMatch ? { message: msgMatch[1] } : {}),
        };
      }
      return { error: text };
    }
  }

  /**
   * Authorize existing customer in 1C ERP via GET /register
   * - B2C: type=B2C&phone=+998...&password=...
   * - B2B: type=B2B&inn=...&password=...
   */
  async loginUser(params: {
    type: "B2C" | "B2B";
    identifier: string;
    password?: string;
  }): Promise<{
    success: boolean;
    user?: OneCUserResponse;
    error?: string;
    statusCode: number;
  }> {
    const isB2C = params.type === "B2C";
    const queryParam = isB2C
      ? `phone=${encodeURIComponent(params.identifier)}`
      : `inn=${encodeURIComponent(params.identifier)}`;
    const pwdParam = params.password
      ? `&password=${encodeURIComponent(params.password)}`
      : "";
    const url = `${this.baseUrl}/register?type=${params.type}&${queryParam}${pwdParam}`;

    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: this.authHeader,
          Accept: "application/json",
          "Content-Type": "application/json; charset=utf-8",
        },
        cache: "no-store",
      });

      const text = await response.text();
      const data = this.parseRegisterJson(text);

      if (response.ok) {
        const parsed = OneCUserResponseSchema.safeParse(data);
        if (parsed.success) {
          return {
            success: true,
            user: parsed.data,
            statusCode: 200,
          };
        }
        return {
          success: true,
          user: {
            id: String(data.id || ""),
            name: String(data.name || ""),
            type: params.type,
          },
          statusCode: 200,
        };
      }

      const errorMessage =
        (typeof data.error === "string" && data.error) ||
        (response.status === 401
          ? "Noto'g'ri parol!"
          : response.status === 404
          ? "Foydalanuvchi topilmadi!"
          : "Avtorizatsiyada xatolik yuz berdi");

      return {
        success: false,
        error: errorMessage,
        statusCode: response.status,
      };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : "Tarmoq xatosi",
        statusCode: 500,
      };
    }
  }

  /**
   * Register new customer in 1C ERP via POST /register
   * - B2C: { type: "B2C", name, phone1, phone2, password }
   * - B2B: { type: "B2B", name, inn, phone1, password }
   */
  async registerUser(payload: {
    type: "B2C" | "B2B";
    name: string;
    phone1?: string;
    phone2?: string;
    inn?: string;
    password?: string;
  }): Promise<{
    success: boolean;
    id?: string;
    name?: string;
    error?: string;
    statusCode: number;
    isConflict?: boolean;
  }> {
    const url = `${this.baseUrl}/register`;

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: this.authHeader,
          Accept: "application/json",
          "Content-Type": "application/json; charset=utf-8",
        },
        body: JSON.stringify(payload),
        cache: "no-store",
      });

      const text = await response.text();
      const data = this.parseRegisterJson(text);

      if (response.status === 201 || response.ok) {
        return {
          success: true,
          id: String(data.id || ""),
          name: typeof data.name === "string" ? data.name.trim() : undefined,
          statusCode: 201,
        };
      }

      if (response.status === 409) {
        return {
          success: false,
          id: String(data.id || ""),
          name: typeof data.name === "string" ? data.name.trim() : undefined,
          error:
            (typeof data.error === "string" && data.error) ||
            "Ushbu ma'lumotlar bilan foydalanuvchi allaqachon mavjud!",
          statusCode: 409,
          isConflict: true,
        };
      }

      return {
        success: false,
        error:
          (typeof data.error === "string" && data.error) ||
          "Ro'yxatdan o'tishda xatolik yuz berdi",
        statusCode: response.status,
      };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : "Tarmoq xatosi",
        statusCode: 500,
      };
    }
  }

  /**
   * Submit an order to 1C ERP via POST /order
   */
  async createOrder(payload: OneCOrderRequest): Promise<{
    success: boolean;
    data?: OneCOrderResponse;
    error?: string;
    statusCode: number;
    retryable?: boolean;
  }> {
    const url = `${this.baseUrl}/order`;
    const sanitizedPayload: OneCOrderRequest = {
      type: payload.type,
      ...(payload.contact_id ? { contact_id: payload.contact_id } : {}),
      ...(payload.client_id ? { client_id: payload.client_id } : {}),
      ...(typeof payload.is_kp === "boolean" ? { is_kp: payload.is_kp } : {}),
      ...(payload.kp_valid_until
        ? { kp_valid_until: payload.kp_valid_until }
        : {}),
      without_delivery: Boolean(payload.without_delivery),
      geolocation: (payload.geolocation ?? "").slice(0, 150),
      comment: (payload.comment ?? "").slice(0, 350),
      products: payload.products.map((item) => ({
        product_id: item.product_id,
        quantity: item.quantity,
        price: item.price,
      })),
    };

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: this.authHeader,
          Accept: "application/json",
          "Content-Type": "application/json; charset=utf-8",
        },
        body: JSON.stringify(sanitizedPayload),
        cache: "no-store",
      });

      const text = await response.text();
      let resJson: Record<string, unknown> = {};
      try {
        resJson = JSON.parse(text);
      } catch {
        resJson = { error: text };
      }

      const apiError =
        typeof resJson.error === "string" && resJson.error.trim().length > 0
          ? resJson.error.trim()
          : undefined;

      if (response.status === 201 || response.status === 200) {
        const parsed = OneCOrderResponseSchema.safeParse(resJson);
        if (parsed.success) {
          return {
            success: true,
            data: parsed.data,
            statusCode: 201,
          };
        }

        return {
          success: false,
          error: "1C serveridan noto'g'ri javob formati qaytdi",
          statusCode: 502,
          retryable: true,
        };
      }

      if (response.status === 400) {
        return {
          success: false,
          error: apiError || "Buyurtma ma'lumotlarida xatolik!",
          statusCode: 400,
          retryable: false,
        };
      }

      if (response.status === 404) {
        return {
          success: false,
          error:
            apiError ||
            "Buyurtmadagi mahsulot yoki mijoz 1C bazasida topilmadi!",
          statusCode: 404,
          retryable: false,
        };
      }

      if (response.status >= 500) {
        return {
          success: false,
          error:
            apiError ||
            "1C serverida texnik nosozlik yuz berdi. Iltimos, qayta urinib ko'ring.",
          statusCode: response.status,
          retryable: true,
        };
      }

      return {
        success: false,
        error: apiError || "Buyurtmani rasmiylashtirishda xatolik yuz berdi",
        statusCode: response.status,
        retryable: false,
      };
    } catch {
      return {
        success: false,
        error:
          "1C serveri bilan aloqa uzildi. Savatchangiz saqlandi — qayta urinib ko'ring.",
        statusCode: 503,
        retryable: true,
      };
    }
  }

  private async fetchOneCOrderGet<T>(
    params: URLSearchParams,
    parse: (raw: unknown) => { success: true; data: T } | { success: false },
    fallbackError: string
  ): Promise<{
    success: boolean;
    data?: T;
    error?: string;
    statusCode: number;
  }> {
    const url = `${this.baseUrl}/order?${params.toString()}`;

    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: this.authHeader,
          Accept: "application/json",
        },
        cache: "no-store",
      });

      const text = await response.text();
      let resJson: Record<string, unknown> = {};
      try {
        resJson = JSON.parse(text);
      } catch {
        resJson = { error: text };
      }

      const apiError =
        typeof resJson.error === "string" && resJson.error.trim().length > 0
          ? resJson.error.trim()
          : undefined;

      if (response.status === 200) {
        const parsed = parse(resJson);
        if (parsed.success) {
          return {
            success: true,
            data: parsed.data,
            statusCode: 200,
          };
        }
        return {
          success: false,
          error: "1C serveridan kutilmagan javob formati keldi",
          statusCode: 502,
        };
      }

      if (response.status === 400) {
        return {
          success: false,
          error: apiError || "So'rov parametrlari noto'g'ri!",
          statusCode: 400,
        };
      }

      if (response.status === 403) {
        return {
          success: false,
          error:
            apiError || "Ushbu buyurtmani ko'rish uchun ruxsat yo'q!",
          statusCode: 403,
        };
      }

      if (response.status === 404) {
        return {
          success: false,
          error: apiError || "Ushbu ID ga ega buyurtma topilmadi!",
          statusCode: 404,
        };
      }

      return {
        success: false,
        error: apiError || fallbackError,
        statusCode: response.status >= 400 ? response.status : 500,
      };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : "Tarmoq xatosi",
        statusCode: 503,
      };
    }
  }

  /**
   * Mode 1: Get single order details, dynamic timeline, and products via GET /order
   */
  async getOrderDetail(input: {
    orderId: string;
    type: "B2C" | "B2B";
    contactId?: string;
    clientId?: string;
  }): Promise<{
    success: boolean;
    data?: OneCOrderDetailResponse;
    error?: string;
    statusCode: number;
  }> {
    const qs = new URLSearchParams({
      order_id: input.orderId,
      type: input.type,
    });
    if (input.type === "B2C" && input.contactId) {
      qs.set("contact_id", input.contactId);
    }
    if (input.type === "B2B" && input.clientId) {
      qs.set("client_id", input.clientId);
    }

    return this.fetchOneCOrderGet(
      qs,
      (raw) => OneCOrderDetailResponseSchema.safeParse(raw),
      "Buyurtma tafsilotini olishda xatolik yuz berdi"
    );
  }

  /**
   * Mode 2: Get paginated customer order history via GET /order (without order_id)
   */
  async getOrderHistory(input: {
    type: "B2C" | "B2B";
    contactId?: string;
    clientId?: string;
    limit?: number;
    offset?: number;
    onlyOnline?: boolean;
    isKp?: boolean;
  }): Promise<{
    success: boolean;
    data?: OneCOrderHistoryResponse;
    error?: string;
    statusCode: number;
  }> {
    const clampedLimit = Math.min(Math.max(Math.trunc(input.limit ?? 20), 1), 100);
    const clampedOffset = Math.max(Math.trunc(input.offset ?? 0), 0);

    const qs = new URLSearchParams({
      type: input.type,
      limit: String(clampedLimit),
      offset: String(clampedOffset),
    });
    if (input.type === "B2C" && input.contactId) {
      qs.set("contact_id", input.contactId);
    }
    if (input.type === "B2B" && input.clientId) {
      qs.set("client_id", input.clientId);
    }
    if (typeof input.onlyOnline === "boolean") {
      qs.set("only_online", input.onlyOnline ? "true" : "false");
    }
    if (typeof input.isKp === "boolean") {
      qs.set("is_kp", input.isKp ? "true" : "false");
    }

    return this.fetchOneCOrderGet(
      qs,
      (raw) => OneCOrderHistoryResponseSchema.safeParse(raw),
      "Buyurtmalar tarixini olishda xatolik yuz berdi"
    );
  }

  /**
   * Perform a KP lifecycle action (CONVERT_TO_ORDER or CANCEL_KP) via POST /order_action
   */
  async performOrderAction(payload: OneCOrderActionRequest): Promise<{
    success: boolean;
    data?: OneCOrderActionResponse;
    error?: string;
    statusCode: number;
  }> {
    const url = `${this.baseUrl}/order_action`;
    const bodyPayload: OneCOrderActionRequest = {
      order_id: payload.order_id,
      type: payload.type,
      ...(payload.client_id ? { client_id: payload.client_id } : {}),
      ...(payload.contact_id ? { contact_id: payload.contact_id } : {}),
      action: payload.action,
      ...(typeof payload.without_delivery === "boolean"
        ? { without_delivery: payload.without_delivery }
        : {}),
      ...(payload.geolocation !== undefined
        ? { geolocation: payload.geolocation.slice(0, 150) }
        : {}),
      ...(payload.comment !== undefined
        ? { comment: payload.comment.slice(0, 350) }
        : {}),
    };

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: this.authHeader,
          Accept: "application/json",
          "Content-Type": "application/json; charset=utf-8",
        },
        body: JSON.stringify(bodyPayload),
        cache: "no-store",
      });

      const text = await response.text();
      let resJson: Record<string, unknown> = {};
      try {
        resJson = JSON.parse(text);
      } catch {
        resJson = { error: text };
      }

      const apiError =
        typeof resJson.error === "string" && resJson.error.trim().length > 0
          ? resJson.error.trim()
          : undefined;

      if (response.status === 200 || response.status === 201) {
        const parsed = OneCOrderActionResponseSchema.safeParse(resJson);
        if (parsed.success) {
          return {
            success: true,
            data: parsed.data,
            statusCode: 200,
          };
        }
        return {
          success: false,
          error: "1C serveridan kutilmagan javob formati qaytdi",
          statusCode: 502,
        };
      }

      const defaultErrorByStatus: Record<number, string> = {
        400: "So'rov parametrlari noto'g'ri yoki KP muddati tugagan!",
        403: "Ushbu hujjat ustida amal bajarish uchun ruxsat yo'q!",
        404: "Hujjat 1C bazasida topilmadi!",
        409: "Hujjat holati o'zgargan yoki 1C da menejer tomonidan tahrirlanmoqda. Sahifani yangilab qayta urinib ko'ring.",
      };

      return {
        success: false,
        error:
          apiError ||
          defaultErrorByStatus[response.status] ||
          "Amalni bajarishda xatolik yuz berdi",
        statusCode: response.status >= 400 ? response.status : 500,
      };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : "1C serveri bilan aloqa uzildi",
        statusCode: 503,
      };
    }
  }
}

function hasCustomFetchOptions(options?: FetchOptions): boolean {
  return Boolean(
    options?.noCache ||
      (options?.tags && options.tags.length > 0) ||
      options?.revalidate !== undefined
  );
}

const cachedGetCategories = cache((client: SoraApiClient) =>
  client.fetchCategoriesImpl()
);
const cachedGetBrands = cache((client: SoraApiClient) =>
  client.fetchBrandsImpl()
);
const cachedGetPrices = cache((client: SoraApiClient) =>
  client.fetchPricesImpl()
);
const cachedGetAllProducts = cache((client: SoraApiClient) =>
  client.fetchAllProductsImpl()
);
const cachedGetProductById = cache((client: SoraApiClient, id: string) =>
  client.fetchProductByIdImpl(id)
);
const cachedGetProductBySlug = cache(
  (client: SoraApiClient, slug: string, locale: "uz" | "ru") =>
    client.fetchProductBySlugImpl(slug, locale)
);
const cachedGetFaqs = cache((client: SoraApiClient) =>
  client.fetchFaqsImpl()
);

export const api = new SoraApiClient();
