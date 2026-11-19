# Sora.uz Veb-Saytini Tezlashtirish Bo‘yicha Texnik Audit va Harakatlar Rejasi

> **Tahlil sanasi:** 2026-11-19  
> **O‘rganilgan muhit:** Production (`https://sora.uz`) jonli TTFB/kesh o‘lchovlari + loyiha manba kodi tahlili

---

## 1. Hozirgi Holat (Jonli O‘lchov Natijalari)

`https://sora.uz` sahifalarini jonli tekshirish natijasida quyidagi haqiqiy ko‘rsatkichlar qayd etildi:

| Sahifa | TTFB | Umumiy yuklanish | Vercel Cache | `Cache-Control` sarlavhasi | Holat |
| :--- | :---: | :---: | :---: | :--- | :--- |
| `/uz` (Bosh sahifa) | 1 111 ms | 1 735 ms | `PRERENDER` | `public, max-age=0, must-revalidate` | Yaxshi |
| `/uz/catalog` | **3 593 ms** | **3 642 ms** | **`MISS`** | `private, no-cache, no-store` | **Sekin (Kritik)** |
| `/uz/category/yozuv-qurollari` | 1 221 ms | **3 749 ms** | **`MISS`** | `private, no-cache, no-store` | **Sekin (Kritik)** |
| `/uz/products/deli-e1589-...` (PDP) | **3 304 ms** | **8 586 ms** | **`MISS`** | `public, max-age=0, must-revalidate` | **Juda sekin (Kritik)** |
| `/uz/search?q=deli` | **3 060 ms** | **5 570 ms** | **`MISS`** | `private, no-cache, no-store` | **Sekin (Kritik)** |

> **Asosiy xulosa:** Saytning sekin ishlashi dizayn yoki brauzerda emas — **90% muammo server tomonidagi 3 ta kesh uzilishida** (`all_product` > 2 MB bo‘lgani uchun Next.js Data Cache ishlamayapti, dinamik sahifalarda Edge CDN keshi bosib ketilyapti va bitta so‘rov ichida 1C API qayta-qayta chaqirilmoqda).

---

## 2. Ustuvorlik Bo‘yicha Takliflar (Eng Katta Ta’sirdan Boshlab)

---

### P0 — KRITIK (Tezlikni 5–10 barobar oshiradi: 3.7–8.5 s → 0.2–0.6 s)

#### 1. `all_product` 2 MB Next.js Data Cache cheklovini bartaraf etish
- **Aniqlangan muammo:**  
  1C `/all_product` javobi hozir **2 105 791 bayt (2.01 MB)**. Next.js Data Cache limiti esa qat’iy **2 097 152 bayt (2.00 MB)**. Atigi **~8.5 KB** oshib ketgani uchun Next.js har bir build va runtime so‘rovda quyidagi xato bilan keshni rad etmoqda:
  ```text
  Failed to set Next.js data cache for http://1cloud.uz:777/SORA/hs/for_msp/all_product,
  items over 2MB can not be cached (2105791 bytes)
  ```
  Natijada har bir tashrifchi katalog, kategoriya, qidiruv yoki mahsulot sahifasini ochganda Vercel serveri Toshkentdagi `1cloud.uz:777` dan 2.1 MB JSON’ni qaytadan yuklab olmoqda.
- **Yechim (2 qatlamli):**
  1. **Next.js ichida ixcham kesh (`unstable_cache` + in-memory TTL):** `src/lib/api/client.ts` da `/all_product` ni `cache: "no-store"` bilan olib, keraksiz bo‘sh maydonlarni qisqartirgan (yoki 2 ta kichik bo‘lakka ajratgan) holda `unstable_cache` (24 soat, tag: `"all-products"`) va server-xotira (in-memory) keshiga saqlash.
  2. **1C tomonida (ideal uzoq muddatli yechim):** 1C `/all_product` javobidan bo‘sh maydonlar va ortiqcha probellarni (minified JSON) olib tashlash yoki `gzip` yoqish — bu javob hajmini 2.1 MB dan **~1.1–1.4 MB** gacha tushiradi va Next.js Data Cache yana 100% ishlaydi.
- **Kutiladigan natija:** Har bir sahifada 1C dan 2.1 MB yuklash yo‘qoladi; server javob vaqti **2–4 soniyaga qisqaradi** va 1C serveriga tushadigan yuklama **95% kamayadi**.

---

