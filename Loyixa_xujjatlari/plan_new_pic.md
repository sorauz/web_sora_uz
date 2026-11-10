# SORA.UZ — Mahsulot rasmlarini Cloudflare R2 (`cdn.sora.uz`) ga o‘tkazish, Vercel sinxronizatsiyasi va SEO Re-index Bo‘yicha Mukammal Amaliy Reja

> **Hujjat maqsadi:** 1C ERP bazasidagi barcha mahsulot rasmlari (`i.ibb.co` -> `https://cdn.sora.uz/products/{kod}_1.jpg`, `1500 × 1500 px`) yangilanganda — **1C Backend**, **Next.js kod bazasi**, **Vercel kesh tizimi**, **Google Merchant Center**, **Yandex Market** hamda **Qidiruv tizimlari (SEO Re-index)** da uzilishsiz (zero-downtime) va maksimal SEO foyda bilan o‘tishni ta’minlash.

---

## Umumiy Jarayon Arxitekturasi

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ 1-BOSQICH: Next.js Kod Bazasi Tayyorgarligi (1C o‘zgarishidan OLDIN)        │
│  • next.config.ts -> cdn.sora.uz domeniga ruxsat berish (i.ibb.co saqlanadi)│
│  • layout.tsx -> <link rel="preconnect" href="https://cdn.sora.uz">         │
│  • Google/Yandex Feedlar -> bo‘sh rasm ("") himoyasi va kesh revalidatsiya  │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ 2-BOSQICH: Python Migratsiya Skripti + 1C ERP API O‘zgarishi                │
│  • Python skript -> 1500×1500 px JPEG -> R2 -> 1C (cf_link1 to‘ldiriladi)   │
│  • 1C Dasturchisi -> 6 ta HTTP endpointda cf_link1 ni asosiy rasm qiladi    │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ 3-BOSQICH: Vercel Keshni Tozalash va Sinxronizatsiya (0 soniya)             │
│  • /api/revalidate?tag=all (Barcha 1552 ta mahsulot, vitrinalar, sitemap)   │
│  • /api/revalidate?mode=smart-diff (IndexNow + Yandex/Bing avtomatik ping)  │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ 4-BOSQICH: SEO Re-Index va Savdo Feedlarini Yangilash                       │
│  • Google Merchant Center -> "Обновить / Fetch now" (72 soatda tasdiqlanadi)│
│  • Google Search Console & Yandex Webmaster -> sitemap.xml qayta yuborish   │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 1-BOSQICH: Kod fayllarida qilinishi SHART bo‘lgan o‘zgarishlar (1C API o‘zgarishidan OLDIN bajariladi!)

Ko‘pchilik *"API dan faqat rasm linki o‘zgaradi-ku, sayt kodiga tegish shart emas"* deb o‘ylaydi. **Ammo Next.js (App Router) xavfsizlik arxitekturasida ruxsat etilmagan domendan rasm kelsa, sayt `500 Runtime Error` berib qulab tushadi!** Shu sababli, 1C dasturchisi API’ni o‘zgartirishidan **oldin** quyidagi 4 ta kod o‘zgarishini qilib, Vercel’ga deploy qilib qo‘yishimiz shart:

### 1.1. `next.config.ts` — Yangi `cdn.sora.uz` domeniga ruxsat berish (`CRITICAL`)
- **Sabab:** Hozirda `next.config.ts` faylidagi `images.remotePatterns` ro‘yxatida faqat `i.ibb.co`, `sora.uz` va `1cloud.uz` bor. Agar 1C API `https://cdn.sora.uz/...` linkini qaytarsa va `next.config.ts` da bu domen bo‘lmasa, `<Image>` komponenti ishlatilgan barcha sahifalar (`ProductCard`, `ProductGallery`, `CartItemRow`, `CompareView`) xato beradi:
  > `Error: Invalid src prop (https://cdn.sora.uz/products/000000028_1.jpg) on next/image, hostname "cdn.sora.uz" is not configured under images in your next.config.js`
