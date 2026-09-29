# Dasturiy Arxitektura va Texnik SEO (Next.js + 1C)

> Ushbu hujjat `SEO.md` faylidan **1-qism: Dasturiy Arxitektura va Texnik SEO (Next.js + 1C)** mavzusi bo‘yicha tartibli jamlangan material hisoblanadi.

---

## 1. Umumiy arxitektura

Sora.uz kabi katta e-commerce loyihasida mahsulot ma’lumotlari 1C/API’dan keladi. SEO uchun ideal model:

```text
1C / API
   ↓
Integration / API layer
   ↓
SEO / Product read model
   ↓
Next.js server
   ↓
SEO-friendly HTML + Metadata + Structured Data
   ↓
CDN / Google Search / Google Shopping / Bing / Copilot / AI Search
```

Bu modelda Google crawler’i hech qachon to‘g‘ridan-to‘g‘ri 1C’ning tranzaksion API’siga kirmasligi kerak. 1C — **source of truth** bo‘lishi mumkin, ammo SEO traffic uchun alohida **SEO read layer** yoki **read model** yuritilishi tavsiya etiladi.

Noto‘g‘ri model:

```text
Browser ochildi → JS ishga tushdi → API’dan product olindi → keyin HTML paydo bo‘ldi
```

Bu SEO uchun asosiy mexanizm bo‘lib qolmasligi kerak. To‘g‘ri model:

```text
1C / API → Next.js server → SEO-friendly HTML → Google/Bing
```

---

## 2. Next.js Server Components va server-rendering

Next.js App Router arxitekturasi asosan Server Components va fayl tizimiga asoslangan Dynamic Routing ustiga qurilgan. Bu SEO va unumdorlik uchun kuchli vositalarni beradi.

### Afzalliklari

- Server Components client JS bundle’ini kamaytirishga yordam beradi.
- HTML sahifalar serverda tayyorlanadi va qidiruv botlariga tayyor HTML yetib boradi.
- Backend integratsiyasi xavfsiz bo‘ladi: API kalitlari va maxfiy tokenlar brauzerga chiqmaydi.
- 1C HTTP REST xizmatiga server orqali xavfsiz murojaat qilish mumkin.
- Ma’lumotlar serverda keshlanadi, takroriy tarmoq trafigi tejaladi.
- Google botlari tayyor, to‘laqonli HTML sahifani tezroq o‘qiy oladi.

### Kamchiliklari va cheklovlari

- Server Component’larda `useState`, `useEffect`, `useReducer` kabi hook’larni ishlatib bo‘lmaydi.
- `window`, `document`, `localStorage`, xarita integratsiyalari kabi faqat brauzerda mavjud obyektlarga to‘g‘ridan-to‘g‘ri kirish mumkin emas.
- Server va client o‘rtasidagi chegarani to‘g‘ri tushunish kerak, aks holda hydration xatolari ko‘payadi.
- Interaktiv qismlar — tugmalar, modallar, dinamik filtrlar, drag-and-drop elementlar — uchun `"use client"` direktivasi orqali Client Component ishlatilishi shart.

### Dynamic Routing

Dynamic Routing (`[id]` yoki `[...slug]`) katta bazalar uchun qulay:

- bitta shablon orqali cheksiz mahsulotni ko‘rsatish mumkin;
- `[...slug]` orqali ko‘p qatlamli kategoriyalarni boshqarish oson;
- `generateStaticParams` yordamida tez-tez kiriladigan sahifalarni build vaqtida statik HTML qilib tayyorlash mumkin;
- Vercel tarmog‘ida yaxshi keshlanadi.

Cheklovlar:

- oldindan generatsiya qilinmagan dinamik sahifada birinchi so‘rovda kechikish bo‘lishi mumkin;
- bir xil darajadagi juda ko‘p dinamik segmentlar marshrutlash konfliktiga olib kelishi mumkin.

### JavaScript haqida muhim nuqta