#### 2. Bitta sahifa so‘rovida 1C API’ni qayta-qayta chaqirishni to‘xtatish (`React.cache`)
- **Aniqlangan muammo:**  
  Mahsulot sahifasi (`src/app/[locale]/products/[slug]/page.tsx`) ochilganda bitta HTTP so‘rovning o‘zida:
  1. `generateMetadata()` → `api.getProductBySlug()` → `api.getAllProducts()` (1-marta);
  2. `ProductDetailPage()` → `api.getProductBySlug()` → `api.getAllProducts()` (2-marta);
  3. `ProductDetailPage()` 128-qator → `Promise.all([..., api.getAllProducts(), ...])` (3-marta).  
  `/all_product` keshlanmagani uchun bitta mahsulot sahifasi 1C ga **3 marta 2.1 MB** so‘rov yuborib **8.59 soniyagacha** cho‘zilmoqda!
- **Yechim:**  
  `src/lib/api/client.ts` dagi `getAllProducts`, `getCategories`, `getBrands`, `getPrices`, `getProductById`, `getProductBySlug` metodlarini React’ning per-request deduplikatsiyasi (`cache()` from `"react"`) bilan o‘rash.
- **Kutiladigan natija:** Bitta sahifa yuklanishida har bir 1C endpoint ko‘pi bilan **1 marta** chaqiriladi; PDP yuklanishi **8.5 s → ~1.5 s** (kesh bilan **< 0.3 s**) ga tushadi.

---

#### 3. Katalog, Kategoriya va Brend sahifalarida Edge CDN / ISR keshini haqiqatan ishga tushirish
- **Aniqlangan muammo:**  
  `next.config.ts` da `Cache-Control: public, s-maxage=600, stale-while-revalidate=3600` yozilgan bo‘lsa-da, jonli tekshiruvda `/uz/catalog` va `/uz/category/yozuv-qurollari` sahifalari **`Cache-Control: private, no-cache, no-store`** va **`x-vercel-cache: MISS`** qaytarmoqda.  
  Sababi: Next.js App Router’da sahifa `searchParams` ni o‘qigan zahoti avtomatik `ƒ (Dynamic)` rejimiga o‘tadi va `next.config.ts` dagi `Cache-Control` ni bekor qiladi.
- **Yechim:**
  1. **Asosiy kategoriya/katalog/brend sahifalari** (`/uz/category/[slug]`, `/uz/catalog`, `/uz/brand/[slug]`) uchun `export const revalidate = 86400` bilan statik ISR qobiq yaratish (hech bo‘lmaganda filtrsiz 1-sahifa va top kategoriyalar `generateStaticParams` orqali CDN’dan **50–150 ms** da ochiladi).
  2. Filtr va saralash (`brand`, `minPrice`, `maxPrice`, `inStock`, `sort`, `page`) o‘zgarganda butun sahifani serverda qayta SSR qilmasdan, kategoriya mahsulotlari ro‘yxati ustida mijoz tomonida tezkor filtratsiya qilish (yoki keshlangan JSON API endpoint orqali yuklash).
  3. Mahsulot sahifalarida (`/[locale]/products/[slug]`) `export const revalidate = 86400` ni aniq belgilash va `generateStaticParams` sonini top 20 tadan top **100–200 ta eng ko‘p kiriladigan mahsulotga** oshirish (qolganlari birinchi kirishdan so‘ng 24 soat CDN’da saqlanadi).
- **Kutiladigan natija:** Katalog va kategoriya sahifalarida `x-vercel-cache: HIT`, TTFB **3 600 ms → 100–250 ms**!

---

### P1 — YUQORI TA’SIR (Vercel–1C tarmoq kechikishi va Core Web Vitals: LCP / INP / TBT)

#### 4. Vercel Serverless funksiyalar mintaqasini O‘zbekistonga yaqinlashtirish (`fra1` yoki `dxb1`)
- **Aniqlangan muammo:**  
  Vercel’da standart mintaqa odatda AQSh (`iad1` — Washington, D.C.). Toshkentdagi `1cloud.uz:777` serveriga AQSh’dan har bir so‘rov ~200–280 ms tarmoq kechikishi (RTT) bilan borib keladi.
- **Yechim:**  
  `vercel.json` (yoki Vercel Project Settings → Functions → Function Region) orqali mintaqani **Frankfurt (`fra1`)** yoki **Dubay (`dxb1`)** ga o‘tkazish.
- **Kutiladigan natija:** O‘zbekistonlik foydalanuvchilar uchun ham, 1C serveriga so‘rovlar uchun ham tarmoq pingi **2–3 barobar** qisqaradi.

---

#### 5. Analitika skriptlarini (`YandexMetrika` + `GoogleAnalytics`) kechiktirib yuklash
- **Aniqlangan muammo:**  
  `src/components/analytics/YandexMetrika.tsx` va `GoogleAnalytics.tsx` da `strategy="afterInteractive"` ishlatilgan, Yandex Metrika’da esa `webvisor: true` + `clickmap: true` yoqilgan. WebVisor sahifa ochilgan zahoti DOM o‘zgarishlarini yozib olishni boshlab, mobil qurilmalarda asosiy oqimni (Main Thread / TBT / INP) sezilarli band qiladi.
