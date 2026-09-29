# SORA.UZ — BOSH REJA (MASTER PLAN)

> Ushbu hujjat `Loyixa_xujjatlari` folderdagi barcha to‘plangan materiallar (Texnalogiya, API, Web_Design, Marketing_va_SEO) asosida yozilgan **bitta birlashgan, bosqichma-bosqich amalga oshiriladigan bosh reja**dir. U loyihani noldan ishga tushirish (launch) gacha bo‘lgan yo‘lni tartib bilan ko‘rsatadi.
>
> Hujjat turi: **boshqaruv + ijro rejası** (management + execution plan).
> Tayyorlangan sana: 2026-09-29.
> Status: tasdiqlash uchun.

---

## 0. QISQACHA (EXECUTIVE SUMMARY)

**Sora.uz** — 1C ERP tizimidan ma’lumot oladigan, **ikki tilli (uz/ru)**, server-rendered asosidagi **katta e-commerce** internet-do‘koni (ofis/kanstelyariya + elektronika va h.k.).

**Maqsad:** 1C’dagi mahsulotlar bazasini Google, Bing, Yandex, Google Shopping, Copilot va AI Search uchun **semantik, tez, ishonchli va doimiy yangilanuvchi** sotuv ekotizimiga aylantirish.

**Asosiy arxitektura (barcha hujjatlarda takrorlangan bitta model):**

```text
1C (source of truth)
        ↓
   API / Integration layer
        ↓
   SEO read model / cache
        ↓
   Next.js 16 server (App Router, Server Components)
        ↓
   Vercel CDN
        ↓
   Foydalanuvchi + Google / Bing / Yandex / Copilot / AI Search
```

**Eng muhim printsiplar (butun loyihaga umumiy):**

1. **Server-first** — critical kontent (nom, narx, tavsif, specifikatsiya, schema) server HTML’da bo‘ladi. SPA “brauzerda hammasini qilish” uslubidan voz kechiladi.
2. **1 mahsulot = 1 barqaror canonical URL**. Kategoriya ko‘chsa ham mahsulot URL‘i o‘zgarmaydi.
3. **100% ikki tilli** — URL, H1, title, description, breadcrumb, structured data barchasi tilga qarab o‘zgaradi (`/uz`, `/ru`).
4. **SEO ≠ keyword + meta**. SEO = texnik SEO + crawlability + indexability + canonicalization + tez/mobile UX + product structured data + Merchant Center + original kontent + ichki linking + trust/reviews + image SEO + monitoring + AI Search readiness.
5. **Design System** — butun sayt bir xil komponentlardan quriladi.
6. **Mobile-first** — dizayn mobil ekrandan boshlab quriladi.
7. **Barcha 4 holat** — komponentlar Loading / Success / Empty / Error holatlarini biladi.
8. **AI = yordamchi, kontent fabrikasi emas**.

**Eng katta ogohlantirish (arxitektura xavfi):** Google/Bing/Yandex crawler‘i hech qachon to‘g‘ridan-to‘g‘ri 1C transactional API‘ga chiqmasligi kerak. SEO traffic uchun alohida **read model / cache** yuritiladi. Aks holda faol skanerlash 1C serverini qotirib qo‘yishi mumkin.

---

## 1. LOYIHA HAQIDA VA MAQSADLAR

### 1.1. Loyiha mahiyati
- Tur: B2C e-commerce internet-do‘koni.
- Bozor: O‘zbekiston (Toshkent boshlang‘ich, keyin mintaqalar).
- Ma’lumot manbasi: 1C (HTTP REST API, Basic Auth).
- Tillar: o‘zbek (uz) va rus (ru), boshdan ikki tilli.
- Platforma: Vercel + Next.js 16.3 (Active LTS).

### 1.2. Asosiy maqsadlar
| # | Maqsad | Natija (o‘lchanadigan) |
|---|--------|------------------------|
| 1 | Mahsulotlarni qidiruv tizimida topiladigan qilib berish | Indexed / Not indexed, CTR |
| 2 | Ishonchli xarid oqimi | Conversion rate, AOV |
| 3 | Tez va mobil qulay sayt | LCP < 2.5s, INP < 200ms, CLS < 0.1 |
| 4 | Google Shopping + Yandex Market‘da ko‘rinish | Merchant Center / YML feed ma’qullangan |
| 5 | AI Search‘da (Copilot, AI Overviews) aylanadigan kontent | AI Search visibility |
| 6 | Barqaror, yangilanadigan ma’lumot oqimi | On-demand revalidation ishlashi |

