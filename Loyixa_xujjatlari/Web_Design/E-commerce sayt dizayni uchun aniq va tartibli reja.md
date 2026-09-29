# E-COMMERCE WEB SAYT DIZAYNI UCHUN ANIQ VA TARTIBLI REJA

## 1. Dizaynning asosiy konsepsiyasi

Sayt dizayni quyidagi 5 tamoyilga quriladi:

```text
ISHONCH
   +
QULAY NAVIGATSIYA
   +
TEZKOR XARID
   +
SEO UCHUN SEMANTIK TUZILMA
   +
MOBILE-FIRST
```

Vizual uslub:

- zamonaviy;
- minimalistik;
- professional;
- ortiqcha dekoratsiyasiz;
- mahsulotni birinchi o‘ringa chiqaradigan;
- oq yoki juda och fonli;
- aniq tipografika;
- katta va sifatli mahsulot rasmlari;
- tushunarli CTA tugmalari;
- bir xil komponentlardan tashkil topgan Design System.

Internet-do‘konning asosiy vizual obyekti **banner emas, mahsulot** bo‘lishi kerak.

---

# 2. Saytning umumiy tuzilishi

Saytni 3 katta qismga ajratish kerak:

```text
PUBLIC E-COMMERCE
│
├── Bosh sahifa
├── Katalog
├── Kategoriya
├── Brend
├── Mahsulot
├── Qidiruv
├── Aksiya / Chegirma
├── Top mahsulotlar
├── Blog / Guide
├── Kompaniya
├── Filiallar / Do‘konlar
├── Yetkazib berish
├── To‘lov
├── Qaytarish
└── Kontaktlar

USER AREA
│
├── Kirish / Ro‘yxatdan o‘tish
├── Profil
├── Sevimlilar
├── Buyurtmalar
├── Buyurtma tafsiloti
└── Saqlangan ma’lumotlar

SHOPPING
│
├── Savatcha
├── Checkout
├── Yetkazib berish
├── To‘lov
└── Buyurtma tasdig‘i
```

SEO nuqtai nazaridan **PUBLIC** qism indekslanadi.

`account`, `cart`, `checkout`, `login` kabi sahifalar esa qidiruv tizimi uchun public SEO sahifa sifatida ishlatilmaydi.

---

# 3. Til arxitekturasi

Sayt boshidan ikki tilli quriladi:

```text
/uz/
/ru/
```

Masalan:

```text
/uz/products/elektr-choynak-125478
/ru/products/elektricheskij-chajnik-125478
```

Til o‘zgarishi faqat matnni almashtirmasligi kerak.

Bir vaqtning o‘zida:

- URL;
- H1;
- title;
- description;
- mahsulot nomi;
- kategoriya nomi;
- breadcrumb;
- SEO text;
- structured data

ham tegishli tilga o‘tishi kerak.

Header'dagi til almashtirgich har doim **joriy sahifaning boshqa til versiyasiga** olib borishi kerak.

Masalan:

```text
UZ ←→ RU
```

Mahsulot sahifasida UZ → shu mahsulotning RU sahifasi.

---

# 4. Header dizayni

Header saytning eng muhim navigatsion qismi bo‘ladi.

## 4.1. Desktop Header

Tavsiya etilgan struktura:

```text
┌─────────────────────────────────────────────────────────────────┐
│ LOGO │ Katalog │      Qidiruv...      │ Kirish │ ♡ │ 🛒 │ UZ/RU │
└─────────────────────────────────────────────────────────────────┘
```

### Elementlar:

1. LOGO
2. Katalog
3. Qidiruv
4. Kirish / Profil
5. Sevimlilar
6. Savatcha
7. Til

### Qoidalar

Logo → `/uz/` yoki `/ru/` bosh sahifaga.

Katalog → mega-menu yoki kengayuvchi katalog.

Qidiruv → saytning asosiy funksiyalaridan biri.

Savatchada:

```text
Savatcha (3)
```

kabi mahsulot soni ko‘rinishi kerak.

---

# 5. Katalog / Mega Menu

“Katalog” bosilganda oddiy dropdown emas, katta **Mega Menu** ishlatish tavsiya etiladi.

Masalan:

```text
KATALOG
──────────────────────────────────────────────

Ofis jihozlari        Kantselyariya
Printerlar            Qog‘oz mahsulotlari
Kompyuter jihozlari   Yozuv qurollari
Arxiv mahsulotlari    Papkalar
Mebel                  Aksessuarlar

Mashhur brendlar
Samsung | HP | Canon | Xiaomi | ...
```

Mega Menu:

- kategoriya;
- subkategoriya;
- mashhur brend;
- mashhur mahsulotlar

ni bir vaqtning o‘zida ko‘rsatishi mumkin.

Bu foydalanuvchi navigatsiyasini ham, ichki linkingni ham kuchaytiradi.

---

# 6. Promo Navigation

Header ostida alohida promo navigation bo‘lishi mumkin:

```text
[ Arzon narxlar ]
[ Mashhur ]
[ Chegirmalar ]
[ Top mahsulotlar ]
[ Yangi ]
[ Boshqa ]
```

Bu menyu commercial landing page'larga olib boradi.

Masalan:

```text
/uz/sales
/uz/popular
/uz/top-products
/uz/new
```

Ammo har bir marketing filtri alohida SEO sahifasiga aylantirilmasligi kerak.

SEO qiymati bo‘lmagan kombinatsiyalar indekslashdan nazorat qilinadi.

---

# 7. BOSH SAHIFA DIZAYNI

Bosh sahifa juda katta SEO maqolaga aylantirilmasligi kerak.

Uning asosiy vazifasi:

```text
KATALOG
     ↓
MAHSULOT
     ↓
ISHONCH
     ↓
XARID
```

## Tavsiya etilgan tartib

```text
HEADER
↓
PROMO NAV
↓
HERO BANNER
↓
KATEGORIYALAR
↓
TOP MAHSULOTLAR
↓
CHEGIRMALAR
↓
MASHHUR MAHSULOTLAR
↓
BRENDLAR
↓
AFZALLIKLAR
↓
ISHONCH / REVIEW
↓
BLOG / GUIDE
↓
KOMPANIYA MA'LUMOTI
↓
FOOTER
```

---

# 8. Hero Banner

Banner butun ekranni egallab olmasligi kerak.

Tavsiya:

```text
┌──────────────────────────────────────────────────────┐
│                                                      │
│  Yangi mahsulotlar / Aksiya                         │
│                                                      │
│  Kuchli sarlavha                                    │
│  Qisqa izoh                                          │
│                                                      │
│  [ Xarid qilish ]                                    │
│                                                      │
│                            Mahsulot rasmi            │
│                                                      │
└──────────────────────────────────────────────────────┘
```

Banner:

- 1 ta asosiy CTA;
- aniq headline;
- qisqa text;
- sifatli rasm;
- mobil versiyada yengil;
- lazy loading kerak bo‘lgan joylarda qo‘llanadi.

Banner matni rasmning ichiga “yozib qo‘yilgan” bo‘lmasligi ma’qul.

---

# 9. KATEGORIYALAR BLOKI

Hero'dan keyin katalogni tez tushunish uchun kategoriyalar.

Masalan:

```text
KATEGORIYALAR

[ Printerlar ] [ Qog‘oz ] [ Papkalar ]
[ Ruchkalar ] [ Ofis jihozlari ]
[ Kantselyariya ] [ Aksessuarlar ]
```

Har bir kategoriya:

- nom;
- rasm/ikonka;
- URL;
- kerak bo‘lsa mahsulot soni

bilan ko‘rsatiladi.

SEO uchun kategoriya nomlari crawlable link bo‘lishi kerak.

---

# 10. TOP MAHSULOTLAR BLOKI

Mahsulot kartasi umumiy Design System asosida yaratiladi.

```text
┌─────────────────────┐
│                     │
│      PRODUCT IMG    │
│                     │
├─────────────────────┤
│ BRAND               │
│ Mahsulot nomi       │
│ ⭐ 4.8 (125)        │
│                     │
│ 250 000 so‘m        │
│                     │
│ [ Savatga ]   ♡     │
└─────────────────────┘
```

Kartada:

- mahsulot rasmi;
- brend;
- mahsulot nomi;
- rating;
- review count;
- narx;
- chegirma;
- availability;
- savat tugmasi;
- favorite tugmasi

bo‘lishi mumkin.

Muhim:

**Product Card'dagi asosiy mahsulot nomi crawlable `<a>` link bo‘lishi kerak.**

---

# 11. PRODUCT CARD UCHUN DESIGN SYSTEM

