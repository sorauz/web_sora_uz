# 1C ERP API (`http://1cloud.uz:777/SORA/hs/for_msp`) — Barcha GET va POST So‘rovlari Xaritasi

> **Yangilangan sana:** 2026-11-19  
> **Asosiy klient:** `src/lib/api/client.ts` (`import "server-only"`, Basic Auth)  
> **Muhim:** Brauzerdan 1C serveriga to‘g‘ridan-to‘g‘ri so‘rov yuborilmaydi — barcha 16 ta 1C so‘rovi faqat Next.js server qatlamidan bajariladi.

---

## 1. Umumiy Jadval — 1C GET So‘rovlari (14 ta)

| № | HTTP Metod va 1C Endpoint | Server Metodi (`client.ts`) | Kesh / Revalidate | Qaysi maqsadda ishlatiladi | Qayerda chaqiriladi (Asosiy sahifa va API’lar) |
| :-: | :--- | :--- | :--- | :--- | :--- |
| 1 | `GET /categories` | `api.getCategories()` | `24 soat` · tag: `categories` + `React.cache` | Kategoriyalar daraxtini (`MegaMenu`), katalog navigatsiyasi va breadcrumbs qurish | 25 ta joy: Barcha 20 ta asosiy sahifa (`Header`), `sitemap.ts`, `llms-full.txt`, `/api/feeds/yandex-market`, `/api/search/suggestions`, `/api/md/.../category/[slug]` |
| 2 | `GET /brands` | `api.getBrands()` | `24 soat` · tag: `brands` + `React.cache` | Rasmiy brendlar ro‘yxati, Header menyusi, brendlar sahifasi va qidiruv filtrlari | 23 ta joy: Barcha 20 ta asosiy sahifa (`Header`), `sitemap.ts`, `llms-full.txt`, `/api/search/suggestions` |
| 3 | `GET /all_product` | `api.getAllProducts()`<br>`api.getAllProductsWithAuditDetails()` | `24 soat` · tag: `products`, `all-products` + `React.cache`<br>*(Audit va Smart Diff’da `no-store`)* | Barcha ~1 930 ta mahsulotning asosiy katalogi (`id`, `sku`, `barcode`, `brand`, `pic`, `up_date`, `uz`/`ru` nom, slug, kategoriya). Avtomatik `/price` bilan birlashtiriladi | 20 ta joy: Bosh sahifa, Katalog, Kategoriya, Brend, Mahsulot (PDP), Qidiruv, Savatcha, Sevimlilar, Solishtirish, Aksiyalar, Google Merchant XML, Yandex YML, `sitemap.ts`, `llms-full.txt`, Markdown `.md`, `smart-diff.ts`, `/internal-audit`, `/api/internal-audit/export`, `/api/search/suggestions` |
| 4 | `GET /price` | `api.getPrices()` | `24 soat` · tag: `prices` + `React.cache`<br>*(Audit va Smart Diff’da `no-store`)* | Barcha mahsulotlarning chakana (`retail_price`), ulgurji (`wholesale_price`), dilerlik narxlari va ombor qoldig‘ini (`InStock`/`OutOfStock`) biriktirish | `getAllProducts()`, `getProductById()`, `getSpecialOffers()` ichida avtomatik chaqiriladi |
| 5 | `GET /product?id={ID}` | `api.getProductById()`<br>`api.getProductBySlug()`<br>`api.fetchAllProductRelations()`<br>`api.fetchAllProductSeoDetails()` | `24 soat` · tag: `products`, `product-{ID}` + `React.cache`<br>*(Batch skanerlar: 48 Keep-Alive worker, `no-store`)* | Bitta mahsulotning to‘liq kartochkasi: `product_description`, `short_description`, `meta_description`, `attributes`, `gallery`, `related_products`, `recommended_products` | `/[locale]/products/[slug]` (PDP), `/api/md/[locale]/products/[slug]`, `/api/products/compare`, `smart-diff.ts` (`related/recommended` diff), `/internal-audit` va `/api/internal-audit/export` (chuqur SEO auditi) |
| 6 | `GET /low_price_guarantee` | `api.getLowPriceGuarantee()` *(orqali `getSpecialOffers`)* | `24 soat` · tag: `offers`, `low_price_guarantee` | «Eng arzon narx kafolati» vitrinasi mahsulotlari | Bosh sahifa (`/[locale]`), `/[locale]/offers`, `/[locale]/catalog/[offer]` |
| 7 | `GET /new_products` | `api.getNewProducts()` *(orqali `getSpecialOffers`)* | `24 soat` · tag: `offers`, `new_products` | «Yangi kelgan mahsulotlar» vitrinasi | Bosh sahifa (`/[locale]`), `/[locale]/offers`, `/[locale]/catalog/[offer]` |
| 8 | `GET /popular` | `api.getPopular()` *(orqali `getSpecialOffers`)* | `24 soat` · tag: `offers`, `popular` | «Ommabop / Top mahsulotlar» vitrinasi | Bosh sahifa (`/[locale]`), `/[locale]/offers`, `/[locale]/catalog/[offer]` |
| 9 | `GET /promotions` | `api.getPromotions()` *(orqali `getSpecialOffers`)* | `24 soat` · tag: `offers`, `promotions` | «Aksiya va chegirmalar» vitrinasi | Bosh sahifa (`/[locale]`), `/[locale]/offers`, `/[locale]/catalog/[offer]` |
| 10 | `GET /review?productId={GUID}` | `api.getReviewsByProductId()` | `24 soat` · tag: `reviews`, `reviews-{ID}`, `product-{ID}` | Mahsulotning tasdiqlangan xaridor sharhlari va o‘rtacha reytingini chiqarish | `/[locale]/products/[slug]` (PDP) |
| 11 | `GET /faq` | `api.getFaqs()` | `24 soat` · tag: `faq` + `React.cache` | Kontekstli savol-javoblar bloki va Google uchun `FAQPage` JSON-LD yaratish | 9 ta sahifa: Bosh sahifa, Kategoriya, Mahsulot, Brend, Yetkazib berish, To‘lov, B2B, Kafolat, Aloqa |
| 12 | `GET /units` | `api.getUnits()` | `24 soat` · tag: `units` | O‘lchov birliklari ma’lumotnomasi (`dona`, `o‘ram`, `kg` va h.k.) | Hozirda faqat `/api/1c/test` diagnostikasida tekshiriladi *(sahifalar bevosita mahsulot ichidagi `unit_uz`/`unit_ru` ni ishlatadi)* |
| 13 | `GET /register?type=...&phone/inn=...&password=...` | `api.loginUser()` | `no-store` (jonli) | Mavjud B2C (telefon) yoki B2B (STIR/INN) mijozni 1C bazasidan qidirish va tizimga kiritish | `POST /api/auth/login`, `POST /api/auth/otp/verify` (SMS tasdiqlangach mavjud mijozni avtomatik aniqlash) |
| 14 | `GET /order?type=...` *(+ ixtiyoriy `order_id`)* | `api.getOrderDetail()`<br>`api.getOrderHistory()` | `no-store` (jonli) | **1-Rejim (`order_id` bilan):** Bitta buyurtma tafsiloti (`delivery.without_delivery`, 7 xil `status_code`, `timeline`, `products`, `customer`) — majburiy egalik (`contact_id`/`client_id`) tekshiruvi bilan.<br>**2-Rejim (`order_id` siz):** Mijozning barcha buyurtmalari tarixi (`limit`, `offset`, `has_more`, `only_online`) | `GET /api/order/status` (`/checkout/success`, `OrderTrackerModal`) va `GET /api/orders` (`/[locale]/orders` — «Mening buyurtmalarim») |

