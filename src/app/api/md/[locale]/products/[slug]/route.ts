import { NextRequest, NextResponse } from "next/server";
import { api } from "@/lib/api";
import { generateProductMarkdown } from "@/lib/utils/markdown";

export const revalidate = 86400; // 24 hours cache

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ locale: string; slug: string }> }
) {
  const { locale, slug } = await context.params;
  const currentLocale = (locale === "ru" ? "ru" : "uz") as "uz" | "ru";
  const cleanSlug = decodeURIComponent(slug).replace(/\.md$/i, "");

  const { product } = await api.getProductBySlug(cleanSlug, currentLocale);

  if (!product) {
    const notFoundMd =
      currentLocale === "uz"
        ? `# 404 — Mahsulot topilmadi\n\nKechirasiz, so'ralgan mahsulot (${cleanSlug}) katalogda topilmadi.\n\n- [Bosh sahifa](https://sora.uz/uz)\n- [AI Indeksi](https://sora.uz/llms.txt)\n`
        : `# 404 — Товар не найден\n\nИзвините, запрашиваемый товар (${cleanSlug}) не найден в каталоге.\n\n- [Главная страница](https://sora.uz/ru)\n- [AI Индекс](https://sora.uz/llms.txt)\n`;

    return new NextResponse(notFoundMd, {
      status: 404,
      headers: {
        "Content-Type": "text/markdown; charset=utf-8",
        "Cache-Control": "public, max-age=300, s-maxage=300",
        Vary: "Accept",
      },
    });
  }

  const markdown = generateProductMarkdown(product, currentLocale);

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
