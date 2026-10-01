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
  const now = new Date().toISOString().replace(/T/, " ").replace(/\..+/, "");

  const [categoriesData, productsData] = await Promise.all([
    api.getCategories(),
    api.getAllProducts(),
  ]);

  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<yml_catalog date="${now}">
  <shop>
    <name>Sora.uz</name>
    <company>Sora.uz Internet Do'koni</company>
    <url>${baseUrl}</url>
    <currencies>
      <currency id="UZS" rate="1"/>
    </currencies>
    <categories>
`;

  for (const cat of categoriesData.categories) {
    if (!cat.id || !cat.group_uz) continue;
    const parentAttr = cat.parent_id?.trim() ? ` parentId="${escapeXml(cat.parent_id.trim())}"` : "";
    xml += `      <category id="${escapeXml(cat.id)}"${parentAttr}>${escapeXml(cat.group_uz)}</category>\n`;
  }

  xml += `    </categories>
    <offers>
`;

  for (const p of productsData.products) {
    const name = p.uz?.name_uz || p.ru?.name_ru;
    const slug = p.uz?.slug_uz || p.ru?.slug_ru;
    if (!name || !slug) continue;

    const priceInfo = calculateProductPrice(p.price);
    if (priceInfo.price <= 0) continue;

    const available = p.price?.stock !== "OutOfStock";
    const desc = p.uz?.short_description_uz || p.uz?.meta_description_uz || name;
    const picture = p.main_picture.startsWith("http")
      ? p.main_picture
      : `${baseUrl}${p.main_picture}`;

    // Find category id if available
    const category = categoriesData.categories.find(
      (c) => c.group_slug_uz === p.uz?.category_slug_uz || c.group_slug_ru === p.ru?.category_slug_ru
    );
    const catId = category?.id || "root";

    xml += `      <offer id="${escapeXml(p.id)}" available="${available}">
        <url>${baseUrl}/uz/products/${escapeXml(slug)}</url>
        <price>${priceInfo.price}</price>
        ${priceInfo.hasDiscount && priceInfo.oldPrice ? `<oldprice>${priceInfo.oldPrice}</oldprice>` : ""}
        <currencyId>UZS</currencyId>
        <categoryId>${escapeXml(catId)}</categoryId>
        <picture>${escapeXml(picture)}</picture>
        <name>${escapeXml(name)}</name>
        ${p.brand ? `<vendor>${escapeXml(p.brand)}</vendor>` : ""}
        <description>${escapeXml(desc)}</description>
      </offer>
`;
  }

  xml += `    </offers>
  </shop>
</yml_catalog>`;

  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