- **Yechim:**
  - `GoogleAnalytics` va `YandexMetrika` skriptlarini `strategy="lazyOnload"` ga o‘tkazish (sahifa to‘liq chizilib bo‘lgach yuklanadi).
  - Agar sessiya video-yozuvi doimiy kerak bo‘lmasa, `webvisor: false` qilish (yoki faqat kerakli davrlarda yoqish).
- **Kutiladigan natija:** Mobile Lighthouse / PageSpeed Performance ko‘rsatkichi **+15–25 ball** yaxshilanadi, TBT (Total Blocking Time) keskin kamayadi.

---

#### 6. Og‘ir modallarni `next/dynamic` (lazy-load) ga o‘tkazish
- **Aniqlangan muammo:**  
  `src/components/layout/Header.tsx` har bir sahifada (bosh sahifa, katalog, mahsulot, kontakt) quyidagi modallarni statik import qiladi:
  - `AuthModal` (680+ qator kod),
  - `OrderTrackerModal`,
  - `MobileSearchModal`.  
  Xaridor ularni ochmagan bo‘lsa ham, ularning butun JS kodi birinchi yuklanishda brauzerga uzatiladi va hydrate qilinadi.
- **Yechim:**  
  Ushbu 3 ta modalni `next/dynamic(() => import(...), { ssr: false })` orqali **faqat foydalanuvchi tugmani bosib ochgandagina** yuklanadigan qilish. Xuddi shu usulni `CheckoutForm.tsx` dagi `LocationPickerModal` (xarita/Leaflet) va `CheckoutOtpModal` uchun ham qo‘llash.
- **Kutiladigan natija:** Boshlang‘ich JavaScript bundle hajmi va hydration vaqti sezilarli qisqaradi.

---

#### 7. `Header` da har safar `GET /api/auth/me` so‘rovini takrorlamaslik
- **Aniqlangan muammo:**  
  `src/components/layout/Header.tsx` (46–49-qatorlar) har bir render/mount’da `checkAuth()` chaqiradi va `GET /api/auth/me` ga so‘rov yuboradi. `useAuthStore` da `isInitialized` bayrog‘i bor, lekin `Header` uni tekshirmaydi.
- **Yechim:**  
  `checkAuth()` ichida `if (get().isInitialized) return;` shartini qo‘shish — shunda foydalanuvchi sayt bo‘ylab 20 ta sahifaga kirsa ham `/api/auth/me` faqat **1 marta** chaqiriladi.
- **Kutiladigan natija:** Sahifalararo o‘tishda ortiqcha serverless funksiya chaqiruvlari va tarmoq kechikishi yo‘qoladi.

---

### P2 — O‘RTA TA’SIR (Brauzerda ishlash ravonligi va LCP rasmlari)

#### 8. `ProductCard` da Zustand selectorlarini optimallashtirish
- **Aniqlangan muammo:**  
  `src/components/discovery/ProductCard.tsx` (33–35-qatorlar):
  ```ts
  const { addItem, removeItem, updateQuantity, hasItem, items } = useCartStore();
  const { toggleFavorite, isFavorite } = useFavoritesStore();
  const { toggleCompare, isInCompare } = useCompareStore();
  ```
  Har bir kartochka **butun `items` massiviga** obuna bo‘lgan. Xaridor 1 ta mahsulotni savatchaga qo‘shganda sahifadagi **barcha 24–40 ta `ProductCard` qayta render bo‘ladi** (INP pasayadi).
- **Yechim:**  
  Har bir kartochka faqat o‘z `product.id` siga tegishli qiymatga obuna bo‘lishi kerak:
  ```ts
  const currentQuantity = useCartStore(
    (s) => s.items.find((i) => i.id === product.id)?.quantity ?? 0
  );
  const isFav = useFavoritesStore((s) => s.items.some((i) => i.id === product.id));
  const inCompare = useCompareStore((s) => s.items.some((i) => i.id === product.id));
  ```
- **Kutiladigan natija:** Savatcha/sevimlilar tugmasini bosganda javob berish (INP) **bir zumda (< 16 ms)** bo‘ladi.

---

#### 9. Rasmlar va `public/` fayllarini yengillashtirish
- **Aniqlangan muammolar:**
  1. `public/` papkasida og‘ir fayllar bor:
     - `logo.png` — **1 144.8 KB (1.14 MB!)**
     - `favicon.ico` va `for_web_logo_icon.ico` — har biri **372.1 KB** (normal favicon 10–30 KB bo‘lishi kerak)
     - `hero-slide-*.png` va `hero-slide-*-transparent.png` — har biri **495–606 KB** (dublikat nusxalar ham mavjud).
  2. `ProductCard.tsx` da barcha kartochkalarda `loading="lazy"` qo‘yilgan — kategoriya va katalog sahifasida birinchi ekranda ko‘rinadigan (above-the-fold) 2–4 ta mahsulot rasmi ham kechikib yuklanadi.
  3. `HeroSlider.tsx` 4 ta slaydning barchasini DOM’da ushlab turadi (yashirin 3 ta slayd ham DOM daraxtini kattalashtiradi).
