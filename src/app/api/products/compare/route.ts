import { NextRequest, NextResponse } from "next/server";
import { api } from "@/lib/api";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const idsParam = searchParams.get("ids");
    if (!idsParam) {
      return NextResponse.json({ products: [] });
    }

    const ids = idsParam
      .split(",")
      .map((id) => id.trim())
      .filter(Boolean)
      .slice(0, 4); // Max 4 products for comparison

    if (ids.length === 0) {
      return NextResponse.json({ products: [] });
    }

    // Fetch full single-product details from 1C ERP (/product?id={id}) for each item
    // This enriches lightweight catalog items with complete 1C attributes, descriptions, and stock
    const productPromises = ids.map(async (id) => {
      const res = await api.getProductById(id);
      return res.product;
    });

    const results = await Promise.all(productPromises);
    const products = results.filter((p) => p !== null);

    return NextResponse.json({ products });
  } catch (error) {
    console.error("[API_COMPARE_PRODUCTS_ERROR]", error);
    return NextResponse.json({ products: [], error: "Failed to fetch compare products" }, { status: 500 });
  }
}
