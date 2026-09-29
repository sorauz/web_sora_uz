# Indekslash, Skanerlash va Status Kodlarini Boshqarish

> Ushbu hujjat `SEO.md` faylidan **3-qism: Indekslash, Skanerlash va Status Kodlarini Boshqarish** mavzusi bo‘yicha tartibli jamlangan material hisoblanadi.

---

## 1. Dinamik Sitemap.xml

E-commerce loyihalari uchun **avtomatik dinamik sitemap.xml** hosil qilish tavsiya etiladi.

Agar 1C bazasida 10 000 ta mahsulot bo‘lsa, Next.js avtomatik ravishda barcha mahsulot havolalarini jamlagan xarita hosil qilishi kerak.

### Sitemap’ga nimalar kiritiladi

Sitemap’da faqat **indexda bo‘lishini xohlagan canonical sahifalar** bo‘lishi kerak:

- bosh sahifa;
- kategoriya sahifalari;
- mahsulot sahifalari;
- brend sahifalari;
- SEO article / blog sahifalari;
- FAQ / qo‘llanmalar.

### Sitemap’ga nimalar kiritilmaydi

Sitemap’ga quyidagilarni tiqib tashlamaslik kerak:

- ❌ filter URL;
- ❌ sort URL;
- ❌ savatcha (cart);
- ❌ akkaunt (account);
- ❌ login;
- ❌ checkout;
- ❌ internal search;
- ❌ duplicate URL.

Bing ham sitemap’da faqat **canonical URL**’larni ko‘rsatishni tavsiya qiladi.

### Sitemap va `lastmod`

Google sitemap documentation’da `lastmod` sahifaning muhim o‘zgarish sanasini ifodalashi kerakligi ko‘rsatilgan.

1C’da quyidagi o‘zgarishlar bo‘lganda `lastmod` yangilanishi mumkin:

- narx o‘zgardi;
- availability o‘zgardi;
- description o‘zgardi;
- asosiy rasm o‘zgardi;
- category o‘zgardi.

Ammo `lastmod`ni har soatda “hozirgi vaqt”ga qo‘yish kerak emas. Faqat sezilarli o‘zgarish bo‘lganda yangilanishi kerak.

### Sitemap — qat’iy buyruq emas

`sitemap.xml` — qidiruv botlari uchun qat’iy buyruq emas, shunchaki **tavsiyaviy xarita**. Googlebot sitemap’ni tekshirishi, sahifani navbatga qo‘yishi, skanerlashi (crawl) va indeksga kiritishi bir necha soatdan bir necha kungacha, ba’zan esa haftalab vaqt olishi mumkin. Google indexing umuman kafolatlanmasligini ta’kidlaydi.

---

## 2. Robots.txt

`robots.txt` orqali qidiruv botlariga shaxsiy sahifalarni indekslashni taqiqlab, faqat mahsulot va katalog sahifalarini ochiq qoldirish lozim.

### Cheklanishi kerak bo‘lgan yo‘nalishlar

- admin;
- account;
- checkout;
- savatcha (cart);
- login;
- shaxsiy API yo‘nalishlari;
- boshqa crawler’ga kerak bo‘lmagan joylar.

### robots.txt va noindex farqi

Muhim:

- **“Google indexlamasin”** → ko‘pincha `noindex`;
- **“Google bu URL’ga umuman crawl qilmasin”** → `robots.txt`.

Google `robots.txt` bilan bloklangan URL ichidagi `noindex`ni ko‘rmasligi mumkin. `noindex` ishlashi uchun crawler sahifaga kira olishi kerak. Shuning uchun bu farq saqlanishi kerak.

Next.js va Google hujjatlarida ham `robots` va `noindex` o‘rtasidagi farq alohida ko‘rsatilgan.

---

## 3. Status kodlarini boshqarish

E-commerce’da status kodlar to‘g‘ri ishlashi kerak:

| Holat | Status kod |
|---|---|
| Mahsulot mavjud | `200` |
| Mahsulot butunlay o‘chirilgan | `404` yoki `410` (vaziyatga qarab) |
| Mahsulot boshqa URL’ga ko‘chirilgan | `301` |

### Noto‘g‘ri amaliyot

“O‘chirilgan mahsulot URL’iga yana boshqa mahsulotni chiqarib qo‘yish” kabi noto‘g‘ri **soft-404** strukturalar SEO uchun zararli bo‘lishi mumkin.