---

## 2. Umumiy Jadval — 1C POST So‘rovlari (2 ta)

| № | HTTP Metod va 1C Endpoint | Server Metodi (`client.ts`) | Kesh | Yuboriladigan ma’lumotlar (Payload) | Qaysi maqsadda va qayerda ishlatiladi |
| :-: | :--- | :--- | :---: | :--- | :--- |
| 1 | `POST /register` | `api.registerUser()` | `no-store` | **B2C:** `{ type: "B2C", name, phone1, phone2, password }`<br>**B2B:** `{ type: "B2B", name, inn, phone1, password }` | 1C da yangi mijoz (`КонтактноеЛицо` yoki `Контрагент`) yaratish yoki `409 Conflict` orqali mavjud mijozning GUID’ini olish.<br>**Chaqiriladigan joylar (4 ta):**<br>• `POST /api/auth/otp/complete` (SMS orqali yangi mijoz ro‘yxatdan o‘tishi)<br>• `POST /api/auth/otp/verify` (eski 1C mijozlar uchun `409` orqali *Seamless Login*)<br>• `POST /api/auth/register` (standart ro‘yxatdan o‘tish)<br>• `POST /api/order/create` (B2C va B2B buyurtmada `contact_id` va `client_id` GUID’larini olish) |
| 2 | `POST /order` | `api.createOrder()` | `no-store` | `{ type: "B2C" \| "B2B", contact_id?, client_id?, without_delivery, geolocation, comment, products: [{ product_id, quantity, price }] }` | SMS orqali tasdiqlangan buyurtmani 1C ERP da yaratish (`201 Created`: `CONFIRMED`/`posted: true` yoki chernovik `PENDING`/`posted: false`, `total_amount`; qat’iy `400`/`404` validatsiyasi).<br>**Chaqiriladigan joy (2 ta):**<br>• `POST /api/order/create` (`CheckoutForm`, `ProductActions` 1-klik buyurtma) |

