# 1-TUR REJA: Ma'lumotlar va Texnik Imkoniyatlar Mavjud Bo'lgan va Amalga Oshirish Mumkin Bo'lgan Ishlar

> **Tavsif:** Ushbu rejaga loyihaning hozirgi arxitekturasi, Next.js 16 (App Router), mavjud 1C ERP ma'lumotlari (`http://1cloud.uz:777/SORA/hs/for_msp`), komponentlar va kod bazasida barcha ma'lumotlar hamda texnik imkoniyatlar 100% mavjud bo'lgan, tashqi to'siqlarsiz darhol amalga oshirilishi mumkin bo'lgan vazifalar kiritilgan.

---

## 1. Texnik SEO va Strukturaviy Ma'lumotlarni Boyitish (Data & Schemas)

### 1.1. Sitemap `lastmod` Sanasini 1C `updated_at` Bilan To'liq Bog'lash
- **Hozirgi holat:** `src/app/sitemap.ts` da barcha mahsulotlar uchun `lastModified: now` dinamik berilgan.
- **Mavjud ma'lumot:** 1C ERP dan kelayotgan har bir mahsulot ob'ektida `product.updated_at` (masalan, `"2026-09-28T00:00:00"`) maydoni mavjud.
- **Amalga oshiriladigan ish:**
  - `sitemap.ts` da mahsulotlarning `lastModified` sanasini `product.updated_at ? new Date(product.updated_at) : now` ga o'tkazish.
  - Bu orqali Google va Bing botlariga soxta sana emas, faqat 1C da narx yoki parametr o'zgargandagina yangilangan haqiqiy sana uzatiladi.

### 1.2. Hududiy Mintaqa Kodlarini (`ru-UZ`, `uz-UZ`) Hreflang va Metadataga Qo'shish
- **Hozirgi holat:** Hozircha til teglari umumiy `uz` va `ru` ko'rinishida berilgan.
- **Mavjud texnik imkoniyat:** Next.js `alternates.languages` mexanizmi har qanday ISO 639-1 / ISO 3166-1 kodlarini qabul qiladi.
- **Amalga oshiriladigan ish:**
  - `layout.tsx`, `products/[slug]/page.tsx` va `category/[slug]/page.tsx` dagi `alternates.languages` ga `"ru-UZ"` va `"uz-UZ"` mintaqaviy aniqlik teglari kiritiladi.
  - O'zbekiston hududidagi rusiyzabon va o'zbekzabon qidiruv so'rovlarida saytning regional SEO kuchi oshadi.

### 1.3. Google 2026 Standartidagi `Product` JSON-LD Schemasini Boyitish — [BAJARILDI ✅]
- **Holat:** To'liq amalga oshirildi va ishlab chiqarishga chiqarildi (`ProductJsonLd.tsx`).
- **Mavjud ma'lumot:**
  - Mahsulot toifasi: `loc.category` ulandi.
  - Shtrix-kod (GTIN/Barcode): 1C dan `product.barcode` kelganda `gtin` va `gtin13` avtomatik qo'shiladi.
  - Yetkazib berish va qaytarish qoidalari: Google Rich Result uchun `shippingDetails` va `hasMerchantReturnPolicy` nestinglari to'liq integratsiya qilindi.
- **Amalga oshirilgan ishlar:**
  - `ProductJsonLd.tsx` ichiga `category`, `gtin`, `gtin13`, `seller`, `shippingDetails` (`OfferShippingDetails`), va `hasMerchantReturnPolicy` (`MerchantReturnPolicy`) kiritildi.
  - Playwright testlari bilan qamrab olindi (`tests/pdp.spec.ts`).

### 1.4. FAQPage JSON-LD Schemasini O'rnatish
- **Hozirgi holat:** Mahsulot sahifasida (PDP) va Kategoriya sahifalarida FAQ savol-javoblari vizual tarzda mavjud, biroq ularning Schema.org JSON-LD tegi yo'q.
- **Mavjud ma'lumot:** Savol va javoblar matnlari komponentlar ichida to'liq tayyor.
- **Amalga oshiriladigan ish:**
  - `FaqJsonLd.tsx` komponenti yaratiladi va PDP hamda Kategoriya sahifalariga ulanadi.
  - Google qidiruv natijalarida sahifa ostida kengaytirilgan FAQ savol-javoblari ochilib-yopiluvchi rich snippet ko'rinishida chiqadi.

---

## 2. Foydalanuvchi Tajribasi (UX) va Katalog Navigatsiyasi

### 2.1. Katalog va Kategoriya Sahifalash (Pagination) Tizimi
- **Hozirgi holat:** Tovar ro'yxati filtrlash bilan bitta sahifada chiqadi. Sahifalash (`?page=1`, `?page=2`) mavjud emas.
- **Mavjud texnik imkoniyat:** Next.js server komponentlari `searchParams.page` parametrini o'qiy oladi va mahsulotlar massivini `slice((page - 1) * pageSize, page * pageSize)` orqali bo'lib bera oladi.
- **Amalga oshiriladigan ish:**
  - Sahifalash komponenti (`Pagination.tsx`) yaratiladi: Oldingi/Keyingi tugmalari va sahifa raqamlari.
  - URL sinxronizatsiyasi: `nuqs` yoki Next.js `useSearchParams` orqali filtrlar bilan birga saqlanadi.
  - SEO uchun `rel="next"` va `rel="prev"` teglari metadata qismiga kiritiladi.

