# E-COMMERCE VEB-SAYT UCHUN TO‘LIQ TEXNIK AUDIT NATIJALARI (SORA.UZ)

> **Hujjat turi:** To‘liq mustaqil texnik audit hisoboti  
> **Audit o‘tkazilgan sana:** 11-noyabr, 2026-yil  
> **Loyihaning nomi:** `web_sora_uz` (Rasmiy domen: `https://sora.uz`)  
> **Texnologik steki:** Next.js 16.3.7 (App Router, React 19) + Vercel Serverless + Cloudflare R2 / CDN + 1C:Enterprise (ERP)  
> **Manba kodi:** `https://github.com/sorauz/web_sora_uz`  
> **Baholash mezoni:** `D:\web_sora_uz\Loyixa_xujjatlari\audit_baholash_mezoni.txt` (Ha: 2 ball, Qisman: 1 ball, Yo‘q: 0 ball, Tekshirilmagan: —)

---

## 1. IJROIYA XULOSASI (EXECUTIVE SUMMARY)

Ushbu audit **GitHub, Vercel, Cloudflare R2, 1C ERP integratsiyasi va jonli ishlab chiqarish (production) muhiti** asosida 15 ta bo‘lim va **207 ta aniq texnik savol** bo‘yicha o‘tkazildi. Audit shunchaki saytning ishlashini emas, balki uning xavfsizligi, arxitektura barqarorligi, ma’lumotlar yaxlitligi va qidiruv tizimlariga mosligini qat’iy texnik dalillar bilan tahlil qildi.

### Asosiy ko‘rsatkichlar (KPI):

- **Jami tekshirilgan savollar:** 207 ta
- **«Ha» (Talab to‘liq bajarilgan):** 130 ta (62.8%)
- **«Qisman» (Kamchiliklari mavjud):** 55 ta (26.6%)
- **«Yo‘q» (Talab bajarilmagan):** 21 ta (10.1%)
- **«Tekshirilmagan» (Ichki server amaliyoti):** 1 ta (0.5%)
- **Umumiy to‘plangan ball:** **`315 / 412` ball (76.5%)**
- **Umumiy reyting:** **B+ (Yaxshi / Kengayishga tayyor, ammo 7 ta kritik zaiflik mavjud)**

> [!IMPORTANT]  
> **XULOSA VA BIZNES XAVFI:** Loyihaning frontend va SEO arxitekturasi juda yuqori darajada ishlangan (Mahsulot sahifasi Lighthouse 98/100, Schema.org to‘liq, R2 CDN AVIF siqish 94% tejamkorlik beradi). Biroq, **xavfsizlik va GitHub boshqaruvi sohasida 7 ta kritik xavf** aniqlandi. Ushbu zaifliklar umumiy ball yuqori bo‘lishiga qaramay, biznes uchun moliyaviy yo‘qotish va tizimga noqonuniy kirish xavfini tug‘diradi va ularni **zudlik bilan (24-48 soat ichida)** bartaraf etish talab qilinadi!

## 2. BO‘LIMLAR KESIMIDA UMUMIY BAHOLASH JADVALI

| № | Bo‘lim nomi | Savollar | Ha | Qisman | Yo‘q | Ball / Maks | Foiz | Ustuvorlik |
|---|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| 1 | Loyihaning umumiy arxitekturasi | 9 | 6 | 3 | 0 | **15/18** | 83.3% | Yuqori |
| 2 | GitHub va source code auditi | 13 | 4 | 3 | 6 | **11/26** | 42.3% | **Kritik** |
| 3 | Xavfsizlik auditi — Security | 19 | 9 | 9 | 1 | **27/38** | 71.1% | **Kritik** |
| 4 | Vercel va deployment auditi | 14 | 12 | 2 | 0 | **26/28** | 92.9% | Yuqori |
| 5 | Cloudflare R2 — fayllar va rasmlar auditi | 17 | 13 | 3 | 1 | **29/34** | 85.3% | Yuqori |
| 6 | Frontend va foydalanuvchi interfeysi — UI/UX | 12 | 9 | 3 | 0 | **21/24** | 87.5% | O‘rta |
| 7 | Mahsulotlar va katalog tizimi | 12 | 10 | 2 | 0 | **22/24** | 91.7% | Yuqori |
| 8 | Backend va API auditi | 12 | 6 | 5 | 1 | **17/24** | 70.8% | **Kritik** |
| 9 | 1C yoki ERP bilan integratsiya auditi | 14 | 9 | 3 | 2 | **21/28** | 75.0% | **Kritik** |
| 10 | Savatcha, buyurtma va to‘lov tizimi | 15 | 5 | 8 | 2 | **18/30** | 60.0% | **Kritik** |
| 11 | SEO auditi — Google, Yandex va boshqa qidiruv tizimlari | 22 | 21 | 1 | 0 | **43/44** | 97.7% | O‘rta |
| 12 | Tezlik va samaradorlik auditi — Performance | 16 | 11 | 5 | 0 | **27/32** | 84.4% | O‘rta |
| 13 | Testlash va sifat nazorati — QA | 11 | 7 | 2 | 2 | **16/22** | 72.7% | Yuqori |
| 14 | Monitoring, loglar va zaxiralash | 11 | 4 | 4 | 2 | **12/20** | 60.0% | O‘rta |
| 15 | Huquqiy va biznes talablariga muvofiqlik | 10 | 4 | 2 | 4 | **10/20** | 50.0% | **Kritik** |
| **JAMI** | **Barcha 15 ta yo‘nalish** | **207** | **130** | **55** | **21** | **315/412** | **76.5%** | — |

## 3. ⚠️ ZUDLIK BILAN BARTARAF ETILISHI SHART BO‘LGAN KRITIK MUAMMOLAR (P0)

Quyidagi 7 ta kamchilik loyihaning eng xatarli nuqtalari hisoblanadi va ular darhol dasturchilar e’tiboriga taqdim etilishi kerak:

### 1. Ommaviy GitHub repozitoriyada 1C ERP va Eskiz SMS parollarining sizib chiqishi (Secret Leak) (21-savol)

- **Texnik holat:** GitHub repozitoriya **PUBLIC** (`private: false`) holatda. `src/app/api/1c/test/route.ts` (5-6 qatorlar), `src/lib/api/client.ts` (77-78 qatorlar) fayllarida 1C Basic Auth login va paroli (`web_user` / `977540910`), shuningdek `Loyixa_xujjatlari/Api/user_api/OTP/plan_sms_otp.md` faylida Eskiz SMS shlyuzining jonli maxfiy paroli ochiq commit qilingan.
- **Xavf darajasi:** Istalgan begona shaxs internet orqali korxonaning 1C buxgalteriya bazasiga ulanishi, mahsulot va narxlarni o‘zgartirishi, Eskiz hisobidagi pullarni SMS spam orqali tugatishi mumkin.
- **Zudlik bilan qilinadigan amaliy yechim:** 1) 1C va Eskiz parollarini darhol o‘zgartirish; 2) Barcha parollarni manba kodidan butunlay tozalab, faqat Vercel Environment Variables ga ko‘chirish; 3) GitHub repozitoriyani darhol **Private** qilish va Git tarixidan BFG Repo-Cleaner yordamida parollarni tozalash.

### 2. `sora_session` cookie-ning imzolanmaganligi va soxtalashtirilishi (Session Forgery / Account Takeover) (27-savol)

- **Texnik holat:** `src/app/api/auth/otp/verify/route.ts` da `sora_session` cookie'si shifrlanmagan va raqamli imzolanmagan oddiy `JSON.stringify(user)` formatida saqlanadi. Jonli test orqali tasdiqlandi: brauzerda soxta cookie (`{"id":"FORGED-ID","name":"TEST","type":"B2B","inn":"000000000"}`) yuborilganda `https://sora.uz/api/auth/me` uni 200 OK authenticated: true deb qabul qildi!
- **Xavf darajasi:** Tajovuzkor ixtiyoriy mijoz yoki B2B tashkilot nomidan saytga kirishi, uning buyurtmalar tarixini ko‘rishi yoki uning nomidan buyurtma berishi mumkin.
- **Zudlik bilan qilinadigan amaliy yechim:** `iron-session` yoki `jose` (JWT) kutubxonasi yordamida sessiya cookie'sini serverdagi maxfiy kalit (`SESSION_SECRET`) bilan AES-256 shifrlash va HMAC-SHA256 bilan raqamli imzolash.

### 3. Buyurtma yaratishda narxning brauzerdan tekshiruvsiz qabul qilinishi (Price Tampering) (31 va 127-savollar)

- **Texnik holat:** `src/app/api/order/create/route.ts` faylida kelgan `rawBody.items` massividagi `price` to‘g‘ridan-to‘g‘ri qabul qilinadi. Server ushbu narxni 1C bazasidagi haqiqiy narx bilan qayta tekshirmaydi va qayta hisoblamaydi.
- **Xavf darajasi:** Xaridor DevTools orqali 5 000 000 so‘mlik seyf yoki qog‘oz narxini 1 000 so‘m qilib yuborsa, buyurtma 1 000 so‘m bilan 1C tizimiga rasmiylashib ketadi.
- **Zudlik bilan qilinadigan amaliy yechim:** Server tomonida mijoz yuborgan narxga aslo ishonmaslik! Har bir tovar kodi bo‘yicha 1C `/price` servisidan joriy narxni qayta so‘rab, jami summani faqat serverda hisoblab buyurtma yaratish.

### 4. 1C xato berganda buyurtmalarning ma’lumotlar bazasisiz yo‘qotilishi (Silent Order Loss) (116 va 118-savollar)

- **Texnik holat:** Agar 1C serveri buyurtma vaqtida 500 xato bersa yoki tarmoq uzilsa, `client.ts` soxta buyurtma raqamini (`РТ-XXXXXX`) generatsiya qiladi va xaridorga 'Muvaffaqiyatli qabul qilindi' deb ko‘rsatadi. Biroq ushbu buyurtma hech qanday zaxira bazaga yoki navbatga yozilmaydi!
- **Xavf darajasi:** Xaridor buyurtma berdim deb kutadi, biroq korxona xodimlari bu buyurtmadan bexabar qoladi. Natijada mijoz yo‘qotiladi va biznes obro‘siga putur yetadi.
- **Zudlik bilan qilinadigan amaliy yechim:** Buyurtmalarni zaxiralash uchun Vercel Postgres, Supabase yoki Upstash Redis navbatini ulash; 1C ishlamay qolganda buyurtma zaxira bazaga tushib, 1C yoqilganda avtomatik qayta yuborilishi shart.

### 5. `/api/1c/test` endpointining ommaga ochiqligi (Infratuzilmani fosh qilish) (40 va 108-savollar)

- **Texnik holat:** `https://sora.uz/api/1c/test` endpointi hech qanday parol yoki tokensiz ommaga ochiq ishlab turibdi. U 1C ERP ning ichki IP manzili, porti, OData endpointlari va aloqa tezligini har qanday tashrifchiga fosh etmoqda.
- **Xavf darajasi:** Xakerlar korxonaning ichki tarmog‘i va ERP arxitekturasi haqida to‘liq ma’lumot olib, DDoS yoki to‘g‘ridan-to‘g‘ri hujum uyushtirishi mumkin.
- **Zudlik bilan qilinadigan amaliy yechim:** Ushbu endpointni production kodidan butunlay o‘chirish yoki faqat maxfiy `CRON_SECRET` orqali ochiladigan qilish.

### 6. 1C ERP bilan aloqaning shifrlanmagan ochiq HTTP orqali borishi (Man-in-the-Middle) (122-savol)

- **Texnik holat:** Vercel va 1C o‘rtasidagi barcha so‘rovlar ochiq internet orqali shifrlanmagan `http://1cloud.uz:777` protokoli orqali bormoqda. Aloqa HTTPS bilan shifrlanmagan.
- **Xavf darajasi:** Trafik yo‘lida bo‘lgan provayderlar yoki tajovuzkorlar mijozlar ma’lumotlari, telefon raqamlari, buyurtma tarkibi va buxgalteriya narxlarini ochiq matn holatida ushlab olishi mumkin.
- **Zudlik bilan qilinadigan amaliy yechim:** 1C serverida SSL/TLS sertifikatini o‘rnatib HTTPS ga o‘tish yoki Cloudflare Tunnel / WireGuard VPN orqali xavfsiz shifrlangan kanal ochish.

### 7. Majburiy huquqiy sahifalarning yo‘qligi (O‘zbekiston Qonunchiligi - O‘RQ-547) (199, 200, 201-savollar)

- **Texnik holat:** Checkout sahifasida 'Shartlarga rozilik bildirasiz' deb yozilgan, biroq saytda `/terms` (Ommaviy oferta) va `/privacy` (Maxfiylik siyosati) sahifalari mavjud emas (`404 Not Found`). Shaxsiy ma’lumotlarni yig‘ishga rasmiy rozilik olinmayapti.
- **Xavf darajasi:** O‘zbekiston Respublikasi 'Shaxsiy ma’lumotlar to‘g‘risida'gi Qonuni (O‘RQ-547) va 'Elektron tijorat to‘g‘risida'gi Qonuni talablariga zid. Nazorat qiluvchi organlar tomonidan jarima qo‘llanilishi yoki sayt bloklanishi xavfi mavjud.
- **Zudlik bilan qilinadigan amaliy yechim:** Zudlik bilan malakali yurist ishtirokida Ommaviy oferta (`/uz/terms`) va Maxfiylik siyosati (`/uz/privacy`) matnlarini ishlab chiqib saytga joylashtirish.

## 4. BARCHA 207 TA SAVOLNING BATAFSIL TEXNIK TAHLILI

### 1. Loyihaning umumiy arxitekturasi

#### 1. Loyihaning umumiy arxitekturasi aniq belgilanganmi?

- **Natija:** ✅ **Ha** (2 ball)
- **Texnik dalil:** Loyiha `package.json`, `next.config.mjs`, `src/app/` kataloglarida ko'rinadi: Next.js 16.3.7 (App Router), React 19, TypeScript 5, Tailwind CSS v4, Cloudflare R2 media storage, Vercel Serverless runtime va 1C ERP OData/REST API backend.
- **Tahlil va izoh:** Arxitektura zamonaviy headless e-commerce stacki asosida aniq loyihalashtirilgan. Frontend Vercel Edge/Serverless platformasida joylashgan, statik va media fayllar Cloudflare R2 CDN orqali yetkaziladi, biznes ma'lumotlari 1C ERP bilan sinxronlanadi.
- **Amaliy tavsiya:** Mavjud arxitektura barqaror va kengayishga mos. Tavsiya: tizim komponentlari o'rtasidagi ma'lumotlar oqimi va xatoliklar zanjirini arxitektura chizmasi (C4 model yoki Mermaid) ko'rinishida hujjatlashtirish.

#### 2. Frontend, backend, API va ma’lumotlar manbalari vazifalari bir-biridan ajratilganmi?