### 1.3. Qaramaydigan / keyingi bosqich (scope tashqarisi, hozircha)
- To‘liq B2B/ulgurji savdo moduli (kerak bo‘lsa keyin qo‘shiladi).
- Ko‘p valyutali to‘lov (hozircha UZS).
- Mobil ilova (native app) — veb-ga moslashuv yetarli.
- Chatbot/24-7 suhbat (kerak bo‘lsa keyin).

---

## 2. TEXNIK ARXITEKTURA VA STACK

### 2.1. Tanlangan stack (Texnalogiya/Muhim.md asosida)
| Qism | Tanlov | Vazifasi |
|------|--------|----------|
| Frontend framework | **Next.js 16.3.x** | App Router, SSR, SEO, routing, caching |
| UI engine | **React 19.3** | Server/Client Components |
| Til | **TypeScript** | Type-safety, katta loyiha |
| CSS | **Tailwind CSS 4.x** | Responsive dizayn + Design System |
| UI komponentlar | **shadcn/ui + Base UI** | Professional, moslashuvchan UI |
| i18n | **next-intl 4.x** | `/uz`, `/ru`, localized routing |
| Validation | **Zod 4.x** | API/form ma’lumotini tekshirish |
| URL filter state | **nuqs** | filter/sort/search‘ni URL bilan bog‘lash |
| Client state | **Zustand** | savat/sevimlilar/UI vaqtinchalik holat |
| Komponent dev | **Storybook 10.6** | Design System, komponent dev |
| Testing | **Playwright** | e2e testlar |
| Analytics | **GA4 + Vercel Analytics** | foydalanuvchi + conversion |
| Performance | **Vercel Speed Insights** | LCP/INP/CLS, real-user monitoring |
| Rasmlar | **Next.js Image** | responsive/optimized pipeline |
| Structured Data | **Schema.org + JSON-LD** | Product, Breadcrumb, Organization va h.k. |

### 2.2. Server/Client chegarasi (muhim)
**Server Component’da qoladi:** mahsulot ma’lumoti, kategoriya, brend, SEO text, metadata, breadcrumb, product schema, reviews, related products, sitemap, robots.

**Clientga tushadi:** Add to Cart, Favorite, Quantity, Gallery interaction, Filter, Sort, Search autocomplete, Modal, Drawer, Checkout forms.

Qoida: `useState/useEffect` va `window/document/localStorage` faqat `"use client"` komponentlarda. Server–client chegarasini to‘g‘ri belgilamasak — hydration xatolari ko‘payadi.

### 2.3. Data flow (to‘g‘ri model)
```text
INTERNET (foydalanuvchi + crawler)
        ↓
   VERCEL CDN
        ↓
   NEXT.JS 16 SERVER (Server Components + caching)
        ↓
   {PRODUCT API} + {PRICE API} + {STOCK API}
        ↓
   1C
```
Yaxshiroq model (katta loyiha uchun):
```text
1C → Integration/API layer → Read Model / Cache → Next.js → Vercel CDN → User + Google + Bing
```

---

## 3. API INTEGRATSIYASI (1C)

### 3.1. Hozir mavjud endpointlar (Api/ hujjatlaridan)
| Endpoint | Metod | Vazifa | Asosiy maydonlar |
|----------|-------|--------|------------------|
| `/SORA/hs/for_msp/units` | GET | O‘lchov birliklari (dona/kg/o‘ram…) | `id, name, unit_uz, unit_ru` |
| `/SORA/hs/for_msp/categories` | GET | Barcha kategoriyalar (flat, `parent_id` iyerarxiya) | `id, group_uz/ru, group_slug_uz/ru, parent_id, parent_name_uz/ru` |
| `/SORA/hs/for_msp/brands` | GET | Brend + ishlab chiqaruvchi + davlat (paket so‘rov) | `brands[], manufacturers[], countries[]` |
| `/SORA/hs/for_msp/all_product` | GET | Barcha mahsulotlar (massiv) | to‘liq `Product` obyektlari |
| `/SORA/hs/for_msp/product?id={UUID}` | GET | Bitta mahsulot (batafsil) | `Product` + `attributes[]` + `related_products[]` + `recommended_products[]` |

**Umumiy:**
- Base URL: `http://sora.uz:777/SORA/hs/for_msp`
- Avtorizatsiya: **Basic Auth (Login va Parol)** — faqat serverda, brauzerga chiqmaydi.
- Content-Type: `application/json; charset=utf-8`
- Status kodlari: `200 OK`, `400 Bad Request` (id yaroqsiz), `404 Not Found` (topilmadi/o‘chirilgan/nashr ruxsati yo‘q).

