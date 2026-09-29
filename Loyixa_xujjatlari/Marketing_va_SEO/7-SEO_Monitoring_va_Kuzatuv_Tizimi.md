# SEO Monitoring va Kuzatuv Tizimi

> Ushbu hujjat `SEO.md` faylidan **7-qism: SEO Monitoring va Kuzatuv Tizimi** mavzusi bo‘yicha tartibli jamlangan material hisoblanadi.

---

## 1. Google Search Console va Bing Webmaster Tools

Saytning skanerlash va indekslanish holatini muntazam tekshirib borish uchun asosiy vositalar:

- **Google Search Console**;
- **Bing Webmaster Tools**.

Bu ikki vosita orqali:

- sahifalarning skanerlash (crawl) holati;
- indekslanish holati;
- xatoliklar;
- sitemap holati;
- Core Web Vitals;
- search queries va CTR;
- Product rich result issues;
- Merchant listings;

kabi ma’lumotlar kuzatiladi.

### Google + Bing — ikkalasi ham kerak

2026-yilda Bing o‘zining Webmaster Guidelines sahifasida SEO asoslari **Bing Search + Copilot + AI grounding** uchun bir xil texnik poydevor bo‘lib xizmat qilishini ochiq ko‘rsatmoqda.

Shuning uchun:

```text
Google SEO
```

emas,

```text
Search ecosystem SEO
```

qilish kerak. Ya’ni:

- Google Search;
- Google Shopping;
- Bing;
- Copilot;
- AI search experiences

uchun bir xil kuchli ma’lumot arxitekturasi.

---

## 2. Sora.uz uchun muntazam kuzatilishi kerak bo‘lgan ko‘rsatkichlar

Sora.uz uchun quyidagilarni muntazam kuzatish kerak:

- Indexed;
- Not indexed;
- Crawled – currently not indexed;
- Discovered – currently not indexed;
- Duplicate, Google chose different canonical;
- Alternate page with proper canonical;
- Soft 404;
- Server errors;
- Sitemap status;
- Core Web Vitals;
- Search queries;
- CTR;
- Product rich result issues;
- Merchant listings;
- AI Search visibility.

Bu amalda **SEO monitoring platformasining asosiy qismi** bo‘ladi.

---

## 3. Xatoliklarni kuzatish

Saytdagi quyidagi xatoliklar doimiy monitoring qilinishi kerak:

- **404** — topilmagan sahifalar;
- **500** — server xatolari;
- **Soft 404** — mavjud bo‘lmagan, ammo 200 qaytarayotgan sahifalar;
- **Dublikat muammolar**;
- **Sitemap holati**;
- **Server errors**.

### Status kodlar va ularning monitoringi

E-commerce’da status kodlar to‘g‘ri ishlashi kerak:

| Holat | Status kod |
|---|---|
| Mahsulot mavjud | `200` |
| Mahsulot butunlay o‘chirilgan | `404` yoki `410` |
| Mahsulot boshqa URL’ga ko‘chirilgan | `301` |

“O‘chirilgan mahsulot URL’iga yana boshqa mahsulotni chiqarib qo‘yish” kabi noto‘g‘ri **soft-404** strukturalar SEO uchun zararli bo‘lishi mumkin.

### Dublikat muammolar

Quyidagilar kuzatilishi kerak:

- `Duplicate, Google chose different canonical`;
- `Alternate page with proper canonical`;
- filter / sort / pagination kombinatsiyalaridan kelib chiqqan dublikatlar.

---

## 4. Sitemap holatini monitoring qilish

`sitemap.xml` holatini doimiy tekshirib borish kerak:

- sitemap qabul qilindimi?
- sitemap’da xatolik bormi?
- sitemap’da qancha URL bor?
- sitemap’ga keraksiz URL tushib qolganmi?
- `lastmod` to‘g‘ri yangilanmoqdami?

Sitemap faqat **indexda bo‘lishini xohlagan canonical sahifalar** uchun bo‘lishi kerak. Sitemap’ga filter URL, sort URL, cart, account, login, checkout, internal search, duplicate URL kabi keraksiz manzillarni tiqib tashlamaslik kerak.

---

## 5. Core Web Vitals monitoring

Core Web Vitals ko‘rsatkichlarini doimiy kuzatish kerak:

- **LCP** — 2.5 soniyadan past bo‘lishi kerak (“Good”);
- **INP** — 200 millisekunddan past bo‘lishi kerak (“Good”);
- **CLS** — 0.1 dan past bo‘lishi kerak (“Good”).

Core Web Vitals — faqat server javob tezligi (TTFB) emas. U real foydalanuvchilarning qurilmasida o‘lchanadi (**CrUX ma’lumotlari**).

2026-yil mart oyidan boshlab Google Core Web Vitals’ni **kompozit (umumiy) ball** sifatida baholaydi. Ya’ni saytning eng yomon sahifasi eng yaxshi sahifasiga ham salbiy ta’sir ko‘rsatishi mumkin.

Shuning uchun CWV’ni doimiy kuzatib borish va muammolarni erta aniqlash juda muhim.

---

## 6. Merchant listings va Product rich result monitoring

Google Search Console’da quyidagilarni kuzatish kerak:

- **Product rich result issues**;
- **Merchant listings** holati;
- structured data bilan bog‘liq xatoliklar;
- narx va availability sinxronligi.

### Muhim eslatma

Structured data’dagi rating ham real sahifada ko‘rsatilayotgan ma’lumotga mos kelishi kerak; noto‘g‘ri structured data Google / Bing tomonidan e’tiborsiz qoldirilishi yoki muammoga olib kelishi mumkin.

### Google Merchant Center monitoringi

Google Merchant Center’da:

- product feed / data source holati;
- disapproval bo‘lgan mahsulotlar;
- til mosligi;
- narx va availability sinxronligi;

kabi masalalar doimiy kuzatilishi kerak.

Google Merchant API 2026-yil holatida mahsulot narxi va availability kabi tez-tez o‘zgaruvchi atributlarni yangilash imkonini beradi va mahsulotlarni muntazam yangilab turishni tavsiya qiladi.

---

## 7. Search queries va CTR monitoring

Google Search Console’da quyidagilarni tahlil qilish kerak:

- **Search queries** — qaysi so‘rovlar orqali foydalanuvchilar kelmoqda;
- **CTR** — bosish ko‘rsatkichlari;
- **Position** — o‘rtacha pozitsiya;
- **Impressions** — ko‘rsatishlar soni.

### Title va description’ni optimallashtirish

CTR past bo‘lsa:

- `title` qayta ko‘rib chiqiladi;
- `description` qayta yoziladi;
- structured data boyitiladi;
- rasmlar va variantlar yaxshilanadi.

Har bir mahsulot uchun `title` individual bo‘lishi kerak.

Yaxshi misol:

```text
Samsung Galaxy S25 256GB — narxi, xususiyatlari | BRAND
```

Yomon misol (hamma mahsulotlarda bir xil):

```text
Mahsulot | Online Shop
```

Google ham har bir sahifada descriptive, concise `<title>` bo‘lishini tavsiya qiladi. Google kerak bo‘lsa search-result title’ini `<title>`dan emas, sahifadagi boshqa manbalardan ham qayta yaratishi mumkin.

---

## 8. AI Search visibility monitoring

2026-yilda AI Search’ni ham hisobga olish kerak.

### Asosiy statistikalar

- Google AI Overviews hozirda so‘rovlarning taxminan **48%ida** ko‘rinadi (2025-yilda 30% edi).
- AI Overview mavjud bo‘lganda, foydalanuvchilarning atigi **8%i** an’anaviy havolalarni bosadi (AI Overview bo‘lmaganda bu ko‘rsatkich 15%).
- AI Overview’da keltirilish (**citation**) reytingdan ham muhimroq bo‘lib bormoqda.

Shuning uchun AI Search visibility alohida kuzatilishi kerak:

- AI Overviews’da sayt keltirilganmi?
- AI Mode’da ko‘rinadimi?
- Bing Copilot’da keltiriladimi?

### Google I/O 2026 — qidiruv paradigmasi o‘zgargan

2026-yil 19-mayda Google I/O’da Sundar Pichai qidiruvni 25 yil ichidagi eng katta o‘zgarishga uchratdi:

- **Gemini 3.5 Flash** AI Mode’da standart modelga aylandi;
- Qidiruv qutisi endi ko‘p formatli (matn, rasm, video, Chrome tablari) kirish nuqtasiga aylandi;
- Foydalanuvchilar endi 2-3 so‘zli kalit so‘zlar bilan emas, uzun, kontekstli savollar bilan murojaat qilmoqda;
- Bu klassik kalit so‘z tadqiqoti modelini butunlay o‘zgartirmoqda.

---

## 9. Kuzatuv jarayonining tuzilishi

Sora.uz uchun quyidagilarni muntazam kuzatish kerak:

| Yo‘nalish | Holat |
|---|---|
| Indexed | ✅ |
| Not indexed | ✅ |
| Crawled – currently not indexed | ✅ |
| Discovered – currently not indexed | ✅ |
| Duplicate, Google chose different canonical | ✅ |
| Alternate page with proper canonical | ✅ |
| Soft 404 | ✅ |
| Server errors | ✅ |
| Sitemap status | ✅ |
| Core Web Vitals | ✅ |
| Search queries | ✅ |
| CTR | ✅ |
| Product rich result issues | ✅ |
| Merchant listings | ✅ |
| AI Search visibility | ✅ |

Bu amalda **SEO monitoring platformasining asosiy qismi** bo‘ladi.

---

## 10. Eng muhim ustuvor vazifalar

Agar hammasini birdan qilish imkoniyati bo‘lmasa, quyidagi tartibda ishlash tavsiya etiladi:

1. SEO-friendly URL architecture.
2. Server-rendered product/category pages.
3. Dynamic metadata.
4. Canonical + filter/indexing strategy.
5. Product structured data.
6. Dynamic sitemap + robots.
7. Google Merchant Center.
8. Original product/category content.
9. Core Web Vitals + mobile performance.
10. Search Console + Bing Webmaster Tools orqali doimiy monitoring.

Mana shu 10 ta yo‘nalish to‘g‘ri bajarilsa, Next.js e-commerce loyiha uchun juda mustahkam SEO poydevori hosil bo‘ladi.

---

## 11. Sora.uz SEO strategiyasining yaxlit ko‘rinishi

Sora.uz SEO strategiyasida quyidagilar birgalikda ko‘rilishi kerak:

```text
Technical SEO + Content + Merchant/Search data + Authority + Brand
```

### Lokal SEO signallari

Agar Sora.uz real O‘zbekiston do‘koni bo‘lsa, quyidagilar juda muhim:

- **Google Business Profile**;
- kompaniya nomi;
- telefon;
- manzil;
- ish vaqti;
- do‘konlar;
- xarita;
- **local inventory**;
- **local landing pages**.

Google 2026-yilda e-commerce content’ni Maps kabi boshqa Google surfaces’da ham chiqarishi mumkinligini ko‘rsatadi.

---

## 12. SEO ≠ keyword + meta tag

2026-yilda e-commerce SEO’ni quyidagicha tasavvur qilish to‘g‘ri:

```text
SEO ≠ keyword + meta tag
```

Balki:

```text
SEO =
Texnik SEO
Crawlability
Indexability
Canonicalization
Fast/mobile UX
Product structured data
Merchant Center
Original content
Internal linking
Trust/reviews
Image SEO
Search Console monitoring
AI Search readiness
```

Google’ning 2026-yilgi materiallari AI Search paydo bo‘lishiga qaramay, odatiy SEO asoslari hanuz markaziy ekanini tasdiqlaydi; Bing esa ayni texnik poydevor **Copilot** va **AI-grounding** uchun ham ishlashini ochiq aytmoqda.

---

## 13. Eng muhim xulosalar

- Google Search Console va Bing Webmaster Tools — doimiy monitoring uchun asos.
- 404, 500, soft-404, dublikat va sitemap muammolari muntazam kuzatilishi kerak.
- Core Web Vitals (LCP, INP, CLS) real foydalanuvchi qurilmasida o‘lchanadi.
- Merchant listings va Product rich result issues alohida kuzatilishi kerak.
- Search queries va CTR tahlili orqali `title` / `description` optimallashtiriladi.
- AI Search visibility (AI Overviews, AI Mode, Bing Copilot) — yangi kuzatuv yo‘nalishi.
- Monitoring — bu bir martalik emas, doimiy jarayon.
- Search ecosystem SEO — Google + Bing + Copilot + AI search uchun yagona arxitektura.