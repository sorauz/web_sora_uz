import { NextRequest, NextResponse } from "next/server";
import { api } from "@/lib/api";
import {
  findCategoryBySlug,
  getCategoryBreadcrumb,
  getAllCategorySlugs,
} from "@/lib/utils/category-tree";
import { getProductLocalized } from "@/lib/schemas/product";
import { generateCategoryMarkdown } from "@/lib/utils/markdown";

export const revalidate = 86400; // 24 hours cache

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ locale: string; slug: string }> }
) {
  const { locale, slug } = await context.params;
  const currentLocale = (locale === "ru" ? "ru" : "uz") as "uz" | "ru";
  const cleanSlug = decodeURIComponent(slug).replace(/\.md$/i, "");

  const [categoriesData, productsData] = await Promise.all([
    api.getCategories(),
    api.getAllProducts(),
  ]);

  const { tree, categories } = categoriesData;
  const currentCategory = findCategoryBySlug(tree, cleanSlug, currentLocale);

  if (!currentCategory) {
    const notFoundMd =
      currentLocale === "uz"
        ? `# 404 — Kategoriya topilmadi\n\nKechirasiz, so'ralgan kategoriya (${cleanSlug}) katalogda topilmadi.\n\n- [Bosh sahifa](https://sora.uz/uz)\n- [AI Indeksi](https://sora.uz/llms.txt)\n`
        : `# 404 — Категория не найдена\n\nИзвините, запрашиваемая категория (${cleanSlug}) не найдена в каталоге.\n\n- [Главная страница](https://sora.uz/ru)\n- [AI Индекс](https://sora.uz/llms.txt)\n`;

    return new NextResponse(notFoundMd, {
      status: 404,
      headers: {
        "Content-Type": "text/markdown; charset=utf-8",
        "Cache-Control": "public, max-age=300, s-maxage=300",
        Vary: "Accept",
      },
    });
  }

  const breadcrumb = getCategoryBreadcrumb(categories, currentCategory.id);
  const matchingSlugs = getAllCategorySlugs(currentCategory);

  const filteredProducts = productsData.products.filter((p) => {
    const slugUz = p.uz?.category_slug_uz;
    const slugRu = p.ru?.category_slug_ru;
    const locSlug = getProductLocalized(p, currentLocale).category_slug;
    return (
      (slugUz && matchingSlugs.has(slugUz)) ||
      (slugRu && matchingSlugs.has(slugRu)) ||
      (locSlug && matchingSlugs.has(locSlug))
    );
  });

  const markdown = generateCategoryMarkdown({
    category: currentCategory,
    breadcrumb,
    products: filteredProducts,
    locale: currentLocale,
  });

  return new NextResponse(markdown, {
    status: 200,
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control":
        "public, max-age=86400, s-maxage=86400, stale-while-revalidate=86400",
      Vary: "Accept",
      "X-Robots-Tag": "index, follow",
    },
  });
}