### 3.2. Product obyekt tuzilishi (asosiy)
```text
Product
├── id, product_sku, package, barcode, brand, manufacturer, country, video_url, main_picture, updated_at
├── uz { unit_uz, category_uz, category_slug_uz, alt_picture_uz, name_uz, slug_uz, title_uz, meta_description_uz, short_description_uz, product_description_uz }
├── ru { ... bir xil maydonlar ru varianti }
├── attributes[] { property_uz, property_ru, value_uz, value_ru }
├── related_products[] { slug, name, title, short_description, alt_picture, picture }
└── recommended_products[] { ... }
```
**Muhim:** `related_products` (o‘xshash/muqobil — substitute) va `recommended_products` (birga sotib olinadi — complementary) **farq qiladi** (Texnalogiya/Produkt.txt). Ular UI’da alohida bloklar bo‘ladi.

### 3.3. ⚠️ API / OCHIQ SAVOLLAR 
Hozir hujjatlangan API‘da quyidagilar **yo‘q**. Ijro boshlanishidan oldin backend (1C) tomonidan berilishi talab qilinadi:

1)Cart / Checkout / Orders API — savatcha, buyurtma yaratish, holat (qabul qilindi/tayyorlanmoqda/yetkazildi).
2)Reviews API — real sharhlar (rating, sharh matni, sana).
3)Webhook (on-demand revalidation) — 1C‘da narx/qoldiq/tavsif o‘zgarganda Next.js serveriga signal yuborish.
4)Variant/Attribute filter API — katalogda brand/ram/rang/narx bo‘yicha filtr uchun qidiruv (hozir all_product butun massiv qaytaradi — katta baza uchun bu yetarli emas, server-side filter/pagination kerak).
5)Image host — rasmlar hozir i.ibb.co (tashqi, sekin, ishonchsiz). Production uchun o‘z/CDN rasm serveri kerak.


### 3.4. Kesh / revalidation strategiyasi (SEO hujjatlaridan)
- **On-demand revalidation** afzal: 1C‘da o‘zgarish → webhook → Next.js → aynan o‘sha sahifa keshi yangilanadi.
- **Gibrid model:** inventory/price uchun **qisqa TTL**, kontent uchun **uzun TTL**, muhim o‘zgarishda on-demand invalidation.
- `revalidate: 120` (har 2 daqiqa) 10–50 ming mahsulot uchun xavfli — 1C‘ni ortiqcha yuklaydi.
- `lastmod` faqat sezilarli o‘zgarishda yangilanadi (narx, availability, description, asosiy rasm, category). Har soat “hozir” qo‘yilmaydi.
- Qachon yangilash: narx, availability, description, asosiy rasm, category o‘zgarganda.

---

## 4. URL va i18n ARXITEKTURASI

### 4.1. Til va URL
- Boshdan ikki tilli: `/uz/...` va `/ru/...`.
- Til almashtirgich har doim **joriy sahifaning boshqa til versiyasiga** olib boradi (UZ ↔ RU).
- Til o‘zgarganda faqat matn emas — URL, H1, title, description, mahsulot nomi, kategoriya nomi, breadcrumb, SEO text, structured data barchasi o‘zgaradi.

### 4.2. Mahsulot URL qoidasi
- **1 mahsulot = 1 barqaror canonical URL.**
- Kategoriya ierarxiyasini URL’ga haddan tashqari qattiq bog‘lamaslik:
  - Yaxshi: `/p/samsung-galaxy-s25-256gb` yoki `/telefonlar/samsung/galaxy-s25` (chuqurligi makul).
  - Yomon: `/product?id=842731`, `/electronics/phones/smartphones/android/samsung/galaxy/s25/256gb`.
- Slug o‘zgarsa — eski URL **301 redirect** bilan yangiga o‘tkaziladi, yo‘qotilmaydi.

### 4.3. Faceted navigation / filter URL siyosati (kritik SEO)
Filter + sort + pagination + query parameter → minglab URL yaratadi. Alohida indekslash siyosati kerak:
- **Index qilinadi** (SEO qiymatli): `/telefonlar/samsung`, kategoriya, brend, maqul landing’lar.
- **Crawl qilinadi, lekin noindex / canonicalizatsiya qilinadi**: `?brand=x&color=y&sort=price` kabi navfigatsiya kombinatsiyalari.
- **Umuman crawl qilinmaydi** (robots): savatcha, checkout, login, internal search, admin.
- UI filter komponenti (nuqs) va SEO URL siyosati **bir-biridan alohida** boshqariladi.

---

