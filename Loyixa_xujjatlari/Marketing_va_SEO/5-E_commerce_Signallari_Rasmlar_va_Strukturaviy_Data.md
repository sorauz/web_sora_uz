# E-commerce Signallari, Rasmlar va Strukturaviy Ma’lumotlar

> Ushbu hujjat `SEO.md` faylidan **5-qism: E-commerce Signallari, Rasmlar va Strukturaviy Ma’lumotlar** mavzusi bo‘yicha tartibli jamlangan material hisoblanadi.

---

## 1. Product Structured Data (Schema.org / JSON-LD)

Google qidiruvida oddiy matn emas, balki narx va ombordagi holati ko‘rinadigan **Strukturaviy Ma’lumotlar (Microdata / JSON-LD)** joylash juda muhim.

### Natija

Google’da qidirganda Sora.uz mahsuloti yonida:

- ⭐ Narxi: 250,000 UZS
- ✅ Mavjudligi: Omborda bor (In Stock)

gohida rating va sharhlar ko‘rinadi. Bu xaridorlar bosish sonini oshirishi mumkin.

### Product Structured Data nima beradi

Bu oddiy meta tag emas. Qidiruv tizimiga:

> “Bu sahifa aynan mahsulot sahifasi.”

degan strukturali signal beriladi.

Mahsulot uchun:

- `Product`
- va tegishli holatlarda `Product variant`

kabi structured data ishlatilishi kerak.

Bu ma’lumotlar Google’ga mahsulot nomi, narx, availability, variant va boshqa ma’lumotlarni yaxshiroq tushunishga yordam beradi.

### Muhim ogohlantirish

`structured data` = yuqori ranking kafolati emas. Lekin u sahifaning mazmunini mashinalarga tushunarliroq qiladi va mavjud bo‘lsa, rich result / merchant ko‘rinishlariga mos kelish imkonini oshiradi.

### Product entity sifatida ajratilishi kerak bo‘lgan maydonlar

SEO nuqtai nazaridan quyidagilar alohida entity sifatida ajratilishi kerak:

- Product ID
- SKU
- Brand
- MPN
- GTIN
- Variant ID
- ProductGroup ID
- Canonical URL
- Language
- Availability
- Price
- Price validity
- Main image
- Additional images
- Shipping
- Return policy

Bu aslida Sora.uz’ning SEO ma’lumotlar modelining yuragi.

### Mahsulot sahifasida qidiruv tizimiga aniq ko‘rinishi kerak

- mahsulot nomi;
- ishlab chiqaruvchi / brend;
- model;
- narx;
- valyuta;
- mavjudlik;
- SKU;
- mahsulot rasmi;
- asosiy xususiyatlar;
- texnik parametrlar;
- variantlar;
- sharhlar;
- reyting;
- yetkazib berish;
- qaytarish shartlari;
- kafolat;
- o‘lcham / rang va boshqa variantlar.

### 2026-yil yangiliklari

2026-yil 7-iyulda Google `Product.category` xususiyatini yangiladi:

- Endi `Product.category` ikkita ma’lumot turini qabul qiladi: **Text** (o‘z ichki kategoriyangiz) va **CategoryCode** (Google’ning rasmiy mahsulot taksonomiyasiga mos).
- Sale duration (chegirma muddati) uchun `validFrom`, `validThrough`, `priceValidUntil` xususiyatlari qo‘shildi.
- Maxsus kategoriya matnlarini 750 belgidan pastroq saqlash tavsiya etiladi.

### Narx va availability sinxronligi

E-commerce’da juda xavfli holat:

- Google mahsulotni ko‘radi: **Narx: 4 500 000 so‘m**;
- saytda esa keyin: **5 200 000 so‘m** bo‘lib qoladi.

Yoki:

- Google: **In stock**;
- sayt: **Out of stock** bo‘ladi.

Shu sababli **API → Next.js → structured data → Merchant Center** o‘rtasidagi ma’lumotlar imkon qadar sinxron bo‘lishi kerak.

