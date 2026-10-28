# E-Commerce AI Integratsiyasi va GEO (Generative Engine Optimization) Amaliy Rejasi (`Sora.uz` — Pro v2.0)

**Asosiy manba:** `Loyixa_xujjatlari/Marketing_va_SEO/text/Analysis of E-commerce AI Integration.txt`
**Loyiha:** `Sora.uz` (Next.js 16 App Router + 1C ERP B2B/B2C E-commerce platformasi)
**Maqsad:** Mahsulot kartochkalarida (PDP) xaridorlarga tashqi AI-ekspertlar (ChatGPT, Google AI Mode, Perplexity, Claude) yordamida tezkor va ijobiy tahlil olish imkoniyatini yaratish, konversiyani (CR) oshirish hamda `Sora.uz` domenini AI qidiruv tizimlarida (GEO) ishonchli birlamchi manba sifatida mustahkamlash.

---

## 1. Chuqur Kod Auditi: `Sora.uz` da Nimalar Tayyor va Qanday Yashirin Kamchiliklar Topildi?

Loyiha kod bazasini (`src/app/robots.ts`, `src/proxy.ts`, `src/lib/schemas/product.ts`, `src/components/seo/ProductJsonLd.tsx`, `src/components/pdp/ProductTabs.tsx`) qatorma-qator tekshirish natijasida quyidagi holat aniqlandi:

### ✅ Allaqachon Tayyor Bo'lgan Qismlar (GEO Poydevori):
1. **AI Qidiruv Botlari uchun Ruxsat (`src/app/robots.ts`):**
   - `OAI-SearchBot`, `ChatGPT-User` (OpenAI real-time brauzeri), `PerplexityBot`, `Claude-SearchBot`, `Claude-User`, `Google-Extended` va `Applebot-Extended` botlariga barcha mahsulot sahifalari (`/uz/products/*`, `/ru/products/*`), `/llms.txt`, `/llms-full.txt` va `/*.md` (Markdown Twin) sahifalarini o'qishga to'liq ruxsat (`allow`) berilgan.
2. **Markdown Twin va Content-Negotiation (`src/proxy.ts` va `src/lib/utils/markdown.ts`):**
   - Har bir mahsulot uchun `https://sora.uz/{locale}/products/{slug}.md` manzili ishlab turibdi va `Accept: text/markdown` so'rovlariga avtomatik toza Markdown qaytaradi.
3. **Yandex Metrika Maqsadlari (`src/lib/analytics/yandex.ts`):**
   - `reachGoal(target, params)` funksiyasi tayyor va ishchi holatda.

### 🚨 Kod Auditida Topilgan 7 Ta Yashirin Muammo (va Ularning Yechimi):

1. **MUAMMO #1: `ProductJsonLd.tsx` da `additionalProperty` (Texnik xususiyatlar) yo'q ekan!**
   - **Holat:** `src/components/seo/ProductJsonLd.tsx` da `name`, `price`, `sku`, `gtin13`, `brand` bor, lekin 1C dan keladigan `product.attributes` (texnik xususiyatlar jadvali) hamda `package`, `country`, `manufacturer` ma'lumotlari `Schema.org/PropertyValue` (`additionalProperty`) sifatida JSON-LD ga umuman qo'shilmagan.
   - **Oqibati:** AI botlar HTML jadval ichidan xususiyatlarni qidirishga majbur bo'ladi.
   - **Yechim:** `ProductJsonLd.tsx` ga `additionalProperty` massivini qo'shamiz — shunda ChatGPT va Perplexity 1 soniyada mahsulotning barcha parametrlarini JSON-LD dan o'qiydi.