## 5. DATA MODEL (Zod schema’lar — Faza 0)
API javoblarini Zod bilan validatsiya qilinadi. Asosiy modellar:
- `Product` (uz/ru bloklari, attributes, related, recommended).
- `Category` (id, group_uz/ru, slugs, parent_id — flat → frontend’da rekursiv tree’ga).
- `Brand`, `Manufacturer`, `Country`.
- `Unit` (unit_uz/ru).
- (Keyingi) `Price`, `Stock`, `CartItem`, `Order`, `Review`, `User`.

> Kategoriyalar API‘dan **yassi (flat)** keladi — menyu (sidebar/mega-menu) uchun `id`+`parent_id` bo‘yicha **rekursiv funksiya** bilan tree’ga to‘planadi.

---

## 6. SAHIFA TUZILMASI (Web_Design rejasi asosida)

Sayt 3 katta qismga ajraladi:
- **PUBLIC E-COMMERCE** (indekslanadi): Bosh sahifa, Katalog, Kategoriya, Brend, Mahsulot, Qidiruv, Aksiya, Top mahsulotlar, Blog/Guide, Kompaniya, Filiallar, Yetkazib berish, To‘lov, Qaytarish, Kontaktlar.
- **USER AREA** (indekslanmaydi): Kirish/ro‘yxat, Profil, Sevimlilar, Buyurtmalar, Buyurtma tafsiloti.
- **SHOPPING** (indekslanmaydi): Savatcha, Checkout, Yetkazib berish, To‘lov, Tasdiqlash.

### 6.1. Asosiy sahifalar va ularning talablari
- **Bosh sahifa:** HEADER → PROMO NAV → HERO → KATEGORIYALAR → TOP MAHSULOTLAR → CHEGIRMALAR → MASHHUR → BRENDLAR → AFZALLIKLAR → ISHONCH/REVIEW → BLOG/GUIDE → KOMPANIYA → FOOTER. (SEO maqolaga aylantirilmaydi.)
- **Kategoriya sahifasi:** Breadcrumb + H1 + qisqa intro + sub-guruhlar + brendlar + filter/sort + product grid + pagination + buying guide + FAQ + internal links.
- **Brend sahifasi:** Breadcrumb + brend logo + H1 + brend haqida + mashhur kategoriyalar + mahsulotlar + brend bo‘yicha filter + tavsiyalar + FAQ. (Brand → Category → Product ichki linking.)
- **Product Detail Page (ENG MUHIM):** Breadcrumb → Product hero → Title → Rating/Reviews → Price → Availability → Variantlar → Buy button → Delivery/Payment → Description → Tech specs → Advantages → FAQ → Reviews → Similar → Recommended → Recently viewed. Mobil’da sticky CTA.
- **Qidiruv:** autocomplete (mahsulot/kategoriya/brend). Internal search URL odatda indekslanmaydi.
- **Cart / Checkout / Order detail / User area** — minimal, indekslanmaydigan UI.
- **404:** “Topilmadi” + bosh sahifa/katalog/qidiruv havolalari + mashhur mahsulotlar. O‘chirilgan mahsulot boshqa mahsulotga tasodifiy aylantirilmaydi.

### 6.2. Design System komponentlari
Button, Input, Select, Search, Modal, Drawer, Badge, Breadcrumb, Pagination, Tabs, Accordion, **ProductCard**, ProductGallery, Price, Rating, ReviewCard, CategoryCard, BrandCard, Banner, Toast, Loader, Skeleton, EmptyState, ErrorState.

**ProductCard qoida:** nomi crawlable `<a>` link bo‘ladi; API dan ma’lumot kelmasa `undefined`/bo‘sh joy chiqmaydi (rating yo‘q bo‘lsa rating blok umuman yashirinadi).

---

## 7. SEO ARXITEKTURASI (Marketing_va_SEO asosida)

### 7.1. Yakuniy model (2026)
```text
1C/API → Next.js server → SEO Product Page → Product Schema + Metadata + Canonical
→ Dynamic Sitemap → Google Search + Google Shopping → Bing + Copilot → AI Search / AI Overviews / AI Mode
```

### 7.2. Technical SEO checklist (ishga tushirishdan oldin — barchasi ✅ bo‘lishi kerak)
HTTPS · Canonical · Dynamic title · Dynamic description · H1 · Structured Data · Product schema · Product variants · Breadcrumb · XML Sitemap · Robots.txt · 404 · 301 · Internal linking · Image SEO · Mobile UX · Core Web Vitals · Google Search Console · Bing Webmaster Tools · Merchant Center · IndexNow · Reviews · FAQ · Unique category content · Unique product value · Filter URL control · Pagination control · Out-of-stock strategy · Multilingual/hreflang.

