# 1-TUR REJA: Ma'lumotlar va Texnik Imkoniyatlar Mavjud Bo'lgan va Amalga Oshirish Mumkin Bo'lgan Ishlar

> **Tavsif:** Ushbu rejaga loyihaning hozirgi arxitekturasi, Next.js 16 (App Router), mavjud 1C ERP ma'lumotlari (`http://1cloud.uz:777/SORA/hs/for_msp`), komponentlar va kod bazasida barcha ma'lumotlar hamda texnik imkoniyatlar 100% mavjud bo'lgan, tashqi to'siqlarsiz darhol amalga oshirilishi mumkin bo'lgan vazifalar kiritilgan.

---

## 1. Texnik SEO va Strukturaviy Ma'lumotlarni Boyitish (Data & Schemas)

### 1.1. Sitemap `lastmod` Sanasini 1C `updated_at` Bilan To'liq Bog'lash — [BAJARILDI ✅]
- **Holat:** To'liq amalga oshirildi va ishlab chiqarishga chiqarildi (`src/app/sitemap.ts`).
- **Mavjud ma'lumot:** 1C ERP dan kelayotgan har bir mahsulot ob'ektida `product.updated_at` maydoni mavjud.
- **Amalga oshirilgan ishlar:**
  - `src/app/sitemap.ts` da mahsulotlarning `lastModified` sanasi `product.updated_at ? new Date(product.updated_at) : now` orqali ulandi.
  - Google, Yandex va Bing botlariga soxta sana emas, 1C da narx yoki parametr o'zgargandagi haqiqiy sana uzatiladi.
  - Playwright testlari bilan to'liq qamrab olindi (`tests/faza5.spec.ts`).

### 1.2. Hududiy Mintaqa Kodlarini (`ru-UZ`, `uz-UZ`) Hreflang va Metadataga Qo'shish — [BAJARILDI ✅]
- **Holat:** To'liq amalga oshirildi va ishlab chiqarishga chiqarildi.
- **Mavjud texnik imkoniyat:** Next.js `alternates.languages` mexanizmi har qanday ISO 639-1 / ISO 3166-1 kodlarini qabul qiladi.
- **Amalga oshirilgan ishlar:**
  - `layout.tsx`, `page.tsx`, `products/[slug]/page.tsx`, `category/[slug]/page.tsx`, `brand/[slug]/page.tsx`, `catalog/page.tsx`, `catalog/[offer]/page.tsx`, `offers/page.tsx`, `brands/page.tsx` hamda `sitemap.ts` dagi `alternates.languages` ga `"ru-UZ"` va `"uz-UZ"` mintaqaviy aniqlik teglari to'liq kiritildi.
  - O'zbekiston hududidagi rusiyzabon va o'zbekzabon qidiruv so'rovlarida saytning regional SEO kuchi oshirildi.
  - Playwright testlari bilan to'liq qamrab olindi (`tests/faza5.spec.ts`).

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