Barcha product card'lar bir xil bo‘lishi kerak.

Masalan:

```text
ProductCard
├── Image
├── Badge
├── Brand
├── ProductName
├── Rating
├── Availability
├── Price
├── OldPrice
├── Discount
├── FavoriteButton
└── AddToCartButton
```

API'dan ma'lumot kelmaganda:

- `undefined` text chiqmasin;
- bo‘sh joy qolmasin;
- layout buzilmasin.

Masalan:

```text
rating mavjud emas
```

bo‘lsa rating bloki umuman ko‘rsatilmaydi.

---

# 12. KATEGORIYA SAHIFASI

Kategoriya sahifasi faqat:

```text
H1
+
Product Grid
```

bo‘lmasligi kerak.

Tavsiya etilgan struktura:

```text
HEADER
↓
BREADCRUMB
↓
H1
↓
QISQA KATEGORIYA INTRO
↓
KATEGORIYA SUB-GURUHLARI
↓
BRANDLAR
↓
FILTER + SORT
↓
PRODUCT GRID
↓
PAGINATION
↓
BUYING GUIDE
↓
FAQ
↓
CATEGORY INTERNAL LINKS
```

Masalan:

```text
Bosh sahifa
  ↓
Ofis mahsulotlari
  ↓
Printerlar
```

---

# 13. Filter dizayni

Filterlar foydalanuvchi uchun juda qulay bo‘lishi kerak.

Desktop:

```text
┌──────────────┬─────────────────────────────────────┐
│ FILTER       │ 1 248 mahsulot                      │
│              │                                     │
│ Brend        │ [ Product ] [ Product ] [ Product ] │
│ □ HP         │ [ Product ] [ Product ] [ Product ] │
│ □ Canon      │                                     │
│              │                                     │
│ Narx         │                                     │
│ [ ___ ] [___]│                                     │
│              │                                     │
│ Rang         │                                     │
│ □ Qora       │                                     │
└──────────────┴─────────────────────────────────────┘
```

Mobil:

```text
[ Filter ]
[ Sort ]
```

bosilganda full-screen yoki bottom-sheet filter ochiladi.

---

# 14. Filter va SEO o‘rtasidagi muhim qoida

Har bir filter kombinatsiyasi alohida SEO landing page bo‘lmasligi kerak.

Masalan:

```text
/uz/printerlar/hp
```

SEO qiymatiga ega bo‘lishi mumkin.

Lekin:

```text
/printerlar?brand=hp&color=black&price=1-5&sort=rating
```

avtomatik ravishda indekslanadigan sahifaga aylantirilmasligi kerak.

Shuning uchun UI filter komponenti va SEO URL siyosati bir-biridan alohida boshqariladi.

---

# 15. BRAND PAGE

Brend sahifasi:

```text
BREADCRUMB
↓
BRAND LOGO
↓
H1 — Samsung
↓
Brend haqida
↓
Mashhur kategoriyalar
↓
Samsung mahsulotlari
↓
Brend bo‘yicha filter
↓
Tavsiya qilinadigan mahsulotlar
↓
FAQ / Guide
```

Masalan:

```text
Samsung
├── Telefonlar
├── Planshetlar
├── Monitorlar
└── Aksessuarlar
```

Bu:

```text
Brand → Category → Product
```

ichki linking tizimini yaratadi.

---

# 16. PRODUCT DETAIL PAGE — ENG MUHIM SAHIFA

E-commerce saytning asosiy dizayn komponenti aynan Product Page bo‘ladi.

Tavsiya etilgan struktura:

```text
HEADER
↓
BREADCRUMB
↓
PRODUCT HERO
↓
PRODUCT TITLE
↓
RATING / REVIEWS
↓
PRICE
↓
AVAILABILITY
↓
VARIANTLAR
↓
BUY BUTTON
↓
DELIVERY / PAYMENT
↓
DESCRIPTION
↓
TECHNICAL SPECIFICATIONS
↓
ADVANTAGES
↓
FAQ
↓
REVIEWS
↓
SIMILAR PRODUCTS
↓
RECOMMENDED PRODUCTS
↓
RECENTLY VIEWED
```

---

# 17. Product Hero dizayni

Desktop:

```text
┌──────────────────────┬────────────────────────────────┐
│                      │ Brand                          │
│                      │ H1 Product Name                │
│      PRODUCT         │ ⭐ 4.8  (125 review)           │
│       IMAGE          │                                │
│                      │ 1 250 000 so‘m                 │
│                      │ ~1 500 000 so‘m~               │
│                      │                                │
│                      │ ✅ Omborda mavjud              │
│                      │                                │
│                      │ [ − ] 1 [ + ]                 │
│                      │                                │
│                      │ [ SAVATGA QO‘SHISH ]           │
│                      │ [ HOZIR SOTIB OLISH ]          │
│                      │                                │
│                      │ Yetkazib berish                │
│                      │ To‘lov                          │
└──────────────────────┴────────────────────────────────┘
```

Mobil:

```text
PRODUCT IMAGE
↓
TITLE
↓
RATING
↓
PRICE
↓
AVAILABILITY
↓
VARIANT
↓
BUY
↓
DELIVERY
```

Mobile'da “Savatga qo‘shish” tugmasini pastda **sticky CTA** sifatida qoldirish juda qulay.

---

# 18. Product Gallery

Mahsulot rasmlari:

```text
[ Main Image ]

[1] [2] [3] [4] [5]
```

bo‘lishi kerak.

Qo‘shimcha:

- zoom;
- fullscreen;
- thumbnails;
- video bo‘lsa video;
- variantga bog‘langan rasmlar.

Rasmlar:

- optimallashtirilgan;
- responsive;
- to‘g‘ri `alt`;
- layout shift keltirib chiqarmaydigan o‘lchamlarga ega

bo‘lishi kerak.

---

# 19. Product Information tablari

Mahsulot haqidagi katta hajmdagi ma'lumotni tartibga solish uchun:

```text
[ Tavsif ]
[ Xususiyatlar ]
[ Afzalliklar ]
[ Yetkazib berish ]
[ Kafolat ]
[ FAQ ]
[ Sharhlar ]
```

ishlatish mumkin.

Lekin SEO uchun muhim matnni JavaScript sababli yashirib qo‘yish kerak emas.

Asosiy foydali kontent server-rendered HTML ichida mavjud bo‘lishi kerak.

---

# 20. TECHNICAL SPECIFICATIONS

Texnik xususiyatlar juda tartibli jadval ko‘rinishida beriladi:

```text
XUSUSIYATLAR

Brend              Samsung
Model              S25
Xotira              256 GB
RAM                 12 GB
Ekran               6.2"
Rang                Black
Kafolat             12 oy
```

Bu ayniqsa:

- foydalanuvchi;
- Google;
- AI Search;
- comparison

uchun foydali.

---

# 21. REVIEWS BLOKI

Review tizimi alohida katta komponent bo‘ladi:

```text
⭐ 4.8 / 5
125 ta sharh

★★★★★ 92%
★★★★☆ 5%
★★★☆☆ 2%
★★☆☆☆ 1%
★☆☆☆☆ 0%
```

Keyin:

```text
[ Sharh yozish ]

Ali
★★★★★
Juda yaxshi mahsulot...
```

Faqat real review ko‘rsatiladi.

Review schema ham sahifadagi real ko‘rsatilgan ma'lumot bilan mos bo‘lishi kerak.

---

# 22. RELATED PRODUCTS

Product Page oxirida kamida quyidagi relationship bloklari bo‘lishi kerak:

```text
O‘XSHASH MAHSULOTLAR
```

```text
BOSHQA MIJOZLAR BILAN BIRGA OLADI
```

```text
ARZONROQ ALTERNATIVLAR
```

```text
PREMIUM ALTERNATIVLAR
```

```text
SHU BREND MAHSULOTLARI
```

Bular SEO uchun kuchli **internal linking** tarmog‘ini yaratadi.

---

# 23. QIDIRUV SAHIFASI

Search saytning eng kuchli UX qismlaridan biri bo‘ladi.

Qidiruv bosilganda:

```text
┌──────────────────────────────────────────┐
│ Samsung Galaxy S25                  🔍   │
└──────────────────────────────────────────┘

Mahsulotlar
├── Galaxy S25
├── Galaxy S25 Ultra
├── Galaxy S25 Case
└── Galaxy S25 Charger
```

Autocomplete:

- mahsulot;
- kategoriya;
- brend

bo‘yicha ishlashi mumkin.

Ammo internal search URL'lari odatda alohida SEO landing page sifatida indekslanmasligi kerak.

---