- **Yechim:**
  - `favicon.ico` va `for_web_logo_icon.ico` ni 16×16 / 32×32 / 48×48 o‘lchamda **~15–25 KB** gacha siqish; `logo.png` ni SVG yoki optimallashtirilgan WebP (**< 30 KB**) ga almashtirish.
  - Hero slayd rasmlarini WebP/AVIF ga o‘tkazish va foydalanilmayotgan dublikat PNG’larni o‘chirish.
  - `ProductCard` ga `priority?: boolean` prop qo‘shib, katalog/kategoriya sahifasidagi birinchi 4 ta mahsulotga `priority={index < 4}` berish (`loading="lazy"` o‘rniga).

---

#### 10. `layout.tsx` dagi keraksiz `preconnect` havolalarini tozalash va `Header` prop’larini yengillashtirish
- **Aniqlangan muammo:**  
  `src/app/[locale]/layout.tsx` (131–138-qatorlar):
  - `<link rel="preconnect" href="http://1cloud.uz:777" />` — **keraksiz!** Brauzer hech qachon 1C ga to‘g‘ridan-to‘g‘ri ulanmaydi (1C faqat serverdan chaqiriladi).
  - `<link rel="preconnect" href="https://i.ibb.co" />` — barcha mahsulot rasmlari `cdn.sora.uz` ga ko‘chirilgan, bu ham endi keraksiz.
  - `<link rel="preconnect" href="https://mc.yandex.ru" />` — analitika `lazyOnload` qilinsa, bunga ham `preconnect` emas, `dns-prefetch` kifoya.
- **Qo‘shimcha (RSC Payload hajmi):**  
  `Header` komponentiga barcha `categories` + `tree` + `brands` to‘liq uzatiladi; faqat kerakli maydonlarni (`id`, `name`, `slug`) qoldirib uzatish har bir sahifaning HTML/RSC hajmini **15–25% ga** kamaytiradi (hozir bosh sahifa 67.3 KB Brotli).

---

### P3 — QO‘SHIMCHA (Barqarorlik va Foydalanuvchi Tajribasi)

#### 11. `loading.tsx` skelet (Skeleton) sahifalarini qo‘shish
- **Sabab:** Foydalanuvchi havolani bosganda server dinamik sahifani (masalan, qidiruv yoki filtr) tayyorlaguncha eski sahifa "qotib turgandek" tuyuladi.
- **Yechim:** `/[locale]/category/[slug]/loading.tsx`, `/[locale]/catalog/loading.tsx`, `/[locale]/products/[slug]/loading.tsx`, `/[locale]/search/loading.tsx` skelet komponentlarini qo‘shish — sahifa bosilgan zahoti **0 ms** da chiroyli yuklanish skeleti ko‘rinadi (perceived speed 2–3× tezroq seziladi).

#### 12. `next.config.ts` dagi `optimizePackageImports` ni kengaytirish
- Hozir faqat `["lucide-react"]` ko‘rsatilgan; unga `"@base-ui/react"` ni ham qo‘shish tree-shaking’ni kuchaytiradi.

---

## 3. Bosqichma-Bosqich Amalga Oshirish Tartibi (Tavsiya)

| Bosqich | Qilinadigan ishlar | Kutiladigan tezlik o‘sishi |
| :--- | :--- | :--- |
| **1-bosqich (Darhol)** | `all_product` 2 MB kesh yechimi + `React.cache()` deduplikatsiyasi + `PDP revalidate=86400` | PDP: **8.5s → <0.8s**, Katalog/Kategoriya: **3.7s → <1.0s** |
| **2-bosqich (Eng katta effekt)** | Katalog/Kategoriya/Brend ISR keshini yoqish (`x-vercel-cache: HIT`) + Vercel Region `fra1`/`dxb1` | Katalog/Kategoriya: **<1.0s → 100–250ms** |
| **3-bosqich (Frontend & Core Web Vitals)** | `lazyOnload` analitika, `next/dynamic` modallar, `ProductCard` Zustand selectorlar, `Header` `checkAuth` cheklovi | Mobile PageSpeed **+15–25 ball**, INP `<50ms` |
| **4-bosqich (Assets & UX)** | `favicon`/`logo`/hero rasmlarni siqish, ortiqcha `preconnect` tozalash, `loading.tsx` skeletlari | LCP yaxshilanishi va darhol vizual reaksiya |