### 2.2. Mahsulotlarni O'zaro Taqqoslash (Product Comparison) Tizimi — [BAJARILDI ✅]
- **Hozirgi holat:** PDP da o'xshash tovarlar ro'yxati bor, lekin ularni yonma-yon solishtirib bo'lmaydi.
- **Mavjud ma'lumot:** 1C dan keluvchi barcha texnik xususiyatlar (paket, brend, o'lcham, model, narx, ishlab chiqarilgan mamlakat) tayyor.
- **Amalga oshiriladigan ish:**
  - Taqqoslash uchun Zustand store (`useCompareStore.ts`) yaratiladi.
  - Mahsulot kartochkalariga "Taqqosla" (Compare) tugmasi qo'shiladi.
  - Alohida taqqoslash sahifasi (`/[locale]/compare`) yaratilib, unda 2 yoki undan ortiq tovarlarning texnik xususiyatlari va narxlari jadval ko'rinishida yonma-yon chiqariladi.

### 2.3. Kengaytirilgan Cross-sell / To'plamni (Bundle) Savatchaga Qo'shish
- **Hozirgi holat:** PDP ostida "Bilan birga xarid qilinadi" tovarlari chiqadi, lekin har birini alohida savatchaga solish kerak.
- **Mavjud ma'lumot:** PDP da asosiy tovar va unga bog'liq tavsiya etiladigan aksessuarlar ro'yxati mavjud.
- **Amalga oshiriladigan ish:**
  - PDP ga "Barchasini birga sotib olish" interaktiv to'plam (Bundle) bloki qo'shiladi (masalan: Perpletka mashinasi + prujina + qoplama).
  - Bitta klik bilan butun komplektni savatchaga qo'shish imkoniyati beriladi.

---

### 3. Yangi Qidiruv Tizimlari va Kontent Arxitekturasi

### 3.1. IndexNow Protokoli Integratsiyasi (Bing & Yandex)
- **Hozirgi holat:** Yangi yoki o'zgargan URL'lar faqat sitemap orqali navbatda skanerlanishini kutadi.
- **Mavjud texnik imkoniyat:** IndexNow protokoli ochiq, bepul va hech qanday murakkab shartnomasiz ishlaydi.
- **Amalga oshiriladigan ish:**
  - `public/` katalogida maxsus IndexNow kaliti (`indexnow-{key}.txt`) joylashtiriladi.
  - `src/app/api/indexnow/route.ts` yaratiladi: Har gal mahsulot yoki toifa yangilanganda IndexNow API endpointiga (`https://api.indexnow.org/indexnow`) avtomatik POST so'rovi yuborilib, Yandex va Bing'ga zudlik bilan xabar beriladi.

### 3.2. Blog va Qo'llanmalar (Content Hub) Bo'limi
- **Hozirgi holat:** Saytda maqolalar, xarid qo'llanmalari va ekspert sharhlari bo'limi yo'q.
- **Mavjud texnik imkoniyat:** Next.js Server Components, Markdown/MDX yoki statik JSON ma'lumotlar modeli orqali to'laqonli blog bo'limi yaratish imkoniyati 100% mavjud.
- **Amalga oshiriladigan ish:**
  - `/[locale]/blog` va `/[locale]/blog/[slug]` yo'nalishlari ochiladi.
  - Ofis jihozlari va kanselyariya bo'yicha amaliy xarid qo'llanmalari joylanadi (masalan: *"Ofis uchun to'g'ri qog'oz qanday tanlanadi?"*, *"Perpletka mashinalari turlari va farqlari"*).
  - Ichki havolalar (Internal linking: `Blog → Category → Product`) orqali SEO vazni asosiy tovar sahifalariga yo'naltiriladi.

---

## 4. Amalga Oshirish Ketma-ketligi (Prioritetlar)

| № | Vazifa nomi | Yo'nalish | Qiyinlik darajasi | Kutilayotgan natija |
|---|---|:---:|:---:|---|
| 1 | **Sitemap lastmod + 1C updated_at** | SEO | Oson | Sitemap sifatini oshirish va indeksatsiyani tezlashtirish |
| 2 | **Hududiy mintaqa teglari (ru-UZ, uz-UZ)** | SEO | Oson | Mahalliy SEO va regional qidiruv aniqligi |
| 3 | **Product JSON-LD boyitish (GTIN, Category, Policies)** | SEO | O'rta | Bajarildi ✅ (Google Rich Snippets va Merchant reytingi) |
| 4 | **FAQPage JSON-LD Schemasi** | SEO | O'rta | Qidiruvda ochiluvchi FAQ rich snippets |
| 5 | **IndexNow protokoli integratsiyasi** | SEO | O'rta | Yandex va Bing'da o'zgarishlarni bir soniyada indekslash |
| 6 | **Katalog sahifalash (Pagination ?page=2)** | UX / Tech | O'rta | Katta tovarlar ro'yxatida tezlik va qulaylik |
| 7 | **Mahsulotlarni Taqqoslash (Comparison Page)** | UX / E-com | O'rta | Bajarildi ✅ (Konversiya oshishi, xaridorga to'g'ri tanlov berish) |
| 8 | **1-klikda to'plam xarid qilish (Bundle Cross-sell)** | E-com | O'rta | O'rtacha chek miqdorini (AOV) oshirish |
| 9 | **Blog va Qo'llanmalar (Content Hub)** | Kontent | Murakkab | Organik qidiruv trafigi va topical authority |