# 24. AKSIYA / DISCOUNT SAHIFASI

Masalan:

```text
H1: Chegirmadagi mahsulotlar

Promo Banner
↓
Filter
↓
Product Grid
↓
FAQ / Shartlar
```

Mahsulot kartasida:

```text
-20%
1 200 000 so‘m
1 500 000 so‘m
```

aniq ko‘rinishi kerak.

Aksiya tugaganda mahsulot:

- noto‘g‘ri chegirma bilan qolmasligi;
- eski narx bilan ko‘rsatilmasligi;
- API ma’lumotiga mos yangilanishi

kerak.

---

# 25. BLOG / GUIDE DIZAYNI

SEO hujjatiga ko‘ra blog faqat yangiliklar uchun emas, mahsulotga olib keluvchi kontent tizimi bo‘lishi kerak.

Masalan:

```text
2026-yilda printer qanday tanlanadi?
```

sahifasida:

```text
Guide
↓
Printer turlari
↓
Taqqoslash
↓
Tavsiya
↓
Printer kategoriyasi
↓
Aniq mahsulotlar
```

bo‘lishi kerak.

Blog sahifasi:

```text
Cover
H1
Intro
Contents
Article
Comparison
FAQ
Recommended Products
Related Categories
```

ko‘rinishida bo‘lishi mumkin.

---

# 26. COMPANY PAGE

“Kompaniya” sahifasi trust uchun alohida ishlab chiqiladi.

```text
Kompaniya
↓
Biz haqimizda
↓
Tarix
↓
Faoliyat
↓
Afzalliklar
↓
Jamoa
↓
Do‘konlar
↓
Manzil
↓
Telefon
↓
Ish vaqti
↓
Kontakt
```

Agar real jismoniy korxona mavjud bo‘lsa:

- yuridik nom;
- STIR/INN;
- telefon;
- manzil;
- ish vaqti;
- xarita;
- filiallar

ko‘rsatiladi.

---

# 27. FILIAL / LOCAL SEO SAHIFALARI

Har bir filialga alohida sahifa qilish mumkin:

```text
/uz/stores/tashkent
/uz/stores/samarkand
```

Sahifada:

```text
Filial nomi
Manzil
Telefon
Ish vaqti
Xarita
Rasm
Mavjud xizmatlar
Mavjud mahsulotlar
Yetkazib berish hududi
```

bo‘ladi.

---

# 28. YETKAZIB BERISH / TO‘LOV / QAYTARISH

Footer'da yashirib qo‘yish yetarli emas.

Alohida sahifalar bo‘lishi kerak:

```text
Yetkazib berish
To‘lov
Qaytarish
Kafolat
Maxfiylik siyosati
Foydalanish shartlari
```

Bu sahifalar foydalanuvchiga xarid qilishdan oldingi eng muhim savollarga javob beradi.

---

# 29. CART DIZAYNI

Savatcha juda oddiy bo‘lishi kerak:

```text
SAVATCHA

Product 1
[-] 2 [+]       500 000 so‘m

Product 2
[-] 1 [+]       300 000 so‘m

────────────────────

Mahsulotlar:     800 000
Yetkazib berish: 50 000
JAMI:            850 000

[ BUYURTMA BERISH ]
```

Ortiqcha elementlar bo‘lmasin.

---

# 30. CHECKOUT DIZAYNI

Checkout imkon qadar qisqa bo‘ladi:

```text
1. Mijoz
↓
2. Yetkazib berish
↓
3. To‘lov
↓
4. Tasdiqlash
```

Bir sahifalik yoki juda qisqa multi-step checkout ishlatilishi mumkin.

Keraksiz registratsiyani majburlash tavsiya etilmaydi.

---

# 31. USER ACCOUNT

Private account:

```text
Profil
├── Shaxsiy ma'lumotlar
├── Buyurtmalar
├── Sevimlilar
├── Manzillar
├── To‘lov usullari
└── Chiqish
```

Bu qism public SEO sahifa emas.

---

# 32. ORDER DETAIL

Buyurtma tafsiloti:

```text
Buyurtma #125487

✅ Buyurtma qabul qilindi

Mahsulotlar
────────────────
Printer HP
1 × 1 500 000

Yetkazib berish
Toshkent

To‘lov
Naqd / karta

Jami
1 550 000
```

Statuslar:

```text
Qabul qilindi
↓
Tayyorlanmoqda
↓
Yetkazib berilmoqda
↓
Yetkazildi
```

ko‘rinishida timeline ishlatilishi mumkin.

---

# 33. ERROR / 404 DIZAYNI

404 oddiy:

```text
404

Mahsulot yoki sahifa topilmadi.

[ Bosh sahifa ]
[ Katalog ]
[ Qidiruv ]
```

va foydalanuvchini qayta xarid oqimiga olib keladigan:

```text
Mashhur mahsulotlar
```

blokiga ega bo‘lishi mumkin.

O‘chirilgan mahsulot boshqa mahsulotning sahifasiga tasodifiy aylantirib yuborilmasligi kerak.

---

# 34. FOOTER

Footer katta, ammo tartibli bo‘ladi.

```text
┌────────────────────────────────────────────────────────┐
│ LOGO                                                   │
│ Kompaniya haqida qisqacha                              │
│                                                        │
│ Katalog       Kompaniya      Mijozlar       Yordam     │
│ Mahsulotlar   Biz haqimizda  Buyurtmalar    Yetkazish │
│ Kategoriyalar Filiallar      Sevimlilar     To‘lov    │
│ Brendlar      Kontakt        Profil         Qaytarish │
│                                                        │
│ Telefon | Email | Manzil | Ish vaqti                  │
│                                                        │
│ UZ | RU                                                │
│                                                        │
│ © Company                                              │
└────────────────────────────────────────────────────────┘
```

Footer ichki linking uchun juda muhim.

---

# 35. MOBILE DIZAYN

Loyiha boshidan **mobile-first** ishlab chiqiladi.

Desktop'dagi elementlarni shunchaki kichraytirish noto‘g‘ri.

Mobil header:

```text
┌──────────────────────────────────┐
│ ☰  LOGO       🔍  ♡  🛒         │
└──────────────────────────────────┘
```

Pastda sticky navigation:

```text
┌──────────────────────────────────┐
│ 🏠     Katalog     ♡     🛒      │
└──────────────────────────────────┘
```

Product Page'da:

```text
[ Savatga qo‘shish ]
```

sticky bo‘lishi mumkin.

---

# 36. MOBILE FILTER

Mobil ekranda chap sidebar ishlatilmaydi.

```text
[ FILTER ] [ SORT ]
```

bosilganda:

```text
┌─────────────────────────┐
│ Filter             ✕    │
│                         │
│ Brend                   │
│ □ HP                    │
│ □ Canon                 │
│ □ Epson                 │
│                         │
│ Narx                    │
│ [______] [______]       │
│                         │
│ [ Natijalarni ko‘rsat ] │
└─────────────────────────┘
```

---

# 37. DESIGN SYSTEM

Saytni boshidan komponentlar asosida qurish kerak.

Asosiy komponentlar:

```text
Button
Input
Select
Search
Modal
Drawer
Badge
Breadcrumb
Pagination
Tabs
Accordion
ProductCard
ProductGallery
Price
Rating
ReviewCard
CategoryCard
BrandCard
Banner
Toast
Loader
Skeleton
EmptyState
ErrorState
```

Shunda butun sayt bir xil ko‘rinishda qoladi.

---

# 38. API BILAN ISHLASHGA MOS UI

Barcha asosiy ma'lumot API'dan kelgani uchun komponentlar quyidagi holatlarni bilishi kerak:

```text
Loading
↓
Success
↓
Empty
↓
Error
```

Masalan Product Page:

```text
Loading → Skeleton
Success → Product
404 → Not Found
API Error → Error State
```

Faqat `Success` holatiga dizayn qilish katta xato.

---

# 39. SKELETON DESIGN

Mahsulot kartasi yuklanayotganda:

```text
┌───────────────┐
│ ▒▒▒▒▒▒▒▒▒▒▒   │
│ ▒▒▒▒▒▒▒▒▒▒▒   │
│               │
│ ▒▒▒▒▒▒▒       │
│ ▒▒▒▒▒▒▒▒      │
│               │
│ ▒▒▒▒▒▒▒▒      │
└───────────────┘
```

Skeleton layout bilan bir xil o‘lchamda bo‘lishi kerak.

Bu CLS muammolarini kamaytirishga yordam beradi.

---

# 40. SEO UCHUN DIZAYN QOIDALARI

Dizaynda quyidagilar majburiy hisoblanadi:

