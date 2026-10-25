import { api } from "@/lib/api";
import { calculateProductPrice } from "@/lib/utils/price";
import { NextResponse } from "next/server";

export const revalidate = 86400; // 24 hours cache

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
- [Yetkazib berish shartlari](${baseUrl}/uz/delivery): Toshkent shahri bo'yicha 24 soat ichida (500 000 so'mdan yuqori xaridlar uchun bepul) va viloyatlarga BTS, Fargo, EMU orqali 1–3 kunda yetkazib berish.
- [To'lov usullari](${baseUrl}/uz/payment): Naqd pul, Payme, Click, Uzcard, Humo va korporativ bank o'tkazmalari.
- [Kafolat va qaytarish](${baseUrl}/uz/warranty): 10 kunlik rasmiy kafolat va almashtirish xizmati.

## Maxsus Takliflar va Aksiyalar
- [Aksiyalar markazi](${baseUrl}/uz/offers): Do'kondagi barcha amaldagi aksiyalar va maxsus takliflar.
- [Kafolatlangan eng arzon narx](${baseUrl}/uz/catalog/low_price_guarantee): Bozorning eng maqbul narxlari kafolatlangan tovarlar.
- [Yangi kelgan mahsulotlar](${baseUrl}/uz/catalog/new_products): Do'konga yangi keltirilgan tovarlar.
- [Top mahsulotlar](${baseUrl}/uz/catalog/popular): Eng ommabop va ko'p sotilgan ofis/maktab mollari.
- [Aksiya va chegirmalar](${baseUrl}/uz/catalog/promotions): Aksiya va maxsus chegirmadagi tovarlar.

## AI Agentlar uchun Dinamik Markdown (.md) Qo'llanmasi
Har bir kategoriya va mahsulot o'zining toza Markdown (\`.md\`) versiyasiga ega:
- Kategoriya indeksi: \`${baseUrl}/uz/category/{slug}.md\` (yoki \`/ru/category/{slug}.md\`)
- Mahsulot tafsiloti: \`${baseUrl}/uz/products/{slug}.md\` (yoki \`/ru/products/{slug}.md\`)
- HTTP Content-Negotiation: \`Accept: text/markdown\` sarlavhasi bilan so'ralganda avtomatik Markdown qaytariladi.

## Kategoriyalar (Markdown Hub Indekslari)
`;

  for (const cat of categoriesData.categories) {
    if (cat.group_uz && cat.group_slug_uz) {
      md += `- [${cat.group_uz}](${baseUrl}/uz/category/${cat.group_slug_uz}.md) ([HTML](${baseUrl}/uz/category/${cat.group_slug_uz}))\n`;
    }
  }

  md += `\n## Rasmiy Brendlar\n`;
  for (const b of brandsData.data.brands) {
    const slug = b.name.toLowerCase().replace(/[^a-z0-9]/g, "-");
    md += `- [${b.name}](${baseUrl}/uz/brand/${slug})\n`;
  }

  md += `\n## Mahsulotlar Katalogi (.md Indeks)\n\n`;
  for (const p of productsData.products) {
    const nameUz = p.uz?.name_uz || p.ru?.name_ru;
    const slugUz = p.uz?.slug_uz || p.ru?.slug_ru;
    if (!nameUz || !slugUz) continue;

    const priceInfo = calculateProductPrice(p.price);
    const inStock = p.price?.stock !== "OutOfStock";

    let priceStr = "So'rov bo'yicha";
    if (priceInfo.price > 0) {
      priceStr = `${priceInfo.price.toLocaleString("ru-RU")} UZS`;
    }

    const stockStr = inStock ? "Omborda mavjud" : "Tugagan";
    const brand = p.brand ? ` | Brend: ${p.brand}` : "";
    const sku = p.product_sku ? ` | SKU: ${p.product_sku}` : "";

    md += `- [${nameUz}](${baseUrl}/uz/products/${slugUz}.md) — **${priceStr}** | ${stockStr}${brand}${sku}\n`;
  }

  return new NextResponse(md, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control":
        "public, max-age=86400, s-maxage=86400, stale-while-revalidate=86400",
    },
  });
}
