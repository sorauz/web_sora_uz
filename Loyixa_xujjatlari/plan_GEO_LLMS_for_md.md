# 🚀 SORA.UZ — GEO VA LLMS (MARKDOWN .MD) INTEGRATSIYASI BO'YICHA MUKAMMAL AMALIY REJA

**Hujjat turi:** Texnik arxitektura va amaliy joriy etish rejasi  
**Loyixa:** Sora.uz (E-commerce / Kanselyariya va ofis anjomlari)  
**Sana:** 2026-yil, Oktyabr  
**Standart:** [llmstxt.org](https://llmstxt.org/) & GEO (Generative Engine Optimization)

---

## 📌 1. KIRISH VA MAQSAD

### 1.1. Loyihaning hozirgi holati (Mavjud 80% baza)
Sora.uz platformasida zamonaviy AI qidiruv tizimlari uchun asosiy poydevor allaqachon yaratilgan:
* ✅ `https://sora.uz/llms.txt` — Domen ildizida asosiy yo'riqnoma, do'kon profili, xizmatlar, B2B va toifalar indeksi mavjud.
* ✅ `https://sora.uz/llms-full.txt` — 1C ERP bilan bog'langan, barcha tovarlar narxlari va brendlarini to'liq matn shaklida beruvchi dinamik Route Handler ishlamoqda.
* ✅ `Product Schema (JSON-LD)` — Har bir mahsulot sahifasida qidiruv botlari uchun Google va Schema.org standartidagi mikroformat o'rnatilgan.

### 1.2. Qilinishi kerak bo'lgan qism (Qolgan 20%)
Katalog kengayishi (1 000 tadan 10 000+ tagacha tovarlar) va AI agentlar (ChatGPT Search, Perplexity, Claude, Apple Intelligence) to'g'ridan-to'g'ri mahsulot sahifalaridan eng aniq ma'lumotni olishi uchun:
1. **Har bir mahsulot sahifasining toza `.md` versiyasini dinamik yaratish** (masalan: `/uz/products/deli-3874.md`).
2. **Kategoriyalar uchun to'plam `.md` havolalari** (masalan: `/uz/category/qogoz-mahsulotlari.md`).
3. **Avtomatik Content-Negotiation:** AI agentlar `Accept: text/markdown` so'rovi yuborganda, og'ir HTML o'rniga to'g'ridan-to'g'ri toza Markdown qaytarish.
4. **HTML `<head>` qismiga `<link rel="alternate" type="text/markdown">` bog'lash:** Brauzer orqali kirgan AI agentlar Markdown varianti borligini darhol aniqlashi uchun.
5. **`llms.txt` ni ierarxik daraxt tizimiga moslashtirish:** Bosh fayldan kategoriya va tovar `.md` lariga to'g'ri bog'lanish.

---

## 🏗️ 2. TEXNIK ARXITEKTURA VA MANTIQ

```mermaid
flowchart TD
    UserOrAgent["AI Agent / Foydalanuvchi"] --> CheckType{"So'rov turi nima?"}
    
    CheckType -->|"Oddiy brauzer (HTML)"| WebPage["/uz/products/[slug] (React UI)"]
    CheckType -->|".md qo'shimchasi bilan"| MdRoute["/uz/products/[slug].md"]
    CheckType -->|"Header: Accept: text/markdown"| ContentNeg["Content-Negotiation (Middleware)"]
    
    ContentNeg --> MdRoute
    WebPage --> MetaTag["`<head>`: rel='alternate' type='text/markdown'"]
    MetaTag -.->|"Agentni yo'naltiradi"| MdRoute
    
    MdRoute --> CacheCheck{"Next.js Kesh (ISR) bormi?"}
    CacheCheck -->|"Ha (24 soat)"| ReturnMD["Toza Markdown (0 ms)"]
    CacheCheck -->|"Yo'q / Eskirgan"| OneC["1C API (/all_product & /price)"]
    
    OneC --> GenerateMD["Markdown generator (H1, Narx, Stock, Xususiyatlar)"]
    GenerateMD --> SaveCache["Keshga saqlash"]
    SaveCache --> ReturnMD
```

---

## 📋 3. BOSQICHMA-BOSQICH AMALIY REJA

---

### 1-BOSQICH: Mahsulotlar uchun Dinamik `.md` Route Handler yaratish

* **Vazifa:** Har bir mahsulot sahifasi uchun uning slug'iga mos ravishda toza Markdown matnini uzatuvchi Next.js Route Handler yaratish.
* **Fayl joylashuvi:**
  `src/app/[locale]/products/[slug].md/route.ts` *(yoki `src/app/api/md/[locale]/products/[slug]/route.ts` + URL rewrite)*
* **Qaytariladigan ma'lumot tuzilishi (Markdown formati):**

```markdown
# Deli E3871 — Hujjatlar uchun teshgich (Dirokol)

> **Narxi:** 45,000 UZS  
> **Holati:** Omborda mavjud  
> **Brend:** Deli  
> **Artikul (SKU):** E3871  
> **Shtrixkod (Barcode):** 6921734938718  
> **Kategoriya:** Ofis buyumlari > Teshgichlar  
> **Onlayn xarid qilish:** https://sora.uz/uz/products/deli-e3871-teshgich  

## Asosiy parametrlari:
- **Teshish sig'imi:** 30 varaq (80 g/m²)
- **Teshiklar soni:** 2 ta
- **Teshiklar oralig'i:** 80 mm
- **Korpus materiali:** Yuqori sifatli qotishma metall

## Mahsulot tavsifi:
Deli E3871 ofis hujjatlarini tez va oson tartibga solish uchun mo'ljallangan mustahkam va qulay teshgich...

## Savdo shartlari:
- Yetkazib berish: Toshkent shahrida 24 soat ichida (500 000 so'mdan yuqori xaridga bepul).
- To'lov: Naqd, Payme, Click, Uzcard/Humo va korporativ B2B to'lov.
- Kafolat: 10 kunlik qaytarish va almashtirish kafolati.
```

* **Texnik talablar:**
  * `Content-Type: text/markdown; charset=utf-8` sarlavhasi bilan qaytishi shart.
  * `Cache-Control: public, max-age=86400, s-maxage=86400, stale-while-revalidate=86400` orqali Vercel Edge keshida saqlanishi kerak (1C ga har bir AI so'rovida qayta-qayta yuk tushmasligi uchun).

---

### 2-BOSQICH: Kategoriyalar uchun Dinamik `.md` Hub (Indeks) yaratish

* **Vazifa:** Toifadagi tovarlarning ixcham ro'yxati va ularning har birining shaxsiy `.md` fayliga to'g'ridan-to'g'ri havolalar beruvchi toifa indeksini yaratish.
* **Fayl joylashuvi:**
  `src/app/[locale]/category/[slug].md/route.ts`
* **Vazifasi:**
  * AI agent butun 1 000 ta mahsulotni bittada o'qimasdan, faqat kerakli kategoriyaga (masalan, `/category/qogoz-mahsulotlari.md`) kiradi.
  * U yerdagi tovarlar ro'yxatidan aniq keraklisining havolasini (masalan, `/products/svetocopy-classic-a4.md`) topib oladi.

---

## 🔄 3.1. `llms.txt` VA `llms-full.txt` NING TAQDIRI: ULARNI QAYTA YOZISH KERAKMI?

Ushbu reja amalga oshirilganda, mavjud fayllarimizni butunlay o'chirib tashlamaymiz, balki ularning **vazifasini professional tarzda qayta taqsimlaymiz va yengillashtiramiz**:

| Fayl | Hozirgi holati | Yangi rejadan keyingi vazifasi | Qayta yoziladimi? |
| :--- | :--- | :--- | :--- |
| **`llms.txt`** | Umumiy do'kon ma'lumotlari va kategoriyalarning HTML havolalari | **AI mundarijasi (Root Index):** Kategoriyalarning to'g'ridan-to'g'ri `.md` hub havolalari joylanadi. Agentlar qidiruvni shu yerdan boshlaydi. | **Ha, yengil yangilanadi** (Kategoriyalar `.md` ga bog'lanadi). |
| **`llms-full.txt`** | 1 000 ta tovarni bitta katta faylga yig'adi (~90 KB). 10 000 ta bo'lsa 1MB+ bo'lib ketadi. | **Kompaniya pasporti va Qo'llanmasi:** Barcha 10 000 ta tovarni bitta faylga tiqishdan to'xtaymiz. U faqat umumiy do'kon siyosati, B2B shartlari, kafolat va xizmatlar uchun to'liq ma'lumotnoma bo'lib qoladi. Tovarlar esa o'zining shaxsiy `.md` sahifalarida yashaydi. | **Ha, optimallashtiriladi** (Og'ir tovarlar ro'yxati alohida `.md` lardan olinadigan qilinadi). |

---

## ⚡ 3.2. 1C BILAN DINAMIKLIK VA "ZERO-TOUCH" AVTOMATIZATSIYA

### Savol: Agar 1C ga yangi tovar qo'shilsa yoki narx o'zgarsa, har bir sahifa uchun Markdown (.md) avtomatik taqdim etiladimi?

**JAVOB: 100% MUTLAQO AVTOMATIK VA JONLI (REAL-TIME)!**

Hech qanday dasturchi yoki operator har bir yangi tovar uchun qo'lda `.md` fayl ochib o'tirmaydi. Bu jarayon **Next.js App Router Dynamic Route Handlers** orqali quyidagicha ishlaydi:

1. **Yangi tovar qo'shilishi:**
   * 1C operatori yangi mahsulot kiritdi (masalan, `deli-e3904-pul-hisoblagich`).
   * Next.js buni 1C API (`/all_product`) orqali ko'radi va unga avtomatik slug beradi.
   * Bir vaqtning o'zida ikkita manzil avtomatik faollashadi:
     * Oddiy xaridor uchun: `https://sora.uz/uz/products/deli-e3904-pul-hisoblagich` (React HTML)
     * AI agentlar uchun: `https://sora.uz/uz/products/deli-e3904-pul-hisoblagich.md` (Toza Markdown)
2. **Narx yoki ombor holati o'zgarishi:**
   * 1C da narx 40,000 so'mdan 35,000 so'mga o'zgardi yoki tovar tugadi (`stock: "OutOfStock"` bo'ldi).
   * Yangi `.md` so'rovi kelganda, Next.js 1C ning `/price` API'sidagi yangilangan narx va stock'ni olib, Markdown ichidagi `> Narxi:` va `> Holati:` qatorlarini **avtomatik tarzda yangi holatda qaytaradi**.
3. **Baza 10 000 taga yetsa ham:**
   * Server xotirasida 10 000 ta alohida `.md` fayllar saqlanmaydi (disk to'lmaydi).
   * Har bir `.md` faqatgina AI agent yoki qidiruvchi so'ragan paytda (On-Demand / JIT - Just In Time) dinamik generatsiya qilinadi va Vercel keshiga joylanadi.

---

### 3-BOSQICH: Content-Negotiation (Middleware darajasida AI aniqlash)

* **Vazifa:** Zamonaviy AI qidiruv botlari sahifani so'raganda ularga avtomatik tarzda toza Markdown formatini taqdim etish.
* **Fayl joylashuvi:**
  [`src/proxy.ts`](file:///d:/web_sora_uz/src/proxy.ts) (Next.js Middleware)
* **Amalga oshirish mantig'i:**
  1. So'rov sarlavhasida (Headers):  
     `Accept: text/markdown` bo'lsa yoki
  2. Qidiruvchi botning User-Agent belgisi:  
     `GPTBot`, `Claude-Web`, `PerplexityBot`, `Applebot-Extended` bo'lsa:
  3. Server so'rovni avtomatik ravishda `.md` Route Handler'ga rewrite qiladi.
* **Natija:** Oddiy odamga chiroyli React dizayn ochiladi, AI agent esa 0.05 soniyada ortiqcha CSS/JS'larsiz toza Markdown oladi.

---

### 4-BOSQICH: HTML `<head>` ga `<link rel="alternate">` ulash

* **Vazifa:** Standart qidiruv brauzerlari va veb-skrepperlar sahifaga kelganda toza Markdown mavjudligini o'zlariga e'lon qilish.
* **Fayl joylashuvi:**
  [`src/app/[locale]/products/[slug]/page.tsx`](file:///d:/web_sora_uz/src/app/[locale]/products/[slug]/page.tsx)
* **Metadata sozlamasi:**
  ```typescript
  export async function generateMetadata({ params }): Promise<Metadata> {
    const { locale, slug } = await params;
    const baseUrl = "https://sora.uz";
    
    return {
      // ... mavjud metadatalar ...
      alternates: {
        canonical: `/${locale}/products/${slug}`,
        types: {
          "text/markdown": `${baseUrl}/${locale}/products/${slug}.md`,
        },
      },
    };
  }
  ```
* **HTML dagi natijasi:**
  ```html
  <link rel="alternate" type="text/markdown" href="https://sora.uz/uz/products/deli-3874.md" />
  ```

---

### 5-BOSQICH: `llms.txt` Faylini Ierarxik Tizimga O'tkazish

* **Vazifa:** Asosiy [`public/llms.txt`](file:///d:/web_sora_uz/public/llms.txt) faylini yangilangan `.md` daraxtiga bog'lash.
* **O'zgarish:**
  Toifalar va maxsus sahifalar ro'yxatida faqat HTML havolalar emas, to'g'ridan-to'g'ri ularning `.md` nusxalari ko'rsatiladi:
  ```markdown
  ## Asosiy Mahsulot Toifalari (AI Indekslari)
  - [Qogʻoz mahsulotlari](https://sora.uz/uz/category/qogoz-mahsulotlari.md): Barcha A4 qog'ozlar va daftarlar ro'yxati.
  - [Ofis buyumlari](https://sora.uz/uz/category/ofis-buyumlari.md): Steplerlar, teshgichlar va boshqa ofis jihozlari.
  - [Yozuv qurollari](https://sora.uz/uz/category/yozuv-qurollari.md): Ruchkalar, flomasterlar va qalamlar.
  ```

---

### 6-BOSQICH: `robots.ts` da AI Botlarga To'liq Yo'l Ochish

* **Vazifa:** [`src/app/robots.ts`](file:///d:/web_sora_uz/src/app/robots.ts) da jahonning asosiy AI botlariga Markdown va LLM fayllarini erkin o'qish huquqini kafolatlash.
* **Sozlama:**
  ```typescript
  {
    userAgent: ["GPTBot", "ClaudeBot", "PerplexityBot", "Applebot-Extended"],
    allow: [
      "/",
      "/llms.txt",
      "/llms-full.txt",
      "/*.md",
      "/api/feeds/",
    ],
    disallow: ["/cart", "/checkout", "/api/order/"],
  }
  ```

---

## 🛡️ 4. XAVFSIZLIK VA 1C ERP RESURSLARINI HIMOYA QILISH

1. **1C ga ortiqcha yuk tushmasligi:**  
   Har bir `.md` sahifasi 1C ga to'g'ridan-to'g'ri so'rov yubormaydi. Ular Next.js ning mavjud `api.getProductBySlug()` va `api.getPrices()` kesh qatlami (Data Cache) orqali ishlaydi. 
2. **CDN / Edge Kesh:**  
   Barcha `.md` javoblari 24 soatga Vercel Edge Serverlarida keshlanadi. 1C da narx yoki tovar o'zgarganda mavjud Webhook / On-demand Revalidation orqali kesh yangilanadi.
3. **Konfidensiallik:**  
   Markdown fayllarga mijozlarning shaxsiy ma'lumotlari, dilerlik/ulgurji maxfiy narxlari yoki ichki ombor registrlari mutlaqo chiqarilmaydi. Faqat ommaviy chakana narx va ommaviy xususiyatlar beriladi.

---

## 📈 5. KUTILAYOTGAN NATIJA VA BIZNES FOYDASI

| Ko'rsatkich | Oddiy HTML scraping | Biz joriy qiladigan Dynamic .md |
| :--- | :--- | :--- |
| **AI token sarfi** | 1 ta sahifa uchun ~8,000–15,000 token | 1 ta sahifa uchun bor-yo'g'i ~400–700 token |
| **Agent javob tezligi** | 3.5 – 6.0 soniya | 0.3 – 0.8 soniya |
| **AI gallyutsinatsiyasi** | Yuqori (JS/CSS tufayli narxni adashtirishi mumkin) | 0% (Faqat toza strukturalangan faktlar) |
| **ChatGPT / Perplexity tavsiyasi** | Tasodifiy | Tovar nomi, aniq narxi va sora.uz havolasi bilan kafolatlangan tavsiya |

---

## 📌 XULOSA

Ushbu reja amalga oshirilgach, **Sora.uz nafaqat insonlar, balki barcha avtonom sun'iy intellekt agentlari uchun O'zbekistondagi eng qulay, eng tezkor va eng ishonchli elektron tijorat platformasiga aylanadi**. 

Barcha bosqichlar loyihamizning mavjud arxitekturasiga 100% mos va uni bosqichma-bosqich, saytning jonli faoliyatiga zarracha xalal bermasdan joriy etish mumkin.