```text
H1
↓
H2
↓
H3
```

semantik ierarxiyasi.

Mahsulot nomi:

```text
H1
```

Kategoriya:

```text
H1
```

Brend:

```text
H1
```

Blog article:

```text
H1
```

bo‘lishi kerak.

---

# 41. VIZUAL HIERARCHY

Har bir sahifada foydalanuvchi birinchi ko‘rishi kerak bo‘lgan elementlar:

```text
1. Nima sotilyapti?
2. Qancha turadi?
3. Mavjudmi?
4. Nima uchun kerak?
5. Qanday sotib olinadi?
```

Shuning uchun Product Page'da:

```text
Title
→ Price
→ Availability
→ CTA
```

eng ko‘zga tashlanadigan qism bo‘lishi kerak.

---

# 42. TRUST SIGNALS

Saytda doimiy ko‘rinadigan ishonch elementlari:

```text
✓ Rasmiy kafolat
✓ Yetkazib berish
✓ Qaytarish
✓ Xavfsiz to‘lov
✓ Real review
✓ Rasmiy kompaniya
```

Mahsulot sahifasida:

```text
🚚 Yetkazib berish
🛡 Kafolat
↩ Qaytarish
💳 To‘lov
```

kabi qisqa trust-card'lar bo‘lishi mumkin.

---

# 43. INTERNAL LINKING DIZAYNI

Ichki linklarni faqat footer'da emas, sahifaning o‘zida ishlatish kerak.

Masalan:

```text
BLOG
 ↓
GUIDE
 ↓
CATEGORY
 ↓
BRAND
 ↓
PRODUCT
```

Product Page:

```text
Product
├── Category
├── Brand
├── Similar products
├── Alternatives
├── Related products
└── Buying guide
```

Bu saytni bitta-biridan uzilgan sahifalar to‘plamiga aylantirmaydi.

---

# 44. SEO SAHIFALARINI VIZUAL JIHATDAN AJRATISH

Public SEO sahifalar:

```text
Product
Category
Brand
Blog
Guide
Store
Company
```

bir xil asosiy Layout'dan foydalanadi.

Private sahifalar:

```text
Account
Cart
Checkout
Orders
```

esa alohida minimal UI ishlatishi mumkin.

---

# 45. PERFORMANCE UCHUN DIZAYN QOIDALARI

Dizayn bosqichidayoq quyidagilar hisobga olinadi:

- keraksiz animatsiyani kamaytirish;
- juda katta video ishlatmaslik;
- hero rasmini optimallashtirish;
- rasm o‘lchamlarini oldindan belgilash;
- font sonini cheklash;
- JS-heavy komponentlarni kamaytirish;
- server-rendered content'ni ustuvor qilish;
- mobile'da og‘ir componentlarni kechiktirish.

Vizual jihatdan chiroyli bo‘lishi uchun sahifani og‘irlashtirish kerak emas.

---

# 46. RASM DIZAYN QOIDALARI

Product Image standart bo‘lishi kerak:

```text
1:1
```

yoki mahsulot turiga mos bir xil aspect ratio.

Masalan:

```text
700 × 700
1000 × 1000
```

kabi standart.

Barcha mahsulot rasmlarining kartadagi balandligi teng bo‘lishi kerak.

Natija:

```text
[ IMAGE ] [ IMAGE ] [ IMAGE ] [ IMAGE ]
    ↓         ↓         ↓         ↓
  bir xil visual rhythm
```

---

# 47. DESKTOP GRID

Desktop product grid:

```text
4 products
```

yoki katta ekran uchun:

```text
5 products
```

bo‘lishi mumkin.

Masalan:

```text
1920px:
[ P ][ P ][ P ][ P ][ P ]

1440px:
[ P ][ P ][ P ][ P ]

1024px:
[ P ][ P ][ P ]

Mobile:
[ P ][ P ]
```

Lekin grid soni mahsulot rasmlari va matn uzunligiga qarab tanlanadi.

---

# 48. API MA'LUMOTI VA DIZAYN

API'dan quyidagi ma'lumotlar kelishi mumkin:

```text
Product
├── id
├── slug
├── name_uz
├── name_ru
├── description_uz
├── description_ru
├── brand
├── category
├── images
├── specifications
├── advantages
├── faq
├── reviews
├── seo
└── related_products
```