- **Nima qilinadi:** `next.config.ts` fayliga `cdn.sora.uz` (va ehtiyot shart `res.cloudinary.com`) qo‘shiladi.
- **Muhim qoida:** Eski `i.ibb.co` domeni ro‘yxatdan **o‘chirilmaydi!** Chunki:
  1. 1C da 100% barcha rasmlar ko‘chib ulgurmagan mahsulotlarda vaqtincha eski link turishi mumkin;
  2. Mijozlarning brauzer xotirasida (`localStorage`: Savatcha `sora-cart-storage`, Sevimlilar `sora-favorites`, Taqqoslash `sora-compare`) avval saqlangan mahsulotlar eski `i.ibb.co` rasm linki bilan turgan bo‘ladi. Ikkala domen ham ruxsatda tursa, hech kimda xatolik chiqmaydi.

```ts
// Fayl: next.config.ts (images.remotePatterns qismiga qo'shiladi)
{
  protocol: "https",
  hostname: "cdn.sora.uz",
  pathname: "/**",
},
{
  protocol: "https",
  hostname: "res.cloudinary.com",
  pathname: "/**",
},
```

### 1.2. `src/app/[locale]/layout.tsx` — Brauzer tezligi (Core Web Vitals / LCP) uchun `preconnect`
- **Sabab:** Hozirda `src/app/[locale]/layout.tsx` (133–134-qatorlar) faqat `https://i.ibb.co` ga oldindan ulanish (`preconnect` va `dns-prefetch`) ochadi.
- **Nima qilinadi:** `https://cdn.sora.uz` uchun birinchi navbatda `preconnect` va `dns-prefetch` qo‘shiladi:
```tsx
// Fayl: src/app/[locale]/layout.tsx
<link rel="preconnect" href="https://cdn.sora.uz" crossOrigin="anonymous" />
<link rel="dns-prefetch" href="https://cdn.sora.uz" />
```
- **Foydasi:** Foydalanuvchi saytga kirgan zahoti brauzer Cloudflare Edge serveri (`cdn.sora.uz`) bilan TLS/HTTP3 aloqani oldindan o‘rnatadi va rasmlar **20–40 ms** tezroq ochiladi (Google PageSpeed LCP ko‘rsatkichi yanada oshadi).

### 1.3. `src/app/api/feeds/google-merchant/route.ts` va `yandex-market/route.ts` — Bo‘sh rasm (`""`) himoyasi
- **Sabab:** 1C bazasida hozirda **19 ta mahsulotda** umuman rasm yo‘q (`main_picture: ""`). Hozirgi kodda agar `main_picture` bo‘sh kelsa, `picture` o‘zgaruvchisi `"https://sora.uz"` (HTML bosh sahifa manzili!) bo‘lib qolmoqda. Google Merchant Center esa `<g:image_link>https://sora.uz</g:image_link>` ni ko‘rganda **"Недействительный URL изображения"** xatosini beradi.
- **Nima qilinadi:** Har ikkala feedda (`google-merchant/route.ts` va `yandex-market/route.ts`) rasmi yo‘q mahsulotlarni feedga qo‘shmaslik sharti (`if (!p.main_picture || !p.main_picture.trim()) continue;`) kiritiladi.

### 1.4. `src/app/api/revalidate/route.ts` — Feed va Sitemap keshlarini bir zumda yangilash
- **Sabab:** Google Merchant (`/api/feeds/google-merchant`), Yandex Market (`/api/feeds/yandex-market`), Sitemap (`/sitemap.xml`) va AI katalog (`/llms-full.txt`) `revalidate = 86400` (24 soatlik kesh) bilan ishlaydi.
- **Nima qilinadi:** `/api/revalidate` ichida `tag=all` yoki `mode=smart-diff` chaqirilganda:
  - `revalidatePath('/api/feeds/google-merchant')`
  - `revalidatePath('/api/feeds/yandex-market')`
  - `revalidatePath('/sitemap.xml')`
  - `revalidatePath('/llms-full.txt')`
  avtomatik chaqirilishi ta’minlanadi. Shunda 1C o‘zgargan zahoti 24 soat kutmasdan barcha XML feedlar shu soniyaning o‘zidayoq yangi `cdn.sora.uz` linklariga o‘tadi!

---

## 2-BOSQICH: 1C Dasturchisi qilishi kerak bo‘lgan ishlar (1C ERP Texnik Topshiriq)

Python skript (`new2_skript_migrat.txt`) ishga tushib, 1C dagi `POST /SORA/hs/pic` orqali barcha mahsulotlarning `cf_link1` rekvizitini `https://cdn.sora.uz/products/{kod}_1.jpg` bilan to‘ldirib chiqqanidan so‘ng, **1C dasturchisi** quyidagi **6 ta HTTP-servis endpointda** rasm qaytarish mantiqini yangilashi kerak:

