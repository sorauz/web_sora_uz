# Sora.uz Veb-Saytini Tezlashtirish Bo‘yicha Takomillashtirilgan Texnik Audit va Harakatlar Rejasi

> **Yangilangan sana:** 2026-11-19 (commit `898f602` — 1C `/all_product` qisqartirilgan JSON deploy’idan keyin)  
> **O‘rganilgan muhit:** Production (`https://sora.uz`) jonli TTFB / Edge Cache / `x-vercel-id` o‘lchovlari + loyiha manba kodi auditi

---

## 1. So‘nggi O‘zgarish Natijasi (Oldin vs Hozir — Jonli O‘lchovlar)

1C `/all_product` endpointidagi kalitlar qisqartirilishi (`sku`, `pic`, `up_date`, `alt_uz`, `alt_ru`) natijasida javob hajmi **`2 105 791` baytdan (`2.01 MB`) → `1 452 905` baytga (`1.38 MB`)** tushdi va Next.js 2 MB Data Cache qayta ishga tushdi.

Bu birgina qadamning o‘zi production saytda quyidagi keskin o‘sishni berdi:

| Sahifa / Endpoint | Oldin (2.01 MB, keshsiz) | Hozir (1.38 MB, Data Cache ON) | O‘zgarish | Vercel Cache / Region (`x-vercel-id`) |
| :--- | :---: | :---: | :---: | :--- |
| `/uz` (Bosh sahifa) | 1 735 ms | **1 353 ms** (`67.3 KB`) | **1.3× tezroq** | `PRERENDER` (`arn1`) |
| `/uz/catalog` | 3 642 ms | **864 ms** (`48.7 KB`) | **4.2× tezroq** | `MISS` · `private, no-store` (`arn1::iad1`) |
| `/uz/category/yozuv-qurollari` | 3 749 ms | **699 ms** (`49.6 KB`) | **5.4× tezroq** | `MISS` · `private, no-store` (`arn1::iad1`) |
| `/uz/products/deli-e1589-...` (PDP) | 8 586 ms | **779 ms** (`58.5 KB`) | **11.0× tezroq** | `MISS` (`arn1::iad1`) |
| `/uz/search?q=deli` | 5 570 ms | **583 ms** (`47.6 KB`) | **9.5× tezroq** | `MISS` · `private, no-store` (`arn1::iad1`) |
| `/api/search/suggestions?q=deli` | — | **800 ms** (`0.7 KB`) | — | `MISS` · `public` (`arn1::iad1`) |

### Asosiy xulosa (Hozirgi to‘siqlar qayerda?)
1. **1C 2 MB muammosi vaqtincha hal qilindi**, lekin bu **doimiy emas**: 1 930 ta mahsulot = `1.45 MB` (~`753` bayt/mahsulot), ya’ni katalog **`~2 780` ta mahsulotga** yetgan kuni (yana ~850 ta mahsulot qo‘shilsa) Next.js 2 MB limiti yana buziladi.
2. **Hozirgi eng katta sekinlashtiruvchi omil — geografiya (`arn1::iad1`) va Edge CDN `MISS`:**  
   Jonli `x-vercel-id: arn1::iad1` sarlavhasi isbotladiki, O‘zbekistondan kelgan so‘rovlar **Stokgolm (`arn1`) → Atlantika okeani osha Vashington, AQSh (`iad1`) → orqaga Stokgolm → Toshkent** yo‘nalishida aylanib yuribdi! Har bir dinamik sahifa va qidiruv so‘rovi shu sababli `580–860 ms` yo‘qotmoqda.

---

## 2. Ustuvorlik Bo‘yicha Takliflar (Shaffof Reja: P0 → P3)

---

### P0 — KRITIK (Dinamik sahifalarni 600–860 ms → 100–250 ms ga tushiradi)

#### 1. Vercel Serverless Function mintaqasini AQSh (`iad1`) dan Yevropa/Yaqin Sharq (`fra1` / `dxb1`) ga o‘tkazish
- **Jonli dalil:** Barcha dinamik sahifalarda `x-vercel-id: arn1::iad1::...` qayd etildi (`vercel.json` da mintaqa ko‘rsatilmagan).
- **Yechim:**  
  `vercel.json` ga `"regions": ["fra1"]` (Frankfurt) yoki `"dxb1"` (Dubay) qo‘shish (va Vercel Dashboard → Settings → Functions → Function Region’da tasdiqlash).