2. **MUAMMO #2: 1C Ma'lumotlar Strukturasi (`product.specs` emas, `product.attributes` va bo'sh atributlar):**
   - **Holat:** `src/lib/schemas/product.ts` (77-qator) da xususiyatlar `product.attributes` (`property_uz`, `property_ru`, `value_uz`, `value_ru`) ko'rinishida keladi. Ko'p tovarlarda 1C dan `attributes: []` (bo'sh) kelishi mumkin, ammo `brand`, `country`, `package`, `unit` va `short_description` to'ldirilgan bo'ladi.
   - **Yechim:** B-Shablon (Texnik prompt) uchun ma'lumot yig'ishda **3 bosqichli Fallback zanjiri** ishlatiladi:
     1) Avval `product.attributes` dan 3 ta eng muhim parametr olinadi;
     2) Agar `attributes` bo'sh bo'lsa, `Brend + Ishlab chiqarilgan davlat + Qadoq/O'lchov birligi` (`brand`, `country`, `package`) birlashtiriladi;
     3) Agar ular ham bo'lmasa, avtomatik **A-Shablon (Universal)** ga o'tiladi (hech qachon prompt ichida bo'sh qavs `()` qolib ketmaydi).

3. **MUAMMO #3: Ikki Tilli Kategoriya Sluglari (`category_slug_uz` vs `category_slug_ru`):**
   - **Holat:** Agar Aqlli Ko'rinish Filtrida faqat `loc.category_slug` ni tekshirsak, u o'zbek tilida `savdo-va-ofis-texnikasi`, rus tilida esa `torgovoe-i-ofisnoe-oborudovanie` bo'ladi. Natijada o'zbekcha sahifada AI tugmasi chiqib, ruscha sahifada chiqmay qolishi mumkin!
   - **Yechim:** Kategoriya filtrini tekshirishda tilga bog'liq bo'lmagan **`product.uz.category_slug_uz`** va **`product.ru.category_slug_ru`** ikkalasi baravar (yoki kalit so'zlar regulyar ifodasi orqali) tekshiriladi.

4. **MUAMMO #4: Mobil Qurilmalar, Telegram In-App Browser va Claude Avtorizatsiya To'sig'i:**
   - **Holat:** O'zbekistonda xaridorlarning ~80% qismi mobil telefondan (ko'pincha Telegram ichidagi brauzerdan) kiradi.
     - **ChatGPT**, **Google AI Mode (`udm=50`)** va **Perplexity** mobil brauzerda ro'yxatdan o'tmasdan ham (Guest mode) ishlaydi.
     - Ammo **Claude (`claude.ai/new?q=...`)** foydalanuvchidan tizimga kirishni (Login) talab qiladi, va login oynasidan o'tgach URL dagi `?q=` parametrini yo'qotib qo'yishi mumkin. Bundan tashqari, Telegram In-App Browser ichida Google OAuth (`Sign in with Google`) xavfsizlik sababli bloklanadi (`403 disallowed_useragent`).
   - **Yechim (Smart Clipboard Fallback):**
     1) Har qanday AI tugmasi bosilganda, havola ochilishi bilan bir vaqtda **prompt matni avtomatik tarzda foydalanuvchi buferiga (`navigator.clipboard.writeText`) ham nusxalanadi** va ekranning pastida 3 soniyalik bildirishnoma chiqadi: *"Savol nusxalandi! Agar AI oynasida matn chiqmasa, «Joylashtirish (Paste)» tugmasini bosing"*.
     2) Tugmalar qatoriga kichik **"Nusxa olish / Скопировать"** (Copy Prompt) tugmachasi ham qo'shiladi (foydalanuvchi o'zi xohlagan AI ilovasiga yoki Telegram botga tashlay olishi uchun).

5. **MUAMMO #5: Omborda Tugagan (`OutOfStock`) Tovarlar:**
   - **Holat:** Agar mahsulot omborda tugagan bo'lsa (`product.price?.stock === "OutOfStock"`), xaridor uni baribir sotib ololmaydi.
   - **Yechim:** `OutOfStock` holatidagi tovarlarda AI tahlil bloki ko'rsatilmaydi (xaridor e'tibori pastdagi *"O'xshash mahsulotlar"* blokiga yo'naltiriladi).

