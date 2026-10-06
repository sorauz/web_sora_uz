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
import { OfferItem, OfferListResponseSchema } from "../schemas/offer";
import {
  Review,
  ReviewListResponseSchema,
  ReviewStats,
} from "../schemas/review";
import {
  OneCUserResponse,
  OneCUserResponseSchema,
} from "../schemas/auth";
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
    const res = await this.request<{ products?: ProductPriceStock[] }>(
      "/price",
      {
        tags: options?.tags ?? ["prices"],
        revalidate: options?.revalidate,
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
    const res = await this.request<unknown[]>("/all_product", {
      tags: options?.tags ?? ["products"],
      revalidate: options?.revalidate,
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
    const res = await this.request<unknown>(`/product?id=${id}`, {
      tags: options?.tags ?? ["products", `product-${id}`],
      revalidate: options?.revalidate,
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
   * Helper to find a product by localized slug.
   * If not found under current locale, gracefully searches across other language slugs.
   */
  async getProductBySlug(
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
      revalidate: options?.revalidate ?? 3600,
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
      revalidate: options?.revalidate ?? 3600,
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
      revalidate: options?.revalidate ?? 3600,
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
      revalidate: options?.revalidate ?? 3600,
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
      revalidate: options?.revalidate ?? 3600,
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
   * Authorize existing customer in 1C ERP via GET /register
   * - B2C: type=B2C&phone=+998...&password=...
   * - B2B: type=B2B&inn=...&password=...
   */
  async loginUser(params: {
    type: "B2C" | "B2B";
    identifier: string;
    password: string;
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
    const url = `${this.baseUrl}/register?type=${params.type}&${queryParam}&password=${encodeURIComponent(
      params.password
    )}`;

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
      let data: Record<string, unknown> = {};
      try {
        data = JSON.parse(text);
      } catch {
        data = { error: text };
      }

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
   * - B2B: { type: "B2B", name, inn, password }
   */
  async registerUser(payload: {
    type: "B2C" | "B2B";
    name: string;
    phone1?: string;
    phone2?: string;
    inn?: string;
    password: string;
  }): Promise<{
    success: boolean;
    id?: string;
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
      let data: Record<string, unknown> = {};
      try {
        data = JSON.parse(text);
      } catch {
        data = { error: text };
      }

      if (response.status === 201 || response.ok) {
        return {
          success: true,
          id: String(data.id || ""),
          statusCode: 201,
        };
      }

      if (response.status === 409) {
        return {
          success: false,
          id: String(data.id || ""),
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
}

export const api = new SoraApiClient();