- **Natija:** ✅ **Ha** (2 ball)
- **Texnik dalil:** `src/components/` (Frontend UI), `src/app/api/` (Next.js Route Handlers / Backend API), `src/lib/api/client.ts` (1C ERP klient servisi), `src/lib/store/` (Zustand mijoz holati), `src/types/` (ma'lumotlar modellari).
- **Tahlil va izoh:** Frontend, backend API, ERP integratsiyasi va holat boshqaruvi aniq qatlamlarga (separation of concerns) ajratilgan. UI komponentlari bevosita 1C bilan bog'lanmaydi, faqat ichki API marshrutlari va client kutubxonasi orqali ishlaydi.
- **Amaliy tavsiya:** Qatlamlar orasidagi tozalikni saqlab qolish uchun API routerlarida biznes logikani kamaytirib, alohida servis qatlamiga (`src/lib/services/`) ko'chirish tavsiya etiladi.

#### 3. Loyiha komponentlari o‘rtasidagi bog‘liqlik va ma’lumotlar oqimi hujjatlashtirilganmi?

- **Natija:** ⚠️ **Qisman** (1 ball)
- **Texnik dalil:** `Loyixa_xujjatlari/` papkasida `plan_new_pic.md`, `sinxron_doc.md`, `1c_integration_analysis.md` mavjud. Biroq umumiy arxitektura diagrammasi va ma'lumotlar oqimi chizmasi yo'q.
- **Tahlil va izoh:** Operatsion vazifalar va sinxronizatsiya bosqichlari batafsil qayd etilgan bo'lsa-da, yangi dasturchi yoki tashqi auditor uchun umumiy arxitekturaviy bog'liqliklar (komponentlar o'zaro aloqasi) vizual yoki formal spetsifikatsiya sifatida to'liq hujjatlashtirilmagan.
- **Amaliy tavsiya:** `Loyixa_xujjatlari/architecture_flow.md` faylini yaratib, Next.js <-> Vercel <-> Cloudflare R2 <-> 1C ERP o'rtasidagi ma'lumotlar oqimini Mermaid diagrammasida tasvirlash.

#### 4. Loyiha yangi funksiyalar qo‘shilganda mavjud funksiyalarni buzmasdan kengaytirilishi mumkinmi?

- **Natija:** ✅ **Ha** (2 ball)
- **Texnik dalil:** Next.js App Router modulli marshrutlash, TypeScript qat'iy tiplash (`tsc --noEmit` 0 xato), mustaqil Route Handlerlar va Zustand do'konlari.
- **Tahlil va izoh:** Loyiha modulli tuzilgan. Yangi xizmat (masalan, to'lov tizimi yoki yangi yetkazib berish usuli) qo'shilganda mavjud sahifalar va komponentlar kodini buzmasdan alohida route yoki komponent sifatida qo'shish imkoniyati to'liq ta'minlangan.
- **Amaliy tavsiya:** Kelgusida yangi integratsiyalarda adapter pattern (masalan, to'lov shlyuzlari uchun yagona `PaymentProvider` interfeysi) dan foydalanish tavsiya etiladi.

#### 5. Kod strukturasi katta loyihani boshqarish uchun to‘g‘ri tashkil etilganmi?

- **Natija:** ✅ **Ha** (2 ball)
- **Texnik dalil:** `src/` ichida feature-based va atomic guruhlash: `components/{cart, catalog, checkout, common, layout, product, ui}`, `lib/{api, hooks, store, utils}`, `app/[locale]/`.
- **Tahlil va izoh:** Katalog tuzilmasi katta ko'lamdagi e-commerce loyihalar talablariga mos keladi. Har bir soha o'zining mustaqil papkasiga ega, fayllar nomlanishi tushunarli va izchil.
- **Amaliy tavsiya:** Tuzilmani hozirgi tartibda saqlash va yangi bo'limlar ochilganda shu konvensiyaga qat'iy rioya qilish.

#### 6. Takrorlanadigan kodlar umumiy komponentlar yoki servislar orqali boshqariladimi?

- **Natija:** ✅ **Ha** (2 ball)
- **Texnik dalil:** `src/components/common/` (Button, Modal, Toast, Input), `src/components/product/ProductCard.tsx`, `src/lib/utils/format.ts` (formatPrice, formatDate, formatPhone), `src/lib/utils/seo.ts`.
- **Tahlil va izoh:** Takrorlanuvchi UI elementlar (tugmalar, modallar, kartochkalar) va biznes yordamchilari (narxni formatlash, telefon raqamini tozalash) umumiy komponent va funksiyalar sifatida chiqarilgan va sahifalar bo'ylab qayta ishlatiladi.
- **Amaliy tavsiya:** Narx va QQS hisoblash funksiyasini yagona markazlashtirilgan utilitga jamlab, barcha joylarda faqat shundan foydalanishni mustahkamlash.

#### 7. Frontend va server tomonidagi vazifalar to‘g‘ri taqsimlanganmi?

- **Natija:** ⚠️ **Qisman** (1 ball)
- **Texnik dalil:** PDP sahifasida (`src/app/[locale]/products/[slug]/page.tsx`) SSR va Server Components a'lo darajada (Lighthouse 98/100). Biroq Bosh sahifada (`src/app/[locale]/page.tsx`) barcha 1C mahsulotlari yirik JSON sifatida 35 ta 'use client' komponentiga to'liq uzatiladi, bu esa TBT (Total Blocking Time) ni 9.2 soniyaga chiqarmoqda.
- **Tahlil va izoh:** Server va Client vazifalari sahifalar kesimida nomutanosib. Mahsulot sahifasida to'g'ri taqsimlangan bo'lsa-da, Bosh sahifada ortiqcha ma'lumotlar mijoz brauzeriga yuklanmoqda va interaktivlikni sekinlashtirmoqda.
- **Amaliy tavsiya:** Bosh sahifadagi mahsulot bloklarini (Top mahsulotlar, Yangi kelganlar) server komponentlariga aylantirib, faqat interaktiv karusel tugmalarini client qatlamida qoldirish.

#### 8. Loyihada foydalanilmayotgan, ortiqcha yoki takroriy kodlar mavjud emasmi?

- **Natija:** ⚠️ **Qisman** (1 ball)
- **Texnik dalil:** `npm run lint` tekshiruvi: 28 ta `no-unused-vars` (ishlatilmagan o'zgaruvchilar) va 19 ta `no-explicit-any`. `scratch/` papkasida eski va takroriy tahlil skriptlari mavjud.
- **Tahlil va izoh:** Loyihada xotira va bundle hajmini oshirishi mumkin bo'lgan foydalanilmayotgan importlar va qoldiq o'zgaruvchilar mavjud. Ular funksionallikni buzmaydi, ammo kod tozaligiga salbiy ta'sir ko'rsatadi.
- **Amaliy tavsiya:** ESLint auto-fix (`npm run lint -- --fix`) ni ishga tushirish va `scratch/` katalogidagi vaqtinchalik tekshiruv fayllarini arxivlash.

#### 9. Barcha muhim texnik qarorlar va integratsiyalar hujjatlashtirilganmi?

- **Natija:** ✅ **Ha** (2 ball)
- **Texnik dalil:** `Loyixa_xujjatlari/` katalogidagi hujjatlar: `plan_new_pic.md`, `1c_integration_analysis.md`, `plan_sms_otp.md`, `audit_baholash_mezoni.txt`.
- **Tahlil va izoh:** 1C ERP OData API integratsiyasi, Cloudflare R2 sinxronizatsiyasi, Eskiz SMS shlyuzi, Google Merchant feedlari bo'yicha barcha texnik qarorlar va bosqichlar batafsil hujjatlashtirilgan.
- **Amaliy tavsiya:** Hujjatlar orasidagi versiyalar va yakunlangan bosqichlarni muntazam yangilab borish.

### 2. GitHub va source code auditi

#### 10. GitHub repository strukturasi tartibli va tushunarli tashkil etilganmi?

- **Natija:** ✅ **Ha** (2 ball)
- **Texnik dalil:** GitHub repository: `https://github.com/sorauz/web_sora_uz.git`. Katalog tuzilmasi standart Next.js loyihalariga to'liq mos keladi.
- **Tahlil va izoh:** Loyihaning ildiz qismida keraksiz yoki chalkash fayllar yo'q, asosiy konfiguratsiyalar (`package.json`, `tsconfig.json`, `next.config.mjs`) o'z o'rnida joylashtirilgan.
- **Amaliy tavsiya:** README.md faylini kengaytirib, loyihani mahalliy o'rnatish va muhit o'zgaruvchilarini yoqish qo'llanmasini to'ldirish.

#### 11. main yoki production branch faqat tekshirilgan kodlarni qabul qiladimi?

- **Natija:** ❌ **Yo‘q** (0 ball)
- **Texnik dalil:** GitHub API tekshiruvi: `sorauz/web_sora_uz` da `main` branchi himoyalanmagan (`protected: false`). Commitlar to'g'ridan-to'g'ri `main` ga push qilinmoqda.
- **Tahlil va izoh:** Production branchiga to'g'ridan-to'g'ri push qilish imkoniyati mavjud. Hech qanday kod tekshiruvi (code review) yoki avtomatlashtirilgan test filtrlari o'rnatilmagan.
- **Amaliy tavsiya:** GitHub repository sozlamalarida `main` branchi uchun Branch Protection qoidalarini yoqish va to'g'ridan-to'g'ri push qilishni taqiqlash.

#### 12. Muhim branchlarda Branch Protection sozlamalari mavjudmi?

- **Natija:** ❌ **Yo‘q** (0 ball)
- **Texnik dalil:** GitHub API orqali tekshirildi: `GET /repos/sorauz/web_sora_uz/branches/main/protection` -> HTTP 404 Not Found ('Branch not protected').
- **Tahlil va izoh:** `main` yoki production branchda hech qanday Branch Protection sozlamalari mavjud emas. Bu holat xato yoki sinovdan o'tmagan kodning tasodifan productionga chiqib ketish xavfini oshiradi.
- **Amaliy tavsiya:** GitHub Settings -> Branches -> Add branch ruleset orqali `main` branchiga protection yoqish.

#### 13. Production kodiga o‘zgarishlar Pull Request orqali kiritiladimi?

- **Natija:** ❌ **Yo‘q** (0 ball)
- **Texnik dalil:** GitHub API: `GET /repos/sorauz/web_sora_uz/pulls?state=all` -> 0 ta Pull Request. Barcha 127 ta commit to'g'ridan-to'g'ri `main` ga push qilingan.
- **Tahlil va izoh:** O'zgarishlar kiritishda Pull Request (PR) mexanizmi qo'llanilmagan. Hamma ishlar yagona `main` branchida to'g'ridan-to'g'ri bajarilgan.
- **Amaliy tavsiya:** Har qanday yangi funksiya yoki tuzatish uchun alohida feature-branch ochish va faqat PR orqali tekshirib birlashtirish (merge) qoidasini joriy etish.

#### 14. Pull Request birlashtirilishidan oldin build va testlar muvaffaqiyatli bajarilishi talab qilinadimi?

- **Natija:** ❌ **Yo‘q** (0 ball)
- **Texnik dalil:** Branch protection yo'q va CI holati sozlanmaganligi sababli birlashtirishdan oldin build/test talabi mavjud emas.
- **Tahlil va izoh:** Kod qo'shilishidan oldin avtomatik build (`next build`) yoki testlar (`playwright test`) muvaffaqiyatli o'tishini majburiy talab qiluvchi cheklov mavjud emas.
- **Amaliy tavsiya:** GitHub Branch Protection ichida 'Require status checks to pass before merging' parametrini faollashtirish.

#### 15. GitHub Actions orqali avtomatik tekshiruvlar (CI) yo‘lga qo‘yilganmi?

- **Natija:** ❌ **Yo‘q** (0 ball)
- **Texnik dalil:** Repositoryda `.github/workflows` katalogi mavjud emas (`workflows: 0`).
- **Tahlil va izoh:** Avtomatlashtirilgan CI (Continuous Integration) pipeline yo'lga qo'yilmagan. Kod push qilinganda avtomatik TypeScript tekshiruvi, ESLint va unit/E2E testlar bajarilmaydi.
- **Amaliy tavsiya:** `.github/workflows/ci.yml` faylini yaratib, har bir push va PR da `npm run lint`, `tsc --noEmit` va `npm test` buyruqlarini avtomatik ishga tushirish.

#### 16. Kod sifati ESLint, TypeScript va boshqa zarur statik tekshiruvlar bilan nazorat qilinadimi?

- **Natija:** ⚠️ **Qisman** (1 ball)
- **Texnik dalil:** `npm run lint` mavjud, lekin 48 ta xato va 34 ta ogohlantirish bor. Pre-commit hooks (Husky / lint-staged) o'rnatilmagan.
- **Tahlil va izoh:** Statik tekshiruv vositalari (TypeScript, ESLint) loyihada mavjud va `tsc` xatosiz o'tadi, biroq ular commit qilish jarayoniga avtomatik bog'lanmagan. Natijada xatolar kod bazasida to'planib borgan.
- **Amaliy tavsiya:** Husky va lint-staged paketlarini o'rnatib, commitdan oldin avtomatik lint tekshiruvini yo'lga qo'yish.

#### 17. package.json va lock fayllari bir-biriga mosmi?

- **Natija:** ✅ **Ha** (2 ball)
- **Texnik dalil:** `package.json` va `package-lock.json` to'liq sinxron holatda. `npm ls` orqali tekshirilganda dependency conflict yoki missing paketlar aniqlanmadi.
- **Tahlil va izoh:** Barcha paketlar versiyalari lock fayli orqali qat'iy mahkamlangan. Bu turli muhitlarda (local, Vercel) bir xil kutubxonalar o'rnatilishini kafolatlaydi.
- **Amaliy tavsiya:** Paketlar o'rnatishda faqat `npm ci` yoki standart `npm install` dan foydalanish qoidasini davom ettirish.

#### 18. Ishlatilayotgan npm paketlari yangilanib turadimi?

- **Natija:** ✅ **Ha** (2 ball)
- **Texnik dalil:** `package.json`: Next.js 16.3.7, React 19.2.0, Tailwind CSS v4, Lucide-react 1.16.0 eng so'nggi barqaror versiyalarda ishlamoqda.
- **Tahlil va izoh:** Kutubxonalar muntazam yangilanib boriladi. Dasturiy ta'minotning eng zamonaviy imkoniyatlaridan (React 19 Server Actions, Tailwind v4 engine) foydalanilmoqda.
- **Amaliy tavsiya:** Kutubxonalarni yangilashda semantic versioning qoidalariga rioya qilish va har yangilanishdan so'ng E2E testlarni ishga tushirish.

#### 19. Eskirgan yoki zaifligi aniqlangan dependency'lar nazorat qilinadimi?

- **Natija:** ⚠️ **Qisman** (1 ball)
- **Texnik dalil:** `npm audit` natijasi: 24 ta zaiflik aniqlangan (2 critical, 5 high). Asosan Next.js 16 va Zod 4 pre-release versiyalariga doir advisorylar.
- **Tahlil va izoh:** Zaifliklar muntazam tekshirib borilmaydi. Hozirgi kunda o'rnatilgan paketlar ichida kritik xavfsizlik ogohlantirishlari mavjud.
- **Amaliy tavsiya:** `npm audit fix` buyrug'ini xavfsiz paketlar uchun ishga tushirish va kritik paketlarni barqaror versiyalarga yangilash.

#### 20. .gitignore orqali maxfiy va vaqtinchalik fayllarning repository'ga tushishi cheklanganmi?

- **Natija:** ⚠️ **Qisman** (1 ball)
- **Texnik dalil:** `.gitignore` faylida `.env*`, `node_modules`, `.next` kiritilgan. Biroq `Loyixa_xujjatlari/` papkasi gitignore ga kiritilmagani sababli u yerdagi maxfiy kalitlar repoga tushgan.
- **Tahlil va izoh:** Standart `.gitignore` to'g'ri tuzilgan, lekin loyiha hujjatlari ichidagi parollar va maxfiy ma'lumotlar e'tibordan chetda qolgan.
- **Amaliy tavsiya:** `.gitignore` ga `*.secret.*`, `*password*`, `*.token` qoidalarini kiritish va hujjatlar ichidagi parollarni tozalash.

#### 21. GitHub repository'da API kalitlari, parollar yoki boshqa maxfiy ma’lumotlar mavjud emasmi?

- **Natija:** ❌ **Yo‘q** (0 ball)
- **Texnik dalil:** KRITIK XAVFSIZLIK LEAK: GitHub repository PUBLIC (`private: false`). `src/app/api/1c/test/route.ts` (5-6 qatorlar) va `src/lib/api/client.ts` (77-78 qatorlar) da 1C Basic Auth (`web_user:977540910`), `Loyixa_xujjatlari/Api/user_api/OTP/plan_sms_otp.md` da Eskiz SMS jonli maxfiy paroli ochiq commit qilingan!
- **Tahlil va izoh:** Ochiq repoda ishlab chiqarish tizimlarining to'liq kirish ma'lumotlari (1C ERP, Eskiz SMS) har qanday begona shaxs uchun ochiq ko'rinib turibdi. Bu o'ta jiddiy xavfsizlik buzilishidir.
- **Amaliy tavsiya:** ZUDLIK BILAN: 1) GitHub repodagi barcha parollarni yangilash (1C va Eskiz parolini o'zgartirish); 2) Barcha maxfiy kalitlarni koddan tozalab, faqat Vercel Environment Variables ga ko'chirish; 3) Repositoryni darhol Private qilish yoki git tarixidan parollarni BFG Repo-Cleaner orqali butunlay o'chirish.

#### 22. Production versiyasiga qaytish (rollback) uchun oldingi barqaror commit va deployment'lar saqlanganmi?

- **Natija:** ✅ **Ha** (2 ball)
- **Texnik dalil:** Git tarixi (127 ta commit) to'liq saqlangan. Vercel Dashboard da barcha o'tgan deploymentlar va ularning snapshotlari mavjud.
- **Tahlil va izoh:** Zaruriyat tug'ilganda Vercel Instant Rollback orqali bir necha soniyada avvalgi barqaror versiyaga qaytish imkoniyati to'liq mavjud.
- **Amaliy tavsiya:** Har bir yirik reliz oldidan Git da semantik taglar (`git tag v1.0.0`) qo'yish amaliyotini yo'lga qo'yish.

### 3. Xavfsizlik auditi — Security

#### 23. API kalitlari va maxfiy ma’lumotlar faqat server muhitida saqlanadimi?

- **Natija:** ⚠️ **Qisman** (1 ball)
- **Texnik dalil:** Vercel boshqaruv panelida environment variablelar mavjud, ammo bir qator maxfiy kalitlar (`ONEC_BASIC_AUTH`, `ESKIZ_SECRET_PASSWORD`, revalidation token) manba kodida fallback sifatida hardcode qilingan.
- **Tahlil va izoh:** Maxfiy ma'lumotlar qisman server muhitida saqlanadi, biroq zaxira (fallback) sifatida kod ichida qolib ketgan parollar xavfsizlikni zaiflashtiradi.
- **Amaliy tavsiya:** Kod ichidagi barcha fallback parollarni olib tashlash, faqat `process.env.VARIABLE` orqali olishni majburiy qilish.

#### 24. NEXT_PUBLIC_ prefiksli environment variable'larda maxfiy ma’lumotlar mavjud emasmi?

- **Natija:** ✅ **Ha** (2 ball)
- **Texnik dalil:** Kod bazasi skanerlandi: `NEXT_PUBLIC_` prefiksi bilan faqat ommaviy URL manzillar ishlatilgan (`NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_CDN_URL`, `NEXT_PUBLIC_FEED_BASE_URL`).
- **Tahlil va izoh:** Mijoz brauzeriga uzatiladigan ommaviy o'zgaruvchilarda hech qanday maxfiy API kaliti yoki parol mavjud emas.
- **Amaliy tavsiya:** Kelajakda ham `NEXT_PUBLIC_` prefiksi ostida faqat ommaviy konfiguratsiyalarni saqlash qoidasiga qat'iy rioya qilish.

#### 25. Production, Preview va Development muhitlari uchun alohida environment variable'lar ishlatiladimi?

- **Natija:** ✅ **Ha** (2 ball)
- **Texnik dalil:** Vercel Project Settings -> Environment Variables bo'limida Production, Preview va Development muhitlari uchun o'zgaruvchilarni alohida ajratish sozlangan.
- **Tahlil va izoh:** Test muhiti va jonli sayt muhiti parametrlari bir-biridan mustaqil boshqariladi.
- **Amaliy tavsiya:** Preview deploymentlar uchun alohida test 1C bazasi va test SMS shlyuzi kalitlarini ishlatish.

#### 26. Foydalanuvchi autentifikatsiyasi xavfsiz mexanizm orqali amalga oshiriladimi?

- **Natija:** ⚠️ **Qisman** (1 ball)
- **Texnik dalil:** Eskiz SMS orqali OTP mexanizmi to'g'ri tuzilgan (2 daqiqalik yashash muddati, 6 xonali tasodifiy kod, 3 ta urinish chegarasi). Biroq avtorizatsiya sessiyasi zaif.
- **Tahlil va izoh:** Foydalanuvchi telefonini tasdiqlash xavfsiz va to'g'ri yo'lga qo'yilgan, ammo tasdiqlashdan so'ng sessiyani saqlash qismida xatolikka yo'l qo'yilgan.
- **Amaliy tavsiya:** OTP tasdiqlangandan so'ng sessiya cookie'sini JWT (JSON Web Token) yoki HMAC SHA-256 imzosi bilan himoyalash.

#### 27. Sessiya va tokenlar xavfsiz saqlanadimi?

- **Natija:** ❌ **Yo‘q** (0 ball)
- **Texnik dalil:** KRITIK XAVFSIZLIK ZAIFLIGI: `src/app/api/auth/otp/verify/route.ts` da `sora_session` cookie'si shifrlanmagan va imzolanmagan oddiy JSON (`JSON.stringify(user)`). Jonli test: soxta `sora_session` cookie yuborilganda `https://sora.uz/api/auth/me` 200 OK authenticated: true qaytardi!
- **Tahlil va izoh:** Istalgan foydalanuvchi o'z brauzerida yoki curl orqali cookie qiymatini o'zgartirib, tizimdagi istalgan B2B kompaniya yoki mijoz nomidan kirish huquqini qo'lga kiritishi mumkin (Session Forgery / Account Takeover).
- **Amaliy tavsiya:** ZUDLIK BILAN: `iron-session`, `jose` yoki NextAuth kutubxonasi yordamida cookie'ni server tomonidagi maxfiy kalit (`SESSION_SECRET`) bilan shifrlash (AES-256) va raqamli imzolash.

#### 28. Cookie'larda HttpOnly, Secure va kerakli SameSite atributlari ishlatiladimi?

- **Natija:** ✅ **Ha** (2 ball)
- **Texnik dalil:** `src/app/api/auth/otp/verify/route.ts` da cookie parametrlari: `httpOnly: true`, `secure: process.env.NODE_ENV === 'production'`, `sameSite: 'lax'`, `path: '/'` to'liq belgilangan.
- **Tahlil va izoh:** Cookie parametrlari to'g'ri sozlangan, JavaScript orqali cookie o'g'irlanishining (XSS orqali) oldi olingan.
- **Amaliy tavsiya:** Cookie xavfsizlik parametrlarini saqlab qolgan holda uning qiymatini shifrlash.

#### 29. Foydalanuvchi huquqlari server tomonida tekshiriladimi?

- **Natija:** ⚠️ **Qisman** (1 ball)
- **Texnik dalil:** Server tomonida sessiya cookie tekshiriladi, ammo cookie imzolanmagani sababli huquqlar (B2B / B2C) mijoz tomonidan soxtalashtirilishi mumkin.
- **Tahlil va izoh:** Serverda tekshiruv kodi bor, biroq tekshirilayotgan ma'lumotning haqiqiyligi kafolatlanmagan.
- **Amaliy tavsiya:** Foydalanuvchi huquqlarini tekshirishda faqat serverda imzolangan token yoki 1C bilan tasdiqlangan ID dan foydalanish.

#### 30. Oddiy foydalanuvchi administrator funksiyalaridan foydalana olmaydimi?

- **Natija:** ✅ **Ha** (2 ball)
- **Texnik dalil:** Veb-sayt kodida hech qanday ma'muriy (admin) panel mavjud emas. Barcha tovarlar, narxlar va buyurtmalar faqat 1C ERP dasturiy ta'minoti orqali boshqariladi.
- **Tahlil va izoh:** Oddiy foydalanuvchi sayt orqali administrator funksiyalariga (narx o'zgartirish, mahsulot o'chirish) kira olmaydi, chunki bunday interfeys vebda mavjud emas.
- **Amaliy tavsiya:** Kelgusida admin panel kiritilsa, uni alohida subdomen va ikki faktorli autentifikatsiya (2FA) bilan himoyalash.

#### 31. API orqali kelayotgan barcha ma’lumotlar serverda validatsiya qilinadimi?

- **Natija:** ⚠️ **Qisman** (1 ball)
- **Texnik dalil:** OTP va qidiruvda Zod validatsiya qo'llangan. Biroq `/api/order/create` marshrutida buyurtmadagi mahsulot narxi (`price`) brauzerdan yuborilganicha qabul qilinadi.
- **Tahlil va izoh:** Buyurtma summasi va mahsulot narxi serverda 1C bazasidan qayta tekshirilmaydi. Xaker brauzer so'rovida narxni 1 so'm qilib yuborsa, buyurtma shu narxda qabul qilinishi xavfi bor (Price Tampering).
- **Amaliy tavsiya:** Buyurtma yaratilishidan oldin serverda har bir tovar narxini 1C /price API dan qayta hisoblash va mijoz yuborgan narx bilan solishtirish.

#### 32. SQL Injection va boshqa injection hujumlariga qarshi himoya mavjudmi?

- **Natija:** ✅ **Ha** (2 ball)
- **Texnik dalil:** Loyiha to'g'ridan-to'g'ri SQL bazasiga ulanmagan. Barcha ma'lumotlar 1C OData/REST API orqali parametrlashtirilgan URL lar bilan so'raladi.
- **Tahlil va izoh:** Klassik SQL Injection xavfi mavjud emas, chunki relatsion SQL so'rovlar yozilmaydi.
- **Amaliy tavsiya:** 1C OData so'rov parametrlarida maxsus belgilarni (`$filter` injection) tozalashni davom ettirish.

#### 33. XSS hujumlarining oldini olish choralari mavjudmi?

- **Natija:** ✅ **Ha** (2 ball)
- **Texnik dalil:** React 19 barcha dinamik o'zgaruvchilarni avtomatik escape qiladi. `dangerouslySetInnerHTML` faqat qat'iy nazoratdagi JSON-LD Schema skriptlarida ishlatilgan.
- **Tahlil va izoh:** XSS (Cross-Site Scripting) hujumlariga qarshi zamonaviy React mexanizmlari to'liq ishlamoqda, foydalanuvchi kiritgan matnlar xavfsiz render qilinadi.
- **Amaliy tavsiya:** Hech qachon foydalanuvchi kiritgan ma'lumotlarni `dangerouslySetInnerHTML` orqali chiqarmaslik.

#### 34. CSRF xavfi baholangan va kerakli himoya qo‘llanganmi?

- **Natija:** ✅ **Ha** (2 ball)
- **Texnik dalil:** Autentifikatsiya cookie'larida `sameSite: 'lax'` o'rnatilgan. Barcha o'zgartiruvchi amallar POST so'rovi va Next.js Server Actions orqali bajariladi.
- **Tahlil va izoh:** Kross-sayt so'rovlarini soxtalashtirish (CSRF) xavfi minimal darajaga tushirilgan.
- **Amaliy tavsiya:** Kelajakda tashqi API mijozlari uchun CSRF token tekshiruvini qo'shimcha joriy qilish.

#### 35. API endpoint'lariga so‘rovlar sonini cheklash (Rate Limiting) mavjudmi?

- **Natija:** ⚠️ **Qisman** (1 ball)
- **Texnik dalil:** Faqat `/api/auth/otp/send` da IP va telefon bo'yicha in-memory rate limiter mavjud (1 daqiqada 1 SMS). Boshqa API endpointlarida (qidiruv, order, revalidate) rate limit yo'q.
- **Tahlil va izoh:** SMS yuborish abuse holatidan himoyalangan, ammo qidiruv va buyurtma endpointlariga cheksiz so'rov yuborish (DDoS yoki bot spam) imkoniyati ochiq.
- **Amaliy tavsiya:** Cloudflare WAF qoidalari yoki `@upstash/ratelimit` (Redis) orqali barcha ommaviy API marshrutlariga so'rovlar chegarasini belgilash.

#### 36. Login, ro‘yxatdan o‘tish, qidiruv va sharh yuborish kabi endpoint'lar abuse holatlaridan himoyalanganmi?

- **Natija:** ⚠️ **Qisman** (1 ball)
- **Texnik dalil:** SMS OTP limitlangan, ammo `/api/search` va `/api/order/create` da botlarga qarshi Captcha yoki Cloudflare Turnstile o'rnatilmagan.
- **Tahlil va izoh:** Avtomatlashtirilgan botlar qidiruv tizimini ortiqcha yuklashi yoki soxta buyurtmalar yuborishi mumkin.
- **Amaliy tavsiya:** Buyurtma berish va qidiruv shakllariga ko'rinmas Cloudflare Turnstile bot-himoyasini integratsiya qilish.

#### 37. CORS faqat kerakli domenlarga ruxsat beradigan tarzda sozlanganmi?

- **Natija:** ✅ **Ha** (2 ball)
- **Texnik dalil:** Ichki API larda Wildcard `*` ruxsati yo'q, faqat sayt domeniga xizmat ko'rsatiladi. Cloudflare R2 media domenida `Vary: Origin` o'rnatilgan.
- **Tahlil va izoh:** CORS siyosati xavfsiz sozlangan, begona veb-saytlar brauzer orqali ichki API lardan ma'lumot o'g'irlay olmaydi.
- **Amaliy tavsiya:** CORS sozlamalarini hozirgi holatida qat'iy saqlash.

#### 38. Saytda HTTPS majburiy ishlatiladimi?

- **Natija:** ✅ **Ha** (2 ball)
- **Texnik dalil:** Jonli tarmoq tekshiruvi: `http://sora.uz` so'rovi zudlik bilan `HTTP 308 Permanent Redirect` bilan `https://sora.uz` ga yo'naltiriladi.
- **Tahlil va izoh:** Barcha foydalanuvchilar va botlar uchun HTTPS protokoli majburiy qo'llaniladi.
- **Amaliy tavsiya:** Cloudflare da 'Always Use HTTPS' va 'Automatic HTTPS Rewrites' sozlamalarini doimiy faol saqlash.

#### 39. Security Headers, jumladan CSP va HSTS kerakli darajada sozlanganmi?

- **Natija:** ⚠️ **Qisman** (1 ball)
- **Texnik dalil:** `Strict-Transport-Security` (HSTS) mavjud (`max-age=63072000`). Biroq `Content-Security-Policy`, `X-Frame-Options`, `X-Content-Type-Options` sarlavhalari server javobida yo'q.
- **Tahlil va izoh:** Sayt clickjacking va MIME-sniffing kabi hujumlarga qarshi asosiy xavfsizlik sarlavhalarini qaytarmaydi.
- **Amaliy tavsiya:** `next.config.mjs` da `headers()` funksiyasi orqali `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin` va CSP sarlavhalarini qo'shish.

#### 40. Xatolik javoblarida serverning ichki ma’lumotlari, tokenlari yoki stack trace foydalanuvchiga ko‘rsatilmaydimi?

- **Natija:** ⚠️ **Qisman** (1 ball)
- **Texnik dalil:** Asosiy API lar toza JSON xato xabari qaytaradi, biroq `https://sora.uz/api/1c/test` endpointi ommaga ochiq bo'lib, 1C serverining ichki IP manzili, porti va holatini ko'rsatmoqda.
- **Tahlil va izoh:** Production tizimida test marshrutining ochiq qolishi tajovuzkorlarga ichki ERP arxitekturasi haqida qimmatli ma'lumot beradi.
- **Amaliy tavsiya:** `/api/1c/test` endpointini butunlay o'chirish yoki faqat maxfiy `CRON_SECRET` orqali kirishga ruxsat berish.

#### 41. Foydalanuvchilarning shaxsiy ma’lumotlari ruxsatsiz ko‘rish va o‘zgartirishdan himoyalanganmi?

- **Natija:** ⚠️ **Qisman** (1 ball)
- **Texnik dalil:** Foydalanuvchi parollari saytda saqlanmaydi (faqat OTP). Biroq `sora_session` imzolanmagani sababli begona mijozning buyurtmalar tarixi va ma'lumotlarini ko'rish xavfi mavjud.
- **Tahlil va izoh:** Shaxsiy ma'lumotlar xavfsizligi autentifikatsiya sessiyasining mustahkamligiga to'g'ridan-to'g'ri bog'liq.
- **Amaliy tavsiya:** Sessiya xavfsizligini JWT/HMAC orqali mustahkamlash orqali shaxsiy ma'lumotlar himoyasini to'liq ta'minlash.

### 4. Vercel va deployment auditi

#### 42. GitHub repository Vercel bilan to‘g‘ri bog‘langanmi?

- **Natija:** ✅ **Ha** (2 ball)
- **Texnik dalil:** Vercel GitHub App integratsiyasi orqali `sorauz/web_sora_uz` repozitoriyasiga to'g'ri ulangan.
- **Tahlil va izoh:** Kod o'zgarishlari Vercel tomonidan avtomatik aniqlanadi va deployment jarayoni boshlanadi.
- **Amaliy tavsiya:** Integratsiyani shu tartibda saqlash.

#### 43. Production branch to‘g‘ri belgilanganmi?

- **Natija:** ✅ **Ha** (2 ball)
- **Texnik dalil:** Vercel Project Settings da Production Branch sifatida `main` tanlangan.
- **Tahlil va izoh:** Production muhiti to'g'ri branchga bog'langan.
- **Amaliy tavsiya:** Production branch o'zgarmasligini ta'minlash.

#### 44. Har bir yangi commit uchun Preview Deployment avtomatik yaratiladimi?

- **Natija:** ✅ **Ha** (2 ball)
- **Texnik dalil:** Vercel da har bir yangi branch yoki commit uchun alohida Preview URL generatsiya qilinadi.
- **Tahlil va izoh:** O'zgarishlarni jonli saytga chiqarmasdan oldin preview muhitida sinab ko'rish imkoniyati mavjud.
- **Amaliy tavsiya:** Barcha jamoa a'zolari yangi xususiyatlarni avval Preview da tekshirishini odatga aylantirish.

#### 45. Production va Preview Deployment'lar uchun alohida environment variable'lar ishlatiladimi?

- **Natija:** ✅ **Ha** (2 ball)
- **Texnik dalil:** Vercel boshqaruv panelida muhit o'zgaruvchilari (Production, Preview, Development) alohida belgilanadi.
- **Tahlil va izoh:** Muhitlar bo'yicha parametrlarni mustaqil boshqarish imkoniyati to'liq mavjud.
- **Amaliy tavsiya:** Preview muhiti uchun alohida sandbox API kalitlarini kiritish.

#### 46. Preview Deployment'lar qidiruv tizimlari tomonidan indekslanishdan himoyalanganmi?

- **Natija:** ⚠️ **Qisman** (1 ball)
- **Texnik dalil:** Vercel preview URL lari himoyalangan, biroq standart `websorauz.vercel.app` domeni HTTP 200 OK qaytarmoqda va unda `X-Robots-Tag: noindex` yo'q.
- **Tahlil va izoh:** Qidiruv botlari asosiy domen `sora.uz` o'rniga `websorauz.vercel.app` ni indekslab, dublikat kontent hosil qilishi mumkin.
- **Amaliy tavsiya:** Vercel Project Settings -> Domains bo'limida `websorauz.vercel.app` domenini `sora.uz` ga 301 Redirect qilish yoki middleware da `X-Robots-Tag: noindex` qo'yish.

#### 47. Production domeni HTTPS orqali ishlaydimi?

- **Natija:** ✅ **Ha** (2 ball)
- **Texnik dalil:** `https://sora.uz` domeni Cloudflare Universal SSL va Vercel SSL sertifikatlari bilan to'liq himoyalangan.
- **Tahlil va izoh:** Foydalanuvchi va server o'rtasidagi ma'lumotlar oqimi to'liq TLS 1.3 shifrlangan.
- **Amaliy tavsiya:** SSL sertifikatlari muddatini avtomatik uzaytirish holatida saqlash.

#### 48. DNS va domen sozlamalari to‘g‘ri ishlayaptimi?

- **Natija:** ✅ **Ha** (2 ball)
- **Texnik dalil:** DNS tekshiruvi: Cloudflare Anycast A yozuvlari (`172.67.212.60`, `104.21.53.114`) va IPv6 to'liq ishlamoqda. `www.sora.uz` apex `sora.uz` ga 308 bilan yo'naltiriladi.
- **Tahlil va izoh:** DNS va marshrutlash konfiguratsiyasi benuqson sozlangan.
- **Amaliy tavsiya:** DNS yozuvlariga muntazam o'zgartirish kiritmaslik.

#### 49. Production build vaqtida TypeScript va boshqa zarur tekshiruvlar bajariladimi?

- **Natija:** ✅ **Ha** (2 ball)
- **Texnik dalil:** Vercel deployment vaqtida `next build` buyrug'i `tsc --noEmit` tekshiruvini majburiy o'tkazadi (loyiha 0 xato bilan o'tadi).
- **Tahlil va izoh:** TypeScript tip xatolari mavjud bo'lgan kod productionga chiqmaydi.
- **Amaliy tavsiya:** `next.config.mjs` da `ignoreBuildErrors: true` parametrini HECH QACHON yoqmaslik.

#### 50. Build xatolari production deployment'ni to‘xtatadimi?

- **Natija:** ✅ **Ha** (2 ball)
- **Texnik dalil:** Vercel da build bosqichida xatolik yuz bersa, deployment darhol to'xtatiladi va jonli sayt avvalgi barqaror versiyada ishlashda davom etadi.
- **Tahlil va izoh:** Xatoli versiya productionga chiqib ketishi tizim tomonidan avtomatik bloklangan.
- **Amaliy tavsiya:** Build jarayoniga qo'shimcha testlarni (lint va unit test) qo'shish.

#### 51. Serverless Functions bajarilish vaqti va resurs cheklovlari loyihaga mosmi?

- **Natija:** ✅ **Ha** (2 ball)
- **Texnik dalil:** Vercel Serverless Function timeout chegarasi 15-60 soniya. 1C so'rovlari 5-10 soniya timeout bilan cheklangan.
- **Tahlil va izoh:** Serverless funksiyalar resurs va vaqt chegaralariga to'liq sig'adi, xotira yoki vaqt tugashi bilan bog'liq xatolar yo'q.
- **Amaliy tavsiya:** 1C so'rovlari sekinlashganda funksiyaning xotira limitini 1024 MB gacha oshirish imkoniyatini yodda tutish.

#### 52. API so‘rovlari uchun Vercel Function region'i backend yoki ma’lumotlar manbasiga mos tanlanganmi?

- **Natija:** ⚠️ **Qisman** (1 ball)
- **Texnik dalil:** Vercel Serverless Functions Frankfurt (`fra1`) mintaqasida joylashgan. 1C ERP serveri esa Toshkentda (`1cloud.uz`).
- **Tahlil va izoh:** Serverless funksiya va 1C o'rtasida 60-80ms tarmoq kechikishi (network latency) mavjud. Bu API so'rovlarining umumiy vaqtini biroz uzaytiradi.
- **Amaliy tavsiya:** Next.js Data Cache (revalidate: 60) orqali 1C ga to'g'ridan-to'g'ri so'rovlar sonini minimallashtirish.

#### 53. Server va Edge Runtime'lar kerakli joylarda to‘g‘ri tanlanganmi?

- **Natija:** ✅ **Ha** (2 ball)
- **Texnik dalil:** Dinamik API marshrutlari va Server Components Node.js runtime da, statik sahifalar va fayllar Edge tarmog'ida to'g'ri sozlangan.
- **Tahlil va izoh:** Serverless va Edge vazifalari to'g'ri tanlangan, ziddiyatlar mavjud emas.
- **Amaliy tavsiya:** Og'ir kriptografik yoki fayl bilan ishlash modullarini faqat Node.js runtime da saqlash.

#### 54. Vercel loglari orqali API xatolari va serverdagi muammolarni aniqlash mumkinmi?

- **Natija:** ✅ **Ha** (2 ball)
- **Texnik dalil:** Vercel Runtime Logs barcha `console.error`, 5xx xatoliklar va funksiya bajarilish vaqtlarini real vaqtda qayd etadi.
- **Tahlil va izoh:** Serverdagi xatoliklarni aniqlash va tahlil qilish uchun Vercel log vositalari to'liq yetarli.
- **Amaliy tavsiya:** Vercel loglarini doimiy monitoring qilish yoki tashqi log agregatoriga (Logflare/Axiom) ulash.

#### 55. Muvaffaqiyatsiz deployment'dan oldingi barqaror versiyaga tez qaytish mumkinmi?

- **Natija:** ✅ **Ha** (2 ball)
- **Texnik dalil:** Vercel Dashboard dagi 'Instant Rollback' imkoniyati mavjud bo'lib, avvalgi deployment snapshotiga 1 marta bosishda qaytish mumkin.
- **Tahlil va izoh:** Avariya holatlarida zudlik bilan oldingi ishchi versiyani tiklash kafolatlangan.
- **Amaliy tavsiya:** Jamoa a'zolariga Rollback qilish tartibini tushuntirib qo'yish.

### 5. Cloudflare R2 — fayllar va rasmlar auditi

#### 56. Mahsulot rasmlari va boshqa media fayllar Cloudflare R2'da tartibli saqlanadimi?

- **Natija:** ✅ **Ha** (2 ball)
- **Texnik dalil:** Barcha mahsulot rasmlari Cloudflare R2 dagi `products/` papkasida saqlanmoqda va `https://cdn.sora.uz/products/` orqali tarqatilmoqda.
- **Tahlil va izoh:** Media fayllar serverdan alohida, maxsus bulutli object storage (R2) da tartibli joylashtirilgan.
- **Amaliy tavsiya:** Mahsulotlardan tashqari banner va brend logolari uchun ham `banners/` va `brands/` papkalarini R2 da doimiy yuritish.

#### 57. R2 ichidagi fayllar uchun katalog yoki object key nomlash standartlari mavjudmi?

- **Natija:** ✅ **Ha** (2 ball)
- **Texnik dalil:** Fayl nomlari qat'iy standart asosida tuzilgan: `products/{kod}_{tartib_raqami}.jpg` (masalan, `00-00000305_1.jpg`).
- **Tahlil va izoh:** Nomlash standarti 1C nomenklatura kodi bilan bevosita bog'langan bo'lib, rasmlarni avtomatik topish va yuklashni osonlashtiradi.
- **Amaliy tavsiya:** Standartni o'zgarishsiz saqlab qolish.

#### 58. Bir xil mahsulot rasmi takroran yuklanishining oldini olish mexanizmi mavjudmi?

- **Natija:** ⚠️ **Qisman** (1 ball)
- **Texnik dalil:** Katalog tahlili: 52 ta rasm fayli 158 ta mahsulotga biriktirilgan. Bitta mahsulot uchun takrorlanmaydi, ammo bir xil rasm turli nomlar bilan R2 ga yuklangan holatlar mavjud.
- **Tahlil va izoh:** R2 da bir xil vizual kontentning ortiqcha nusxalari (storage waste) paydo bo'lishining oldini oluvchi hash-asosidagi tekshiruv mavjud emas.
- **Amaliy tavsiya:** Yuklashdan oldin rasmning MD5/SHA-256 hashini tekshirib, mavjud rasmga havola berish mexanizmini joriy qilish.

#### 59. Fayllar uchun to‘g‘ri MIME type va Content-Type belgilanadimi?

- **Natija:** ✅ **Ha** (2 ball)
- **Texnik dalil:** Jonli HTTP so'rovi: `curl -I https://cdn.sora.uz/products/00-00000305_1.jpg` -> `Content-Type: image/jpeg` to'g'ri qaytmoqda.
- **Tahlil va izoh:** R2 object metadata to'g'ri sozlangan, brauzerlar rasmni rasm sifatida xatosiz taniy oladi.
- **Amaliy tavsiya:** MIME type sozlamalarini avtomatik saqlash.

#### 60. Rasmlarning haqiqiy formati va fayl hajmi yuklash vaqtida tekshiriladimi?

- **Natija:** ⚠️ **Qisman** (1 ball)
- **Texnik dalil:** 1C dan yuklash skriptlarida fayl kengaytmasi (.jpg) tekshiriladi, biroq rasmning haqiqiy binary magic bytes formati va maksimal hajmi qat'iy tekshirilmaydi.
- **Tahlil va izoh:** Soxta formatdagi yoki o'ta yirik (masalan, 15 MB) fayl yuklanishi ehtimoli nazariy jihatdan mavjud.
- **Amaliy tavsiya:** Sinxronizatsiya skriptida `sharp` yoki `image-size` kutubxonasi yordamida piksel o'lchami va fayl hajmini (max 2 MB) tekshirish.

#### 61. Foydalanuvchi yuklaydigan fayllar zararli yoki ruxsat etilmagan formatlardan tekshiriladimi?

- **Natija:** ✅ **Ha** (2 ball)
- **Texnik dalil:** Veb-sayt interfeysida oddiy foydalanuvchilar yoki mijozlar uchun fayl yuklash (upload) funksiyasi umuman mavjud emas.
- **Tahlil va izoh:** Tashqaridan zararli skriptlar (webshell, virus) yuklanishi xavfi 100% istisno qilingan.
- **Amaliy tavsiya:** Kelgusida sharhlarga rasm yuklash kiritilsa, alohida karantin bucket va antivirus tekshiruvi qo'yish.

#### 62. R2'ga fayl yuklash jarayoni maxfiy API kalitlarini frontend'ga chiqarmasdan amalga oshiriladimi?

- **Natija:** ✅ **Ha** (2 ball)
- **Texnik dalil:** R2 S3-kompatibil API kalitlari (`R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`) faqat server muhitida saqlanadi, mijoz kodiga chiqmaydi.
- **Tahlil va izoh:** R2 boshqaruv kalitlarining brauzerga sizib chiqishi kuzatilmadi.
- **Amaliy tavsiya:** R2 kalitlarini minimal ruxsatlar bilan (faqat Put/Get, bucket delete huquqisiz) cheklash.

#### 63. Fayl yuklash uchun kerak bo‘lganda vaqtinchalik, cheklangan muddatli Signed URL ishlatiladimi?

- **Natija:** ❌ **Yo‘q** (0 ball)
- **Texnik dalil:** Saytda dinamik fayl yuklash talab qilinmagani sababli Signed URL (presigned upload URL) mexanizmi joriy etilmagan.
- **Tahlil va izoh:** Hozirgi biznes mantiqida bunga ehtiyoj bo'lmagani sababli mexanizm mavjud emas.
- **Amaliy tavsiya:** Mijozlar tomonidan fayl yuklash funksiyasi qo'shilganda S3 Presigned URL lardan foydalanish.

#### 64. R2 bucket ichida ommaviy ko‘rinishi mumkin bo‘lmagan fayllar himoyalanganmi?

- **Natija:** ✅ **Ha** (2 ball)
- **Texnik dalil:** Jonli HTTP tekshiruvi: `https://cdn.sora.uz/` va `https://cdn.sora.uz/products/` so'rovlari `HTTP 404 Not Found` qaytaradi. Directory listing butunlay yopiq.
- **Tahlil va izoh:** Begona shaxslar bucket ichidagi barcha fayllar ro'yxatini ko'ra olmaydi, faqat to'liq URL manzili ma'lum bo'lgan fayllargina ochiladi.
- **Amaliy tavsiya:** Directory listing yopiqligini doimiy nazoratda ushlab turish.

#### 65. Public media fayllar uchun alohida domen yoki custom domain sozlanganmi?

- **Natija:** ✅ **Ha** (2 ball)
- **Texnik dalil:** Media fayllar uchun maxsus `cdn.sora.uz` subdomeni Cloudflare orqali bog'langan va SSL sertifikati bilan ta'minlangan.
- **Tahlil va izoh:** Fayllar to'g'ridan-to'g'ri R2 generic URL orqali emas, o'z brendiga xos CDN domeni orqali tarqatilmoqda.
- **Amaliy tavsiya:** Subdomen kesh sozlamalarini Cloudflare Page Rules orqali optimallashtirish.

#### 66. R2 CORS siyosati faqat kerakli domenlarga ruxsat beradimi?

- **Natija:** ✅ **Ha** (2 ball)
- **Texnik dalil:** Jonli testda `cdn.sora.uz` javobida `Vary: Origin` mavjud, umumiy ommaviy ruxsat cheklangan.
- **Tahlil va izoh:** CORS sozlamalari media fayllarni xavfsiz uzatishga mos sozlangan.
- **Amaliy tavsiya:** CORS qoidalarini faqat `sora.uz` va `*.sora.uz` ga cheklab qo'yish.

#### 67. Fayllar uchun Cache-Control va boshqa HTTP cache header'lari to‘g‘ri belgilanganmi?

- **Natija:** ✅ **Ha** (2 ball)
- **Texnik dalil:** HTTP javob sarlavhasi: `cache-control: public, max-age=31536000, immutable`, Cloudflare `cf-cache-status: HIT`.
- **Tahlil va izoh:** Rasmlar foydalanuvchi brauzerida va CDN tugunlarida 1 yil davomida samarali keshlanadi, bu esa ortiqcha trafik va server yukini bartaraf etadi.
- **Amaliy tavsiya:** Kesh sarlavhasini shu holatda saqlash.

#### 68. Eski rasm yangilanganda CDN'da eski versiya uzoq vaqt ko‘rinib qolmasligi ta’minlanganmi?

- **Natija:** ⚠️ **Qisman** (1 ball)
- **Texnik dalil:** Fayl nomlarida versiyalash (content hash) yo'q (`kod_1.jpg`). Rasm yangilanganda URL o'zgarmasdan qoladi.
- **Tahlil va izoh:** 1 yil muddatga berilgan kesh sababli, agar mahsulot rasmi o'zgarsa, mijozlar eski rasmni ko'rishda davom etishi mumkin. Keshni tozalash uchun Cloudflare API orqali Purge talab qilinadi.
- **Amaliy tavsiya:** Rasm yangilanganda Cloudflare API orqali avtomatik kesh tozalash webhookini joriy etish yoki URL ga `?v=timestamp` qo'shish.

#### 69. Next.js Image Optimization R2'dan keladigan rasmlar bilan to‘g‘ri ishlaydimi?

- **Natija:** ✅ **Ha** (2 ball)
- **Texnik dalil:** `next.config.mjs` faylida `cdn.sora.uz` remotePatterns ga kiritilgan. Next.js `/_next/image` endpointi R2 dan keluvchi rasmlarni muvaffaqiyatli qayta ishlamoqda.
- **Tahlil va izoh:** Next.js va Cloudflare R2 o'rtasidagi tasvirni qayta ishlash integratsiyasi to'g'ri yo'lga qo'yilgan.
- **Amaliy tavsiya:** Ruxsat etilmagan domenlardan rasm yuklash taqiqlanganini doimiy nazorat qilish.

#### 70. Rasmlar kerakli o‘lcham va formatlarda (masalan, WebP yoki AVIF) yetkazib beriladimi?

- **Natija:** ✅ **Ha** (2 ball)
- **Texnik dalil:** Jonli test: 87.1 KB bo'lgan JPEG rasm Next.js Image Optimizer orqali brauzerga 5.8 KB bo'lgan zamonaviy `image/avif` formatida yetkazilmoqda (hajm 94% ga qisqargan).
- **Tahlil va izoh:** Zamonaviy AVIF va WebP formatlari orqali foydalanuvchi trafiki va yuklanish vaqti maksimal tejalmoqda.
- **Amaliy tavsiya:** `next.config.mjs` da `formats: ['image/avif', 'image/webp']` sozlamasini saqlash.

#### 71. Katta hajmdagi rasmlar mobil qurilmalarda ortiqcha trafik sarflamayaptimi?

- **Natija:** ✅ **Ha** (2 ball)
- **Texnik dalil:** Next.js Image komponentida `sizes='(max-width: 768px) 100vw, 50vw'` va `srcset` to'g'ri sozlangan.
- **Tahlil va izoh:** Mobil qurilmalarga desktop uchun mo'ljallangan yirik rasmlar yuklanmaydi, faqat ekran o'lchamiga mos kichik rasmlar beriladi.
- **Amaliy tavsiya:** Yangi qo'shiladigan barcha komponentlarda `sizes` atributini aniq ko'rsatish.

#### 72. R2'dagi muhim fayllar uchun zaxira nusxa yoki tiklash strategiyasi mavjudmi?

- **Natija:** ✅ **Ha** (2 ball)
- **Texnik dalil:** Barcha tovar rasmlarining asl nusxalari Toshkentdagi 1C serverida va arxiv disklarida to'liq saqlanadi. R2 yo'qolgan taqdirda skript orqali to'liq qayta yuklash imkoniyati bor.
- **Tahlil va izoh:** Media fayllar uchun mustahkam zaxira manbasi mavjud.
- **Amaliy tavsiya:** R2 bucketlarining oylik snapshotlarini avtomatlashtirish.

### 6. Frontend va foydalanuvchi interfeysi — UI/UX

#### 73. Sayt mobil, planshet va desktop ekranlarida to‘g‘ri ko‘rinadimi?

- **Natija:** ✅ **Ha** (2 ball)
- **Texnik dalil:** Tailwind CSS moslashuvchan breakpointlari (`sm:`, `md:`, `lg:`, `xl:`) orqali mobil (360px), planshet (768px) va desktop (1440px) ekranlarida to'liq sinovdan o'tkazildi.
- **Tahlil va izoh:** Barcha asosiy qurilmalarda interfeys elementlari ekran kengligiga to'g'ri moslashadi, gorizontal skroll yoki matn buzilishi kuzatilmadi.
- **Amaliy tavsiya:** Kam uchraydigan o'ta kichik (320px) ekranlarda ham qo'shimcha testlar o'tkazish.

#### 74. Barcha sahifalarda responsive dizayn to‘liq ishlaydimi?

- **Natija:** ✅ **Ha** (2 ball)
- **Texnik dalil:** Mahsulot sahifasi, katalog, savat, checkout va aloqa sahifalarining barchasida responsive dizayn to'liq ishlaydi.
- **Tahlil va izoh:** Foydalanuvchi qaysi sahifada bo'lishidan qat'i nazar qulay interfeysdan foydalana oladi.
- **Amaliy tavsiya:** Mobil menyuning ochilib-yopilish animatsiyasini yanada silliqlashtirish.

#### 75. Header, navigatsiya va footer sahifalar bo‘ylab bir xil ishlaydimi?

- **Natija:** ✅ **Ha** (2 ball)
- **Texnik dalil:** `src/components/layout/Header.tsx` va `Footer.tsx` barcha sahifalarda yagona Root Layout orqali bir xil tartibda ishlaydi.
- **Tahlil va izoh:** Navigatsiya va pastki blok sahifalar o'rtasida izchil (consistent) taqdim etilgan.
- **Amaliy tavsiya:** Headerdagi savatcha hisoblagichini (badge) har doim real vaqtda yangilanadigan holatda ushlash.

#### 76. Katalog, kategoriya va mahsulot sahifalari uchun qulay navigatsiya mavjudmi?

- **Natija:** ✅ **Ha** (2 ball)
- **Texnik dalil:** Breadcrumb (non ushoqlari), ko'p bosqichli kategoriya daraxti, yon panel filtrlari va yuqori qidiruv paneli mavjud.
- **Tahlil va izoh:** Foydalanuvchi sayt bo'ylab qayerda turganini aniq biladi va 1 marta bosishda yuqori toifalarga qayta oladi.
- **Amaliy tavsiya:** Breadcrumb navigatsiyasini mobil ekranlarda ham to'liq ko'rinadigan qilib ixchamlashtirish.

#### 77. Foydalanuvchi kerakli mahsulotni ortiqcha bosqichlarsiz topa oladimi?

- **Natija:** ✅ **Ha** (2 ball)
- **Texnik dalil:** Jonli qidiruv dropdowni (`SearchDropdown.tsx`) va kategoriya katalogi orqali istalgan mahsulotga 2-3 marta bosish orqali yetib boriladi.
- **Tahlil va izoh:** Mahsulotni topish yo'li qisqa va qulay tuzilgan.
- **Amaliy tavsiya:** Qidiruv paneliga eng ko'p qidirilgan ommabop so'rovlar (tezkor takliflar) blokini qo'shish.

#### 78. Qidiruv tizimi foydalanuvchi xatosi yoki turli yozilish shakllarini hisobga oladimi?

- **Natija:** ⚠️ **Qisman** (1 ball)
- **Texnik dalil:** Qidiruv kodi tahlili: registrga sezgir emas va qisman so'z mosligini topadi, biroq imlo xatolarini to'g'rilash (fuzzy search) va morfolojik qidiruv yo'q.
- **Tahlil va izoh:** Foydalanuvchi so'zni bitta harf xato bilan yozsa (masalan 'svetocopy' o'rniga 'sveticopy'), qidiruv natija topa olmaydi.
- **Amaliy tavsiya:** Qidiruv tizimiga Fuse.js yoki PostgreSQL/Meilisearch asosidagi fuzzy qidiruv algoritmini integratsiya qilish.

#### 79. Filtrlash va saralash funksiyalari to‘g‘ri ishlaydimi?

- **Natija:** ✅ **Ha** (2 ball)
- **Texnik dalil:** `CatalogFilters.tsx` orqali narx bo'yicha (arzon/qimmat), mavjudlik, brendlar va alifbo bo'yicha saralash to'g'ri ishlaydi.
- **Tahlil va izoh:** Filtrlar URL query parametrlariga bog'langan va sahifa yangilanganda ham o'z holatini saqlab qoladi.
- **Amaliy tavsiya:** Filtrlar o'zgarganda sahifani to'liq qayta yuklamasdan faqat ro'yxatni silliq yangilash (Soft Navigation).

#### 80. Loading, Empty, Error va Success holatlari foydalanuvchiga tushunarli ko‘rsatiladimi?

- **Natija:** ✅ **Ha** (2 ball)
- **Texnik dalil:** Skeleton komponentlari (`ProductSkeleton.tsx`), bo'sh savatcha vizuali, xatolik toastlari va buyurtma tasdiq modallari to'liq mavjud.
- **Tahlil va izoh:** Foydalanuvchi tizimning har qanday holati (yuklanish, xato, muvaffaqiyat) haqida aniq vizual ma'lumot oladi.
- **Amaliy tavsiya:** Skeletonlar rangini saytning umumiy mavzusiga yanada moslashtirish.

#### 81. API sekin javob berganda sahifa yoki interfeys ishlamay qolmaydimi?

- **Natija:** ✅ **Ha** (2 ball)
- **Texnik dalil:** Asinxron so'rovlar fonda bajariladi, tugmalarda yuklanish holatlari (`isSubmitting`, spinner) ko'rsatiladi va foydalanuvchi interfeysi muzlab qolmaydi.
- **Tahlil va izoh:** Sekin internet yoki kechikuvchi API holatlarida ham UI o'z sezgirligini saqlab qoladi.
- **Amaliy tavsiya:** Sekin javob beruvchi so'rovlar uchun 5 soniyadan keyin 'Kutilmoqda...' deb qo'shimcha xabar chiqarish.

#### 82. Internet uzilganda foydalanuvchiga tushunarli xabar ko‘rsatiladimi?

- **Natija:** ⚠️ **Qisman** (1 ball)
- **Texnik dalil:** So'rov xatolarida Toast orqali 'Internet ulanishida xatolik' xabari chiqadi, biroq umumiy Offline PWA sahifasi yoki doimiy aloqa yo'qolgani bori banneri mavjud emas.
- **Tahlil va izoh:** Internet butunlay uzilib qolganda yangi sahifalarni ochishda brauzerning standart xato ekrani chiqadi.
- **Amaliy tavsiya:** Oddiy Service Worker va chiroyli offline sahifasini (`offline.html`) joriy qilish.

#### 83. Tugmalar, inputlar va navigatsiya elementlari klaviatura orqali boshqariladimi?

- **Natija:** ✅ **Ha** (2 ball)
- **Texnik dalil:** Barcha tugma va inputlar semantik HTML teglari bilan yozilgan, `Tab` va `Enter/Space` tugmalari orqali fokus va boshqaruv ishlaydi.
- **Tahlil va izoh:** Klaviatura orqali boshqaruv talablari qondirilgan.
- **Amaliy tavsiya:** Fokus ramkalarini (`focus-visible:ring`) dizayn bilan yanada uyg'unlashtirish.

#### 84. Rang kontrasti, shrift va element o‘lchamlari accessibility talablariga mosmi?

- **Natija:** ⚠️ **Qisman** (1 ball)
- **Texnik dalil:** Lighthouse Accessibility bahosi: 88/100. Ayrim kulrang yordamchi matnlarda va ikonkalarda kontrast nisbati 4.5:1 talabiga yetmaydi.
- **Tahlil va izoh:** Ko'rish qobiliyati zaif foydalanuvchilar uchun ayrim kichik matnlarni o'qish qiyin bo'lishi mumkin.
- **Amaliy tavsiya:** Barcha yordamchi matnlar rangini kamida `text-gray-600` yoki `text-gray-700` ga o'zgartirib, kontrastni oshirish.

### 7. Mahsulotlar va katalog tizimi

#### 85. Har bir mahsulotning yagona va o‘zgarmas identifikatori mavjudmi?

- **Natija:** ✅ **Ha** (2 ball)
- **Texnik dalil:** Har bir mahsulot 1C ERP dagi yagona nomenklatura kodi (`kod`, masalan `00-00000305`) bilan identifikatsiyalanadi. 1,760 ta mahsulot ichida 0 ta takroriy ID aniqlandi.
- **Tahlil va izoh:** Mahsulotlar identifikatori yagona, qat'iy va barqaror.
- **Amaliy tavsiya:** 1C kodi identifikator sifatida o'zgarmasligini saqlash.

#### 86. Mahsulot URL manzillari SEO uchun tushunarli slug asosida yaratilganmi?

- **Natija:** ✅ **Ha** (2 ball)
- **Texnik dalil:** URL manzillari transliteratsiya qilingan tushunarli slug asosida yaratilgan: `/uz/products/deli-33559-qora-ofis-seyfi`.
- **Tahlil va izoh:** Sluglar inson va qidiruv tizimlari uchun tushunarli, mahsulot brendi va modelini aks ettiradi.
- **Amaliy tavsiya:** Slug yaratishda maxsus belgilarni tozalash algoritmini saqlash.

#### 87. Mahsulot nomi, tavsifi, rasmi va texnik xususiyatlari to‘g‘ri ko‘rsatiladimi?

- **Natija:** ✅ **Ha** (2 ball)
- **Texnik dalil:** Mahsulot sahifasida nomi, batafsil tavsifi, fotosuratlari, o'lchov birligi, artikuli va texnik xususiyatlari to'liq ko'rsatiladi.
- **Tahlil va izoh:** Mahsulot kartochkasi to'liq va aniq ma'lumotlar bilan boyitilgan.
- **Amaliy tavsiya:** Texnik xususiyatlar jadvalini xaridorlar uchun yanada ixcham qilib taqdim etish.

#### 88. Mahsulot kategoriyalari va ichki kategoriyalar ierarxiyasi to‘g‘ri tashkil etilganmi?

- **Natija:** ✅ **Ha** (2 ball)
- **Texnik dalil:** Asosiy kategoriyalar va ichki toifalar (subcategories) ierarxik daraxt ko'rinishida `categories.ts` da tizimlashtirilgan.
- **Tahlil va izoh:** Kategoriya daraxti mantiqiy to'g'ri tashkil etilgan.
- **Amaliy tavsiya:** Yangi kategoriyalar qo'shilganda 1C toifalari bilan sinxronligini tekshirib borish.

#### 89. Mahsulotning asosiy va qo‘shimcha rasmlari to‘g‘ri bog‘langanmi?

- **Natija:** ✅ **Ha** (2 ball)
- **Texnik dalil:** Mahsulot galereyasi `_1`, `_2`, `_3` rasmlarini to'g'ri qabul qiladi va xatosiz almashtirib ko'rsatadi.
- **Tahlil va izoh:** Asosiy va qo'shimcha rasmlar o'zaro to'g'ri bog'langan.
- **Amaliy tavsiya:** Rasm yo'q bo'lgan mahsulotlar uchun sifatli SVG placeholder ko'rsatishni ta'minlash.

#### 90. Narxlar va mavjudlik ma’lumotlari ishonchli manbadan olinadimi?

- **Natija:** ✅ **Ha** (2 ball)
- **Texnik dalil:** Narxlar va ombor mavjudligi to'g'ridan-to'g'ri 1C ERP OData/REST servisidan real vaqtda olinadi.
- **Tahlil va izoh:** Saytdagi narxlar va qoldiqlar birlamchi hisob tizimi (1C) bilan to'liq mos.
- **Amaliy tavsiya:** 1C API dan olinadigan narxlar registrini muntazam tekshirib turish.

#### 91. Mahsulot narxi o‘zgarganda sayt yangilangan narxni to‘g‘ri ko‘rsatadimi?

- **Natija:** ✅ **Ha** (2 ball)
- **Texnik dalil:** 60 soniyalik ISR kesh muddati va buyurtma rasmiylashtirishdagi tekshiruv orqali narx o'zgarganda yangi narx saytda aks etadi.
- **Tahlil va izoh:** Eski narxlar uzoq vaqt keshda qolib ketmaydi.
- **Amaliy tavsiya:** Narx o'zgarganda on-demand revalidate API ni chaqirish.

#### 92. Omborda mavjud bo‘lmagan mahsulotlar to‘g‘ri belgilanganmi?

- **Natija:** ✅ **Ha** (2 ball)
- **Texnik dalil:** Qoldig'i 0 bo'lgan mahsulotlar 'Mavjud emas' holatida belgilanadi, narx ko'rinadi ammo savatga qo'shish tugmasi bloklanadi.
- **Tahlil va izoh:** Xaridor mavjud bo'lmagan tovarni tasodifan sotib olishining oldi olingan.
- **Amaliy tavsiya:** Mavjud bo'lmagan tovarlar uchun 'Kelganda xabar berish' tugmasini qo'shish.

#### 93. Bir xil mahsulotning takroriy yozuvlari nazorat qilinadimi?

- **Natija:** ⚠️ **Qisman** (1 ball)
- **Texnik dalil:** Unikal ID bo'yicha dublikatlar 0 ta. Biroq 3 ta mahsulotda bir xil slug aniqlandi va 52 ta rasm bir nechta mahsulotlar o'rtasida umumiy ishlatilmoqda.
- **Tahlil va izoh:** Mahsulot kodlari unikal bo'lsa-da, sluglar dublikat bo'lishi SEO yo'naltirishlarida chalkashlik keltirib chiqarishi mumkin.
- **Amaliy tavsiya:** Slug yaratishda agar nom takrorlansa, uning oxiriga unikal kodni qo'shish (masalan `slug-kod`).

#### 94. Mahsulot parametrlarini (brend, model, artikul, rang, o‘lcham va boshqalar) filtrlash mumkinmi?

- **Natija:** ✅ **Ha** (2 ball)
- **Texnik dalil:** Brend, narx oralig'i, mavjudlik bo'yicha dinamik filtrlar mavjud va to'g'ri ishlamoqda.
- **Tahlil va izoh:** Katalogda mahsulotlarni asosiy parametrlar bo'yicha saralash va filtrlash imkoniyati to'liq ta'minlangan.
- **Amaliy tavsiya:** Kelgusida toifa xususiyatlariga qarab maxsus filtrlar (masalan qog'oz zichligi, seyf o'lchami) qo'shish.

#### 95. Katta katalogda sahifalash (Pagination) yoki samarali Infinite Scroll ishlatiladimi?

- **Natija:** ✅ **Ha** (2 ball)
- **Texnik dalil:** Katalog sahifalarida sahifalash (Pagination) va sahifa sonini boshqarish to'g'ri ishlamoqda.
- **Tahlil va izoh:** Barcha 1,760 ta mahsulot bitta sahifada yuklanmaydi, qismlarga bo'linadi.
- **Amaliy tavsiya:** Pagination bilan bir qatorda 'Ko'proq yuklash' tugmasini ham qo'llab-quvvatlash.

#### 96. Kategoriya sahifalarida mahsulotlar soni ko‘payganda server va brauzerga ortiqcha yuk tushmaydimi?

- **Natija:** ⚠️ **Qisman** (1 ball)
- **Texnik dalil:** Kategoriya sahifalarida yuklama me'yorda, biroq Bosh sahifada (Home page) barcha mahsulotlar ro'yxati bitta massivda uzatilgani sababli DOM elementlari soni 2,821 taga yetgan.
- **Tahlil va izoh:** Bosh sahifa yuklanishida brauzer xotirasiga ortiqcha yuk tushmoqda.
- **Amaliy tavsiya:** Bosh sahifada mahsulotlar sonini cheklash (masalan, har bir slayderda maksimal 8-12 ta tovar).

### 8. Backend va API auditi

#### 97. API endpoint'lari yagona standart asosida tashkil etilganmi?

- **Natija:** ✅ **Ha** (2 ball)
- **Texnik dalil:** Barcha API endpointlari `src/app/api/` katalogi ostida Next.js Route Handlers yordamida yagona RESTful konvensiyasida tashkil etilgan.
- **Tahlil va izoh:** Marshrutlar strukturasi mantiqiy va standartlarga mos.
- **Amaliy tavsiya:** API marshrutlari soni ko'payganda ularni sohalar bo'yicha guruhlash.

#### 98. API javoblarining JSON strukturasi barcha endpoint'larda bir xil va tushunarlimi?

- **Natija:** ✅ **Ha** (2 ball)
- **Texnik dalil:** Barcha endpointlar yagona JSON strukturasida javob beradi: `{ success: boolean, data?: ..., error?: string }`.
- **Tahlil va izoh:** Frontend va tashqi tizimlar uchun javoblarni pars qilish juda oson va izchil.
- **Amaliy tavsiya:** Ushbu yagona javob formatini o'zgarishsiz saqlash.

#### 99. API muvaffaqiyatli va muvaffaqiyatsiz so‘rovlar uchun tegishli HTTP status code qaytaradimi?

- **Natija:** ✅ **Ha** (2 ball)
- **Texnik dalil:** Muvaffaqiyatli so'rovlar uchun 200/201, xatolar uchun 400 (Bad Request), 401 (Unauthorized), 404 (Not Found), 429 (Rate Limit), 500 (Server Error) kodlari to'g'ri qaytariladi.
- **Tahlil va izoh:** HTTP status kodlari standart semantikaga to'liq javob beradi.
- **Amaliy tavsiya:** Status kodlarni o'zgartirmaslik.

#### 100. API xatoliklari standartlashtirilgan formatda qaytariladimi?

- **Natija:** ✅ **Ha** (2 ball)
- **Texnik dalil:** Xatoliklar `{ success: false, error: 'Xatolik tavsifi' }` ko'rinishidagi standart JSON obyektida qaytariladi.
- **Tahlil va izoh:** Xatoliklarni mijoz tomonidan ushlash va tushunarli ko'rsatish qulay yo'lga qo'yilgan.
- **Amaliy tavsiya:** Xatolik obyektiga xato kodini ham (`code: 'INVALID_PHONE'`) qo'shish.

#### 101. API so‘rovlarida kiruvchi parametrlar validatsiya qilinadimi?

- **Natija:** ⚠️ **Qisman** (1 ball)
- **Texnik dalil:** OTP va qidiruvda Zod orqali qat'iy parametr tekshiruvi bor. Biroq `/api/order/create` da mahsulot narxi va summasi serverda qayta hisoblanmaydi.
- **Tahlil va izoh:** Kiruvchi ma'lumotlar qisman validatsiya qilinadi, lekin eng muhim biznes jarayoni (buyurtma narxi) zaif qolgan.
- **Amaliy tavsiya:** Buyurtma marshrutida Zod schema orqali to'liq tekshiruv o'rnatish va narxlarni 1C dan qayta hisoblash.

#### 102. API server tomonida autentifikatsiya va avtorizatsiya tekshiruvlari mavjudmi?

- **Natija:** ⚠️ **Qisman** (1 ball)
- **Texnik dalil:** Sessiya cookie tekshiriladi, ammo cookie imzolanmaganligi sababli ruxsatlarni soxtalashtirish mumkin. Shuningdek `/api/1c/test` umuman himoyalanmagan.
- **Tahlil va izoh:** Autentifikatsiya va avtorizatsiya mexanizmida xavfsizlik teshiklari mavjud.
- **Amaliy tavsiya:** Sessiya tokenlarini HMAC bilan imzolash va test marshrutlarini yopish.

#### 103. Uzoq davom etuvchi API so‘rovlariga timeout belgilanganmi?

- **Natija:** ✅ **Ha** (2 ball)
- **Texnik dalil:** `src/lib/api/client.ts` da `fetchWithTimeout` yordamida `AbortController` orqali 10 soniyalik qat'iy timeout belgilangan.
- **Tahlil va izoh:** 1C serveri qotib qolganda so'rov cheksiz osilib qolmaydi, 10 soniyadan so'ng xavfsiz to'xtatiladi.
- **Amaliy tavsiya:** Timeout vaqtini turli operatsiyalar (katalog so'rovi uchun 10s, buyurtma uchun 15s) ga qarab sozlash.

#### 104. Tashqi API vaqtincha ishlamasa, retry va backoff mexanizmi mavjudmi?

- **Natija:** ⚠️ **Qisman** (1 ball)
- **Texnik dalil:** Xatoliklar `try/catch` orqali ushlanadi, ammo 1C vaqtincha tarmoq xatosi berganda avtomatik qayta urinish (retry with exponential backoff) mavjud emas.
- **Tahlil va izoh:** Kichik bir martalik tarmoq uzilishida so'rov darhol rad etiladi.
- **Amaliy tavsiya:** 1C mijozida 3 martagacha qayta urinish (retry logic: 1s, 2s, 4s) algoritmini qo'shish.

#### 105. Takroriy so‘rovlar bir xil buyurtma yoki yozuvni qayta-qayta yaratib yubormaydimi?

- **Natija:** ⚠️ **Qisman** (1 ball)
- **Texnik dalil:** Frontendda submit tugmasi yuklanish vaqtida bloklanadi (`loading`). Biroq backend API da Idempotency Key tekshiruvi yo'q.
- **Tahlil va izoh:** Agar foydalanuvchi zaif tarmoq tufayli so'rovni takror yuborsa, 1C da bitta buyurtma ikki marta yaratilib qolishi mumkin.
- **Amaliy tavsiya:** Har bir buyurtma uchun noyob `idempotency_key` (UUID) talab qilish va uni keshda 10 daqiqa tekshirib turish.

#### 106. API versiyalarini boshqarish strategiyasi mavjudmi?

- **Natija:** ❌ **Yo‘q** (0 ball)
- **Texnik dalil:** API marshrutlarida `/api/v1/...` kabi versiyalash mavjud emas. Barcha so'rovlar to'g'ridan-to'g'ri chaqiriladi.
- **Tahlil va izoh:** Kelgusida mobil ilova yoki tashqi hamkorlar ulanganda API o'zgarishlari mavjud mijozlarni uzib qo'yishi mumkin.
- **Amaliy tavsiya:** Yangi marshrutlarni `/api/v1/...` prefiksi ostida tuzishni rejalashtirish.

#### 107. Backend loglarida xatolarni aniqlash va muammoli so‘rovlarni topish mumkinmi?

- **Natija:** ✅ **Ha** (2 ball)
- **Texnik dalil:** Vercel Functions Console va server loglarida barcha xatoliklar, so'rov yo'llari va xato matnlari to'liq ko'rinadi.
- **Tahlil va izoh:** Backend xatoliklarini diagnostika qilish imkoniyati to'liq mavjud.
- **Amaliy tavsiya:** Loglarni formatlashtirib, JSON logger (Pino yoki Winston) ishlatish.

#### 108. API ortiqcha ma’lumotlarni qaytarmasdan, faqat zarur maydonlarni taqdim etadimi?

- **Natija:** ⚠️ **Qisman** (1 ball)
- **Texnik dalil:** Ichki tozalangan API lar faqat kerakli maydonlarni qaytaradi, biroq `https://sora.uz/api/1c/test` 1C ning barcha ichki xususiyatlari, URL va portlarini ochiq chiqarib yuboradi.
- **Tahlil va izoh:** Maxfiy ma'lumotlar cheklanishi lozim bo'lgan test endpointi ishlab chiqarishda ochiq qolgan.
- **Amaliy tavsiya:** Test endpointini yopish va faqat minimal kerakli ma'lumotlarni chiqarish.

### 9. 1C yoki ERP bilan integratsiya auditi

#### 109. Sayt va 1C o‘rtasidagi ma’lumotlar almashinuvi uchun aniq integratsiya arxitekturasi mavjudmi?

- **Natija:** ✅ **Ha** (2 ball)
- **Texnik dalil:** `src/lib/api/client.ts` da 1C OData va REST protokoli asosida to'liq integratsiya mantiqi jamlangan.
- **Tahlil va izoh:** Sayt va 1C o'rtasida ma'lumotlar almashinuvi uchun aniq belgilangan arxitektura mavjud.
- **Amaliy tavsiya:** Integratsiya kodini alohida servis qatlamiga ajratib, testlar bilan qamrab olish.

#### 110. Mahsulotlar identifikatori 1C va sayt o‘rtasida to‘g‘ri moslashtirilganmi?

- **Natija:** ✅ **Ha** (2 ball)
- **Texnik dalil:** 1C dagi nomenklatura kodi (`kod`, masalan `00-00000305`) saytdagi mahsulot kodi bilan 1:1 to'liq mos keladi.
- **Tahlil va izoh:** Mahsulotlar identifikatsiyasida hech qanday nomutanosiblik yoki adashish yo'q.
- **Amaliy tavsiya:** Ushbu 1:1 bog'liqlikni qat'iy saqlash.

#### 111. Mahsulot nomi, tavsifi, kategoriyasi va texnik xususiyatlari to‘g‘ri sinxronlanadimi?

- **Natija:** ✅ **Ha** (2 ball)
- **Texnik dalil:** Mahsulot nomi, o'lchov birligi, toifasi va xususiyatlari 1C dan to'g'ri o'qib olinib saytda ko'rsatiladi.
- **Tahlil va izoh:** Mahsulot asosiy atributlari 1C bilan to'liq sinxron holatda.
- **Amaliy tavsiya:** Yangi qo'shiladigan tovar parametrlarini ham avtomatik sinxronlashni davom ettirish.

#### 112. Narxlar 1C'dagi tegishli registrdan olinadimi?

- **Natija:** ✅ **Ha** (2 ball)
- **Texnik dalil:** Narxlar 1C ning `/price` endpointi orqali to'g'ridan-to'g'ri narxlar registridan olinadi. Jonli testda saytdagi narx 1C bilan 100% mos chiqdi.
- **Tahlil va izoh:** Saytda sun'iy yoki eskirgan narxlar emas, birlamchi buxgalteriya narxlari aks etadi.
- **Amaliy tavsiya:** Narx registrining doimiy ishlashini nazorat qilib borish.

#### 113. Ombordagi qoldiqlar 1C'dagi haqiqiy qoldiq ma’lumotlari asosida hisoblanadimi?

- **Natija:** ✅ **Ha** (2 ball)
- **Texnik dalil:** Ombordagi haqiqiy qoldiqlar 1C hisobidan olinadi va mahsulot kartasida mavjudlik holatini belgilaydi.
- **Tahlil va izoh:** Omborda qolmagan tovarlar saytda avtomatik 'Mavjud emas' ga aylanadi.
- **Amaliy tavsiya:** Qoldiqlar kam qolganda (masalan, 3 donadan kam) xaridorga 'Kam qoldi' eslatmasini chiqarish.

#### 114. Narx va qoldiq ma’lumotlari mahsulotning asosiy ma’lumotlaridan mustaqil yangilanadimi?

- **Natija:** ✅ **Ha** (2 ball)
- **Texnik dalil:** Narxlar va qoldiqlar `/price` endpointi orqali alohida va tezkor so'raladi (har 60 soniyada yangilanadi), og'ir mahsulot tavsiflaridan mustaqil ishlaydi.
- **Tahlil va izoh:** O'zgaruvchan ma'lumotlar statik tavsiflardan mustaqil arxitekturada ajratilgan.
- **Amaliy tavsiya:** Ushbu mustaqil yangilanish modelini saqlab qolish.

#### 115. Saytda eski narx yoki noto‘g‘ri qoldiq ko‘rsatilishining oldini olish mexanizmi mavjudmi?

- **Natija:** ✅ **Ha** (2 ball)
- **Texnik dalil:** 60 soniyalik Next.js ISR kesh muddati va buyurtma berishdan oldin yangi narx tekshiruvi mavjud.
- **Tahlil va izoh:** Eski narx yoki noto'g'ri qoldiq ko'rsatilishining oldi olingan.
- **Amaliy tavsiya:** Narx o'zgarganda veb-saytga zudlik bilan xabar beruvchi webhook (Push model) joriy qilish.

#### 116. 1C vaqtincha ishlamasa, saytning mahsulot katalogi ishlashda davom etadimi?

- **Natija:** ✅ **Ha** (2 ball)
- **Texnik dalil:** Next.js Stale-While-Revalidate kesh mexanizmi tufayli, agar 1C vaqtincha uzilib qolsa, sayt keshdagi mahsulotlarni xatosiz ko'rsatishda davom etadi.
- **Tahlil va izoh:** 1C dagi nosozliklar tashrif buyuruvchilar uchun saytning butunlay to'xtab qolishiga olib kelmaydi.
- **Amaliy tavsiya:** Kesh yangilanmay qolgan vaqtda konsolda ogohlantirish qayd etilishini ta'minlash.

#### 117. 1C va sayt o‘rtasidagi sinxronizatsiya xatolari qayd etiladimi?

- **Natija:** ⚠️ **Qisman** (1 ball)
- **Texnik dalil:** Xatolar Vercel konsolida `console.error` bilan yoziladi, biroq alohida sinxronizatsiya loglar bazasi yoki ogohlantiruvchi bot yo'q.
- **Tahlil va izoh:** Agar 1C bilan aloqa uzilsa, mas'ul xodimlar faqat konsolga kiribgina buni bilishi mumkin.
- **Amaliy tavsiya:** 1C so'rovlari 3 marta ketma-ket xato berganda mas'ul xodimga Telegram-bot orqali xabar yuborish.

#### 118. Sinxronizatsiyada muvaffaqiyatsiz bo‘lgan ma’lumotlarni qayta yuborish mumkinmi?

- **Natija:** ❌ **Yo‘q** (0 ball)
- **Texnik dalil:** Sinxronizatsiya xatoga uchraganda ma'lumotlarni navbatga qo'yib (queue), keyinchalik qayta yuboruvchi mexanizm mavjud emas.
- **Tahlil va izoh:** Xatolik yuz bersa, ma'lumot shunchaki yo'qotiladi yoki keyingi revalidation davrigacha yangilanmay qoladi.
- **Amaliy tavsiya:** Redis/Upstash yoki BullMQ asosidagi xabarlar navbatini (Queue) integratsiya qilish.

#### 119. Buyurtma 1C'ga yuborilganda takroriy buyurtma yaratilishining oldi olinadimi?

- **Natija:** ⚠️ **Qisman** (1 ball)
- **Texnik dalil:** Foydalanuvchi interfeysida submit tugmasi yuklanish vaqtida bloklanadi, ammo backend API da takrorlanishdan himoya qiluvchi token yo'q.
- **Tahlil va izoh:** Tarmoq qayta ulanishlarida bitta buyurtma ikki marta yaratilishi xavfi saqlanib qoladi.
- **Amaliy tavsiya:** Har bir buyurtma so'roviga noyob ID biriktirib, 1C ga yuborishdan oldin takroriylikni tekshirish.

#### 120. Buyurtma holatlari 1C va saytda o‘zaro to‘g‘ri sinxronlanadimi?

- **Natija:** ⚠️ **Qisman** (1 ball)
- **Texnik dalil:** Buyurtma 1C ga tushadi, ammo 1C dagi buyurtma holati (yetkazilmoqda, to'landi, bajarildi) saytda foydalanuvchi profiliga real vaqtda qaytib kelmaydi.
- **Tahlil va izoh:** Mijoz sayt orqali o'z buyurtmasining joriy holatini kuzatib bora olmaydi.
- **Amaliy tavsiya:** 1C dan buyurtma statuslarini veb-saytga uzatuvchi ikki tomonlama sinxronizatsiya webhookini joriy qilish.

#### 121. Narx, chegirma, valyuta va yaxlitlash qoidalari ikki tizimda bir xilmi?

- **Natija:** ✅ **Ha** (2 ball)
- **Texnik dalil:** Narxlar so'mda, 12% QQS narx ichiga kiritilgan, barcha yaxlitlashlar butun so'mgacha 1C dagi kabi bir xil qoidada bajariladi.
- **Tahlil va izoh:** Ikki tizim o'rtasida narx va hisob-kitob tafovutlari yo'q.
- **Amaliy tavsiya:** QQS va narx qoidalarini yagona hisoblash moduli orqali boshqarishni davom ettirish.

#### 122. 1C API bilan ishlashda autentifikatsiya va ma’lumotlar xavfsizligi ta’minlanganmi?

- **Natija:** ❌ **Yo‘q** (0 ball)
- **Texnik dalil:** KRITIK XAVFSIZLIK LEAK: 1C ERP bilan aloqa ochiq internet orqali shifrlanmagan HTTP (`http://1cloud.uz:777`) orqali boradi va parollar GitHubda ochiq commit qilingan!
- **Tahlil va izoh:** Shifrlanmagan aloqa tufayli internet provayder yoki tajovuzkor buyurtmalar, mijozlar va buxgalteriya ma'lumotlarini ushlab olishi (Man-in-the-Middle) mumkin.
- **Amaliy tavsiya:** ZUDLIK BILAN: 1C serveri uchun SSL sertifikati (HTTPS) o'rnatish yoki Vercel bilan 1C o'rtasida xavfsiz VPN/Cloudflare Tunnel tashkil etish; GitHubdagi parollarni o'zgartirish.

### 10. Savatcha, buyurtma va to‘lov tizimi

#### 123. Foydalanuvchi mahsulotni savatchaga to‘g‘ri qo‘sha oladimi?

- **Natija:** ✅ **Ha** (2 ball)
- **Texnik dalil:** Zustand kutubxonasi asosidagi `cartStore.ts` orqali mahsulot savatchaga to'g'ri qo'shiladi va savatcha hisoblagichi darhol yangilanadi.
- **Tahlil va izoh:** Savatga qo'shish jarayoni tezkor va xatosiz ishlaydi.
- **Amaliy tavsiya:** Savatga tovar qo'shilganda chiroyli mikro-animatsiya yoki tezkor yon panel ochilishini ta'minlash.

#### 124. Mahsulot miqdorini o‘zgartirish va savatchadan o‘chirish to‘g‘ri ishlaydimi?

- **Natija:** ✅ **Ha** (2 ball)
- **Texnik dalil:** Savatchada mahsulot sonini oshirish (+), kamaytirish (-) va o'chirish funksiyalari to'liq ishlaydi. 1 donadan kamayganda o'chirish taklif etiladi.
- **Tahlil va izoh:** Savat ichidagi tovarlar sonini boshqarish qulay va aniq.
- **Amaliy tavsiya:** Maksimal ombor qoldig'idan ko'p tovar tanlashga yo'l qo'ymaslik tekshiruvini kuchaytirish.

#### 125. Savatcha ma’lumotlari foydalanuvchi sessiyasi yoki akkaunti bilan to‘g‘ri bog‘langanmi?

- **Natija:** ⚠️ **Qisman** (1 ball)
- **Texnik dalil:** Savatcha ma'lumotlari faqat brauzerning `localStorage` xotirasida saqlanadi. Foydalanuvchi akkaunti bilan serverda sinxronlanmaydi.
- **Tahlil va izoh:** Agar foydalanuvchi telefonida tovarlarni savatga qo'shib, keyin kompyuterdan kirsa, savat bo'sh bo'ladi.
- **Amaliy tavsiya:** Avtorizatsiyadan o'tgan foydalanuvchilar uchun savatni serverda saqlash va qurilmalararo sinxronlash.

#### 126. Sahifa yangilanganda savatcha ma’lumotlari yo‘qolib qolmaydimi?

- **Natija:** ✅ **Ha** (2 ball)
- **Texnik dalil:** Zustand `persist` middleware orqali savatcha `localStorage` ga avtomatik yoziladi va sahifa yangilanganda ham saqlanib qoladi.
- **Tahlil va izoh:** Sahifa yangilanganda yoki brauzer yopilganda savatdagi tovarlar yo'qolmaydi.
- **Amaliy tavsiya:** Persist holatini saqlash.

#### 127. Savatchadagi narx server tomonidan qayta tekshiriladimi?

- **Natija:** ❌ **Yo‘q** (0 ball)
- **Texnik dalil:** KRITIK XAVFSIZLIK ZAIFLIGI: `src/app/api/order/create/route.ts` da `rawBody.items` dagi mijoz brauzeri yuborgan `price` to'g'ridan-to'g'ri qabul qilinadi; server narxni 1C dan qayta hisoblab tekshirmaydi!
- **Tahlil va izoh:** Tajovuzkor narxni 1 so'm qilib POST so'rov yuborsa, buyurtma 1 so'm bilan 1C ga tushib ketishi mumkin (Price Tampering).
- **Amaliy tavsiya:** ZUDLIK BILAN: `/api/order/create` da har bir mahsulot kodining haqiqiy narxini 1C dan qayta so'rab, jami summani faqat serverda hisoblab buyurtma yaratish.

#### 128. Buyurtma berish vaqtida mahsulotning haqiqiy mavjudligi qayta tekshiriladimi?

- **Natija:** ⚠️ **Qisman** (1 ball)
- **Texnik dalil:** Foydalanuvchi interfeysida qoldiq tekshiriladi, ammo buyurtma berilayotgan soniyada serverda ombor qoldig'i qayta tekshirilmaydi.
- **Tahlil va izoh:** Agar buyurtma berish paytida tovar tugab qolsa, buyurtma baribir 1C ga ketadi va u yerda xatolik yuzaga keladi.
- **Amaliy tavsiya:** Buyurtmani tasdiqlashdan avval 1C ombor qoldig'ini tezkor tekshirish.

#### 129. Bir vaqtning o‘zida oxirgi mahsulotni bir nechta foydalanuvchi sotib olishga uringanda qoldiq to‘g‘ri boshqariladimi?

- **Natija:** ⚠️ **Qisman** (1 ball)
- **Texnik dalil:** Saytda parallel buyurtmalar uchun zaxira qilish (reservation locking) mexanizmi yo'q; to'qnashuv faqat 1C ga tushganda hal qilinadi.
- **Tahlil va izoh:** Bir vaqtda bir nechta mijoz so'nggi bitta tovarni sotib olishga uringanda birinchisi o'tadi, qolganlarida 1C rad etishi mumkin.
- **Amaliy tavsiya:** Katta aksiyalar vaqtida tovarlarni 10 daqiqaga bron qilish mexanizmini ko'rib chiqish.

#### 130. Buyurtma yuborish jarayonida foydalanuvchining ma’lumotlari to‘g‘ri validatsiya qilinadimi?

- **Natija:** ✅ **Ha** (2 ball)
- **Texnik dalil:** Buyurtma shaklida mijoz ismi, telefon raqami (+998 formati) va yetkazib berish manzili to'liq validatsiya qilinadi.
- **Tahlil va izoh:** Noto'g'ri yoki chala kiritilgan ma'lumotlar bilan buyurtma yuborishning oldi olingan.
- **Amaliy tavsiya:** Manzil kiritishda xaritadan (Yandex Maps) nuqta tanlash qulayligini qo'shish.

#### 131. Buyurtma muvaffaqiyatli yaratilgandan keyin foydalanuvchiga aniq buyurtma raqami beriladimi?

- **Natija:** ✅ **Ha** (2 ball)
- **Texnik dalil:** Buyurtma muvaffaqiyatli qabul qilinganda foydalanuvchiga 1C tomonidan berilgan unikal buyurtma raqami va xulosasi ko'rsatiladi.
- **Tahlil va izoh:** Xaridor o'z buyurtma raqamini oladi va operator bilan gaplashganda shuni aytishi mumkin.
- **Amaliy tavsiya:** Ushbu raqamni xaridorga SMS orqali ham jo'natish.

#### 132. Buyurtma ikki marta yuborilishidan himoya mavjudmi?

- **Natija:** ⚠️ **Qisman** (1 ball)
- **Texnik dalil:** UI da 'Buyurtma berish' tugmasi bosilgandan so'ng bloklanadi (`disabled`), biroq backendda Idempotency Key yo'q.
- **Tahlil va izoh:** Brauzer darajasida himoya bor, ammo tarmoq darajasida takrorlanishdan to'liq kafolat yo'q.
- **Amaliy tavsiya:** Backendda bir xil mijozdan 1 daqiqa ichida kelgan bir xil savatli so'rovlarni rad etish.

#### 133. To‘lov integratsiyasi mavjud bo‘lsa, to‘lov holati server tomonida tekshiriladimi?

- **Natija:** ⚠️ **Qisman** (1 ball)
- **Texnik dalil:** Hozirgi vaqtda to'lov usullari: Yetkazib berilganda naqd/karta bilan to'lash va B2B hisob-faktura. Avtomatlashtirilgan onlayn shlyuzlar (Payme/Click) ulanmagan.
- **Tahlil va izoh:** To'lovlar oflayn qabul qilinadi, shuning uchun onlayn to'lov holatini serverda tekshirish hozircha yo'q.
- **Amaliy tavsiya:** Payme va Click to'lov tizimlarini integratsiya qilish va ularning xavfsiz server tekshiruvini joriy etish.

#### 134. To‘lov provayderidan keladigan callback yoki webhook xabarlari imzosi tekshiriladimi?

- **Natija:** ❌ **Yo‘q** (0 ball)
- **Texnik dalil:** Saytda to'lov provayderlaridan keluvchi webhooklar yo'q, shuning uchun ularning imzosini tekshirish kodi mavjud emas.
- **Tahlil va izoh:** Onlayn to'lov bo'lmagani sababli imzo tekshiruvi amalga oshirilmagan.
- **Amaliy tavsiya:** To'lov tizimlari ulanayotganda HMAC-SHA256 imzosi tekshiruvini majburiy kiritish.

#### 135. To‘lov muvaffaqiyatsiz bo‘lganda buyurtma holati to‘g‘ri yangilanadimi?

- **Natija:** ⚠️ **Qisman** (1 ball)
- **Texnik dalil:** To'lovlar oflayn bo'lgani sababli to'lov xatolari va buyurtmani bekor qilish operator tomonidan 1C da qo'lda boshqariladi.
- **Tahlil va izoh:** Avtomatlashtirilgan to'lov xatoliklarini qayta ishlash zanjiri yo'q.
- **Amaliy tavsiya:** To'lov integratsiyasi bilan birga bu jarayonni avtomatlashtirish.

#### 136. Buyurtma holatlari (yangi, tasdiqlangan, tayyorlanmoqda, yetkazilmoqda, yakunlangan, bekor qilingan) aniq boshqariladimi?

- **Natija:** ⚠️ **Qisman** (1 ball)
- **Texnik dalil:** Holatlar 1C ERP tizimi ichida mavjud, ammo veb-saytda foydalanuvchi shaxsiy kabinetida barcha statuslar (yangi, tasdiqlandi, yo'lda, yakunlandi) real vaqtda aks etmaydi.
- **Tahlil va izoh:** Mijoz buyurtma qaysi bosqichda ekanligini faqat telefon orqali bilishi mumkin.
- **Amaliy tavsiya:** Shaxsiy kabinetda buyurtma statuslari trekerini (progress bar) yaratish.

#### 137. Buyurtma bo‘yicha foydalanuvchiga SMS, email yoki boshqa bildirishnoma yuborish mexanizmi mavjudmi?

- **Natija:** ⚠️ **Qisman** (1 ball)
- **Texnik dalil:** OTP uchun Eskiz SMS ishlaydi, biroq buyurtma berilgandan keyin mijozga buyurtma raqami va summasi yozilgan avtomatik SMS yuborilmaydi.
- **Tahlil va izoh:** Xaridordan keyingi aloqa (post-purchase notification) to'liq avtomatlashtirilmagan.
- **Amaliy tavsiya:** Buyurtma muvaffaqiyatli qabul qilinganda mijozga avtomatik SMS xabarnoma yuborishni ulash.

### 11. SEO auditi — Google, Yandex va boshqa qidiruv tizimlari

#### 138. Har bir muhim sahifaning yagona va to‘g‘ri title tegi bormi?

- **Natija:** ✅ **Ha** (2 ball)
- **Texnik dalil:** Har bir sahifada Next.js Metadata API orqali dinamik, unikal va jozibador `<title>` tegi generatsiya qilinadi.
- **Tahlil va izoh:** Sarlavhalar dublikat emas, mahsulot va brend nomini to'liq qamrab oladi.
- **Amaliy tavsiya:** Title uzunligini 60 belgidan oshirmaslik qoidasiga rioya qilish.

#### 139. Har bir sahifada mazmuniga mos meta_description mavjudmi?

- **Natija:** ✅ **Ha** (2 ball)
- **Texnik dalil:** Har bir mahsulot va toifa sahifasida mos meta_description o'zbek va rus tillarida mavjud.
- **Tahlil va izoh:** Qidiruv natijalarida (SERP) jozibador snippet chiqishi ta'minlangan.
- **Amaliy tavsiya:** Meta tavsiflarga narx va 'Yetkazib berish bepul' kabi jozibador kalit so'zlarni kiritish.

#### 140. Har bir sahifada to‘g‘ri H1 sarlavhasi bormi?

- **Natija:** ✅ **Ha** (2 ball)
- **Texnik dalil:** Barcha sahifalarda semantik yagona `<h1>` sarlavhasi mavjud va u mahsulot/toifa nomiga to'liq mos.
- **Tahlil va izoh:** Sahifada H1 sarlavhalari takrorlanmaydi, yagona ierarxiya saqlangan.
- **Amaliy tavsiya:** H1 teglarini vizual va semantik jihatdan to'g'ri saqlash.

#### 141. H1, H2 va H3 sarlavhalar ierarxiyasi to‘g‘ri tashkil etilganmi?

- **Natija:** ✅ **Ha** (2 ball)
- **Texnik dalil:** H1 -> H2 -> H3 ketma-ketligi to'g'ri tashkil etilgan. Bo'lim sarlavhalari mantiqiy darajalarga ega.
- **Tahlil va izoh:** Semantik struktura qidiruv botlari uchun to'liq tushunarli.
- **Amaliy tavsiya:** Sarlavhalar ierarxiyasini yangi sahifalarda ham buzmaslik.

#### 142. Mahsulot URL manzillari qisqa, tushunarli va barqarormi?

- **Natija:** ✅ **Ha** (2 ball)
- **Texnik dalil:** Mahsulot URL manzillari qisqa, barqaror va tushunarli: `/uz/products/deli-33559-qora-ofis-seyfi`.
- **Tahlil va izoh:** Inson tushunadigan URL manzillar (clean URLs) SEO talablariga to'liq javob beradi.
- **Amaliy tavsiya:** URL tuzilmasini o'zgartirmaslik.

#### 143. Bir mahsulotga bir nechta URL orqali kirish mumkin bo‘lsa, canonical manzili to‘g‘ri belgilanadimi?

- **Natija:** ✅ **Ha** (2 ball)
- **Texnik dalil:** Har bir sahifada o'ziga qaratilgan to'g'ri canonical sarlavhasi mavjud: `<link rel='canonical' href='https://sora.uz/uz/products/...' />`.
- **Tahlil va izoh:** Parametrli URL lar tufayli qidiruv tizimlarida dublikatlar paydo bo'lishining oldi olingan.
- **Amaliy tavsiya:** Canonical teglarni doimiy nazorat qilish.

#### 144. Til versiyalari uchun hreflang atributlari to‘g‘ri ishlatiladimi?

- **Natija:** ✅ **Ha** (2 ball)
- **Texnik dalil:** Til versiyalari uchun `hreflang` teglari to'liq joriy etilgan: `uz`, `uz-UZ`, `ru`, `ru-UZ` va `x-default`.
- **Tahlil va izoh:** Google qidiruv tizimi foydalanuvchi tiliga qarab to'g'ri sahifani ko'rsatishi kafolatlangan.
- **Amaliy tavsiya:** Hreflang teglaridagi o'zaro havolalar sinxronligini saqlash.

#### 145. Har bir til versiyasi uchun tegishli canonical URL ko‘rsatiladimi?

- **Natija:** ✅ **Ha** (2 ball)
- **Texnik dalil:** Har bir til versiyasi o'zining mos canonical URL manziliga ega (`https://sora.uz/uz/...` va `https://sora.uz/ru/...`).
- **Tahlil va izoh:** Til versiyalari o'rtasida canonical ziddiyati mavjud emas.
- **Amaliy tavsiya:** Ushbu qoidani saqlash.

#### 146. sitemap.xml avtomatik shakllantirilib, yangilanib turadimi?

- **Natija:** ✅ **Ha** (2 ball)
- **Texnik dalil:** `https://sora.uz/sitemap.xml` avtomatik shakllanadi. Unda 3,970 ta URL va barcha rasmlar havolalari mavjud, hajmi 1.6 MB (50MB/50,000 URL limitidan ancha past).
- **Tahlil va izoh:** Sitemap barcha tovar va toifalarni qamrab olgan va qidiruv botlari uchun to'liq ochiq.
- **Amaliy tavsiya:** Sitemap generatsiyasini har kuni avtomatik yangilanadigan holatda ushlash.

#### 147. robots.txt qidiruv tizimlariga to‘g‘ri ko‘rsatmalar beradimi?

- **Natija:** ✅ **Ha** (2 ball)
- **Texnik dalil:** `https://sora.uz/robots.txt` to'g'ri sozlangan: `/api/`, `/uz/cart`, `/uz/checkout`, parametrlar yopilgan, sitemap ko'rsatilgan.
- **Tahlil va izoh:** Qidiruv botlariga qaysi sahifalarni indekslash va qaysilarini e'tiborsiz qoldirish bo'yicha aniq ko'rsatmalar berilgan.
- **Amaliy tavsiya:** Robots.txt ga yangi yopiq sahifalar paydo bo'lsa kiritib borish.

#### 148. Savatcha, login, profil va texnik sahifalar indekslanishdan himoyalanganmi?

- **Natija:** ✅ **Ha** (2 ball)
- **Texnik dalil:** Robots.txt faylida `Disallow: /uz/cart`, `Disallow: /uz/checkout`, `Disallow: /api/` qoidalari o'rnatilgan.
- **Tahlil va izoh:** Xarid jarayoni va shaxsiy sahifalar qidiruv indeksiga kirmaydi.
- **Amaliy tavsiya:** Savat sahifalariga qo'shimcha `noindex` meta tegini ham qo'yish.

#### 149. Preview va test domenlarining Google tomonidan indekslanishi cheklanganmi?

- **Natija:** ⚠️ **Qisman** (1 ball)
- **Texnik dalil:** Vercel preview URL lari himoyalangan, biroq `websorauz.vercel.app` ochiq va unda `X-Robots-Tag: noindex` yo'q.
- **Tahlil va izoh:** Standart vercel domeni qidiruv indeksiga kirib, asosiy domen reytingini tushirishi mumkin.
- **Amaliy tavsiya:** `websorauz.vercel.app` domeniga `X-Robots-Tag: noindex` qo'shish yoki 301 bilan `sora.uz` ga yo'naltirish.

#### 150. Mahsulot sahifalarida server tomonidan render qilingan asosiy matnli kontent mavjudmi?

- **Natija:** ✅ **Ha** (2 ball)
- **Texnik dalil:** Next.js SSR/SSG orqali mahsulot nomi, narxi, tavsifi va xususiyatlari dastlabki HTML javobidayoq to'liq serverda render qilinadi.
- **Tahlil va izoh:** Qidiruv botlari sahifani ochishi bilanoq barcha matnli ma'lumotlarni o'qiydi.
- **Amaliy tavsiya:** SSR render sifatini doimiy saqlab qolish.

#### 151. JavaScript ishlamagan holatda ham asosiy mahsulot ma’lumotlarini qidiruv tizimi ko‘ra oladimi?

- **Natija:** ✅ **Ha** (2 ball)
- **Texnik dalil:** Jonli `curl -A 'Googlebot' https://sora.uz/uz/products/...` so'rovi orqali tekshirildi: JavaScript o'chirilgan holatda ham barcha kontent HTML da mavjud.
- **Tahlil va izoh:** Sayt qidiruv botlari va sekin qurilmalar uchun to'liq optimallashtirilgan.
- **Amaliy tavsiya:** SSR kontentini client hydration bilan to'liq sinxron saqlash.

#### 152. Mahsulotlarda Product va Offer Schema.org structured data mavjudmi?

- **Natija:** ✅ **Ha** (2 ball)
- **Texnik dalil:** JSON-LD formatida `Product` va `Offer` Schema.org ma'lumotlari mavjud: `name`, `image`, `description`, `sku`, `price`, `priceCurrency: 'UZS'`, `availability`, `valueAddedTaxIncluded: true`.
- **Tahlil va izoh:** Google Rich Snippets talablari to'liq qondirilgan, mahsulot narxi va mavjudligi SERP da chiroyli chiqadi.
- **Amaliy tavsiya:** Rich Snippets sinov vositasi (Google Rich Results Test) orqali muntazam tekshirib turish.

#### 153. Kategoriya sahifalarida BreadcrumbList structured data ishlatiladimi?

- **Natija:** ✅ **Ha** (2 ball)
- **Texnik dalil:** Kategoriya va mahsulot sahifalarida `BreadcrumbList` Schema.org strukturaviy ma'lumotlari mavjud.
- **Tahlil va izoh:** Google qidiruv natijalarida sahifaning aniq yo'nalishi (Katalog > Toifa > Mahsulot) ko'rinadi.
- **Amaliy tavsiya:** Breadcrumb schema elementlarining to'g'ri tartibda ekanligini nazorat qilish.

#### 154. Mahsulot rasmi uchun to‘g‘ri ALT matnlar yoziladimi?

- **Natija:** ✅ **Ha** (2 ball)
- **Texnik dalil:** Barcha mahsulot rasmlarida `alt` atributi to'liq va mazmunli yozilgan (`alt='{product.name} - fotosurati 1'`).
- **Tahlil va izoh:** Google Images va Yandex Pictures da mahsulot rasmlari bo'yicha yuqori indeksatsiya ta'minlanadi.
- **Amaliy tavsiya:** Kategoriya va banner rasmlarida ham alt matnlarni doimiy yozish.

#### 155. Structured data ichidagi narx, valyuta va mavjudlik haqiqiy ma’lumotlar bilan mos keladimi?

- **Natija:** ✅ **Ha** (2 ball)
- **Texnik dalil:** Schema.org ichidagi narx, valyuta (`UZS`) va mavjudlik holati 1C dan kelgan haqiqiy ma'lumotlar bilan 100% mos.
- **Tahlil va izoh:** Google Merchant Center va qidiruv tizimlari narx nomuvofiqligi sababli jarima qo'llamaydi.
- **Amaliy tavsiya:** Narxlar o'zgarganda schemani ham avtomatik yangilashni ta'minlash.

#### 156. Filtr va saralash URL'lari duplicate content hosil qilmaydimi?

- **Natija:** ✅ **Ha** (2 ball)
- **Texnik dalil:** Filtr va saralash parametrlari (`?sort=price_asc`) bo'lgan barcha URL manzillar canonical tegi orqali asosiy toza URL ga qaratilgan.
- **Tahlil va izoh:** Parametrlar tufayli sun'iy dublikat sahifalar paydo bo'lishi 100% cheklangan.
- **Amaliy tavsiya:** Robots.txt da ham qidiruv parametrlarini bloklash qoidasini saqlash.

#### 157. O‘chirilgan mahsulotlar uchun 404, 410 yoki tegishli redirect strategiyasi mavjudmi?

- **Natija:** ✅ **Ha** (2 ball)
- **Texnik dalil:** O'chirilgan yoki mavjud bo'lmagan mahsulotlar uchun to'g'ri `HTTP 404 Not Found` qaytariladi va maxsus foydalanuvchibop 404 sahifasi ko'rsatiladi.
- **Tahlil va izoh:** Soft-404 xatolari mavjud emas, qidiruv tizimlari yo'q sahifalarni tezda indeksdan chiqaradi.
- **Amaliy tavsiya:** Ommabop eski tovarlar butunlay o'chirilganda ularni 301 Redirect bilan o'xshash yangi modelga yo'naltirish.

#### 158. Mahsulot nomi, tavsifi, texnik xususiyatlari va SEO matnlari takrorlanmaydimi?

- **Natija:** ✅ **Ha** (2 ball)
- **Texnik dalil:** Har bir mahsulot o'zining unikal nomiga, artikuliga va xususiyatlariga ega. Umumiy matnlar takrorlanmaydi.
- **Tahlil va izoh:** Kontent unikalligi yuqori darajada ta'minlangan.
- **Amaliy tavsiya:** Mahsulot tavsiflarini yanada boyitish va o'zbek tilidagi original matnlarni ko'paytirish.

#### 159. Google Search Console va Yandex Webmaster orqali indeksatsiya xatolari nazorat qilinadimi?

- **Natija:** ✅ **Ha** (2 ball)
- **Texnik dalil:** Saytda Google Search Console va IndexNow API (`/api/indexnow`) integratsiyasi mavjud, Google Merchant Center feedi ulanib tekshirilgan.
- **Tahlil va izoh:** Qidiruv indeksatsiyasi va xatolar doimiy monitoring qilib boriladi.
- **Amaliy tavsiya:** Yandex Webmaster va Bing Webmaster panellariga ham saytni to'liq ulab qo'yish.

### 12. Tezlik va samaradorlik auditi — Performance

#### 160. Sayt Google PageSpeed Insights orqali mobil va desktop rejimlarida tekshirilganmi?

- **Natija:** ✅ **Ha** (2 ball)
- **Texnik dalil:** Lighthouse va PageSpeed vositalari orqali mobil va desktop o'lchovlari o'tkazildi: Mahsulot sahifasi Desktop 98/100, Mobil 85/100; Bosh sahifa Desktop 82/100, Mobil 60/100.
- **Tahlil va izoh:** Saytning barcha asosiy shablonlari tezlik va samaradorlik ko'rsatkichlari bo'yicha to'liq test qilindi.
- **Amaliy tavsiya:** Bosh sahifa mobil versiyasini tezlashtirish ustida qo'shimcha optimallashtirish olib borish.

#### 161. Core Web Vitals ko‘rsatkichlari — LCP, INP va CLS — yaxshi darajadami?

- **Natija:** ⚠️ **Qisman** (1 ball)
- **Texnik dalil:** PDP da ko'rsatkichlar a'lo: LCP 2.1s, CLS 0, TBT 70ms. Biroq Bosh sahifada TBT 9,240ms ga yetmoqda, bu esa mobil qurilmalarda yuklanish paytida qotishga sabab bo'ladi.
- **Tahlil va izoh:** Sahifalar kesimida Core Web Vitals turlicha: mahsulot sahifalari yashil zonada, ammo Bosh sahifada yirik JS gidratsiyasi mavjud.
- **Amaliy tavsiya:** Bosh sahifada 'use client' komponentlarini kamaytirish orqali TBT ni 300ms dan pastga tushirish.

#### 162. Eng katta kontent elementi (LCP) imkon qadar tez yuklanadimi?

- **Natija:** ⚠️ **Qisman** (1 ball)
- **Texnik dalil:** PDP da LCP 2.1s (yaxshi zona). Bosh sahifada yirik karusel va bannerlar sababli mobil LCP 3.8 soniyagacha cho'zilmoqda.
- **Tahlil va izoh:** Eng katta vizual element (LCP) mahsulot sahifasida tez, biroq bosh sahifada sekinroq yuklanadi.
- **Amaliy tavsiya:** Bosh sahifaning dastlabki ekranidagi (Hero banner) birinchi rasmiga `priority={true}` qo'shish va AVIF da siqish.

#### 163. Foydalanuvchi harakatlariga javob berish tezligi (INP) qoniqarli darajadami?

- **Natija:** ⚠️ **Qisman** (1 ball)
- **Texnik dalil:** Bosh sahifadagi 9.2s TBT sababli dastlabki yuklanish soniyalarida sahifa tugmalari darhol reaksiyaga kirishmasligi (INP kechikishi) mumkin.
- **Tahlil va izoh:** Mijoz qurilmasi og'ir JavaScriptni pars qilayotgan paytda interaktivlik pasayadi.
- **Amaliy tavsiya:** Client-side bundle hajmini qisqartirish orqali INP ko'rsatkichini <200ms darajasida ushlash.

#### 164. Sahifa yuklanayotganda elementlarning kutilmagan siljishi (CLS) oldi olinganmi?

- **Natija:** ✅ **Ha** (2 ball)
- **Texnik dalil:** Lighthouse natijasi: Cumulative Layout Shift (CLS) = 0.000. Barcha banner, kartochka va rasmlar aniq `aspect-ratio` va `width/height` ga ega.
- **Tahlil va izoh:** Sahifa yuklanayotganda kutilmagan sakrash yoki elementlar siljishi umuman yo'q.
- **Amaliy tavsiya:** Kelgusidagi barcha yangi bloklarda o'lchamlarni qat'iy saqlab borish.

#### 165. Rasmlar optimallashtirilganmi va kerakli o‘lchamda yetkazib beriladimi?

- **Natija:** ✅ **Ha** (2 ball)
- **Texnik dalil:** Next.js Image Optimizer va Cloudflare R2 orqali rasmlar AVIF va WebP formatlarida brauzer o'lchamiga mos siqib yetkazilmoqda (87 KB -> 5.8 KB).
- **Tahlil va izoh:** Tasvirlar samarali optimallashtirilgan.
- **Amaliy tavsiya:** Banner dizaynerlariga ham rasmlarni yuklashdan oldin TinyPNG yoki Squoosh da siqishni tavsiya qilish.

#### 166. Lazy Loading kerakli rasmlar uchun to‘g‘ri ishlatiladimi?

- **Natija:** ✅ **Ha** (2 ball)
- **Texnik dalil:** Ekranning ko'rinmaydigan pastki qismidagi (below-the-fold) barcha rasmlarga `loading='lazy'` atributi to'g'ri o'rnatilgan.
- **Tahlil va izoh:** Foydalanuvchi pastga skroll qilmaguncha ortiqcha rasmlar yuklanmaydi, internet trafiki tejaladi.
- **Amaliy tavsiya:** Faqat birinchi ko'rinadigan 1-2 ta rasmda lazy loadingni o'chirib, qolganlarida qoldirish.

#### 167. Keraksiz JavaScript va CSS fayllari yuklanmayaptimi?

- **Natija:** ⚠️ **Qisman** (1 ball)
- **Texnik dalil:** Next.js va Tailwind v4 tree-shaking amalga oshiradi, biroq `lucide-react` to'liq import qilingan holatlar va ayrim ortiqcha client modullari bundle hajmini oshirgan.
- **Tahlil va izoh:** JavaScript hajmini yanada ixchamlashtirish imkoniyati mavjud.
- **Amaliy tavsiya:** Paketlar importini tekshirish va faqat kerakli ikonkalar/funksiyalarni alohida import qilish.

#### 168. Keraksiz client-side JavaScript va hydration hajmi minimallashtirilganmi?

- **Natija:** ⚠️ **Qisman** (1 ball)
- **Texnik dalil:** Bosh sahifada 35 ta 'use client' direktivasi mavjud bo'lib, React hydration hajmini sezilarli oshirmoqda.
- **Tahlil va izoh:** Statik ko'rinishi mumkin bo'lgan ko'plab bloklar client komponentga aylantirilgani hisobiga keraksiz JS ishlamoqda.
- **Amaliy tavsiya:** Bosh sahifadagi mahsulot ro'yxatlari, toifalar bloklarini Server Components ga o'tkazish.

#### 169. Server va brauzer cache strategiyasi to‘g‘ri tashkil etilganmi?

- **Natija:** ✅ **Ha** (2 ball)
- **Texnik dalil:** Statik resurslar uchun `Cache-Control: public, max-age=31536000, immutable`, HTML sahifalar uchun esa Next.js ISR (Incremental Static Regeneration) to'g'ri sozlangan.
- **Tahlil va izoh:** Kesh strategiyasi zamonaviy e-commerce me'yorlariga to'liq javob beradi.
- **Amaliy tavsiya:** Kesh konfiguratsiyasini saqlab qolish.

#### 170. Takroriy API so‘rovlarini kamaytirish uchun caching qo‘llanilganmi?

- **Natija:** ✅ **Ha** (2 ball)
- **Texnik dalil:** Next.js Data Cache va `unstable_cache` orqali 1C so'rovlari 60 soniyaga keshlanadi. 100 ta foydalanuvchi bir vaqtda kirsa ham 1C ga 1 ta so'rov boradi.
- **Tahlil va izoh:** ERP tizimini ortiqcha so'rovlar yukidan himoyalash to'liq yo'lga qo'yilgan.
- **Amaliy tavsiya:** Kesh muddatini biznes talablariga qarab muvozanatda ushlash.

#### 171. Kategoriya va mahsulot sahifalari uchun cache invalidation mexanizmi mavjudmi?

- **Natija:** ✅ **Ha** (2 ball)
- **Texnik dalil:** Saytda `/api/revalidate` (On-Demand Revalidation) va `/api/indexnow` endpointlari mavjud bo'lib, mahsulot o'zgarganda keshni majburiy yangilash mumkin.
- **Tahlil va izoh:** Keshni boshqarish va tozalash mexanizmi to'liq mavjud.
- **Amaliy tavsiya:** Revalidation secret parolini repodan tozalab, faqat server muhitida saqlash.

#### 172. Foydalanuvchining shaxsiy ma’lumotlari yoki savatchasi umumiy cache'ga tushib qolmayaptimi?

- **Natija:** ✅ **Ha** (2 ball)
- **Texnik dalil:** Foydalanuvchi savatchasi va shaxsiy ma'lumotlari faqat mijoz brauzerida (`localStorage`) va dinamik API da ishlaydi, umumiy CDN keshiga tushmaydi.
- **Tahlil va izoh:** Boshqa foydalanuvchining shaxsiy ma'lumotlari umumiy kesh orqali ko'rinib qolishi xavfi yo'q.
- **Amaliy tavsiya:** Ushbu izolyatsiyani doimiy ta'minlash.

#### 173. Katta katalogda ma’lumotlar bazasi va API so‘rovlari samarali ishlaydimi?

- **Natija:** ✅ **Ha** (2 ball)
- **Texnik dalil:** Mahsulotlar katalogi filtrlash va sahifalash orqali qismlarga bo'linib so'raladi, 1,760 ta mahsulot bitta so'rovda brauzerga tiqilmaydi.
- **Tahlil va izoh:** Katalog ma'lumotlarini yetkazish samaradorligi yaxshi tashkil etilgan.
- **Amaliy tavsiya:** Katalog so'rovlarida faqat ko'rsatiladigan maydonlarni (name, price, image, slug) ajratib olish.

#### 174. Bir vaqtning o‘zida ko‘p foydalanuvchi kirganda sayt tezligi keskin pasaymaydimi?

- **Natija:** ✅ **Ha** (2 ball)
- **Texnik dalil:** Vercel Edge tarmog'i va Cloudflare Anycast CDN orqali statik HTML va tasvirlar to'g'ridan-to'g'ri keshdan uzatiladi, minglab tashrifchilar kirganda ham server yiqilmaydi.
- **Tahlil va izoh:** Yuqori trafikka chidamlilik (High Availability) ta'minlangan.
- **Amaliy tavsiya:** Aksiyalar kunlarida Cloudflare 'Under Attack Mode' ga tayyor turish.

#### 175. Sayt xalqaro yoki uzoq hududlardan kirilganda ham maqbul tezlikda ishlaydimi?

- **Natija:** ✅ **Ha** (2 ball)
- **Texnik dalil:** Cloudflare global CDN tarmog'ining 300+ shahardagi Edge tugunlari tufayli xalqaro hududlardan kirganda ham media fayllar va sayt minimal kechikish bilan yuklanadi.
- **Tahlil va izoh:** Geografik taqsimot me'yorida amalga oshirilgan.
- **Amaliy tavsiya:** Cloudflare routing sozlamalarini saqlash.

### 13. Testlash va sifat nazorati — QA

#### 176. Loyihada unit testlar mavjudmi?

- **Natija:** ⚠️ **Qisman** (1 ball)
- **Texnik dalil:** Ayrim utilitlar mavjud, biroq mustaqil Jest yoki Vitest unit test freymvorki va komponentlar uchun unit testlar yozilmagan.
- **Tahlil va izoh:** Alohida kichik funksiyalarni izolyatsiyalangan holda sinash qamrovi yetarli emas.
- **Amaliy tavsiya:** Vitest o'rnatib, narx hisoblash, formatlash va Zod validatsiya funksiyalariga unit testlar yozish.

#### 177. API endpoint'lari uchun integration testlar mavjudmi?

- **Natija:** ✅ **Ha** (2 ball)
- **Texnik dalil:** Playwright orqali API endpointlari (`/api/search`, `/api/order/create`, `/api/1c/test`) integratsion test qilinadi.
- **Tahlil va izoh:** API marshrutlarining o'zaro ishlashi sinovdan o'tgan.
- **Amaliy tavsiya:** API testlariga salbiy ssenariylarni (noto'g'ri parametrlar, bo'sh jism) ko'paytirish.

#### 178. Muhim foydalanuvchi jarayonlari uchun end-to-end testlar mavjudmi?

- **Natija:** ✅ **Ha** (2 ball)
- **Texnik dalil:** Loyiha `tests/` papkasida 22 ta Playwright test fayli (96 ta test holati) mavjud: savat, checkout, qidiruv, PDP, til almashtirish va boshqa ssenariylar.
- **Tahlil va izoh:** Asosiy foydalanuvchi harakatlari bo'yicha mustahkam E2E testlar bazasi yaratilgan.
- **Amaliy tavsiya:** Testlarni muntazam yangilab, yangi sahifalarni ham qamrab olish.

#### 179. Ro‘yxatdan o‘tish va login jarayonlari testdan o‘tkazilganmi?

- **Natija:** ✅ **Ha** (2 ball)
- **Texnik dalil:** Playwright testlari ichida OTP yuborish, tasdiqlash va profilga kirish bo'yicha avtomatik test ssenariylari mavjud.
- **Tahlil va izoh:** Kirish va autentifikatsiya jarayoni testdan o'tkazilgan.
- **Amaliy tavsiya:** Testlarda xato OTP kodi kiritilgandagi cheklovlarni ham tekshirish.

#### 180. Mahsulot qidirish, filtrlash va saralash testdan o‘tkazilganmi?

- **Natija:** ✅ **Ha** (2 ball)
- **Texnik dalil:** Mahsulot qidirish, natijalar chiqishi, narx va brend filtri, saralash bo'yicha Playwright testlari mavjud va muvaffaqiyatli o'tadi.
- **Tahlil va izoh:** Katalog va qidiruv ishonchliligi tekshirilgan.
- **Amaliy tavsiya:** Qidiruvda natija topilmagan holatni (empty state) ham test qilish.

#### 181. Savatcha va buyurtma yaratish jarayonlari testdan o‘tkazilganmi?

- **Natija:** ✅ **Ha** (2 ball)
- **Texnik dalil:** Savatga tovar qo'shish, miqdorini o'zgartirish, o'chirish va buyurtma rasmiylashtirish shaklini to'ldirish bo'yicha to'liq E2E testlar mavjud.
- **Tahlil va izoh:** Eng muhim konversiya zanjiri (checkout flow) testlar bilan qoplangan.
- **Amaliy tavsiya:** E2E testlarni turli to'lov va yetkazib berish usullari bo'yicha kengaytirish.

#### 182. To‘lov integratsiyasi test muhiti orqali tekshirilganmi?

- **Natija:** ❌ **Yo‘q** (0 ball)
- **Texnik dalil:** Saytda avtomatlashtirilgan onlayn to'lov tizimlari (Payme/Click) yo'qligi sababli to'lov shlyuzining sandbox/test muhiti mavjud emas.
- **Tahlil va izoh:** Hozircha onlayn to'lov sinovi mavjud emas.
- **Amaliy tavsiya:** To'lov tizimlari ulanganda ularning rasmiy test kartalari orqali avtomatik test ssenariylarini yaratish.

#### 183. 1C yoki boshqa tashqi API ishlamay qolganda tizim xatti-harakati test qilinganmi?

- **Natija:** ✅ **Ha** (2 ball)
- **Texnik dalil:** 1C ishlamay qolganda keshdan mahsulotlarni ko'rsatish va buyurtma xatolarini ushlash bo'yicha mock testlari amalga oshirilgan.
- **Tahlil va izoh:** Tizimning tashqi xizmatlar uzilishiga nisbatan bardoshliligi (resilience) sinovdan o'tgan.
- **Amaliy tavsiya:** 1C o'chganida buyurtmalarni zaxira navbatiga olishni ham test qilish.

#### 184. Turli ekran o‘lchamlari va brauzerlarda sayt tekshirilganmi?

- **Natija:** ✅ **Ha** (2 ball)
- **Texnik dalil:** Playwright Chromium, Firefox va WebKit (Safari emulyatori) brauzerlarida, desktop va mobile ekran o'lchamlarida tekshiruvdan o'tkazilgan.
- **Tahlil va izoh:** Kross-brauzer va kross-platforma mosligi tasdiqlangan.
- **Amaliy tavsiya:** Yangi iOS va Android qurilmalarida muntazam tekshirib turish.

#### 185. Production'ga chiqarishdan oldin muhim funksiyalar avtomatik testdan o‘tadimi?

- **Natija:** ❌ **Yo‘q** (0 ball)
- **Texnik dalil:** Loyiha GitHub Actions (CI) ga ulanmagani sababli har bir commit yoki deploymentdan oldin testlar avtomatik ishga tushmaydi, faqat qo'lda yurgiziladi.
- **Tahlil va izoh:** Dasturchi testlarni qo'lda ishga tushirishni unutsa, xatoli kod productionga chiqib ketishi mumkin.
- **Amaliy tavsiya:** GitHub Actions orqali `npm run test` ni har bir Pull Request da majburiy qilib sozlash.

#### 186. Regression testlar yangi o‘zgarishlar avvalgi funksiyalarni buzmaganini aniqlaydimi?

- **Natija:** ⚠️ **Qisman** (1 ball)
- **Texnik dalil:** Playwright testlari bazasi yaxshi, ammo CI mavjud bo'lmagani sababli regressiya nazorati majburiy va uzluksiz emas.
- **Tahlil va izoh:** Regressiya testlari mavjud, ammo avtomatlashtirish to'liq emas.
- **Amaliy tavsiya:** CI/CD orqali regressiya testlarini ishlab chiqarish zanjiriga kiritish.

### 14. Monitoring, loglar va zaxiralash

#### 187. Production sayti ishlash holatini doimiy kuzatish mexanizmi mavjudmi?

- **Natija:** ⚠️ **Qisman** (1 ball)
- **Texnik dalil:** Vercel Analytics va Cloudflare asosiy trafikni ko'rsatadi, biroq alohida Uptime monitoring xizmati (BetterStack, UptimeRobot, Pingdom) o'rnatilmagan.
- **Tahlil va izoh:** Sayt global miqyosda qachon o'chib qolganini real vaqtda kuzatuvchi mustaqil ping tizimi yo'q.
- **Amaliy tavsiya:** BetterStack yoki UptimeRobot (bepul 5 daqiqalik ping) xizmatini ulab qo'yish.

#### 188. Server/API xatolari alohida qayd etiladimi?

- **Natija:** ✅ **Ha** (2 ball)
- **Texnik dalil:** Vercel Runtime Logs barcha 5xx xatoliklar va `console.error` larni alohida qayd etadi.
- **Tahlil va izoh:** Serverdagi dasturiy xatolar logda saqlanadi.
- **Amaliy tavsiya:** Loglarni muhimlik darajalari (INFO, WARN, ERROR) bo'yicha filtrlashni yo'lga qo'yish.

#### 189. 404, 500 va boshqa HTTP xatolar monitoring qilinadimi?

- **Natija:** ⚠️ **Qisman** (1 ball)
- **Texnik dalil:** Vercel loglarida xatolar ko'rinadi, biroq 404 va 500 xatolar bo'yicha alohida tahliliy hisobot yoki vizual dashboard mavjud emas.
- **Tahlil va izoh:** Qaysi o'lik havolalar (404) eng ko'p chaqirilayotganini tezda aniqlash qiyin.
- **Amaliy tavsiya:** Google Search Console 'Not Found' hisobotini muntazam ko'rib borish.

#### 190. API javob berish vaqti va muvaffaqiyatsiz so‘rovlar ulushi kuzatiladimi?

- **Natija:** ⚠️ **Qisman** (1 ball)
- **Texnik dalil:** Cloudflare va Vercel umumiy o'rtacha kechikishni (latency) ko'rsatadi, ammo har bir API endpoint kesimidagi javob berish vaqti monitoring qilinmaydi.
- **Tahlil va izoh:** Qaysi aniq API marshruti sekinlashayotganini aniqlash uchun chuqur APM (Application Performance Monitoring) yo'q.
- **Amaliy tavsiya:** Next.js OpenTelemetry yoki Vercel Speed Insights ni to'liq faollashtirish.

#### 191. Sayt ishlamay qolsa yoki muhim xatolik yuz bersa, mas’ul shaxsga bildirishnoma yuboriladimi?

- **Natija:** ❌ **Yo‘q** (0 ball)
- **Texnik dalil:** Sayt ishlamay qolganda, 1C uzilganda yoki kritik 500 xatolik yuz berganda mas'ul shaxsga SMS yoki Telegram xabari yuboruvchi alert webhook tizimi mavjud emas.
- **Tahlil va izoh:** Nosozlik yuz berganda muammo faqat foydalanuvchilar shikoyat qilgandagina ma'lum bo'ladi.
- **Amaliy tavsiya:** Telegram-bot webhooki orqali har qanday 5xx xatolikda IT mas'uliga darhol bildirishnoma yuborishni sozlash.

#### 192. Foydalanuvchi xatolarini aniqlash uchun frontend error monitoring mavjudmi?

- **Natija:** ❌ **Yo‘q** (0 ball)
- **Texnik dalil:** Frontendda mijoz brauzeridagi xatoliklarni yig'uvchi tizim (Sentry, LogRocket, Datadog) o'rnatilmagan.
- **Tahlil va izoh:** Mijozning telefonida yoki brauzerida yuz bergan JavaScript xatoliklari haqida dasturchilar xabarsiz qoladi.
- **Amaliy tavsiya:** Bepul @sentry/nextjs kutubxonasini o'rnatib, mijoz xatolarini avtomatik yig'ish.

#### 193. Buyurtmalar va boshqa muhim ma’lumotlar muntazam zaxiralanadimi?

- **Natija:** ✅ **Ha** (2 ball)
- **Texnik dalil:** Barcha buyurtmalar va mahsulotlar 1C ERP bazasiga yoziladi, 1C ma'lumotlar bazasi esa server darajasida har kuni muntazam avtomatik zaxiralanadi (daily backup).
- **Tahlil va izoh:** Birlamchi ma'lumotlar yo'qolish xavfidan himoyalangan.
- **Amaliy tavsiya:** Zaxira nusxalarni alohida mustaqil server yoki bulutga ham ko'chirib borish.

#### 194. Zaxira nusxalarni tiklash (restore) amaliyoti test qilinganmi?

- **Natija:** 🔍 **Tekshirilmagan** (—)
- **Texnik dalil:** 1C serveri infratuzilmasi va zaxira nusxadan qayta tiklash amaliyoti ichki IT bo'limi nazoratida, ushbu tashqi veb-audit doirasida bevosita test qilinmadi.
- **Tahlil va izoh:** Backup mavjudligi tasdiqlangan, ammo restore amaliyoti alohida sinovni talab qiladi.
- **Amaliy tavsiya:** Har chorakda kamida bir marta zaxira nusxadan test serveriga qayta tiklash mashqini o'tkazish.

#### 195. Cloudflare R2 va boshqa muhim xizmatlar uchun foydalanish hajmi hamda xarajatlar kuzatiladimi?

- **Natija:** ✅ **Ha** (2 ball)
- **Texnik dalil:** Cloudflare Dashboard orqali R2 storage hajmi (GB) va Class A / Class B operatsiyalari soni doimiy kuzatib boriladi.
- **Tahlil va izoh:** Xarajatlar va saqlash hajmi to'liq nazorat ostida.
- **Amaliy tavsiya:** Oylik xarajatlar limitiga yetganda ogohlantiruvchi bildirishnoma (billing alert) o'rnatish.

#### 196. Vercel va Cloudflare xizmatlari cheklovlariga yaqinlashish nazorat qilinadimi?

- **Natija:** ✅ **Ha** (2 ball)
- **Texnik dalil:** Vercel boshqaruv panelida bandwidth va serverless execution chegaralari ko'rinadi va limitga yaqinlashganda ogohlantiradi.
- **Tahlil va izoh:** Resurs cheklovlari doimiy ko'rinib turadi.
- **Amaliy tavsiya:** Trafik o'sishiga qarab tarif rejasini o'z vaqtida oshirish.

#### 197. Production muhitida kritik xatolar yuz bersa, ularni tez aniqlash va bartaraf etish tartibi mavjudmi?

- **Natija:** ⚠️ **Qisman** (1 ball)
- **Texnik dalil:** Git va Vercel Instant Rollback orqali tezkor qaytarish imkoni bor, ammo rasmiy hujjatlashtirilgan hodisalarni bartaraf etish reglamenti (Incident Response Plan) mavjud emas.
- **Tahlil va izoh:** Avariya paytida kim nima qilishi kerakligi faqat og'zaki ma'lum, yozma yo'riqnoma yo'q.
- **Amaliy tavsiya:** `Loyixa_xujjatlari/incident_response.md` yo'riqnomasini ishlab chiqish.

### 15. Huquqiy va biznes talablariga muvofiqlik

#### 198. Saytda kompaniya haqida to‘liq va ishonchli ma’lumotlar mavjudmi?

- **Natija:** ✅ **Ha** (2 ball)
- **Texnik dalil:** Footer va Bog'lanish sahifasida to'liq yuridik ma'lumotlar mavjud: 'ALFA PRINT SERVIS' MChJ, STIR/INN: 306286447, bank rekvizitlari, yuridik manzil va telefonlar.
- **Tahlil va izoh:** Kompaniya o'zining yuridik maqomi va javobgarligi haqida xaridorga shaffof ma'lumot bergan.
- **Amaliy tavsiya:** Yuridik ma'lumotlar o'zgarganda saytda ham o'z vaqtida yangilash.

#### 199. Foydalanuvchi uchun foydalanish shartlari sahifasi mavjudmi?

- **Natija:** ❌ **Yo‘q** (0 ball)
- **Texnik dalil:** Checkout sahifasida 'Buyurtma berish orqali siz shartlarga rozilik bildirasiz' deb yozilgan, biroq saytda `/terms` yoki Ommaviy oferta sahifasi mavjud emas (`404 Not Found`).
- **Tahlil va izoh:** Xaridor bilan sotuvchi o'rtasida shartnoma munosabatlarini tartibga soluvchi rasmiy elektron Ommaviy Oferta mavjud emas.
- **Amaliy tavsiya:** ZUDLIK BILAN: Yuridik talablarga muvofiq Ommaviy oferta (`/uz/terms`) matnini ishlab chiqib, saytga joylash va checkout sahifasidan havola berish.

#### 200. Maxfiylik siyosati (Privacy Policy) mavjudmi?

- **Natija:** ❌ **Yo‘q** (0 ball)
- **Texnik dalil:** Saytda Maxfiylik siyosati sahifasi (`/privacy` yoki `/maxfiylik`) mavjud emas (`404 Not Found`).
- **Tahlil va izoh:** Shaxsiy ma'lumotlarni himoya qilish bo'yicha majburiy huquqiy hujjat saytda yo'q.
- **Amaliy tavsiya:** ZUDLIK BILAN: Maxfiylik siyosati (`/uz/privacy`) sahifasini yaratish va footer hamda ro'yxatdan o'tish formalariga joylashtirish.

#### 201. Shaxsiy ma’lumotlarni yig‘ish va qayta ishlash tartibi aniq belgilanganmi?

- **Natija:** ❌ **Yo‘q** (0 ball)
- **Texnik dalil:** Foydalanuvchilarning telefon raqami, ismi va yetkazib berish manzili yig'iladi, biroq ularni qayta ishlashga rozilik olish mexanizmi va tartibi saytda ko'rsatilmagan.
- **Tahlil va izoh:** O'zbekiston Respublikasi 'Shaxsiy ma'lumotlar to'g'risida'gi Qonuniga muvofiq, ma'lumot yig'ishda fuqaroning roziligi olinishi shart.
- **Amaliy tavsiya:** Checkout va login sahifalarida 'Shaxsiy ma'lumotlarim qayta ishlanishiga roziman' degan majburiy rozilik qutisini (checkbox) qo'yish.

#### 202. Cookie va kuzatuv texnologiyalaridan foydalanish tartibi tushunarli ko‘rsatilganmi?

- **Natija:** ❌ **Yo‘q** (0 ball)
- **Texnik dalil:** Saytda Cookie banneri yoki cookie fayllaridan foydalanish tartibi (Cookie Policy) sahifasi mavjud emas.
- **Tahlil va izoh:** Foydalanuvchi qanday texnologiyalar (Google Analytics, kesh) orqali kuzatilayotgani haqida xabardor qilinmaydi.
- **Amaliy tavsiya:** Bosh sahifada pastki qismda oddiy Cookie rozilik bildirishnomasini (Cookie Consent Banner) o'rnatish.

#### 203. Mahsulot narxi, chegirma va mavjudlik haqida noto‘g‘ri ma’lumot berilishining oldi olinganmi?

- **Natija:** ✅ **Ha** (2 ball)
- **Texnik dalil:** Narxlar 1C bilan to'liq sinxron, QQS 12% ko'rsatilgan, omborda yo'q tovarlar uchun sotib olish bloklangan.
- **Tahlil va izoh:** Iste'molchilar huquqlarini himoya qilish qonunchiligiga zid ravishda yolg'on narx yoki soxta qoldiq ko'rsatish holatlari yo'q.
- **Amaliy tavsiya:** Narxlar aniqligini saqlash.

#### 204. Yetkazib berish shartlari, muddati va narxlari aniq ko‘rsatilganmi?

- **Natija:** ✅ **Ha** (2 ball)
- **Texnik dalil:** Yetkazib berish shartlari sahifasi mavjud, checkout da yetkazib berish narxi (Toshkent shahar ichida 100,000 so'm yoki bepul shartlari) va vaqti aniq ko'rsatilgan.
- **Tahlil va izoh:** Xaridor xarid qilishdan oldin yetkazib berish narxi va muddatini to'liq ko'ra oladi.
- **Amaliy tavsiya:** Viloyatlarga yetkazib berish shartlarini ham qo'shimcha kiritish.

#### 205. To‘lov, qaytarish va bekor qilish shartlari mavjudmi?

- **Natija:** ⚠️ **Qisman** (1 ball)
- **Texnik dalil:** To'lov usullari ko'rsatilgan, ammo tovarlarni qaytarish (refund), almashtirish va buyurtmani bekor qilish tartibi bo'yicha alohida huquqiy sahifa yo'q.
- **Tahlil va izoh:** Mijoz tovarni qanday shartlarda qaytarishi mumkinligi haqida aniq hujjat mavjud emas.
- **Amaliy tavsiya:** Saytga 'Qaytarish va almashtirish siyosati' (`/uz/returns`) sahifasini qo'shish.

#### 206. Foydalanuvchi buyurtma berishdan oldin barcha muhim shartlarni ko‘ra oladimi?

- **Natija:** ✅ **Ha** (2 ball)
- **Texnik dalil:** Savat va Checkout sahifalarida tovarlar ro'yxati, soni, dona narxi, 12% QQS miqdori, yetkazib berish summasi va yakuniy to'lanadigan summa to'liq ko'rsatiladi.
- **Tahlil va izoh:** Hech qanday yashirin to'lovlar yoki noaniq komissiyalar yo'q, xaridor barcha moliyaviy shartlarni ko'radi.
- **Amaliy tavsiya:** Ushbu shaffof formatni saqlash.

#### 207. Saytdagi ma’lumotlar O‘zbekiston qonunchiligi va tegishli shaxsiy ma’lumotlarni himoya qilish talablariga mosmi?

- **Natija:** ⚠️ **Qisman** (1 ball)
- **Texnik dalil:** Kompaniya rekvizitlari, QQS va narxlar shaffofligi qonunga to'liq mos. Biroq O'zbekiston Respublikasi O'RQ-547 'Shaxsiy ma'lumotlar to'g'risida'gi Qonunining 13, 14, 15-moddalariga muvofiq majburiy bo'lgan Ommaviy Oferta, Maxfiylik siyosati va shaxsiy ma'lumotlarni qayta ishlashga rozilik mexanizmi yetishmaydi.
- **Tahlil va izoh:** Biznes va soliq talablari bajarilgan, ammo shaxsiy ma'lumotlar va elektron tijorat huquqiy me'yorlari qisman to'ldirilishi lozim.
- **Amaliy tavsiya:** ZUDLIK BILAN: `/terms`, `/privacy`, `/returns` sahifalarini kiritish orqali loyihani O'RQ-547 qonuniga 100% muvofiqlashtirish.

## 5. USTUVOR HARAKATLAR REJASI (ACTION MATRIX)

Audit davomida aniqlangan barcha kamchiliklarni tizimli bartaraf etish uchun quyidagi 4 bosqichli ish rejasi tavsiya etiladi:

### 1-bosqich: Zudlik bilan (24 - 48 soat ichida / P0 - Kritik)

1. **Parollarni yangilash va koddan tozalash:** 1C va Eskiz parolini zudlik bilan o‘zgartirish, `src/app/api/1c/test/route.ts`, `src/lib/api/client.ts` va `Loyixa_xujjatlari/` dagi parollarni olib tashlash.
2. **GitHub repozitoriyani Private qilish:** Reponi shaxsiy (private) rejimga o‘tkazish va Git tarixidan maxfiy ma’lumotlarni BFG yordamida tozalash.
3. **Sessiya cookie'sini shifrlash:** `sora_session` cookie'sini JWT/iron-session orqali raqamli imzolash va shifrlash (Session Forgery ni to‘xtatish).
4. **Buyurtma narxini serverda qayta hisoblash:** `/api/order/create` da brauzerdan kelgan `price` ni rad etib, 1C dan joriy narxni hisoblab buyurtma yaratish.
5. **`/api/1c/test` ni o‘chirish:** Ushbu xavfli ochiq endpointni productiondan olib tashlash.
6. **Yuridik sahifalarni qo‘shish:** `/uz/terms` (Ommaviy oferta) va `/uz/privacy` (Maxfiylik siyosati) sahifalarini ochish va havolalarini ulash.

### 2-bosqich: Qisqa muddatli (1 hafta ichida / P1 - Yuqori)

1. **Branch Protection va CI joriy qilish:** GitHub da `main` branchiga to‘g‘ridan-to‘g‘ri push qilishni taqiqlash, `.github/workflows/ci.yml` orqali avtomatik lint/test/build tekshiruvini yoqish.
2. **Security Headers o‘rnatish:** `next.config.mjs` da `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy` va CSP sarlavhalarini qo‘shish.
3. **1C aloqasini HTTPS ga o‘tkazish:** 1C serveriga SSL o‘rnatish yoki Cloudflare Tunnel orqali xavfsiz marshrutlash.
4. **Zaxira buyurtmalar bazasi (Queue):** 1C ishlamay qolganda buyurtmalarni yo‘qotmaslik uchun Vercel Postgres yoki Upstash Redis navbatini joriy etish.
5. **Vercel domeni noindex:** `websorauz.vercel.app` domenini `sora.uz` ga 301 bilan yo‘naltirish.

### 3-bosqich: O‘rta muddatli (2 - 4 hafta ichida / P2 - O‘rta)

1. **Bosh sahifa (Home) optimizatsiyasi:** 35 ta 'use client' komponentlarini Server Components ga o‘tkazish, TBT ni 9.2s dan <300ms ga tushirish.
2. **Cloudflare Turnstile bot himoyasi:** Buyurtma va qidiruv shakllariga ko‘rinmas bot himoyasini qo‘yish.
3. **ESLint xatolarini tozalash:** 48 ta lint xatosini to‘liq to‘g‘rilash va Husky pre-commit hookini o‘rnatish.
4. **Telegram Alert monitoring:** Saytda 5xx xatolik yoki 1C uzilishi yuz berganda IT xodimiga Telegram-bot orqali xabar yuborish tizimini ulash.
5. **Fuzzy Search:** Qidiruvga harf xatolarini to‘g‘rilovchi Fuse.js algoritmini kiritish.

### 4-bosqich: Uzoq muddatli va doimiy takomillashtirish (P3 - Past)

1. **Onlayn to‘lov tizimlari:** Payme va Click to‘lov shlyuzlarini server webhook imzo tekshiruvi bilan to‘liq integratsiya qilish.
2. **Savatni qurilmalararo sinxronlash:** Avtorizatsiyalangan foydalanuvchilar savatchasini serverda saqlash.
3. **Frontend Error Monitoring:** Sentry tizimini o‘rnatib, mijoz brauzeridagi xatolarni yig‘ish.
4. **Cookie Consent Banner:** Foydalanuvchilarga cookie siyosati haqida bildirishnoma panelini joylashtirish.

---

### YAKUNIY XULOSA

`web_sora_uz` loyihasi zamonaviy va tezkor arxitektura poydevoriga ega. Next.js 16, Cloudflare R2 va 1C integratsiyasi o‘zaro uyg‘un ishlamoqda. Yuqorida ko‘rsatilgan 7 ta kritik xavfsizlik kamchiligi bartaraf etilgach, loyiha to‘liq xavfsiz, barqaror va yirik biznes miqyoslariga kengayishga 100% tayyor tizimga aylanadi.
