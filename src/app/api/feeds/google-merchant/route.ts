import { api } from "@/lib/api";
import { calculateProductPrice } from "@/lib/utils/price";
import { NextResponse } from "next/server";

export const revalidate = 3600; // 1 hour

function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET() {
  const baseUrl = "https://sora.uz";
  const { products } = await api.getAllProducts();

  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss xmlns:g="http://base.google.com/ns/1.0" version="2.0">
  <channel>
    <title>Sora.uz Products Feed</title>
    <link>${baseUrl}</link>
    <description>O'zbekistonning yetakchi kanselyariya va ofis anjomlari internet-do'koni</description>
`;

  for (const p of products) {
    const name = p.uz?.name_uz || p.ru?.name_ru;
    const slug = p.uz?.slug_uz || p.ru?.slug_ru;
    if (!name || !slug) continue;

    const desc = p.uz?.short_description_uz || p.uz?.meta_description_uz || name;
    const priceInfo = calculateProductPrice(p.price);
    if (priceInfo.price <= 0) continue; // Google Merchant requires valid price > 0

    const inStock = p.price?.stock !== "OutOfStock";
    const picture = p.main_picture.startsWith("http")
      ? p.main_picture
      : `${baseUrl}${p.main_picture}`;

    xml += `    <item>
      <g:id>${escapeXml(p.id)}</g:id>
      <g:title>${escapeXml(name)}</g:title>
      <g:description>${escapeXml(desc)}</g:description>
      <g:link>${baseUrl}/uz/products/${escapeXml(slug)}</g:link>
      <g:image_link>${escapeXml(picture)}</g:image_link>
      <g:condition>new</g:condition>
      <g:availability>${inStock ? "in_stock" : "out_of_stock"}</g:availability>
      <g:price>${priceInfo.oldPrice ?? priceInfo.price} UZS</g:price>
      ${priceInfo.hasDiscount ? `<g:sale_price>${priceInfo.price} UZS</g:sale_price>` : ""}
      <g:brand>${escapeXml(p.brand || "Sora")}</g:brand>
      <g:identifier_exists>${p.product_sku ? "yes" : "no"}</g:identifier_exists>
      ${p.product_sku ? `<g:mpn>${escapeXml(p.product_sku)}</g:mpn>` : ""}
    </item>
`;
  }

  xml += `  </channel>
</rss>`;

  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
