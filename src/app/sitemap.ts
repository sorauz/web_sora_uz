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
    { path: "/brands", priority: 0.7, changeFrequency: "weekly" as const },
  ];

  for (const page of staticPages) {
    sitemapEntries.push({
      url: `${baseUrl}/uz${page.path}`,
      lastModified: now,
      changeFrequency: page.changeFrequency,
      priority: page.priority,
      alternates: {
        languages: {
          uz: `${baseUrl}/uz${page.path}`,
          ru: `${baseUrl}/ru${page.path}`,
        },
      },
    });
    sitemapEntries.push({
      url: `${baseUrl}/ru${page.path}`,
      lastModified: now,
      changeFrequency: page.changeFrequency,
      priority: page.priority,
      alternates: {
        languages: {
          uz: `${baseUrl}/uz${page.path}`,
          ru: `${baseUrl}/ru${page.path}`,
        },
      },
    });
  }

  // 2. Categories
  for (const cat of categoriesData.categories) {
    if (!cat.group_slug_uz && !cat.group_slug_ru) continue;
    const uzSlug = cat.group_slug_uz || cat.group_slug_ru;
    const ruSlug = cat.group_slug_ru || cat.group_slug_uz;

    // Uzbek category URL
    sitemapEntries.push({
      url: `${baseUrl}/uz/category/${uzSlug}`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.8,
      alternates: {
        languages: {
          uz: `${baseUrl}/uz/category/${uzSlug}`,
          ru: `${baseUrl}/ru/category/${ruSlug}`,
        },
      },
    });

    // Russian category URL
    sitemapEntries.push({
      url: `${baseUrl}/ru/category/${ruSlug}`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.8,
      alternates: {
        languages: {
          uz: `${baseUrl}/uz/category/${uzSlug}`,
          ru: `${baseUrl}/ru/category/${ruSlug}`,
        },
      },
    });
  }

  // 3. Brands
  for (const brand of brandsData.data.brands) {
    const brandSlug = brand.name.toLowerCase().replace(/[^a-z0-9]/g, "-");
    if (!brandSlug) continue;

    sitemapEntries.push({
      url: `${baseUrl}/uz/brand/${brandSlug}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.65,
      alternates: {
        languages: {
          uz: `${baseUrl}/uz/brand/${brandSlug}`,
          ru: `${baseUrl}/ru/brand/${brandSlug}`,
        },
      },
    });
    sitemapEntries.push({
      url: `${baseUrl}/ru/brand/${brandSlug}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.65,
      alternates: {
        languages: {
          uz: `${baseUrl}/uz/brand/${brandSlug}`,
          ru: `${baseUrl}/ru/brand/${brandSlug}`,
        },
      },
    });
  }

  // 4. Products
  for (const product of productsData.products) {
    const uzSlug = product.uz?.slug_uz || product.ru?.slug_ru;
    const ruSlug = product.ru?.slug_ru || product.uz?.slug_uz;
    if (!uzSlug && !ruSlug) continue;

    const images = product.main_picture ? [product.main_picture] : undefined;

    // Uzbek product URL
    sitemapEntries.push({
      url: `${baseUrl}/uz/products/${uzSlug}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.75,
      images,
      alternates: {
        languages: {
          uz: `${baseUrl}/uz/products/${uzSlug}`,
          ru: `${baseUrl}/ru/products/${ruSlug}`,
        },
      },
    });

    // Russian product URL
    sitemapEntries.push({
      url: `${baseUrl}/ru/products/${ruSlug}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.75,
      images,
      alternates: {
        languages: {
          uz: `${baseUrl}/uz/products/${uzSlug}`,
          ru: `${baseUrl}/ru/products/${ruSlug}`,
        },
      },
    });
  }

  return sitemapEntries;
}