### 7.3. Ko‘p tilli SEO (uz/ru)
- Har bir mahsulot 2 tilda alohida URL.
- `hreflang="uz"`, `hreflang="ru"`, + `x-default` (fallback). Har bir til versiyasi **o‘zini ham** ro‘yxatga qo‘shadi (reciprocal). Canonical — o‘sha tilning o‘zidagi URL.
- Kontent haqiqatdan ham o‘sha tilda bo‘lishi kerak (aks holda “dublikat”).
- O‘zbek keyword research: lotinch o‘zbekcha, kirillcha o‘zbekcha, ruscha, model/SKU, xalq yozuvlari, xatoli yozuvlar.

### 7.4. Structured data (Schema.org / JSON-LD)
- `Product` (va `ProductVariant`), `BreadcrumbList`, `Organization`, `FAQPage`, `Review/AggregateRating`, `Store` (filiallar), `HowTo` (guide’lar uchun).
- 2026-yil 7-iyul: `Product.category` endi `Text` + `CategoryCode` qabul qiladi; `Sale` uchun `validFrom/validThrough/priceValidUntil` qo‘shildi; kategoriya matni < 750 belgi.
- Structured data = ranking kafolati **emas**, lekin rich result/merchant ko‘rinishiga mos kelish imkonini oshiradi.

### 7.5. Sitemap + robots
- **Dynamic segmented sitemap**: bosh sahifa, kategoriya, mahsulot, brend, blog/faq, filial.
- Sitemap’ga **kiritilmaydi**: filter URL, sort URL, cart, account, login, checkout, internal search, duplicate.
- `lastmod` faqat sezilarli o‘zgarishda.
- **robots.txt**: admin/account/checkout/private API bloklanadi; faqat mahsulot/katalog ochiq.
- **IndexNow** (Bing/Yandex): yangi/o‘zgargan URL’ni bir soniyada bildirish.

### 7.6. Status kodlar va out-of-stock
- mavjud → `200`; butunlay o‘chirilgan → `404` yoki `410`; boshqa URL’ga ko‘chgan → `301`.
- Vaqtincha tugagan mahsulot **404 qilinmaydi**: `200` + Schema `OutOfStock` + o‘xshash modellar tavsiyasi (nufuz yo‘qolmasligi uchun).
- Soft-404 (o‘chirilgan mahsulotni 200 bilan bo‘sh sahifada qoldirish) — xavfli, qilinmaydi.

### 7.7. Kontent sifat / AI Search
- Mahsulot tavsifi copy-paste bo‘lmaydi: API text = asos; ustiga o‘z izohlar + taqqoslash + foydalanish holatlari + FAQ + afzallik/kamchilik.
- Kategoriya/brend sahifalari foydali kontekstli (faqat grid emas).
- AI orqali minglab bir xil foydasiz maqola = scaled content abuse (xavfli). AI = yordamchi.
- **llms.txt** (`https://llmstxt.org/`) va `schema.org/Product` mosligi; `developers.google.com/search/updates` kuzatiladi.
- AI Overviews 2025→2026: so‘rovlarning ~48%ida ko‘rinadi; citatsiya reytingdan muhimroq bo‘lib bormoqda.

---

## 8. MARKETING / LOCAL SEO / BAZAR INTEGRATSIYALARI

### 8.1. Google Merchant Center
- Free product listings (2026). Feed ma’lumotlari: id, title, description, link, image, price, availability, brand, GTIN/MPN, condition, shipping, returns, country, language, variantlar.
- Landing page tili = data source tili mos kelishi kerak (aks holda disapproval).
- `Google → 1C` emas: API → Next.js → structured data → Merchant Center sinxron.

### 8.2. Yandex
- **YML fayl** (1C/baza → YML) → Yandex Webmaster “Tovarlar va takliflar”.
- Yandex Webmaster: hudud (O‘zbekiston/Toshkent), **Yandex Biznes/Kartalar** (jismoniy manzil, +998 telefon, ish vaqti, fotos).
- **Yandex Metrika + Vebvizor**: konversiya maqsadlari (savatga qo‘shish, xarid, qo‘ng‘iroq) + foydalanuvchi harakati tahlili.
- **robots.txt** `clean=` parametri (filter/sort URL’larini tozalash).
- SSR muhim (Yandex JS orqali yuklanuvchini qiyin o‘qiydi).
- **Baden-Baden algoritmi**: kategoriya ostiga faqat kalit so‘zli “Toshkentda arzon…” matn yopishtirib qo‘ymaslik.
- Tezkor havolalar (Быстрые ссылки), favicon, Schema mikroformatlari.