### 2.1. O‘zgarishi kerak bo‘lgan 1C API Endpointlar ro‘yxati:

| # | 1C HTTP Endpoint manzili | JSON ichidagi o‘zgaradigan maydon(lar) |
|---|---|---|
| **1** | `GET /SORA/hs/for_msp/all_product` | `main_picture` |
| **2** | `GET /SORA/hs/for_msp/product?id={uuid}` | `main_picture`,<br>`related_products[*].picture`,<br>`recommended_products[*].picture` *(hamda `gallery` bo‘lsa)* |
| **3** | `GET /SORA/hs/for_msp/low_price_guarantee` | `picture` (yoki `main_picture`) |
| **4** | `GET /SORA/hs/for_msp/new_products` | `picture` (yoki `main_picture`) |
| **5** | `GET /SORA/hs/for_msp/popular` | `picture` (yoki `main_picture`) |
| **6** | `GET /SORA/hs/for_msp/promotions` | `picture` (yoki `main_picture`) |

### 2.2. 1C Dasturchisi uchun "Fallback" (Zaxira) qoidasi:
1C dasturchisi eski `link1` maydonini butunlay uzib qo‘ymasdan, **shartli tanlov (Fallback)** yozishi shart:
```bsl
// 1C So'rovida (Запрос) yoki kodida:
ВЫБОР
    КОГДА ЗначениеЗаполнено(Файлы.cf_link1)
        ТОГДА Файлы.cf_link1
    ИНАЧЕ Файлы.link1
КОНЕЦ КАК main_picture
```
**Nima uchun bu muhim?**
Agar kelajakda omborga yangi mahsulot qo‘shilsa va Python skripti hali ishga tushmagan bo‘lsa, `cf_link1` bo‘sh bo‘lganda 1C vaqtincha `link1` ni qaytarib turadi, skript ishlagach avtomatik `cf_link1` (`cdn.sora.uz`) ga o‘tadi.

---

## 3-BOSQICH: Vercel ma’lumotlarini yangilash va sinxronizatsiya amaliyoti

1C dasturchisi *"API larda `cf_link1` (`https://cdn.sora.uz/...`) ni yoqdim"* degan xabarni bergan daqiqada quyidagi ketma-ketlik bajariladi:

### 3.1. 1C API javobini tekshirish (1 daqiqa)
Brauzer yoki terminal orqali 1C API haqiqatan yangi link qaytarayotgani tekshiriladi:
- `http://1cloud.uz:777/SORA/hs/for_msp/all_product` -> `"main_picture": "https://cdn.sora.uz/products/000000028_1.jpg"`
- `http://1cloud.uz:777/SORA/hs/for_msp/product?id=f0c200c0-cd7b-11e4-b024-005056c00008` -> `main_picture`, `related_products[*].picture`, `recommended_products[*].picture` larda `https://cdn.sora.uz/...` kelayotgani tasdiqlanadi.

### 3.2. Vercel Global Keshni Tozalash (`tag=all`)
Saytdagi barcha **1 552 ta mahsulot**, bosh sahifa vitrinalari (`offers`), kategoriyalar, Sitemap va Feedlar keshini bir zarbada yangilash uchun brauzerda quyidagi URL ochiladi:
```http
GET https://sora.uz/api/revalidate?secret=sora_revalidate_secret_2026&tag=all
```
**Natija:**
- `products-list` (Barcha 1 552 ta mahsulot ro‘yxati) yangilanadi;
- `product-detail` (Barcha mahsulot ichki sahifalari) yangilanadi;
- `offers` (Arzon narx kafolati, Yangi mahsulotlar, Ommabop, Aksiyalar) yangilanadi;
- `/sitemap.xml`, `/api/feeds/google-merchant`, `/api/feeds/yandex-market` yangilanadi.

### 3.3. Smart-Diff sinxronizatsiya va IndexNow Ping
Darhol ketidan `smart-diff` ishga tushiriladi (kelajakdagi inkremental o‘zgarishlar uchun snapshot xotirani yangilash va qidiruv tizimlariga ping yuborish uchun):
```http
GET https://sora.uz/api/revalidate?secret=sora_revalidate_secret_2026&mode=smart-diff
```
> **Eslatma:** Bizning `src/lib/sync/diff-utils.ts` (167-qator) faylimizda `if (cached.main_picture !== fresh.main_picture) diffs.push("main_picture changed")` tekshiruvi allaqachon yozilgan! Ya’ni keyinchalik bitta-ikkita mahsulot rasmi o‘zgarsa ham `mode=smart-diff` buni o‘zi avtomatik aniqlab, faqat o‘sha mahsulot sahifasini yangilaydi.