---

## 2. Image SEO (Rasmlar optimizatsiyasi va alt matnlari)

Elektron tijoratda rasmlar SEO’ning eng muhim qismlaridan biridir.

### Format

Rasmlar Next.js orqali avtomatik **WebP yoki AVIF** formatga o‘tkazilishi lozim (bu `next.config.ts` faylida sozlanadi).

### alt atributi

Har bir mahsulot rasmining HTML’dagi `alt` atributiga mahsulot nomi va kalit so‘zi yozilishi shart.

Masalan:

```html
alt="Sora elektr choynak 1.8L qora"
```

Google Images qidiruvida bu rasm orqali minglab xaridorlar kirib keladi. `alt` tasvirni aniq va tabiiy tasvirlashi kerak.

### Faqat WebP/AVIF qilishning o‘zi yetarli emas

Rasm SEO’sining maqsadi faqat:

- kichik fayl hajmi

emas. Yana quyidagilar ham muhim:

- asosiy rasmning aniq bo‘lishi;
- mahsulot markazda bo‘lishi;
- yaxshi resolution;
- to‘g‘ri image URL;
- alt text;
- sahifa bilan semantik bog‘liqlik;
- tez yuklanish.

### Rasm URL’lari

Har bir mahsulot rasmi:

- aniq nomlangan;
- tegishli alt matnga ega;
- optimallashtirilgan;
- crawl qilinadigan URL

orqali berilishi kerak.

2026-yilda Google image SEO hujjatlarida ham image URL’larini izchil va crawl qilish oson holatda saqlashga e’tibor qaratilgan.

Sora.uz holatida API’dan kelayotgan JPG rasmlar ayniqsa muhim.

---

## 3. Google Merchant Center

E-commerce uchun faqat oddiy Google Search SEO bilan chegaralanib qolish xato. Mahsulotlarni **Google Merchant Center** orqali ham Google ekotizimiga berish kerak.

### Free product listings

2026-yilda Google Merchant Center’da:

- **Free product listings** mavjud;
- mahsulotlar Google’da bepul product listing sifatida ko‘rinishi mumkin.

Ya’ni strategiya:

```text
SEO + Product structured data + Merchant Center
```

bo‘lishi kerak. Bu uchalasi bir-birining o‘rnini bosmaydi.

### Merchant Center product feed / data source

Amaliyotda alohida **Merchant Center product feed / data source** strategiyasi kerak.

Bu yerda quyidagilar boshqariladi:

- ID
- title
- description
- link
- image
- price
- availability
- brand
- GTIN / MPN
- condition
- shipping
- returns
- country
- language
- variantlar

### Til mosligi

Google mahsulot landing page tili bilan product data source tili mos kelishiga e’tibor beradi. Nom, description va variant ma’lumotlari landing page bilan mos bo‘lmasa performance yomonlashishi yoki ma’lumot source language bilan mos kelmasa **disapproval** bo‘lishi mumkin.

### Google Merchant API

Google Merchant API 2026-yil holatida mahsulot narxi va availability kabi tez-tez o‘zgaruvchi atributlarni yangilash imkonini beradi va mahsulotlarni muntazam yangilab turishni tavsiya qiladi.

---

## 4. E-E-A-T va Tijorat Ishonch Signallari (Merchant Trust)

Google 2026-yilda e-commerce saytlarga sun’iy intellekt bilan yaratilgan soxta do‘kon deb qaramasligi uchun quyidagi ma’lumotlar bo‘lishini qat’iy talab qiladi:

### Kompaniya haqidagi ma’lumotlar

- aloqa ma’lumotlari;
- qaytarish siyosati;
- yetkazib berish;
- to‘lov;
- biznes identifikatsiyasi;
- ishonchlilik va merchant quality uchun juda muhim.

Masalan:

- yuridik nomi;
- STIR / INN;
- jismoniy do‘kon yoki ofis manzili;
- rasmiy telefonlar.