- **Kutiladigan natija:** Transatlantik ping (`~300–450 ms`) butunlay yo‘qoladi; katalog, kategoriya, qidiruv, autocomplete, checkout va 1C API chaqiruvlari **2–3 barobar tezlashadi**.

---

#### 2. `/uz/catalog` va `/ru/catalog` sahifalarini `ƒ (Dynamic)` dan `PRERENDER` (ISR) ga o‘tkazish *(Yangi topilma)*
- **Aniqlangan muammo:**  
  `src/app/[locale]/catalog/page.tsx` (44–61-qatorlar) faqatgina eski `?offer=promotions` / `?badge=sale` query havolalarini yo‘naltirish uchun `await searchParams` ni o‘qimoqda. Bitta shu sababdan butun katalog sahifasi Next.js tomonidan `ƒ (Dynamic)` (`private, no-cache, no-store`, `x-vercel-cache: MISS`, **864 ms**) qilib qo‘yilgan!
- **Yechim:**  
  `?offer=` / `?badge=` redirect qoidalarini `src/proxy.ts` (yoki `next.config.ts` `redirects()`) ga ko‘chirib, `CatalogPage` dan `searchParams` ni olib tashlash va `export const revalidate = 86400` qo‘yish.
- **Kutiladigan natija:** `/uz/catalog` va `/ru/catalog` bir zumda `PRERENDER` (`x-vercel-cache: HIT`) ga o‘tadi: **864 ms → ~120–180 ms**.

---

#### 3. Kategoriya, Brend va Mahsulot sahifalarida haqiqiy ISR / Edge CDN keshini yoqish
- **Aniqlangan muammo:**
  - `category/[slug]` va `brand/[slug]` da `searchParams` o‘qilgani uchun `next.config.ts` dagi `Cache-Control: public, s-maxage=600` bekor qilinib, brauzerga `private, no-cache, no-store` (`MISS`, **699 ms**) ketmoqda.
  - `products/[slug]/page.tsx` da `export const revalidate = 86400` aniq yozilmagan va `generateStaticParams` faqat birinchi **20 ta** mahsulotni oldindan quradi (qolgan 1 910 ta mahsulot birinchi kirishda `MISS` — **779 ms**).
- **Yechim:**
  1. `products/[slug]/page.tsx` ga `export const revalidate = 86400` qo‘shish va `generateStaticParams` qamrovini top **100–200 ta** eng ko‘p kiriladigan mahsulotga kengaytirish.
  2. Asosiy kategoriya va brend sahifalarining filtrsiz ko‘rinishini ISR (statik kesh + `generateStaticParams`) bilan berish, filtr/saralashni esa client-side yoki keshlangan API orqali boshqarish.
- **Kutiladigan natija:** Kategoriya, brend va mahsulot sahifalarida `x-vercel-cache: HIT`, TTFB **700–800 ms → 100–200 ms**.

---

#### 4. Bitta sahifa so‘rovida 1C metodlarini `React.cache()` bilan deduplikatsiya qilish
- **Aniqlangan muammo:**  
  Mahsulot sahifasida (`products/[slug]/page.tsx`) `generateMetadata()` ham, `ProductDetailPage()` ham `api.getProductBySlug()` va `api.getAllProducts()` ni ketma-ket **3 marta** chaqiradi. Har safar Zod `AllProductsResponseSchema.safeParse()` barcha 1 930 ta mahsulot ustidan 3 marta qayta yugurib, CPU vaqti (100–200 ms) sarflaydi.
- **Yechim:**  
  `src/lib/api/client.ts` dagi `getAllProducts`, `getCategories`, `getBrands`, `getPrices`, `getProductById`, `getProductBySlug` funksiyalarini `cache()` (`from "react"`) bilan o‘rash.
- **Kutiladigan natija:** Har bir so‘rovda Zod validatsiya va `fetch` faqat **1 marta** bajariladi (server CPU sarfi 3× kamayadi).

---

### P1 — YUQORI TA’SIR (Uzoq muddatli barqarorlik, Qidiruv tezligi va Mobile PageSpeed)