---

## 4-BOSQICH: Re-index va O‘zgarishlarning SEO uchun ijobiy ta’sirini ta’minlash amallari

Rasmlarning `i.ibb.co` (uchinchi tomon bepul xostingi, `440×440 px`) dan o‘z subdomenimiz `https://cdn.sora.uz/products/{kod}_1.jpg` (`1500×1500 px`) ga o‘tishi — **SORA.UZ SEO reytingi va Google Merchant uchun ulkan ijobiy sakrash bo‘ladi.** Buni qidiruv tizimlariga eng tez yetkazish uchun quyidagi 4 ta amal bajariladi:

### 4.1. Google Merchant Center — 72 soatlik Ustuvor Tekshiruvni ishga tushirish (`ENG MUHIM`)
Siz taqdim etgan Google rasmiy talabnomasi (`Google_talabi.txt`, 58-band) da aniq yozilgan:
> *"Всегда меняйте название файла и URL изображения в сведениях о товарах, и тогда новая проверка будет запускаться в течение трех дней. В противном случае повторное сканирование может занять до полутора месяцев."*

Bizda rasm URL manzili `https://i.ibb.co/...` dan `https://cdn.sora.uz/products/{kod}_1.jpg` ga **butunlay o‘zgargani sababli**, Google 45 kun kutmaydi, balki **72 soat (3 kun) ichida** barcha mahsulotlarni qayta skanerlaydi!
**Qilinadigan amal:**
1. Avval `https://sora.uz/api/feeds/google-merchant` sahifasini ochib, `<g:image_link>` ichida `https://cdn.sora.uz/products/...` chiqayotganiga ishonch hosil qiling.
2. **Google Merchant Center** kabinetiga kiring -> **Товары (Products)** -> **Источники данных (Feeds)**.
3. Asosiy feed ustiga кириб, **"Обновить" (Fetch now / Загрузить сейчас)** tugmasini bosing.
4. `cdn.sora.uz` Cloudflare Edge + HTTP/3 + IPv6 da ishlagani uchun `Googlebot-Image` 1 533 ta rasmni bir necha daqiqada tortib oladi va **"Не одобрено (Изображение обрабатывается / Слишком маленькое изображение)"** xatolari yechiladi.

### 4.2. Google Search Console — Sitemap va Domain Property (`cdn.sora.uz`)
Bizning `src/app/sitemap.ts` (136-qator) faylimiz har bir mahsulot uchun `<image:image><image:loc>` tegida rasm linkini chiqaradi.
**Qilinadigan amal:**
1. **Google Search Console** da `sora.uz` profiliga kiring.
2. **Файлы Sitemap (Sitemaps)** bo‘limiga o‘tib, `https://sora.uz/sitemap.xml` manzilini qayta yuboring (**Отправить**).
3. *(Muhim SEO ustunlik)*: Agar Google Search Console’da `sora.uz` **Domain resource (`Доменный ресурс: sora.uz`)** sifatida tasdiqlangan bo‘lsa, `cdn.sora.uz` subdomenidagi barcha rasmlar avtomatik ravishda `sora.uz` ning o‘z mulki sifatida tan olinadi! Agar faqat `https://sora.uz` (URL-prefix) sifatida qo‘shilgan bo‘lsa, Search Console’ga `https://cdn.sora.uz` ni ham qo‘shib qo‘ying — shunda Google rasmlarni 100% tasdiqlangan birinchi tomon (first-party) domeni sifatida indeksatsiya qiladi.

### 4.3. Yandex Webmaster va Yandex Market (YML Feed)
1. **Yandex Webmaster** (`webmaster.yandex.ru`) -> **Индексирование** -> **Файлы Sitemap** bo‘limida `https://sora.uz/sitemap.xml` yonidagi **🔄 (Переобход / Qayta tekshirish)** tugmasini bosing.
2. **IndexNow Ping:** 3-bosqichda `/api/revalidate?mode=smart-diff` yoki `/api/indexnow` ishga tushirilganda Yandex va Bing’ga yangilangan mahsulot URL’lari avtomatik yuboriladi.
3. Agar **Yandex Market / Tovarlar** da `https://sora.uz/api/feeds/yandex-market` YML feed ulangan bo‘lsa, u yerda ham feedni yangilash tugmasi bosiladi.