---

## 3. Yordamchi Diagnostika va Sinxronizatsiya Nuqtalari

| Ichki Endpoint / Modul | Qaysi 1C so‘rovlarini ishlatadi | Maqsadi |
| :--- | :--- | :--- |
| `GET /api/1c/test` (`src/app/api/1c/test/route.ts`) | `GET` → `/categories`, `/units`, `/brands`, `/price`, `/all_product`, `/product?id=...`, `/review?productId=...`, `/faq` | 1C ERP serveri ulanishini va javob vaqtlarini tezkor diagnostika qilish (`no-store`) |
| `GET/POST /api/revalidate` va `POST /api/internal-audit/sync` (`src/lib/sync/smart-diff.ts`) | `GET /all_product`, `GET /price`, `GET /product?id={ID}` (parallel 48 worker) | Keshdagi katalog bilan jonli 1C ma’lumotlarini solishtirish (*Smart Diff*), faqat o‘zgargan teglarni tozalash va IndexNow’ga yuborish |
| `/[locale]/internal-audit` va `GET /api/internal-audit/export` | `GET /all_product`, `GET /price`, `GET /product?id={ID}` (parallel 48 worker, `no-store`) | Yopiq admin panelda 1C va Google Merchant xatolarini jonli tekshirish va Excel (CSV) eksport qilish |

---

## 4. Qisqa Xulosa (Statistika)

- **Jami 1C endpointlari:** **16 ta** (**14 ta `GET`** — o‘qish, **2 ta `POST`** — yozish).
- **Keshlanadigan `GET` so‘rovlar (12 ta):** 24 soatlik Next.js Data Cache + `React.cache()` (bitta so‘rov ichida takroriy chaqiruvsiz) + `/api/revalidate` orqali 0 soniyada tozalash imkoniyati.
- **Har doim jonli (`no-store`) so‘rovlar (4 ta):** `GET /register`, `POST /register`, `GET /order`, `POST /order` — mijoz avtorizatsiyasi va buyurtmalar hech qachon keshlanmaydi.