### 1.5. ItemList (Kategoriya va Brend Ro'yxatlari) JSON-LD Schemasi — [BAJARILDI ✅]
- **Holat:** To'liq amalga oshirildi va ishlab turibdi (`ItemListJsonLd.tsx`).
- **Amalga oshirilgan ishlar:**
  - `ItemListJsonLd.tsx` SEO komponenti yaratildi.
  - Kategoriya (`/category/[slug]`), Brend (`/brand/[slug]`) va Aksiya to'plamlari (`/catalog/[offer]`) sahifalariga ulandi.
  - Har bir element uchun `ListItem` shakllantirilib, `position` (ko'p sahifalilik hisobi bilan `(page - 1) * 24 + index + 1`), `name`, `url`, `image`, `sku`, `brand` va `offers` (narx, UZS, mavjudlik) to'liq kiritildi.
  - Playwright avtomatlashtirilgan testlari bilan qamrab olindi (`tests/itemlist-schema.spec.ts`).

---

## 2. Foydalanuvchi Tajribasi (UX) va Katalog Navigatsiyasi

### 2.1. Katalog va Kategoriya Sahifalash (Pagination) Tizimi — [BAJARILDI ✅]
- **Holat:** To'liq amalga oshirildi va ishlab turibdi.
- **Amalga oshirilgan ishlar:**
  - Standart sahifa hajmi: `PAGE_SIZE = 24` dona mahsulot (mobil 2 ustun, kategoriya 3 ustun, brend/aksiya 4 ustun uchun simmetrik EKUK).
  - `Pagination.tsx` komponenti yaratildi: Oldingi/Keyingi navigatsiya, aqlli ellipsis `...` (1 ... 4 5 6 ... 10), mobil uchun kamida 44x44px qulay touch-targetlar va jami hisoblagich.
  - URL va Filtrlar sinxronizatsiyasi: `nuqs` yordamida filtr yoki saralash o'zgarganda sahifa avtomatik 1-ga qaytariladi (`setPage(null)`).
  - Kategoriya (`/category/[slug]`), Brend (`/brand/[slug]`), Aksiya to'plamlari (`/catalog/[offer]`) hamda Qidiruv (`/search`) sahifalariga to'liq integratsiya qilindi.
  - Ko'p sahifali SEO: Canonical havolalar `?page=X` bilan, sarlavhalar `(2-sahifa)`, botlar uchun `rel="prev"` va `rel="next"` belgilari qo'shildi.
  - Playwright e2e testlari yaratildi (`tests/pagination.spec.ts`) va barcha testlar muvaffaqiyatli o'tdi.

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

### 3.1. IndexNow Protokoli Integratsiyasi (Bing & Yandex) — [BAJARILDI ✅]
- **Holat:** To'liq amalga oshirildi va ishlab turibdi.
- **Amalga oshirilgan ishlar:**
  - Unikal 32-belgili IndexNow API kaliti (`c83b49e19d7a46f28945a8df39b561c2`) yaratildi va `public/c83b49e19d7a46f28945a8df39b561c2.txt` orqali qidiruv tizimlariga verifikatsiya taqdim etildi.
  - `src/lib/seo/indexnow.ts` mijozi yaratildi: `https://api.indexnow.org/indexnow` endpointiga asinxron va xavfsiz JSON POST so'rovlarini yuboradi.
  - Maxsus API endpoint (`src/app/api/indexnow/route.ts`) ochildi (Yandex/Bing uchun to'g'ridan-to'g'ri URL jo'natish).
  - 1C On-Demand Revalidation webhook'iga (`src/app/api/revalidate/route.ts`) to'liq ulandi: 1C dan `tag=prices`, `tag=products` yoki `path` o'zgarganda Next.js keshini tozalash bilan parallel tarzda Yandex va Bing botlarini zudlik bilan chaqiradi.
  - Avtomatlashtirilgan Playwright testlari bilan to'liq qamrab olindi (`tests/indexnow.spec.ts`).

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
| 1 | **Sitemap lastmod + 1C updated_at** | SEO | Oson | Bajarildi ✅ (1C updated_at sitemap.ts ga to'liq ulandi) |
| 2 | **Hududiy mintaqa teglari (ru-UZ, uz-UZ)** | SEO | Oson | Bajarildi ✅ (Barcha sahifalar va sitemap alternates ga kiritildi) |
| 3 | **Product JSON-LD boyitish (GTIN, Category, Policies)** | SEO | O'rta | Bajarildi ✅ (Google Rich Snippets va Merchant reytingi) |
| 4 | **FAQPage JSON-LD Schemasi** | SEO | O'rta | Qidiruvda ochiluvchi FAQ rich snippets |
| 5 | **IndexNow protokoli integratsiyasi** | SEO | O'rta | Bajarildi ✅ (1C o'zgarishlarida Yandex va Bing'ga 0 soniyada xabar berish) |
| 6 | **Katalog sahifalash (Pagination ?page=2)** | UX / Tech | O'rta | Bajarildi ✅ (24 tadan simmetrik sahifalash, filtr reset, SEO va mobil 44px) |
| 7 | **Mahsulotlarni Taqqoslash (Comparison Page)** | UX / E-com | O'rta | Bajarildi ✅ (Konversiya oshishi, xaridorga to'g'ri tanlov berish) |
| 8 | **1-klikda to'plam xarid qilish (Bundle Cross-sell)** | E-com | O'rta | O'rtacha chek miqdorini (AOV) oshirish |
| 9 | **Blog va Qo'llanmalar (Content Hub)** | Kontent | Murakkab | Organik qidiruv trafigi va topical authority |
