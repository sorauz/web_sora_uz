# 🛡️ SORA.UZ — ICHKI KATALOG VA GOOGLE MERCHANT AUDIT SAHIFASI REJASI

> **Hujjat nomi:** `audit_prage.md`  
> **Maqsad:** 1C ERP bazasidan kelayotgan barcha mahsulotlarni Google Merchant Center, Yandex Market va SEO talablari bo‘yicha jonli tekshirish, muammolarni tezkor aniqlash va dasturchisiz Excel/CSV formatida yuklab olish uchun yopiq ichki boshqaruv sahifasini yaratish.  
> **Manzil (Route):** `/[locale]/internal-audit` *(yoki `/[locale]/katalog-auditi` — kirish faqat maxfiy kalit orqali)*

---

## 1. Asosiy 6 ta Tamoyil

| № | Talab | Amaliy Yechim |
| :-: | :--- | :--- |
| **1** | **Jonli holat** | Har safar sahifa ochilganda yoki **«Yangilash»** bosilganda to‘g‘ridan-to‘g‘ri 1C ERP (`/all_product`, `/price`, `/categories`, `/faq`) dan keshsiz (`no-store`) eng so‘nggi holat olinadi. |
| **2** | **Dasturchisiz ishlash** | Kontent-menejer dasturchidan ro‘yxat so‘ramasdan o‘zi kerakli filtrni (*masalan: «Narxi 0 bo‘lgan DELI mahsulotlari»*) tanlab, 1 klikda tayyor jadvalni yuklab oladi. |
| **3** | **Maxfiylik** | Sahifa va uning API eksport endpointi begonalar va raqobatchilar ko‘ra olmasligi uchun maxfiy kalit va himoyalangan HttpOnly sessiya bilan yopiladi. |
| **4** | **SEO yopish (`noindex, nofollow`)** | Qidiruv tizimlari (Google, Yandex, AI-botlar) ushbu sahifani aslo indekslamasligi uchun 4 qatlamli himoya o‘rnatiladi. |
| **5** | **Tezkor eksport** | Filtrlangan natijalarni 1 klikda Microsoft Excel’da chiroyli ochiladigan (UTF-8 BOM) CSV/XLSX fayl ko‘rinishida yuklab olish (shtrix-kod va artikul nollari yo‘qolib ketmaydigan formatda). |
| **6** | **Qulay interfeys** | Tezkor KPI statistik kartochkalari, rangli xato yorliqlari, artikul/nom/shtrix-kod bo‘yicha tezkor qidiruv va mahsulot sahifasiga to‘g‘ridan-to‘g‘ri havola. |

---

## 2. Jonli Holat — Nimalar Avtomatik Tekshiriladi?

Sahifa barcha **1 931+ mahsulotni** har ochilganda 6 ta asosiy mezon bo‘yicha tekshiradi (mavjud `merchant.ts` qoidalari bilan 100% bir xil mantiqda):

1. **💰 Narxi `0` so‘m (`no_price`):**
   - `retail_price <= 0` va `wholesale_price <= 0` («Narxi kelishiladi») bo‘lgan mahsulotlar — Google Merchant fidiga kirmaydi.
2. **🖼️ Rasmi yo‘q (`no_image`):**
   - `main_picture` bo‘sh bo‘lgan mahsulotlar.
3. **📊 Xato shtrix-kod (`invalid_gtin`):**
   - GS1 EAN-8/UPC-12/EAN-13/GTIN-14 nazorat raqami (Modulo-10) xato, `000000...` yoki `2...` ichki kod kiritilgan mahsulotlar. *(Shtrix-kodi umuman bo‘sh bo‘lganlar alohida «Shtrix-kod kiritilmagan» ogohlantirishi sifatida belgilanadi).*
4. **🏷️ Artikul muammosi (`invalid_mpn`):**
   - `product_sku` bo‘sh yoki `"N/A"`, `"-"`, `"0"` kabi soxta qiymat yozilgan mahsulotlar.
5. **📦 Omborda tugagan (`out_of_stock`):**
   - `stock === "OutOfStock"` holatidagi mahsulotlar.
6. **✍️ SEO / Tavsif bo‘sh (`missing_seo`):**
   - `short_description_uz/ru`, `meta_description_uz/ru` yoki `attributes` bo‘sh qolgan mahsulotlar.

---

## 3. Maxfiylik va Kirish Xavfsizligi