Google JavaScript’ni render qiladi. “JavaScript ishlatsa Google index qilmaydi” degan qarash noto‘g‘ri. Lekin JS rendering uchun resurs, vaqt va cheklovlar mavjud. Shuning uchun mahsulot nomi, narxi, tavsifi kabi **critical content server-side HTML’da** bo‘lishi juda foydali.

---

## 3. 1C bilan integratsiya: SEO read model

Google crawler’ni 1C’ning transactional API’siga yaqin olib borish yaxshi arxitektura emas. Ayniqsa 1C Enterprise backend bo‘lsa, SEO traffic uchun alohida read-oriented product API yoki cache ishlatish xavfsizroq.

Tavsiya etilgan oqim:

```text
Google → Next.js → cache/read model → 1C
```

Ya’ni:

- 1C — asosiy ma’lumot manbasi;
- SEO traffic uchun alohida **SEO read layer**;
- Next.js server shu read layer’dan oladi;
- Google hech qachon to‘g‘ridan-to‘g‘ri 1C API’siga chiqmaydi.

Bu yondashuv `revalidate` bilan bog‘liq muammolarni ham sezilarli kamaytiradi.

---

## 4. Kesh strategiyasi: On-demand Revalidation

Har 2 daqiqada keshni yangilash (`revalidate: 120`) har doim ham to‘g‘ri emas. Agar internet-do‘konda 10 000 yoki 50 000 ta mahsulot bo‘lsa va Googlebot saytni faol skanerlasa, har 2 daqiqada server orqa fonda 1C API’siga qayta-qayta so‘rov yuboradi. Bu 1C serverini ortiqcha yuklashi va server xarajatlarini oshirishi mumkin.

Shuning uchun vaqtga bog‘liq umumiy revalidation o‘rniga **On-demand Revalidation** strategiyasi afzal:

```text
1C’da narx yoki qoldiq o‘zgardi
   ↓
Webhook orqali Next.js serveriga xabar
   ↓
Aynan o‘sha mahsulot sahifasining keshi yangilanadi
```

Gibrid model ko‘pincha yaxshiroq:

- inventory/price uchun qisqa TTL;
- kontent uchun uzun TTL;
- muhim o‘zgarishda on-demand invalidation.

Qachon yangilash kerak:

- narx o‘zgardi;
- availability o‘zgardi;
- description o‘zgardi;
- asosiy rasm o‘zgardi;
- category o‘zgardi.

`lastmod`ni har soatda “hozirgi vaqt”ga qo‘yish kerak emas. Faqat sezilarli o‘zgarish bo‘lganda yangilanishi kerak.

---

## 5. Core Web Vitals (LCP, INP, CLS)

Core Web Vitals — faqat server javob tezligi (TTFB) emas. U real foydalanuvchilarning qurilmasida o‘lchanadi (CrUX ma’lumotlari). Agar sahifada og‘ir rasmlar, shriftlar sakrashi yoki tugma bosilganda sahifa qotib qolsa, server qanchalik tez bo‘lmasin, sayt CWV testidan yiqiladi.

Asosiy ko‘rsatkichlar:

- **LCP** — 2.5 soniyadan past bo‘lishi kerak (“Good”).
- **INP** — 200 millisekunddan past bo‘lishi kerak (“Good”).
- **CLS** — 0.1 dan past bo‘lishi kerak (“Good”).

2026-yil mart oyidan boshlab Google Core Web Vitals’ni kompozit (umumiy) ball sifatida baholaydi. Ya’ni saytning eng yomon sahifasi eng yaxshi sahifasiga ham salbiy ta’sir ko‘rsatishi mumkin.

E-commerce’da mahsulot sahifasida odatda rasm, gallery, narx, variant, review, tavsif, recommendation kabi ko‘p elementlar bo‘ladi. Shuning uchun:

- rasmlar optimallashtirilishi;
- shrift sakrashi oldini olinishi;
- interaktivlik kechikmasligi;
- mobil qurilmada tez ishlashi;
- Next.js server rendering va kesh imkoniyatlaridan to‘g‘ri foydalanish zarur.