### Merchant Center siyosatlari

Merchant Center siyosatlari alohida masala. Google free listings uchun alohida siyosatlarga ega va siyosatni buzuvchi merchantlar cheklanishi mumkin.

### Refund / Return policy

Tovarlarni qaytarish va almashtirish siyosati (Refund / Return policy) uchun **alohida to‘liq sahifalar** bo‘lishi kerak.

### Yetkazib berish va to‘lov

Yetkazib berish shartlari va to‘lov turlari bo‘yicha ochiq ma’lumotlar bo‘lishi kerak.

Bularsiz Google Merchant Center akkauntni to‘sib qo‘yadi (ayniqsa O‘zbekiston kabi rivojlanayotgan bozorlarda).

---

## 5. Review va Rating

Agar real foydalanuvchi sharhlari mavjud bo‘lsa:

- rating;
- review count;
- real comments

katta qiymat beradi.

Ammo review’larni sun’iy yaratish yoki fake rating qo‘yish kerak emas. Structured data’dagi rating ham real sahifada ko‘rsatilayotgan ma’lumotga mos kelishi kerak; noto‘g‘ri structured data Google / Bing tomonidan e’tiborsiz qoldirilishi yoki muammoga olib kelishi mumkin.

---

## 6. FAQ — faqat foydali bo‘lsa

Mahsulot uchun:

- Bu telefon 5G’ni qo‘llaydimi?
- Qancha kafolat bor?
- Yetkazib berish qancha vaqt?
- Qaysi zaryadlovchi mos?

kabi real savollar foydali.

FAQ’ni faqat SEO uchun sun’iy ravishda to‘ldirish kerak emas.

---

## 7. Nazorat ro‘yxati

| Yo‘nalish | Holat |
|---|---|
| Product schema (`Product`) | ✅ |
| Product variants schema | ✅ |
| Product ID, SKU, Brand, MPN, GTIN | ✅ |
| ProductGroup ID | ✅ |
| Canonical URL, Language | ✅ |
| Availability, Price, Price validity | ✅ |
| Main image, Additional images | ✅ |
| Shipping, Return policy (schema) | ✅ |
| `Product.category` — Text + CategoryCode | ✅ |
| `validFrom`, `validThrough`, `priceValidUntil` | ✅ |
| Rasm WebP / AVIF | ✅ |
| Image alt matnlari | ✅ |
| Image URL crawl qilinadi | ✅ |
| Rasm resolution va markazlashtirish | ✅ |
| Google Merchant Center | ✅ |
| Free product listings | ✅ |
| Merchant Center product feed | ✅ |
| Narx va availability sinxronligi | ✅ |
| E-E-A-T: aloqa, STIR, manzil | ✅ |
| Refund / Return policy sahifasi | ✅ |
| Yetkazib berish va to‘lov sahifasi | ✅ |
| Real review va rating | ✅ |
| Fake review yo‘q | ✅ |
| FAQ faqat foydali savollar | ✅ |

---

## 8. Eng muhim xulosalar

- `Product structured data` — e-commerce uchun juda muhim signal.
- Structured data — ranking kafolati emas, lekin mashinalarga tushunarli mazmun beradi.
- Narx va availability doimo sinxron bo‘lishi kerak: API → Next.js → structured data → Merchant Center.
- Rasmlar avtomatik WebP/AVIF’ga o‘tkazilishi va alt matnga ega bo‘lishi shart.
- Image URL’lar crawl qilinadigan va izchil bo‘lishi kerak.
- Google Merchant Center’ni SEO bilan parallel yuritish kerak.
- E-E-A-T va Merchant Trust signallari — qaytarish siyosati, aloqa, STIR, manzil, to‘lov turlari — bo‘lmasa Merchant Center akkaunt to‘silishi mumkin.
- Fake review va noto‘g‘ri structured data — xavfli.
- FAQ faqat real, foydali savollardan iborat bo‘lishi kerak.