Next.js’ning SEO materiallarida HTTP status code va indexing alohida mavzu sifatida ko‘rsatilgan.

---

## 4. Out of Stock (Omborda tugagan tovarlar) strategiyasi

1C bilan ishlaydigan har qanday do‘konda tovar qoldig‘i nolga tushishi oddiy holat.

Agar tovar vaqtincha tugasa, uni `404` qilish qidiruvdagi to‘plangan barcha nufuzni (SEO reytingni) yo‘q qiladi.

### To‘g‘ri strategiya

- Sahifa `200` kodi bilan ochiq qolishi kerak.
- Schema.org ma’lumotlarida mahsulot holati **`OutOfStock`** qilib ko‘rsatilishi kerak.
- Sahifada xaridorga o‘xshash boshqa modellar tavsiya etilishi kerak.

Bu bilan sahifa indeksda saqlanib qoladi va vaqtinchalik tugagan tovar qaytib kelganda SEO nufuzi tiklanadi.

---

## 5. 404 sahifa va yo‘naltirishlar

### 404 sahifa yaxshi ishlashi kerak

Masalan:

```text
/iphone-15-pro-max-256gb
```

mahsulot o‘chdi.

404 sahifada:

- “Mahsulot topilmadi” xabari;
- unga yaqin bo‘lgan ichki navigatsiya:
  - iPhone;
  - Smartfonlar;
  - Yangi mahsulotlar.

kabi ichki navigatsiya bo‘lishi foydali.

### 301 redirect

Mahsulot nomi yoki slug o‘zgarganda eski URL’ni shunchaki yo‘qotmasdan, kerak bo‘lsa `301` redirect bilan yangi URL’ga o‘tkazish kerak.

---

## 6. IndexNow

Bing 2026-yilgi hujjatlarida yangi yoki o‘zgargan URL’larni tezroq bildirish uchun **IndexNow**ni sitemap va internal links bilan birga discovery usullaridan biri sifatida ko‘rsatmoqda.

Mahsulotlari tez-tez o‘zgaradigan katta e-commerce uchun bu ayniqsa foydali bo‘lishi mumkin.

IndexNow orqali:

- yangi mahsulot URL’lari;
- o‘zgargan narx/availability sahifalari;
- yangi kategoriya/brend sahifalari;

Bing va boshqa qidiruv tizimlariga tezkor yetkazilishi mumkin.

---

## 7. Nazorat ro‘yxati

| Yo‘nalish | Holat |
|---|---|
| Dinamik sitemap.xml | ✅ |
| Sitemap faqat canonical URL’lar | ✅ |
| Sitemap’da `lastmod` faqat sezilarli o‘zgarishda | ✅ |
| Sitemap’da filter/sort/cart/account/login/checkout yo‘q | ✅ |
| robots.txt | ✅ |
| Savatcha, akkaunt, to‘lov, API yopilgan | ✅ |
| robots.txt va noindex farqi saqlangan | ✅ |
| Status kodlar: 200, 301, 404, 410 | ✅ |
| Soft-404 oldini olish | ✅ |
| Out of Stock sahifasi 200 bilan saqlanadi | ✅ |
| Out of Stock’da `OutOfStock` schema | ✅ |
| Out of Stock’da muqobil modellar tavsiyasi | ✅ |
| 404 sahifada ichki navigatsiya | ✅ |
| 301 redirect slug o‘zgarganda | ✅ |
| IndexNow ishlatilishi | ✅ |
| Google Search Console | ✅ |
| Bing Webmaster Tools | ✅ |
| Merchant Center | ✅ |

---

## 8. Eng muhim xulosalar

- Sitemap — faqat canonical sahifalar uchun.
- `robots.txt` — crawl nazorati, `noindex` — index nazorati. Ikkalasi bir xil narsa emas.
- Status kodlar aniq bo‘lishi kerak: `200`, `301`, `404`, `410`.
- Out of Stock sahifa `404` qilinmaydi, `200` bilan saqlanadi va `OutOfStock` schema ko‘rsatiladi.
- O‘chirilgan mahsulot URL’iga boshqa mahsulot chiqarib qo‘yish — soft-404, bu zararli.
- IndexNow Bing va boshqa qidiruv tizimlariga o‘zgarishlarni tez yetkazish uchun foydali.
- Sitemap va robots doimiy monitoring qilinishi kerak: Search Console, Bing Webmaster Tools.