Raqobatchilar do‘konning qaysi mahsulotlarida narx yoki rasm yo‘qligini ko‘ra olmasligi uchun **qattiq himoya** qo‘llaniladi:

1. **Maxfiy kalit (Environment Variable):**
   - Serverda `AUDIT_ACCESS_KEY` (yoki mavjud `REVALIDATION_SECRET` ga o‘xshash alohida parol) saqlanadi.
2. **Kirish mexanizmi:**
   - URL manzilga shunchaki `/uz/internal-audit` deb kirgan foydalanuvchiga **hech qanday 1C mahsulot ma’lumoti uzatilmaydi** — faqat oddiy **«Kirish paroli»** formasi ko‘rinadi (Server Component ma’lumotlarni faqat parol tekshirilgandan keyingina yuklaydi!).
   - Parol to‘g‘ri kiritilganda (yoki maxfiy havola `?key=...` bilan ochilganda), brauzerga `HttpOnly; Secure; SameSite=Lax` belgili vaqtinchalik cookie (masalan, 12 soatlik) yoziladi.
   - Shu sababli sahifa kodida (HTML manbasida) ham begona odam uchun hech qanday mahsulot ro‘yxati bo‘lmaydi.
3. **Eksport API himoyasi:**
   - `/api/internal-audit/export` endpointi ham aynan shu cookie yoki `AUDIT_ACCESS_KEY` ni tekshiradi; ruxsatsiz so‘rovlarga `401 Unauthorized` qaytaradi.

---

## 4. SEO Yopish (4 Qatlamli Himoya)

Qidiruv tizimlari va AI botlari ushbu sahifani aslo ko‘rmasligi hamda indeks byudjetini sarflamasligi uchun:

1. **Metadata `robots`:** Sahifaning `generateMetadata` funksiyasida `robots: { index: false, follow: false, nocache: true }` qat’iy belgilanadi.
2. **HTTP `X-Robots-Tag`:** Javob sarlavhalarida `X-Robots-Tag: noindex, nofollow, noarchive` yuboriladi (eksport API uchun ham).
3. **`robots.ts` bloklovi:** `Disallow: /uz/internal-audit`, `Disallow: /ru/internal-audit` va `Disallow: /api/internal-audit/` qo‘shiladi.
4. **Sitemap va `llms.txt`:** `src/app/sitemap.ts` hamda `llms-full.txt` ro‘yxatlariga umuman kiritilmaydi.

---

## 5. Qulay Interfeys Tuzilishi (UI / UX)

Sahifa kontent-menejer uchun sodda, ko‘zga tushunarli va bir ekrandan boshqariladigan ko‘rinishda bo‘ladi:

### A) Yuqori Boshqaruv Qatori:
- Sahifa nomi: **«Katalog va Google Merchant Audit Paneli»**
- Oxirgi tekshirilgan vaqt (`Yangilandi: 18.11.2026 15:55`) + **«🔄 1C dan qayta tekshirish»** tugmasi
- O‘ng tomonda katta yashil tugma: **«📥 Excel (CSV) yuklab olish (N ta)»** *(faqat ayni paytda filtrlangan mahsulotlarni yuklaydi)*

### B) 6 ta Jonli KPI Statistik Kartochkalari (bosilganda jadvalni shu muammoga filtrlaydi!):
```text
┌───────────────────┐ ┌───────────────────┐ ┌───────────────────┐
│ ✅ To'liq tayyor  │ │ 🔴 Narxi 0 so'm   │ │ 🔴 Rasmi yo'q     │
│     1 107 ta      │ │      799 ta       │ │       19 ta       │
├───────────────────┤ ├───────────────────┤ ├───────────────────┤
│ 🟡 Xato GTIN      │ │ 🟡 Artikul N/A    │ │ ⚪ Tavsif bo'sh   │
│      23 ta        │ │       5 ta        │ │      109 ta       │
└───────────────────┘ └───────────────────┘ └───────────────────┘
```
*(Masalan, «Rasmi yo‘q — 19 ta» kartochkasini bossangiz, pastdagi jadvalda darhol o‘sha 19 ta mahsulot ajralib chiqadi!)*