---

## 6. Mobile-first SEO

2026-yilda e-commerce uchun saytni desktopdan boshlab keyin mobile’ga moslashtirishdan ko‘ra, **mobile-first** yondashuv ma’qul. Google foydalanuvchi mobil qurilmada nima ko‘rishini juda muhim deb hisoblaydi.

Mobil versiyada quyidagilar yo‘qolib qolmasligi kerak:

- mahsulot nomi;
- narx;
- availability;
- rasm;
- asosiy parametrlar;
- buy button;
- review;
- description.

Sayt tez, responsive, mobile-first va interaktiv bo‘lishi kerak. Ayniqsa LCP, INP, CLS ko‘rsatkichlari mobil qurilmada nazorat qilinishi zarur.

---

## 7. Texnik SEO tekshiruv ro‘yxati

| Yo‘nalish | Holat |
|---|---|
| HTTPS | ✅ |
| Canonical | ✅ |
| Dynamic title | ✅ |
| Dynamic description | ✅ |
| H1 | ✅ |
| Structured Data | ✅ |
| Product schema | ✅ |
| Product variants | ✅ |
| Breadcrumb | ✅ |
| XML Sitemap | ✅ |
| Robots.txt | ✅ |
| 404 | ✅ |
| 301 | ✅ |
| Internal linking | ✅ |
| Image SEO | ✅ |
| Mobile UX | ✅ |
| Core Web Vitals | ✅ |
| Google Search Console | ✅ |
| Bing Webmaster Tools | ✅ |
| Merchant Center | ✅ |
| IndexNow | ✅ |
| Reviews | ✅ |
| FAQ | ✅ |
| Unique category content | ✅ |
| Unique product value | ✅ |
| Filter URL control | ✅ |
| Pagination control | ✅ |
| Out-of-stock strategy | ✅ |
| Multilingual/hreflang, kerak bo‘lsa | ✅ |

### Status code’lar

- mahsulot mavjud → `200`;
- mahsulot butunlay o‘chirilgan → vaziyatga qarab `404` yoki `410`;
- mahsulot boshqa URL’ga ko‘chirilgan → `301`.

O‘chirilgan mahsulot URL’iga boshqa mahsulotni chiqarib qo‘yish kabi soft-404 strukturalar SEO uchun zararli.

### robots.txt va noindex farqi

- “Google indexlamasin” → ko‘pincha `noindex`;
- “Google bu URL’ga umuman crawl qilmasin” → `robots.txt`.

Google `robots.txt` bilan bloklangan URL ichidagi `noindex`ni ko‘rmasligi mumkin. Shuning uchun bu farq saqlanishi kerak.

### Sitemap

E-commerce uchun dynamic XML sitemap tavsiya etiladi. Unda asosiy kategoriya, mahsulot, brend va SEO article URL’lari bo‘lishi kerak. Sitemap’ga filter URL, sort URL, cart, account, login, checkout, internal search, duplicate URL kabi keraksiz manzillarni tiqib tashlamaslik kerak.

---

## 8. Eng muhim xulosalar

Sora.uz uchun eng katta SEO imkoniyati mahsulot ma’lumotlari tashqi API/1C’dan kelayotganining o‘zida emas, balki shu ma’lumotlarni Next.js orqali Google/Bing uchun semantik, server-rendered, structured va doimiy yangilanadigan product ecosystemga aylantirishda.

2026-yil uchun yakuniy model:

```text
1C / API
   ↓
Next.js server
   ↓
SEO Product Page
   ↓
Product Schema + Metadata + Canonical
   ↓
Dynamic Sitemap
   ↓
Google Search + Google Shopping
   ↓
Bing + Copilot
   ↓
AI Search / AI Overviews / AI Mode
```

Bu yondashuv Next.js + tashqi API + Vercel arxitekturasi uchun ayniqsa mos.

### Ustuvor vazifalar

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