### 8.3. Local SEO (jismoniy do‘kon)
- **Google Business Profile**: yuridik nom, telefon, manzil, ish vaqti, xarita, filiallar, local inventory, local landing pages.
- Filial sahifalari: `/uz/stores/tashkent`, `/uz/stores/samarkand` — manzil, telefon, ish vaqti, xarita, xizmatlar, yetkazib berish hududi.
- STIR/INN, yuridik nom, bank rekvizitlari, refund/return policy, yetkazib berish, to‘lov turlari sahifalari.

### 8.4. To‘lov usullari (saytda ko‘rsatiladi)
Naqd pul, bank kartasi, terminal, milliy tizimlar (Payme, Click, Uzum), yuridik shaxslar uchun hisob-faktura.

### 8.5. Ijtimoiy tarmoqlar
- Instagram, Telegram (kanal/bot) — aloqa va marketing kanallari.

---

## 9. ISHLAB CHIQISH BOSQICHLARI (FAZALAR — TARTIB BILAN)

> Quyidagi ketma-ketlik dizayn (51-bo‘lim) va SEO (10 ustuvor vazifa) hujjatlarini birlashtiradi. Har bir fazaning “tayyorlik belgisi” (definition of done) bor.

### FAZA 0 — Fond va tayyorgarlik
**Maqsad:** poydevor, repo, stack, i18n, API ulanishi.
- Repo tuzilmasi, git branch strategiyasi, CI/CD (Vercel).
- Next.js 16.3 + React 19 + TS + Tailwind 4 + shadcn/Base UI loyihani create qilish.
- next-intl sozlash (`/uz`, `/ru`, localized routing, x-default).
- Zod schema’lari (Product, Category, Brand, Unit).
- 1C API ulanish: Basic Auth (env’da, server-only), base URL, rate limit, retry.
- API client (units, categories, brands, all_product, product).
- **Backend’dan kerakli API’lar so‘rashi** (Price, Stock, Cart, Order, Review, User, Webhook) — §3.3.
- Design System boshlanishi: colors, typography, spacing, radius, shadows tokens.
- **Tayyorlik belgisi:** dev server ishlaydi, ikki til o‘tadi, API‘dan bitta mahsulot + kategoriyalar real ma’lumot bilan chiqadi.

### FAZA 1 — Global layout va navigatsiya
**Maqsad:** butun saytdagi “qobiq”.
- Header (desktop + mobil), Logo, Katalog, Qidiruv, Kirish, Sevimlilar, Savat (son bilan), Til (UZ↔RU).
- **Mega Menu** (kategoriya + subkategoriya + mashhur brend + mashhur mahsulot).
- Promo nav (Arzon narxlar / Mashhur / Chegirmalar / Top / Yangi).
- Footer (katalog, kompaniya, mijozlar, yordam, telefon/email/manzil, UZ|RU).
- Mobil sticky bottom navigation.
- **Tayyorlik belgisi:** har ikki tilda header/menu/footer to‘g‘li ishlaydi, mobil’da qulay.

### FAZA 2 — Katalog, kategoriya, brend (DISCOVER)
**Maqsad:** mahsulotlarni topish va ko‘rsatish.
- Bosh sahifa (blok tuzilmasi §6.1).
- CategoryCard / BrandCard / ProductCard (Design System).
- Kategoriya sahifasi (faceted navigation: filter + sort, URL state — nuqs).
- Brend sahifasi (Brand → Category → Product linking).
- Search (autocomplete: mahsulot/kategoriya/brend).
- Pagination (SEO’ga mos, noindex siyosati bilan).
- Filter URL vs SEO siyosati (§4.3).
- Loading/Empty/Error holatlar + Skeleton.
- **Tayyorlik belgisi:** kategoriya va brend sahifalari filter/sort bilan ishlaydi; filter kombinatsiyalari noindex.

### FAZA 3 — Product Detail Page (BUY — eng muhim)
**Maqsad:** xarid qilishga tayyor mahsulot sahifasi.
- Product hero (rasm gallery + video bo‘lsa).
- Title (H1), Rating/Reviews, **Price (dynamic, Price API)**, **Availability (dynamic, Stock API)**, Variantlar.
- Add to cart / Hozir sotib olish (client), mobil sticky CTA.
- Description, Tech specs (jadval, tabs/accordion), Advantages, FAQ, Reviews.
- Related (o‘xshash) / Recommended (birga olinadi) / Recently viewed — alohida bloklar.
- Server/Client chegarasi (§2.2), Product structured data (JSON-LD).
- **Tayyorlik belgisi:** mahsulot sahifasi server-rendered, schema o‘rinli, price/stock dinamik, mobil’da sticky CTA.

> **Bog‘liqlik:** Faza 3 to‘liq ishlashi uchun Price + Stock API kerak (§3.3). Yo‘q bo‘lsa — placeholder bilan dev’da davom etiladi, lekin production’da majburiy.

