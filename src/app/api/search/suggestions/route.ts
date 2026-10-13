import { NextRequest, NextResponse } from "next/server";
import { api } from "@/lib/api";
import { searchProducts, searchCategories, searchBrands } from "@/lib/utils/search";
import { getProductLocalized } from "@/lib/schemas/product";
import { calculateProductPrice } from "@/lib/utils/price";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const q = searchParams.get("q")?.trim() || "";
  const locale = (searchParams.get("locale") === "ru" ? "ru" : "uz") as "uz" | "ru";

  if (!q || q.length < 2) {
    return NextResponse.json(
      { products: [], categories: [], brands: [] },
      {
        headers: {
          "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
        },
      }
    );
  }

  try {
    const [categoriesData, brandsData, productsData] = await Promise.all([
      api.getCategories(),
      api.getBrands(),
      api.getAllProducts(),
    ]);

    const matchedProducts = searchProducts(productsData.products, q, locale)
      .slice(0, 6)
      .map((p) => {
        const loc = getProductLocalized(p, locale);
        const priceInfo = calculateProductPrice(p.price);
        return {
          id: p.id,
          slug: loc.slug,
          name: loc.name,
          main_picture: p.main_picture,
          price: priceInfo.price,
          oldPrice: priceInfo.oldPrice,
          hasDiscount: priceInfo.hasDiscount,
        };
      });

    const matchedCategories = searchCategories(categoriesData.categories, q, locale)
      .slice(0, 4)
      .map((c) => ({
        id: c.id,
        name: locale === "uz" ? c.group_uz : c.group_ru,
        slug: locale === "uz" ? c.group_slug_uz : c.group_slug_ru,
      }));

    const matchedBrands = searchBrands(brandsData.data.brands, q)
      .slice(0, 4)
      .map((b) => ({
        id: b.id,
        name: b.name,
      }));

    return NextResponse.json(
      {
        products: matchedProducts,
        categories: matchedCategories,
        brands: matchedBrands,
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
        },
      }
    );
  } catch (err: unknown) {
    return NextResponse.json(
      { products: [], categories: [], brands: [], error: String(err) },
      { status: 500 }
    );
  }
}