Narx va availability alohida API'dan keladigan bo‘lsa, UI buni ham hisobga oladi:

```text
Product API
       +
Price API
       +
Stock API
       ↓
Product Page
```

Shuning uchun narx va stock ma'lumotlari product kontentidan mustaqil yangilanadigan komponent bo‘lishi kerak.

---

# 49. PRODUCT PAGE'DA SERVER/CLIENT CHEGARASI

Server Component:

```text
Product
Description
SEO
Metadata
Specifications
Reviews data
Related products
```

Client Component:

```text
Gallery interaction
Favorite
Quantity
Add to cart
Filter
Search autocomplete
Modal
Checkout interaction
```

Shu bilan sahifa kerak bo‘lmagan joyda ortiqcha JavaScript yuklamaydi.

---

# 50. FINAL SAYT WIREFRAME

Butun saytni quyidagi ko‘rinishda tasavvur qilish mumkin:

```text
                           WEBSITE
                              │
              ┌───────────────┴──────────────┐
              │                              │
           PUBLIC                         PRIVATE
              │                              │
     ┌────────┼──────────┐           ┌───────┼────────┐
     │        │          │           │       │        │
  HOME     CATALOG     CONTENT      ACCOUNT  CART   CHECKOUT
     │        │          │
     │        │          ├── Blog
     │        │          ├── Guide
     │        │          └── FAQ
     │        │
     │        ├── Category
     │        ├── Brand
     │        └── Product
     │
     ├── Promo
     ├── Popular
     ├── Discount
     ├── Top Products
     ├── Company
     └── Stores
```

---

# 51. ISHLAB CHIQISH TARTIBI

Dizayn va dasturlashni aynan quyidagi ketma-ketlikda qilish maqsadga muvofiq:

### 1-bosqich — Design System

```text
Colors
Typography
Spacing
Buttons
Cards
Forms
Icons
Responsive rules
```

### 2-bosqich — Global Layout

```text
Header
Mega Menu
Footer
Mobile Navigation
```

### 3-bosqich — Product Components

```text
ProductCard
Price
Rating
Gallery
Specifications
Review
Related Products
```

### 4-bosqich — Public Pages

```text
Home
Catalog
Category
Brand
Product
Search
Promotion
Blog
Guide
Company
Store
```

### 5-bosqich — Shopping

```text
Cart
Checkout
Payment
Order Confirmation
```

### 6-bosqich — User Area

```text
Login
Registration
Profile
Favorites
Orders
Order Detail
```

### 7-bosqich — SEO Layer

```text
Metadata
Canonical
hreflang
Breadcrumb
Product Schema
Sitemap
Robots
404
301
Indexing rules
```

### 8-bosqich — Performance

```text
Mobile
LCP
INP
CLS
Images
Fonts
Caching
Server Rendering
```

### 9-bosqich — Monitoring

```text
Google Search Console
Bing Webmaster Tools
Merchant Center
Analytics
Core Web Vitals
Indexation
404/500
CTR
Product rich results
```

---

# 52. ENG MUHIM YAKUNIY DIZAYN MODELI

Sizning loyihangiz uchun men quyidagi modelni asosiy UI arxitektura sifatida belgilagan bo‘lardim:

```text
                         E-COMMERCE
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
      DISCOVER             BUY                  TRUST
        │                    │                    │
    Category              Product              Reviews
    Brand                 Price                Warranty
    Search                Cart                 Delivery
    Blog                  Checkout             Company
    Guide                 Payment              Return
        │                    │                    │
        └────────────────────┼────────────────────┘
                             │
                       SEO ECOSYSTEM
                             │
       ┌──────────────┬──────┼──────┬──────────────┐
       │              │      │      │              │
   Canonical       Schema  Sitemap hreflang      Internal
                                                    Links
       │              │      │      │              │
       └──────────────┴──────┼──────┴──────────────┘
                             │
                    Google / Bing / AI Search
```

### Eng asosiy tamoyil

Saytning har bir sahifasi uchun:

```text
Foydalanuvchi uchun foydali
+
API ma'lumotiga mos
+
tez
+
mobile-friendly
+
crawlable
+
semantic
+
structured
+
ichki linking bilan bog‘langan
```

bo‘lishi kerak.

Shunda **dizayn, UX, API arxitekturasi va SEO bir-biriga qarshi emas, bitta tizim sifatida ishlaydi.**