### FAZA 4 — Xarid oqimi (Cart / Checkout / User)
**Maqsad:** savat → buyurtma → tasdiq.
- Cart (oddiy, jami hisob).
- Checkout (qisqa multi-step yoki bitta sahifa; majburiy registratsiya qilinmaydi).
- To‘lov (naqd/karta/Payme/Click/Uzum), yetkazib berish, tasdiqlash.
- User area: Kirish/ro‘yxat, Profil, Sevimlilar, Buyurtmalar, Buyurtma tafsiloti (status timeline), Manzillar.
- **Bog‘liqlik:** Cart/Checkout/Orders/User/Auth API (§3.3).
- **Tayyorlik belgisi:** savatdan buyurtma tugunigacha to‘liq oqim ishlaydi.

### FAZA 5 — SEO qatlami
**Maqsad:** saytni qidiruv tizimlari uchun tayyor.
- Dynamic metadata (har bir mahsulot/kategoriya/brend uchun individual title+description).
- Canonical + hreflang (uz/ru + x-default) + reciprocal self-links.
- Breadcrumb (UI + BreadcrumbList schema).
- Structured data (Product, ProductVariant, Organization, FAQ, Review, Store, HowTo).
- Dynamic segmented sitemap + robots.txt + IndexNow.
- 404/301/soft-404 + out-of-stock strategiyasi.
- Image SEO (alt, WebP/AVIF, responsive, crawlable URL).
- **Tayyorlik belgisi:** GSC’da crawl/index signal keladi; schema validator‘da xatolar yo‘q; sitemap faqat canonical URL‘lar.

### FAZA 6 — Kontent va Local SEO / Marketing
**Maqsad:** ishonch + mahalliy + bazar.
- Original kontent: kategoriya/brend tavsiflari, buying guide, blog, taqqoslash, FAQ (foydali, takrorlanmagan).
- Company page (biz haqimizda, tarix, jamoa, manzil, telefon, ish vaqti, xarita).
- Filial / local landing pages (`/stores/...`).
- Yetkazib berish / To‘lov / Qaytarish / Kafolat / Maxfiylik / Shartlar sahifalari.
- Google Business Profile + Local Inventory.
- Google Merchant Center feed (free listings).
- Yandex: YML feed, Webmaster, Yandex Biznes, Metrika+Vebvizor, robots `clean=`.
- Instagram / Telegram kanallari.
- **Tayyorlik belgisi:** Merchant Center feed ma’qullangan; Yandex‘da tovarlar ko‘rinadi; GBP to‘ldirilgan.

### FAZA 7 — Performance va monitoring
**Maqsad:** tezlik + doimiy kuzatuv.
- Core Web Vitals: LCP < 2.5s, INP < 200ms, CLS < 0.1.
- Rasmlar (Next Image, WebP/AVIF, responsive, o‘lcham oldindan), font sonini cheklash, keraksiz JS/animatsiyani kamaytirish, mobile’da og‘ir komponentni kechiktirish.
- Caching review (hybrid TTL + on-demand revalidation webhook).
- GA4 + Vercel Analytics + Speed Insights.
- GSC + Bing Webmaster + Merchant Center + SEO monitoring (indexed/not indexed/soft 404/CTR/rich results/merchant listings/AI search visibility).
- **Tayyorlik belgisi:** CWV “Good”; monitoring panel ishlaydi; webhook test qilingan.

### FAZA 8 — Test va Launch
**Maqsad:** xavfsiz ishga tushirish.
- Playwright e2e (asosiy xarid oqimi, ikki til, filter/search).
- Pre-launch SEO technical checklist (§7.2 — barchasi ✅).
- Launch (Vercel).
- Post-launch: GSC/Bing/Merchant Center monitoring, IndexNow, CWV kuzatuv.
- **Tayyorlik belgisi:** barcha checklist ✅, e2e yashil, production’da live.

---

## 10. USTUVORLIK VA KETMA-KETLIK (agar hammasini birdan bo‘lsa)

SEO hujjatlaridagi **10 ustuvor vazifa** (tartibli):
1. SEO-friendly URL arxitekturasi.
2. Server-rendered product/category sahifalar.
3. Dynamic metadata.
4. Canonical + filter/indexing strategiyasi.
5. Product structured data.
6. Dynamic sitemap + robots.
7. Google Merchant Center.
8. Original product/category kontent.
9. Core Web Vitals + mobile performance.
10. Search Console + Bing Webmaster Tools doimiy monitoring.