### C) Qidiruv va Filtrlar Paneli:
- **Qidiruv satri:** Mahsulot nomi, Artikul (SKU), Shtrix-kod (`barcode`) yoki 1C GUID bo‘yicha bir zumda izlash.
- **Kategoriyalar bo‘yicha filtr:** Dropdown ro‘yxat (*masalan: «Qaychilar», «Foto qog‘oz»*).
- **Brendlar bo‘yicha filtr:** Dropdown ro‘yxat (*masalan: «DELI», «Maped», «Bindi»*).
- **Muammo turi bo‘yicha filtr:** *Barcha muammolilar / Narxi 0 / Rasmi yo‘q / Xato GTIN / Artikul N/A / Merchantga tayyor*.

### D) Asosiy Jadval Ustunlari (Sahifalangan — 50 tadan):

| № | Rasm | Mahsulot nomi & 1C GUID | Artikul (SKU) | Brend & Kategoriya | Narx (UZS) | Shtrix-kod (Barcode) | Aniqlangan muammolar (Badge) | Havola |
| :-: | :-: | :--- | :--- | :--- | :-: | :--- | :--- | :-: |
| 1 | `🖼️` / `❌` | Nomi + ID nusxalash tugmasi | `EM711` | `DELI • Qaychilar` | `0 so'm` | `69352...` | `[🔴 Narx = 0]` `[🔴 Rasm yo'q]` | `[Saytda ↗]` |

---

## 6. Tezkor Eksport (Excel / CSV) Qoidalari

1C da ishlaydigan menejer faylni ochganda o‘zbek/rus harflari buzilmasligi va artikul/shtrix-kod boshidagi nollar (`000001321` $\rightarrow$ `1321`) tushib qolmasligi uchun:

1. **UTF-8 BOM (`\uFEFF`):** Fayl boshiga BOM belgisi qo‘shiladi — Microsoft Excel o‘zbekcha (`o‘`, `g‘`, `sh`) va ruscha (`А–Я`) harflarni avtomatik to‘g‘ri o‘qiydi.
2. **Nollarni saqlash:** Artikul (`000001321`) va shtrix-kod (`4605817132201`) ustunlari Excel’da ilmiy formatga (`4.60E+12`) aylanib ketmasligi uchun `="000001321"` ko‘rinishida yoki `.xlsx` formatda matn (Text) sifatida chiqariladi.
3. **Foydali ustunlar tarkibi:**
   - `1C_ID` (GUID — 1C da 1 soniyada topish uchun)
   - `Artikul_SKU`
   - `Mahsulot_Nomi_UZ`
   - `Mahsulot_Nomi_RU`
   - `Brend`
   - `Kategoriya`
   - `Chakana_Narx` / `Ulgurji_Narx` / `Qoldiq_Holati`
   - `Shtrix_Kod`
   - `Rasm_Bormi` (`Ha` / `Yo'q`)
   - `Merchant_Holati` (`Tasdiqlanadi` / `Rad etiladi`)
   - `Muammo_Sabablari` (o‘zbek tilida tushunarli ro‘yxat)
   - `Sayt_Havolasi`
4. **Aqlli fayl nomi:** Yuklab olinayotganda filtrga qarab tushunarli nom beriladi: masalan `sora-audit-narxsiz-deli-2026-11-18.csv`.

---

## 7. Amalga Oshirish Bosqichlari (Yo‘l xaritasi)

1. **1-bosqich — Audit Dvigateli (`src/lib/utils/catalog-audit.ts`):**
   - 1C dan kelgan barcha mahsulotlarni `merchant.ts` qoidalari bilan tekshirib, statistika + batafsil muammolar ro‘yxatini shakllantiruvchi modul yozish.
2. **2-bosqich — Xavfsiz Autentifikatsiya va Eksport API (`src/app/api/internal-audit/...`):**
   - Parolni tekshirish (`POST /api/internal-audit/auth`) va HttpOnly cookie berish;
   - Filtrlangan natijani Excelga tayyor CSV/XLSX qilib qaytaruvchi `GET /api/internal-audit/export` endpointi.
3. **3-bosqich — Interfeys va Sahifa (`src/app/[locale]/internal-audit/page.tsx`):**
   - KPI kartochkalar, tezkor filtrlar, qidiruv, ID nusxalash va eksport tugmasi bilan qulay boshqaruv paneli (`noindex, nofollow` + `robots.ts` bloklovi).
4. **4-bosqich — Sinov (Playwright Test):**
   - Parolsiz kirilganda ma’lumotlar yopiqligini, `noindex, nofollow` mavjudligini, parol kiritilganda jonli KPI + jadval chiqishini va CSV eksport `200 OK` berishini avtotest bilan tasdiqlash.