#### 5. `/all_product` 2 MB chegarasidan kelajakda oshib ketishiga qarshi doimiy himoya *(Yangilangan baho)*
- **Hozirgi zaxira:** `1 930` ta mahsulot = `1.45 MB` → **`~2 780` ta mahsulotda 2 MB limiti yana to‘ladi!**
- **Doimiy yechim (2 ta yo‘l):**
  1. **1C tomonida:** `/all_product` javobida HTTP `gzip` siqishni yoqish yoki pagination (`?page=1&limit=1000`) qo‘shish.
  2. **Next.js tomonida:** `getAllProducts()` ichida natijani 2–3 ta kichik bo‘lakda `unstable_cache` (yoki in-memory LRU + `tags: ["all-products"]`) orqali saqlash — shunda katalog 5 000–10 000 mahsulotga o‘sganda ham 2 MB chekloviga hech qachon urilmaydi.

---

#### 6. Qidiruv Autocomplete (`/api/search/suggestions`) keshini tuzatish *(Yangi topilma)*
- **Jonli dalil:** `GET /api/search/suggestions?q=deli&locale=uz` hozir **800 ms**, `x-vercel-cache: MISS` va javob sarlavhasida faqat `cache-control: public` (ya’ni `s-maxage=3600` yo‘qolib qolgan!).
- **Yechim:**
  1. `src/app/api/search/suggestions/route.ts` javobiga `Vercel-CDN-Cache-Control: public, s-maxage=3600, stale-while-revalidate=86400` sarlavhasini qo‘shish.
  2. `SearchAutocomplete.tsx` da client-side `Map` keshi (bir sessiyada avval qidirilgan so‘zni qayta serverga yubormaslik) va `250–300 ms` debounce + `AbortController` ni tekshirish.
- **Kutiladigan natija:** Qidiruv tavsiyalari chiqishi **800 ms → < 80 ms** (`HIT`).

---

#### 7. Analitika skriptlarini (`YandexMetrika` + `GoogleAnalytics`) kechiktirib yuklash
- **Aniqlangan muammo:**  
  `YandexMetrika.tsx` va `GoogleAnalytics.tsx` da `strategy="afterInteractive"` ishlatilgan, Yandex Metrika’da esa `webvisor: true` + `clickmap: true` yoqilgan. WebVisor brauzerning asosiy oqimini (Main Thread / TBT / INP) kuchli yuklaydi.
- **Yechim:**
  - Ikkala skriptni `strategy="lazyOnload"` ga o‘tkazish.
  - Agar sessiya video-yozuvi doimiy shart bo‘lmasa, `webvisor: false` qilish (yoki faqat kerakli vaqtda yoqish).
- **Kutiladigan natija:** Mobile PageSpeed Performance **+15–25 ball**, TBT va INP keskin yaxshilanadi.

---

#### 8. Og‘ir modallarni `next/dynamic` (lazy-load) ga o‘tkazish
- **Aniqlangan muammo:**
  - `Header.tsx` har bir sahifada `AuthModal` (~680 qator), `OrderTrackerModal` va `MobileSearchModal` ni statik import qiladi.
  - `CheckoutForm.tsx` da `LocationPickerModal` (xarita/Leaflet) va `CheckoutOtpModal` ham statik import qilingan.
- **Yechim:**  
  Ushbu modallarni `next/dynamic(() => import(...), { ssr: false })` orqali **faqat ochilganda** yuklanadigan qilish.
- **Kutiladigan natija:** Barcha sahifalarda boshlang‘ich JS bundle va hydration vaqti qisqaradi.

---

#### 9. `Header` da `GET /api/auth/me` so‘rovini sessiya bo‘yicha 1 martaga cheklash
- **Aniqlangan muammo:**  
  `Header.tsx` (46–49-qatorlar) har safar mount bo‘lganda `checkAuth()` chaqiradi; `useAuthStore` dagi `isInitialized` tekshirilmagani uchun mehmon foydalanuvchilarda ham ortiqcha `/api/auth/me` so‘rovlari ketadi.
- **Yechim:**  
  `useAuthStore.checkAuth()` boshida `if (get().isInitialized) return;` qo‘shish.
- **Kutiladigan natija:** Navigatsiyada keraksiz serverless chaqiruvlar yo‘qoladi.