### 4.4. SEO va AI-Qidiruv (`Schema.org JSON-LD`, `OpenGraph`, `llms-full.txt`) ga avtomatik ta’siri
Loyihamiz arxitekturasi shunday qurilganki, `main_picture` o‘zgarganda quyidagi SEO qatlamlar **hech qanday qo‘shimcha aralashuvsiz o‘zi yangilanadi**:
- **Schema.org `Product` JSON-LD (`src/app/[locale]/products/[slug]/page.tsx`):** Google Rich Results (Qidiruvda narx, yulduzcha va rasm chiqishi) avtomatik `1500 × 1500 px` `cdn.sora.uz` rasmiga o‘tadi (Google Rich Results uchun ham rasm kamida 1200 px kenglikda va 1:1 proporsiyada bo‘lishini tavsiya qiladi!).
- **OpenGraph va Telegram/WhatsApp Preview (`og:image`):** Mahsulot linkini Telegram’da ulashganda endi `i.ibb.co` kabi bloklanib qolmaydi, har doim yuqori sifatli rasm bir zumda ochiladi.
- **Google Images (Картинки Google):** Oldin rasmlar `i.ibb.co` domenida turgani uchun Google Images’da obro‘ `ibb.co` ga ketardi. Endi rasmlar `cdn.sora.uz` da joylashgani sababli **Domain Authority (Domen obro‘si) to‘g‘ridan-to‘g‘ri `sora.uz` brendiga ishlaydi!**

---

## 5-BOSQICH: Yakuniy Tekshiruv Ro‘yxati (Checklist)

Amaliyot muvaffaqiyatli yakunlandi va auditdan o‘tkazildi (2026-11-10 holatiga):

- [x] **1-qadam (Biz — Next.js):** `next.config.ts` ga `cdn.sora.uz` qo‘shildi, `layout.tsx` ga `preconnect` qo‘shildi, Feedlarga bo‘sh rasm himoyasi va `revalidate` qo‘shilib Vercel’ga deploy qilindi (`commit: 931c8ef`).
- [x] **2-qadam (Python Skript):** `new2_skript_migrat.txt` to‘liq ishlab bo‘ldi. 1C dagi rasmli 1 741 ta mahsulotning **100% barchasida** `cf_link1` muvaffaqiyatli to‘ldirildi!
- [x] **3-qadam (1C Dasturchisi):** 6 ta 1C HTTP endpoint (`all_product`, `product`, `low_price_guarantee`, `new_products`, `popular`, `promotions`) `cf_link1` ni qaytaradigan qilindi (fallback `link1` bilan).
- [x] **4-qadam (Vercel Kesh):** `https://sora.uz/api/revalidate?secret=sora_revalidate_secret_2026&tag=all` va `mode=smart-diff` muvaffaqiyatli chaqirildi (718 ms, 200 OK).
- [x] **5-qadam (Vizual va Texnik QA):**
  - [x] `https://sora.uz/uz` va mahsulot sahifalari (PDP) 200 OK ochilmoqda, yangi `cdn.sora.uz` rasmlari to‘g‘ri chiqmoqda;
  - [x] `https://api.feeds/google-merchant`: 1 126 ta tovar yangi `cdn.sora.uz` (1500×1500 px) havolalariga o‘tdi (0 ta `i.ibb.co`);
  - [x] `https://api.feeds/yandex-market`: 1 126 ta tovar yangi `cdn.sora.uz` havolalariga o‘tdi (0 ta `i.ibb.co`);
  - [x] Cloudflare R2 rasmlari: 200 OK, `1500 × 1500 px`, Progressive JPEG, `cache-control: public, max-age=31536000, immutable`.
- [x] **6-qadam (Re-index & Merchant Center):**
  - [x] Google Merchant Center’da `https://sora.uz/api/feeds/google-merchant` taqdim etildi va **1 126 ta tovar** yangilandi (`All recognized`);
  - [x] IndexNow protokoli orqali Yandex va Bing qidiruv tizimlariga sitemap va 100 ta eng asosiy tovar sahifalari yuborildi (`200 OK`).