**Bosh rejaga bog‘lash:**
- 1–4 → Faza 0–3 (URL, server-render, metadata, filter siyosati).
- 5 → Faza 3 + Faza 5.
- 6 → Faza 5.
- 7 → Faza 6.
- 8 → Faza 6.
- 9 → Faza 7.
- 10 → Faza 7–8.

---

## 11. ENG KATTA XATOLAR (SAQLANISH KERAK)

**Arxitektura:**
- Browser ochildi → JS → API → HTML ni asosiy SEO mexanizmi qilish.
- Google/Bing/Yandex’ni to‘g‘ridan-to‘g‘ri 1C transactional API‘ga olib borish.
- `revalidate: 120` ni katta baza uchun umumiy qoida qilish.

**SEO (e-commerce’da 10 katta xato):**
1. Barcha mahsulotlarda bir xil `title`.
2. Barcha mahsulotlarda bir xil `description`.
3. Faqat ishlab chiqaruvchi copy-paste tavsifi.
4. Har bir filter kombinatsiyasini index qildirish.
5. Sitemap’ga yuz minglab keraksiz URL qo‘shish.
6. O‘chgan mahsulotni 200 bilan bo‘sh sahifada qoldirish (soft-404).
7. Fake review / fake rating.
8. Keyword stuffing.
9. AI orqali minglab bir xil foydasiz maqola (scaled content abuse).
10. Faqat Google’ga qarab, Bing/Copilot/AI Search’ni hisobga olmash.

---

## 12. OCHIQ SAVOLLAR / HARAKATLAR (DECISIONS)

| # | Savol / harakat | Kimga | Holat |
|---|-----------------|-------|-------|
| 1 | Price API (narx, eski narx, valyuta, muddat) endpoint | Backend/1C | ⏳ kerak |
| 2 | Stock/Availability API endpoint | Backend/1C | ⏳ kerak |
| 3 | Cart/Checkout/Orders API | Backend/1C | ⏳ kerak |
| 4 | User/Auth/Profile/Reviews API | Backend/1C | ⏳ kerak |
| 5 | On-demand revalidation webhook (1C→Next.js) | Backend/1C | ⏳ kerak |
| 6 | Server-side filter/pagination (all_product butun massiv katta baza uchun yetarli emas) | Backend/1C | ⏳ kerak |
| 7 | Production image host/CDN (hozir `i.ibb.co`) | Dizayn/Ops | ⏳ kerak |
| 8 | Mahsulot soni (10k? 50k?) — kesh/filter strategiyasiga ta’sir | Biznes | 10k(aniqlandi) |
| 9 | Real jismoniy do‘kon/filial borligi (Local SEO uchun) | Biznes | bor (keginroq kiritiladi) |
| 10 | To‘lov integratsiyasi (Payme/Click/Uzum) API | Backend/To‘lov | ⏳ kerak |
| 11 | Domain + HTTPS (sora.uz) | Ops | ❓ aniqlansin |
| 12 | Keyword research (uz lotin/kirill, ru, model) | Marketing | ⏳ kerak |

---

## 13. HUZMATLAR RO‘YXATI (har bir fazada qaysi hujjat ishlatiladi)

| Faza | Asosiy hujjat(s) |
|------|------------------|
| 0 | Texnalogiya/Muhim.md, Api/* |
| 1 | Web_Design/reja §4–6, §35 |
| 2 | Web_Design §12–15, §36; SEO §2 (faceted navigation) |
| 3 | Web_Design §16–23, §49; SEO §5 (structured data), §3 (out-of-stock) |
| 4 | Web_Design §29–32 |
| 5 | SEO.md + 1–9 qismlar (barchasi) |
| 6 | Marketing_va_SEO §8, Yandex_Instagram_telegram.md |
| 7 | SEO §1 (CWV), §7 (monitoring); Texnalogiya |
| 8 | SEO §9 (checklist) |

---

## 14. YAKUN

Sora.uz uchun eng katta imkoniyat — 1C/API ma’lumotlarini Next.js orqali **Google/Bing/Yandex/Copilot/AI Search** uchun semantik, server-rendered, structured va doimiy yangilanuvchi **product ecosystem**ga aylantirish.

Dizayn, UX, API arxitekturasi va SEO bu yerda bir-biriga qarshi emas — ular **bitta tizim** sifatida ishlaydi:

```text
Foydalanuvchi uchun foydali + API’ga mos + tez + mobile-friendly
+ crawlable + semantic + structured + ichki linking bilan bog‘langan
```

**Keyingi qadam:** §3.3 va §12’dagi ochiq API’lar (Price, Stock, Cart, Order, Review, User, Webhook) backend’dan so‘raladi va §9 FAZA 0 boshlanadi.