---

### P2 — O‘RTA TA’SIR (Frontend ravonligi, RSC Payload hajmi va LCP rasmlari)

#### 10. `ProductCard` da atomik Zustand selectorlari + `toCardProduct` ni barcha sahifalarga yoyish *(Kengaytirilgan)*
- **Aniqlangan muammo:**
  1. `ProductCard.tsx` (33–35-qatorlar) butun `useCartStore()`, `useFavoritesStore()`, `useCompareStore()` obyektlariga obuna bo‘lgan — 1 ta mahsulot savatchaga qo‘shilsa sahifadagi barcha 24–40 ta kartochka qayta render bo‘ladi.
  2. `toCardProduct()` (og‘ir maydonlarni kesish) hozir faqat bosh sahifada (`page.tsx:93`) bor; `catalog`, `category/[slug]`, `brand/[slug]` va `products/[slug]` (`relatedProducts`/`recommendedProducts`) da esa to‘liq obyektlar Client Component’ga uzatilmoqda.
- **Yechim:**
  - `ProductCard` da har bir store’dan faqat `product.id` bo‘yicha selektor olish.
  - Umumiy `toCardProduct()` funksiyasini barcha ro‘yxat sahifalari va PDP tavsiyalarida ishlatish.
- **Kutiladigan natija:** Savatcha/sevimlilar klik reaksiyasi (INP) `< 16 ms`; HTML/RSC hajmi 15–25% yengillashadi.

---

#### 11. `Next.js <Link>` ortiqcha avtomatik prefetch’ini tartibga solish *(Yangi topilma)*
- **Aniqlangan muammo:**  
  MegaMenu’da 50+ kategoriya linki va katalog/kategoriya sahifalarida 24–40 ta `ProductCard` linki bor. Next.js standart holda viewport’ga kirgan barcha `<Link>` larni avtomatik prefetch qilib, foydalanuvchi bosmagan o‘nlab dinamik sahifalar uchun fon RSC so‘rovlarini yuboradi (bu brauzer tarmog‘ini band qiladi va Vercel Edge/Function sarfini oshiradi).
- **Yechim:**  
  MegaMenu ichki kategoriya linklari hamda `ProductCard` da `prefetch={false}` qo‘yish (yoki faqat eng asosiy menyu tugmalarida qoldirish).
- **Kutiladigan natija:** Fon tarmoq so‘rovlari va Vercel serverless chaqiruvlari keskin kamayadi.

---

#### 12. Rasmlar, `public/` statik fayllari va `cdn.sora.uz` keshini optimallashtirish *(Kengaytirilgan)*
- **Aniqlangan muammolar:**
  1. `public/` dagi og‘ir fayllar:
     - `logo.png` — **1 144.8 KB (1.14 MB)**
     - `favicon.ico` va `for_web_logo_icon.ico` — har biri **372.1 KB** (normal hajmi 15–25 KB)
     - `hero-slide-*.png` va `hero-slide-*-transparent.png` — har biri **495–606 KB** (dublikat PNG fayllar mavjud).
  2. `ProductCard.tsx` da barcha kartochkalarda `loading="lazy"` turibdi — birinchi ekranda ko‘rinadigan 2–4 ta kartochka rasmi ham kechikib yuklanadi.
  3. `ProductGallery.tsx` (PDP asosiy rasmi) da `priority` va `fetchPriority="high"` borligini kafolatlash zarur.
  4. **`cdn.sora.uz` (Cloudflare R2) kesh sarlavhasi:** Rasmlarga `?v=20261110` versiyalash qo‘shilgani sababli Cloudflare’da `Cache-Control: public, max-age=31536000, immutable` qo‘yish mumkin — takroriy tashrifchilarda rasmlar brauzer keshidan **0 ms** da ochiladi.
- **Yechim:**
  - `favicon.ico` / `for_web_logo_icon.ico` ni `~15–25 KB` ga, `logo.png` ni SVG/WebP (`< 30 KB`) ga, Hero slayd rasmlarini WebP/AVIF ga siqish va keraksiz dublikatlarni tozalash.
  - `ProductCard` ga `priority?: boolean` prop qo‘shib, birinchi 4 ta kartochkaga `priority={idx < 4}` berish.

