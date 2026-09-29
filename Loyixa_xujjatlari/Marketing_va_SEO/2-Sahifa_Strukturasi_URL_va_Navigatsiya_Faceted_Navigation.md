# Sahifa Strukturasi, URL va Navigatsiya (Faceted Navigation)

> Ushbu hujjat `SEO.md` faylidan **2-qism: Sahifa Strukturasi, URL va Navigatsiya (Faceted Navigation)** mavzusi bo‘yicha tartibli jamlangan material hisoblanadi.

---

## 1. URL strukturasi va kanonik manzillar

Har bir mahsulot uchun mantiqiy, qisqa, barqaror va mahsulotni aniq ifodalaydigan **canonical URL** shakllantirilishi kerak.

Asosiy qoida:

```text
1 mahsulot = 1 asosiy canonical URL
```

### Yaxshi URL belgilari

- qisqa;
- mantiqiy;
- o‘zgarmaydigan;
- mahsulotni ifodalovchi;
- odam ham, qidiruv tizimi ham tushuna oladigan.

Yaxshi misol:

```text
/telefonlar/samsung/galaxy-s25
```

Yomon misol:

```text
/product?id=842731
```

Strukturali URL `?id=842731` kabi parametrli URL’dan ancha tushunarli.

### Mahsulot URL’i va kategoriya ierarxiyasi

`/telefonlar/samsung/galaxy-s25` kabi URL yaxshi, ammo URL ichiga category hierarchy’ni haddan tashqari qattiq bog‘lamaslik kerak.

Juda chuqur URL muammo tug‘dirishi mumkin:

```text
/electronics/phones/smartphones/android/samsung/galaxy/s25/256gb
```

Sora.uz uchun **stabil product canonical URL** muhim. Kategoriya ko‘chsa ham mahsulot URL’ini o‘zgartirmaslik ko‘pincha yaxshi.

Masalan:

```text
/product/samsung-galaxy-s25-256gb
```

yoki:

```text
/p/samsung-galaxy-s25-256gb
```

Kategoriya esa alohida relation sifatida saqlanishi mumkin. Bu slug o‘zgarishi sababli 301 redirectlar sonini kamaytiradi.

### Slug lifecycle va 301 redirect

Mahsulot nomi yoki slug o‘zgarganda eski URL’ni shunchaki yo‘qotmasdan, kerak bo‘lsa **301 redirect** bilan yangi URL’ga o‘tkazish kerak.

---

## 2. Duplicate URL va indekslash siyosati

E-commerce’dagi eng katta SEO muammolaridan biri:

```text
filter + sort + pagination + query parameter
```

Masalan:

```text
/telefonlar
/telefonlar?brand=samsung
/telefonlar?brand=samsung&color=black
/telefonlar?sort=price
/telefonlar?sort=rating
/telefonlar?price=5000000-10000000
```

Shunday qilib minglab yoki millionlab URL paydo bo‘lishi mumkin. Google bunday URL’larni duplicate yoki juda o‘xshash sahifalar sifatida guruhlashtirishi mumkin.

Canonical shu holatda asosiy URL’ni ko‘rsatish uchun muhim signal hisoblanadi, lekin Google canonical’ni yakuniy buyruq emas, **signal** sifatida ko‘radi.

### Indekslash siyosati

Quyidagilarni aniq belgilash kerak:

- qaysi filter kombinatsiyasi index qilinadi?
- qaysi filter canonical bo‘ladi?
- qaysi biri `noindex`?
- qaysi biri `robots.txt` bilan cheklanadi?
- SEO landing page qachon yaratiladi?
- 100 000 filter kombinatsiyasidan qaysilari Google’ga ochiladi?

Umumiy mantiq:

| URL turi | Siyosat |
|---|---|
| SEO qiymatli sahifa | `index` |
| Faqat navigatsiya uchun kombinatsiya | `noindex` yoki canonicalizatsiya |
| Crawl qilinmasligi kerak bo‘lgan kombinatsiya | `robots.txt` |

Misol:

```text
/noutbuklar/lenovo
```

SEO qiymatli bo‘lishi mumkin.

Lekin:

```text
/noutbuklar?brand=lenovo&ram=16&color=black&sort=price
```

SEO qiymatli bo‘lmasligi mumkin.

Shuning uchun filterlar uchun aniq indexing policy kerak:

- index qilinadigan kombinatsiyalar;
- crawl qilinishi mumkin, lekin index qilinmaydiganlar;
- umuman crawl qilinmasligi kerak bo‘lgan kombinatsiyalar.

### Faceted navigation strategiyasi

E-commerce’da faceted navigation strategiyasi SEO architecture’ning markaziy qismidir:

```text
Category → brand → model → specification → filters → pagination
```

Bu yerda har bir filter SEO landing page bo‘lavermaydi. Har bir kombinatsiyani Google’ga index qildirish katta xato.

### Pagination

Pagination alohida nazorat qilinishi kerak. Pagination sahifalari filter va sort kombinatsiyalari bilan aralashganda duplicate URL’lar ko‘payadi. Har bir pagination holati uchun canonical va index/noindex siyosati aniq belgilanishi kerak.

### Sitemap va canonical

Sitemap’ga hamma URLni tiqib tashlamaslik kerak.

Sitemap’ga quyidagilar kirmasligi kerak:

- filter URL;
- sort URL;
- cart;
- account;
- login;
- checkout;
- internal search;
- duplicate URL.

Sitemap faqat **indexda bo‘lishini xohlagan canonical sahifalar** uchun bo‘lishi kerak.

Google sitemap documentation’da `lastmod` sahifaning muhim o‘zgarish sanasini ifodalashi kerakligi ko‘rsatilgan. `lastmod`ni har soatda “hozirgi vaqt”ga qo‘yish kerak emas. Faqat sezilarli o‘zgarish bo‘lganda yangilanishi kerak:

- narx o‘zgardi;
- availability o‘zgardi;
- description o‘zgardi;
- asosiy rasm o‘zgardi;
- category o‘zgardi.

---

## 3. Breadcrumbs (Non ushoqlari)

Sahifa yuqori qismida iyerarxik yo‘nalish zanjiri ko‘rsatilishi lozim.

Misol:

```text
Bosh sahifa → Maishiy texnika → Oshxona → Elektr choynak
```

Yoki:

```text
Bosh sahifa → Telefonlar → Samsung → Galaxy S25
```

SEO foydasi:

- Google botlari sayt tuzilishini mukammal tushunadi;
- qidiruv natijalarida havolangiz ostida bo‘limlar chiroyli ko‘rinadi;
- foydalanuvchi uchun sahifaning joylashuvi tushunarli bo‘ladi.

Breadcrumb ham foydalanuvchi uchun, ham search engine uchun sahifaning ierarxik joylashuvini tushunishga yordam beradi.

---

## 4. Internal linking (Ichki havolalar)

Mahsulot sahifasi pastida quyidagi bo‘limlarni joylashtirish tavsiya etiladi:

- “O‘xshash mahsulotlar”;
- “Boshqalar ushbu mahsulot bilan birga sotib oldi”;
- shu kategoriya;
- shu brend;
- alternativlar;
- premium alternativ;
- arzonroq variant.

SEO foydasi:

- sayt ichidagi sahifalarni bir-biri bilan bog‘laydi;
- foydalanuvchining saytda qolish vaqtini uzaytirishi mumkin;
- Google botiga sayt bo‘ylab chuqur kirib borishga yordam beradi.

Internal linkingning kuchli jihatlari:

- discovery;
- crawl path;
- topical relationships;
- site hierarchy;
- contextual relevance.

Google crawlable links’ni asosiy discovery mexanizmlaridan biri sifatida ko‘rsatadi.

### Blog → Category → Product

Faqat mahsulot sahifalari emas, blog va guide sahifalari ham ichki havolalar tarmog‘iga ulanadi:

```text
Blog / Guides
   ↓
Comparisons
   ↓
FAQ / Educational content
   ↓
Products
```

Keyin:

```text
Blog → Category → Product
```

orqali mahsulotlarga ichki linklar beriladi.

Bu nafaqat foydalanuvchi uchun qulay, balki qidiruv crawler’lariga saytning:

- entity relationship;
- tuzilishini tushunishga yordam beradi.

---

## 5. Kategoriya va brend sahifalari

### Kategoriya sahifalari

Kategoriya sahifasi shunchaki mahsulot grid’i bo‘lmasligi kerak.

Masalan:

```text
/telefonlar
```

Unda quyidagilar bo‘lishi kerak:

- H1: Smartfonlar;
- qisqa kategoriya tavsifi;
- qaysi telefonlar bor;
- kim uchun;
- asosiy brendlar;
- asosiy parametrlar;
- qanday tanlash;
- filter;
- category taxonomy;
- brands;
- price ranges;
- comparison;
- FAQ;
- buying guide;
- mahsulotlar.

“Telefonlar” sahifasida 1 500 so‘zli sun’iy SEO text va pastda product grid qilish emas, balki foydalanuvchi haqiqatan foydalanadigan filter, taxonomy, brendlar, price ranges, comparison, FAQ va buying guide bo‘lishi kerak.

### Brend sahifalari

Brend sahifalari ham SEO obyektiga aylantirilishi kerak.

Masalan:

```text
/brand/samsung
```

Bu oddiy mahsulot ro‘yxati bo‘lmasligi kerak. Unda:

- Samsung haqida;
- Samsung telefonlari;
- Samsung planshetlari;
- Samsung mahsulotlarini qanday tanlash;
- kabi foydali kontekst bo‘lishi kerak.

Shunda:

```text
Brand → Category → Product
```

ichki SEO ekotizimi hosil bo‘ladi.

---

## 6. Nazorat ro‘yxati

| Yo‘nalish | Holat |
|---|---|
| SEO-friendly URL architecture | ✅ |
| Har bir mahsulot uchun canonical URL | ✅ |
| Stabil product canonical URL | ✅ |
| Slug lifecycle va 301 redirect | ✅ |
| Filter URL control | ✅ |
| Sort URL control | ✅ |
| Pagination control | ✅ |
| Canonical + filter/indexing strategy | ✅ |
| Faceted navigation policy | ✅ |
| Breadcrumbs | ✅ |
| Internal linking | ✅ |
| O‘xshash mahsulotlar | ✅ |
| Birga sotib olinadiganlar | ✅ |
| Kategoriya sahifasi SEO strukturasi | ✅ |
| Brend sahifasi SEO strukturasi | ✅ |
| Sitemap faqat canonical URL’lar | ✅ |
| `lastmod` faqat sezilarli o‘zgarishda | ✅ |

---

## 7. Eng katta xatolar

E-commerce’da ayniqsa quyidagilardan saqlanish kerak:

1. Har bir filter kombinatsiyasini Google’ga index qildirish.
2. Sitemap’ga yuz minglab keraksiz URL qo‘shish.
3. Duplicate URL’larni nazorat qilmaslik.
4. Mahsulot slug’i o‘zgarganda 301 redirect qilmaslik.
5. Kategoriya sahifasini faqat product grid qilib qoldirish.
6. Brend sahifasini oddiy mahsulot ro‘yxatidan iborat qoldirish.
7. Ichki havolalar tarmog‘ini yaratmaslik.
8. Pagination va filter URL’larini aralash holda indekslash.