import { MetadataRoute } from "next";
import { api } from "@/lib/api";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://sora.uz";
  const now = new Date();

  // Fetch all live entities from 1C API layer
  const [categoriesData, brandsData, productsData] = await Promise.all([
    api.getCategories(),
    api.getBrands(),
    api.getAllProducts(),
  ]);

  const sitemapEntries: MetadataRoute.Sitemap = [];

  // 1. Core Static Pages
  const staticPages = [
    { path: "", priority: 1.0, changeFrequency: "daily" as const },
    { path: "/catalog", priority: 0.85, changeFrequency: "daily" as const },
    { path: "/catalog/low_price_guarantee", priority: 0.85, changeFrequency: "daily" as const },
    { path: "/catalog/new_products", priority: 0.85, changeFrequency: "daily" as const },
    { path: "/catalog/popular", priority: 0.85, changeFrequency: "daily" as const },
    { path: "/catalog/promotions", priority: 0.85, changeFrequency: "daily" as const },
    { path: "/offers", priority: 0.85, changeFrequency: "daily" as const },
    { path: "/brands", priority: 0.7, changeFrequency: "weekly" as const },
    { path: "/about", priority: 0.6, changeFrequency: "monthly" as const },
    { path: "/contact", priority: 0.7, changeFrequency: "monthly" as const },
    { path: "/delivery", priority: 0.65, changeFrequency: "monthly" as const },
    { path: "/payment", priority: 0.65, changeFrequency: "monthly" as const },
    { path: "/warranty", priority: 0.6, changeFrequency: "monthly" as const },
    { path: "/b2b", priority: 0.7, changeFrequency: "monthly" as const },
  ];

  for (const page of staticPages) {
    const alternates = {
      languages: {
        uz: `${baseUrl}/uz${page.path}`,
        "uz-UZ": `${baseUrl}/uz${page.path}`,
        ru: `${baseUrl}/ru${page.path}`,
        "ru-UZ": `${baseUrl}/ru${page.path}`,
        "x-default": `${baseUrl}/uz${page.path}`,
      },
    };

    sitemapEntries.push({
      url: `${baseUrl}/uz${page.path}`,
      lastModified: now,
      changeFrequency: page.changeFrequency,
      priority: page.priority,
      alternates,
    });
    sitemapEntries.push({
      url: `${baseUrl}/ru${page.path}`,
      lastModified: now,
      changeFrequency: page.changeFrequency,
      priority: page.priority,
      alternates,
    });
  }

  // 2. Categories
  for (const cat of categoriesData.categories) {
    if (!cat.group_slug_uz && !cat.group_slug_ru) continue;
    const uzSlug = cat.group_slug_uz || cat.group_slug_ru;
    const ruSlug = cat.group_slug_ru || cat.group_slug_uz;

    const alternates = {
      languages: {
        uz: `${baseUrl}/uz/category/${uzSlug}`,
        "uz-UZ": `${baseUrl}/uz/category/${uzSlug}`,
        ru: `${baseUrl}/ru/category/${ruSlug}`,
        "ru-UZ": `${baseUrl}/ru/category/${ruSlug}`,
        "x-default": `${baseUrl}/uz/category/${uzSlug}`,
      },
    };

    // Uzbek category URL
    sitemapEntries.push({
      url: `${baseUrl}/uz/category/${uzSlug}`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.8,
      alternates,
    });

    // Russian category URL
    sitemapEntries.push({
      url: `${baseUrl}/ru/category/${ruSlug}`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.8,
      alternates,
    });
  }

  // 3. Brands
  for (const brand of brandsData.data.brands) {
    const brandSlug = brand.name.toLowerCase().replace(/[^a-z0-9]/g, "-");
    if (!brandSlug) continue;

    const alternates = {
      languages: {
        uz: `${baseUrl}/uz/brand/${brandSlug}`,
        "uz-UZ": `${baseUrl}/uz/brand/${brandSlug}`,
        ru: `${baseUrl}/ru/brand/${brandSlug}`,
        "ru-UZ": `${baseUrl}/ru/brand/${brandSlug}`,
        "x-default": `${baseUrl}/uz/brand/${brandSlug}`,
      },
    };

    sitemapEntries.push({
      url: `${baseUrl}/uz/brand/${brandSlug}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.65,
      alternates,
    });
    sitemapEntries.push({
      url: `${baseUrl}/ru/brand/${brandSlug}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.65,
      alternates,
    });
  }

  // 4. Products (1C updated_at lastmod + Regional hreflang uz-UZ / ru-UZ)
  for (const product of productsData.products) {
    const uzSlug = product.uz?.slug_uz || product.ru?.slug_ru;
    const ruSlug = product.ru?.slug_ru || product.uz?.slug_uz;
    if (!uzSlug && !ruSlug) continue;

    const images = product.main_picture ? [product.main_picture] : undefined;

    // Use 1C updated_at if valid date, otherwise fallback to now
    let productLastMod = now;
    if (product.updated_at) {
      const parsed = new Date(product.updated_at);
      if (!isNaN(parsed.getTime())) {
        productLastMod = parsed;
      }
    }

    const alternates = {
      languages: {
        uz: `${baseUrl}/uz/products/${uzSlug}`,
        "uz-UZ": `${baseUrl}/uz/products/${uzSlug}`,
        ru: `${baseUrl}/ru/products/${ruSlug}`,
        "ru-UZ": `${baseUrl}/ru/products/${ruSlug}`,
        "x-default": `${baseUrl}/uz/products/${uzSlug}`,
      },
    };

    // Uzbek product URL
    sitemapEntries.push({
      url: `${baseUrl}/uz/products/${uzSlug}`,
      lastModified: productLastMod,
      changeFrequency: "weekly",
      priority: 0.75,
      images,
      alternates,
    });

    // Russian product URL
    sitemapEntries.push({
      url: `${baseUrl}/ru/products/${ruSlug}`,
      lastModified: productLastMod,
      changeFrequency: "weekly",
      priority: 0.75,
      images,
      alternates,
    });
  }

  return sitemapEntries;
}