---

#### 13. `layout.tsx` dagi keraksiz `preconnect`, shriftlar va `Header`/`i18n` payload’ini yengillashtirish *(Kengaytirilgan)*
- **Aniqlangan muammolar:**
  1. `layout.tsx` (131–138-qatorlar):
     - `<link rel="preconnect" href="http://1cloud.uz:777" />` — keraksiz (1C faqat serverdan chaqiriladi, brauzer unga ulanmaydi).
     - `<link rel="preconnect" href="https://i.ibb.co" />` — barcha rasmlar `cdn.sora.uz` ga ko‘chgan.
     - `<link rel="preconnect" href="https://mc.yandex.ru" />` — `lazyOnload` qilingach `dns-prefetch` kifoya.
  2. `Plus_Jakarta_Sans` shriftida 5 ta weight (`400, 500, 600, 700, 800`) va 3 ta subset (`latin, latin-ext, cyrillic-ext`) yuklanmoqda — `weight` sonini 3–4 taga qisqartirish (yoki variable font) ilk yuklanishdagi font fayllarini kamaytiradi.
  3. `Header` ga uzatiladigan `categories`, `tree`, `brands` dan faqat menyuda ko‘rsatiladigan maydonlarni (`id`, `name`, `slug`, `children`) qoldirish har bir sahifaning HTML hajmini (`67.3 KB` → `~35–40 KB`) kamaytiradi.

---

### P3 — QO‘SHIMCHA (Vizual tezlik va Build optimizatsiyasi)

#### 14. `loading.tsx` skelet (Skeleton) sahifalarini qo‘shish
- **Maqsad:** Dinamik sahifalarga (`category/[slug]`, `catalog`, `products/[slug]`, `search`) o‘tishda bosilgan zahoti **0 ms** da skelet ko‘rinishi chiqadi — foydalanuvchiga sayt 2–3 barobar tezroq seziladi.

#### 15. `next.config.ts` dagi `optimizePackageImports` ni kengaytirish
- Hozir `optimizePackageImports: ["lucide-react"]`; unga `"@base-ui/react"` ni ham qo‘shish kerak.

---

## 3. Yangilangan Amalga Oshirish Rejasi (Bosqichma-Bosqich)

| Bosqich | Qilinadigan ishlar | Kutiladigan natija |
| :--- | :--- | :--- |
| **Bajarildi (v1)** | 1C `/all_product` qisqartirilishi (`2.01 MB → 1.38 MB`) + Zod dual-schema (`898f602`) | PDP **8.59s → 0.78s**, Kategoriya **3.75s → 0.70s**, 2 MB xatosi **0** |
| **1-bosqich (Eng tez va eng katta effekt)** | `vercel.json` region `fra1`/`dxb1` + `/catalog` ni `PRERENDER` (ISR) ga o‘tkazish + `React.cache()` + PDP `revalidate = 86400` + `/api/search/suggestions` `Vercel-CDN-Cache-Control` | Katalog **864ms → 150ms**, Kategoriya/Qidiruv **700ms → 200–300ms**, Autocomplete **800ms → <80ms** |
| **2-bosqich (Katalog/Kategoriya ISR + 2 MB uzoq muddatli himoya)** | Kategoriya/Brend filtrsiz sahifalarini ISR qilish + `all_product` uchun chunked `unstable_cache` / 1C gzip himoyasi | Barcha asosiy sahifalarda `x-vercel-cache: HIT`, 10 000+ mahsulotga tayyor |
| **3-bosqich (Frontend & Core Web Vitals)** | `lazyOnload` analitika (`webvisor` nazorati), `next/dynamic` modallar, `ProductCard` atomik Zustand + `toCardProduct`, `Header` `checkAuth` cheklovi, `<Link prefetch={false}>` | Mobile PageSpeed **+15–25 ball**, INP `< 50 ms`, Vercel yuklamasi keskin kamayadi |
| **4-bosqich (Assets, Fonts & UX)** | `favicon`/`logo`/hero PNG siqish, Cloudflare `immutable` kesh, ortiqcha `preconnect` tozalash, `loading.tsx` skeletlari, `optimizePackageImports` | LCP maksimal tezlikda va sahifalararo o‘tish 0 ms reaksiya bilan |
