import { api } from "@/lib/api";
import { calculateProductPrice } from "@/lib/utils/price";
import { NextResponse } from "next/server";

export const revalidate = 3600; // 1 hour cache

export async function GET() {
  const baseUrl = "https://sora.uz";

  const [categoriesData, brandsData, productsData] = await Promise.all([
    api.getCategories(),
    api.getBrands(),
    api.getAllProducts(),
  ]);

  let md = `# Sora.uz — To'liq Katalog va Mahsulotlar (LLMs Full Data)

> O'zbekistondagi 1C ERP integratsiyalangan yetakchi kanselyariya, maktab qurollari va ofis anjomlari internet-do'koni.

## Kompaniya Rekvizitlari
- Do'kon: Sora.uz
- Manzil: Toshkent shahri, Dilsaroy ko'chasi, 1 uy
- Telefon: +998 (90) 326-47-57 ; +998 (90) 969-90-90 ; +998 (71) 228-05-78
- Email: info@sora.uz
- Telegram: https://t.me/sora_uz
- Ish vaqti: Dushanba – Shanba, 09:00 – 19:00

## Xizmatlar va Korporativ Hamkorlik
- [B2B Korporativ xizmat](${baseUrl}/uz/b2b): Yuridik shaxslar uchun to'g'ridan-to'g'ri shartnoma, elektron hisob-faktura (Didox) va korporativ to'lov.
- [Yetkazib berish shartlari](${baseUrl}/uz/delivery): Toshkent shahri bo'yicha 24 soat ichida (500 000 so'mdan yuqori xaridlar uchun bepul) va viloyatlarga yetkazib berish.
- [To'lov usullari](${baseUrl}/uz/payment): Naqd pul, Payme, Click, Uzcard, Humo va korporativ bank o'tkazmalari.
- [Kafolat va qaytarish](${baseUrl}/uz/warranty): 14 kunlik rasmiy kafolat va almashtirish xizmati.

## Maxsus Takliflar va Aksiyalar
- [Aksiyalar markazi](${baseUrl}/uz/offers): Do'kondagi barcha amaldagi aksiyalar va maxsus takliflar.
- [Kafolatlangan eng arzon narx](${baseUrl}/uz/catalog/low_price_guarantee): Bozorning eng maqbul narxlari kafolatlangan tovarlar.
- [Yangi kelgan mahsulotlar](${baseUrl}/uz/catalog/new_products): Do'konga yangi keltirilgan tovarlar.
- [Top mahsulotlar](${baseUrl}/uz/catalog/popular): Eng ommabop va ko'p sotilgan ofis/maktab mollari.
- [Aksiya va chegirmalar](${baseUrl}/uz/catalog/promotions): Aksiya va maxsus chegirmadagi tovarlar.

## Kategoriyalar
`;

  for (const cat of categoriesData.categories) {
    if (cat.group_uz && cat.group_slug_uz) {
      md += `- [${cat.group_uz}](${baseUrl}/uz/category/${cat.group_slug_uz})\n`;
    }
  }

  md += `\n## Rasmiy Brendlar\n`;
  for (const b of brandsData.data.brands) {
    const slug = b.name.toLowerCase().replace(/[^a-z0-9]/g, "-");
    md += `- [${b.name}](${baseUrl}/uz/brand/${slug})\n`;
  }

  md += `\n## Mahsulotlar Assortimenti\n\n`;
  for (const p of productsData.products) {
    const nameUz = p.uz?.name_uz || p.ru?.name_ru;
    const nameRu = p.ru?.name_ru || p.uz?.name_uz;
    const slugUz = p.uz?.slug_uz || p.ru?.slug_ru;
    const slugRu = p.ru?.slug_ru || p.uz?.slug_uz;
    const priceInfo = calculateProductPrice(p.price);
    
    let priceStr = "Kelishilgan holda";
    if (priceInfo.price > 0) {
      if (priceInfo.hasDiscount && priceInfo.oldPrice) {
        priceStr = `${priceInfo.price.toLocaleString()} UZS (chegirma, asl narxi: ${priceInfo.oldPrice.toLocaleString()} UZS)`;
      } else {
        priceStr = `${priceInfo.price.toLocaleString()} UZS`;
      }
    }
    const brand = p.brand ? `[Brend: ${p.brand}]` : "";
    const sku = p.product_sku ? `[SKU: ${p.product_sku}]` : "";
    const desc = p.uz?.short_description_uz || p.uz?.meta_description_uz || p.ru?.short_description_ru || "";

    md += `### ${nameUz}\n`;
    md += `- URL (UZ): ${baseUrl}/uz/products/${slugUz}\n`;
    if (slugRu && slugRu !== slugUz) {
      md += `- URL (RU): ${baseUrl}/ru/products/${slugRu}\n`;
    }
    md += `- Narxi: ${priceStr}\n`;
    if (brand || sku) md += `- Xususiyatlar: ${brand} ${sku}\n`;
    if (desc) md += `- Tavsif: ${desc}\n`;
    md += `\n`;
  }

  return new NextResponse(md, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