6. **MUAMMO #6: URL Uzunligi (`URI Too Long`) va 1C Tovar Nomlaridagi Maxsus Belgilar:**
   - **Holat:** 1C bazasida tovar nomlarida qo'shtirnoqlar (`"`, `«»`), `#`, `%`, `\n` kabi belgilar ko'p uchraydi. Shuningdek, kirill harflari `encodeURIComponent` qilinganda har bir harf 6 baytga (`%D0%9F...`) aylanadi va URL 2000 belgidan oshib ketib, Cloudflare yoki mobil brauzerda xato berishi mumkin.
   - **Yechim:**
     - Tovar nomi va xususiyatlari maxsus `sanitizeForPrompt(text, maxLength)` funksiyasidan o'tkaziladi (ichki qo'shtirnoqlar tozalanadi, mahsulot nomi 100 belgigacha, xususiyatlar 120 belgigacha qisqartiriladi).
     - Umumiy prompt matni **maksimal 350–400 belgi** atrofida ushlab turiladi.

7. **MUAMMO #7: Kanonik URL vs `.md` URL Tanlovi:**
   - **Savol:** Prompt ichida `https://sora.uz/uz/products/{slug}` berish kerakmi yoki `.md` bilan tugaydigan manzilni?
   - **Yechim:** Albatta **Kanonik HTML URL (`https://sora.uz/{locale}/products/{slug}`)** beriladi! Sababi:
     1) Perplexity va Google AI Mode javob ostida foydalanuvchiga **kliklanadigan manba (Citation Link)** chiqaradi. Agar `.md` bersak, boshqa foydalanuvchi manbani bosganda xarid sahifasiga emas, quruq matnli faylga tushib qoladi.
     2) Sahifamizning `<head>` qismida `<link rel="alternate" type="text/markdown" href="...md" />` va `ProductJsonLd` mavjud, `src/proxy.ts` esa `Accept: text/markdown` so'rovlariga avtomatik Markdown qaytaradi. Ya'ni Kanonik URL ham odamlar uchun, ham AI botlar uchun 2-in-1 ishlaydi!

---

## 2. Tanlangan AI Xizmatlar va URL Arxitekturasi

Mahsulot sahifasini keraksiz tugmalar bilan to'ldirmaslik va xaridor e'tiborini asosiy **"Savatga qo'shish"** tugmasidan chalg'itmaslik uchun **3 ta asosiy (+1 ta B2B opsional)** AI xizmati + **1 ta "Promptni nusxalash"** yordamchi tugmasi tanlab olinadi:

| № | AI Xizmat Nomi | Status | URL Qolipi (Endpoint) | Tanlanish Sababi (Biznes & GEO foydasi) |
| :--- | :--- | :--- | :--- | :--- |
| **1** | **ChatGPT** | **Majburiy (#1)** | `https://chatgpt.com/?q={ENCODED_PROMPT}` | O'zbekistonda eng ommabop AI (#1). `ChatGPT-User` boti orqali saytga real vaqtda (Direct Fetch) kirib, hatto 5 daqiqa oldin 1C dan qo'shilgan yangi tovarni ham o'qiy oladi. |
| **2** | **Google AI Mode** | **Majburiy (#2)** | `https://www.google.com/search?udm=50&q={ENCODED_PROMPT}` | `gemini.google.com` URL orqali prompt qabul qilmaydi. Ammo `udm=50` parametri foydalanuvchini to'g'ridan-to'g'ri Google'ning yangi **AI Mode** oynasiga olib kiradi va Login so'ramasdan, Enter bosmasdan avtomatik tahlilni boshlaydi. |
| **3** | **Perplexity** | **Tavsiya (#3)** | `https://www.perplexity.ai/search?q={ENCODED_PROMPT}` | Eng kuchli AI-qidiruv tizimi. Login talab qilmaydi. Javobda `Sora.uz` saytiga kliklanadigan manba (citation link) qoldiradi va saytning GEO-obro'sini keskin oshiradi. |
| **4** | **Claude** | **Opsional (100k+ / Texnika / B2B)** | `https://claude.ai/new?q={ENCODED_PROMPT}` | Ofis texnikalari, B2B uskunalar va narxi 100 000 so'mdan yuqori tovarlar uchun ko'rsatiladi. *(Avtomatik clipboard fallback bilan himoyalangan).* |
| ❌ | **Grok (X.ai)** | **Olib tashlanadi** | — | O'zbekistonda xarid (e-commerce) uchun deyarli ishlatilmaydi, interfeysni ortiqcha yuklaydi. |

---

## 3. Dinamik Prompt Engineering: 2 Xil "Sotuvchi" Prompt Formulasi

### A-Shablon: Universal "Sotuvchi" Prompt (Standart qimmat tovarlar va jamlanmalar uchun)
Texnik parametrlar ro'yxati bo'lmagan, ammo narxi `>= 300 000 so'm` bo'lgan tovarlar uchun:

* **O'zbek tilida (`locale === "uz"`):**
  > `Sora.uz onlayn do'konidagi "{MAHSULOT_NOMI}" ({NARXI_MATNI}) mahsulotini tahlil qilib ber: {KANONIK_URL} — Uning asosiy afzalliklari, sifat ko'rsatkichlari va aynan qanday vazifalar uchun eng yaxshi tanlov ekanligini qisqa punktlarda tushuntir.`
* **Rus tilida (`locale === "ru"`):**
  > `Проанализируй товар «{MAHSULOT_NOMI}» ({NARXI_MATNI}) в интернет-магазине Sora.uz на основе страницы: {KANONIK_URL} — Кратко выдели главные преимущества, ключевые характеристики и объясни, для каких задач эта модель подойдет лучше всего.`

### B-Shablon: Murakkab Texnika va Uskunalar Prompti (Ofis va savdo texnikasi uchun)
Texnik xususiyatlari (`product.attributes` yoki `brand + country + package`) mavjud bo'lgan uskunalar uchun:

* **O'zbek tilida (`locale === "uz"`):**
  > `Sora.uz saytidagi "{MAHSULOT_NOMI}" ({QISQA_XUSUSIYATLARI}, {NARXI_MATNI}) mahsulotining texnik ko'rsatkichlarini oddiy tilda tushuntirib ber: {KANONIK_URL} — Ushbu modelning kuchli tomonlari nimada va uni ofis yoki ish jarayonida ishlatishda nimalarga e'tibor berish kerak?`
* **Rus tilida (`locale === "ru"`):**
  > `Объясни простым языком технические характеристики товара «{MAHSULOT_NOMI}» ({QISQA_XUSUSIYATLARI}, {NARXI_MATNI}) из магазина Sora.uz: {KANONIK_URL} — В чем сильные стороны этой модели и на что обратить внимание при установке и эксплуатации?`

---

## 4. Aqlli Ko'rinish Filtri (`shouldShowAiAssistant`) Aniq Algoritmi

Oddiy 3 000 so'mlik ruchka, qalam yoki daftar sahifasida AI tugmalari ko'rsatilmaydi.

```ts
const TECH_CATEGORY_KEYWORDS = [
  "texnika", "oborudovanie", "uskuna",
  "doska", "doski",
  "aksessuar", "aksessuary",
  "shreder", "seyf", "seif",
  "laminator", "pereplet", "pereplyot",
  "hisoblagich", "schetchik", "detektor",
  "printer", "skaner", "kalkulyator"
];
```

**Ko'rsatish shartlari:**
1. **Shart 0 (Omborda borligi):** `product.price?.stock !== "OutOfStock"` bo'lishi shart (tugagan tovarda chiqmaydi).
2. **Shart 1 (Narx mezoni):** `priceInfo.price >= 300_000` (300 000 so'm va undan yuqori barcha tovarlar).
3. **Shart 2 (B2B / So'rov bo'yicha uskunalar):** `priceInfo.price <= 0` (narxi kelishiladigan yirik korporativ uskunalar).
4. **Shart 3 (Texnik kategoriya + o'rta narx):** Tovar kategoriyasi (`product.uz.category_slug_uz` yoki `product.ru.category_slug_ru`) `TECH_CATEGORY_KEYWORDS` dan birini o'z ichiga olsa **YOKI** `product.attributes.length >= 3` bo'lsa (va narxi kamida `>= 100_000 so'm` bo'lsa).

*(Shuningdek, **Claude** tugmasi: `isTechProduct === true` yoki `priceInfo.price >= 100_000` (100 000 so'm va undan yuqori barcha tovarlar) yoki `priceInfo.price <= 0` (B2B kelishilgan narx) bo'lganda 4-tugma sifatida ko'rsatiladi).*

---

## 5. UI/UX Joylashuv va Dizayn (`ProductAiAssistant.tsx`)

- **Joylashuvi:** `src/components/pdp/ProductActions.tsx` ichida — ikkilamchi tugmalar (*"Sevimlilarga / Taqqoslash"*) blokidan pastda, *"Rasmiy kafolat / Tezkor yetkazib berish"* (Trust Badges) blokidan tepada.
- **Vizual ko'rinishi:**
  - Yengil gradient fon (`bg-gradient-to-br from-slate-50 to-indigo-50/40 dark:from-slate-800/50 dark:to-indigo-950/20`), nozik chegara (`border-indigo-100/80`).
  - Yuqori qismda `Sparkles` ikonkasi bilan tushunarli Micro-copy:
    - **UZ:** *"Mahsulot sizga mos kelishiga ikkilanyapsizmi? AI-ekspertdan 5 soniyada qisqa tahlil oling:"*
    - **RU:** *"Сомневаетесь, подойдет ли вам товар? Получите краткий разбор от ИИ-эксперта за 5 секунд:"*
  - Pastki qatorda ixcham, mobil ekranda ham sig'adigan pill-tugmalar (`ChatGPT`, `Google AI`, `Perplexity`, `+Claude`) hamda o'ng burchakda **"Promptni nusxalash"** ikonkasi.

---

## 6. Bosqichma-Bosqich Texnik Ijro Rejasi (Implementation Checklist) — ✅ TO'LIQ BAJARILDI

1. **[x] `src/components/seo/ProductJsonLd.tsx` ni boyitish (BAJARILDI):**
   - `product.attributes`, `product.package`, `product.country`, `product.manufacturer`, `loc.unit` maydonlari `additionalProperty` (`@type: "PropertyValue"`) sifatida `Schema.org/Product` obyektiga qo'shildi.
2. **[x] `src/app/robots.ts` ni yangilash (BAJARILDI):**
   - `AI_SEARCH_BOTS` ro'yxatiga `Perplexity-User` va `GoogleOther` botlari qo'shildi.
3. **[x] `src/components/pdp/ProductAiAssistant.tsx` komponentini yaratish (BAJARILDI):**
   - `shouldShowAiAssistant` filtri (`OutOfStock` himoyasi, ikki tilli kategoriya/kalit so'zlar va narx filtri);
   - `sanitizeForPrompt` va 3 bosqichli Fallback bilan **A/B Prompt Generator**;
   - `navigator.clipboard.writeText` (Auto-copy fallback + Toast bildirishnoma + Manual copy tugmasi);
   - Yandex Metrika `reachGoal("ai_analyze_click", ...)` va `reachGoal("ai_prompt_copy", ...)` integratsiyasi.
4. **[x] `src/components/pdp/ProductActions.tsx` ga ulash (BAJARILDI):**
   - Komponent PDP harakatlar blokiga (Wishlist/Compare tugmalaridan keyin, Trust Badges dan oldin) integratsiya qilindi.
5. **[x] Tekshiruv (`npx tsc --noEmit` va `npm run build` — BAJARILDI):**
   - TypeScript (`0 errors`) va Next.js production build (`102/102 static pages`) muvaffaqiyatli o'tdi.
