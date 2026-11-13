# A — FOYDALANUVCHI ISHTIROKISIZ, FAQAT KOD ORQALI HAL QILINADIGAN ISHLAR RO‘YXATI

> **Manba:** [`audit_natija.md`](file:///D:/web_sora_uz/Loyixa_xujjatlari/audit_natija.md) asosida tuzildi  
> **Maqsad:** Loyiha egasining shaxsiy ruxsati, tashqi akkaunt ochish, 1C server sozlamalari yoki yuridik qarorlarni kutmasdan — bevosita loyiha manba kodi (`src/`, `next.config.ts`, `tests/`, `.github/`) darajasida mustaqil hal qilinadigan texnik vazifalar ro‘yxati.  
> **Sana:** 12-noyabr, 2026-yil  

---

## Umumiy tamoyil

Ushbu faylda **faqat dasturchi / AI tomonidan kod yozish va konfiguratsiya o‘zgartirish orqali hal qilinadigan** muammolar jamlangan.  
Ba’zi xavfsizlik bandlari (masalan, sessiyani shifrlash yoki Sentry integratsiyasi) ikki qismdan iborat: **kod qismini** bu yerda mustaqil yozib tayyorlash mumkin, **tashqi kalit/parolni** esa [`b_audit_natijasi.md`](file:///D:/web_sora_uz/Loyixa_xujjatlari/b_audit_natijasi.md) bo‘yicha foydalanuvchi taqdim etadi — bunday bandlar alohida belgilab qo‘yilgan.

---

## 🔴 1-BOSQICH: ZUDLIK BILAN BAJARILADIGAN KOD XAVFSIZLIGI VA BUYURTMA YAXLITLIGI (P0 — Kritik)

### A1. Buyurtma narxini va ombor qoldig‘ini serverda qayta tekshirish (`#31`, `#101`, `#127`, `#128`)
- **Muammo:** [`src/app/api/order/create/route.ts`](file:///d:/web_sora_uz/src/app/api/order/create/route.ts) da mijoz brauzeridan kelgan `items[].price` qiymati tekshiruvsiz qabul qilinadi (Price Tampering xavfi), shuningdek buyurtma yuborish lahzasida ombor qoldig‘i serverda qayta tekshirilmaydi.
- **Kodda qilinadigan ish:**
  1. `POST /api/order/create` ichida mijoz yuborgan narxlarga ishonmasdan, `client.ts` orqali 1C `/price` ma’lumotlaridan har bir tovar kodi bo‘yicha haqiqiy joriy narx va qoldiqni olish.
  2. Serverda umumiy summani (`total`, QQS 12%, yetkazib berish narxi) qayta hisoblash.
  3. Agar narx o‘zgargan bo‘lsa yoki omborda tovar qolmagan bo‘lsa, buyurtmani yaratmasdan `409 Conflict` / `400 Bad Request` bilan aniq JSON ogohlantirish qaytarish.
  4. Kiruvchi maydonlarni qat’iy `zod` sxemasi bilan validatsiya qilish.

### A2. 1C xato berganda soxta buyurtma raqamini qaytarishni to‘xtatish (`#118` — kod qismi)
- **Muammo:** 1C API xato berganda yoki javob bermaganda [`src/lib/api/client.ts`](file:///d:/web_sora_uz/src/lib/api/client.ts) soxta fallback buyurtma raqami (`РТ-XXXXXX`) yaratib xaridorga «Muvaffaqiyatli qabul qilindi» deb qaytaradi, ammo buyurtma hech qayerga saqlanmay yo‘qolib ketadi (Silent Order Loss).
- **Kodda qilinadigan ish:**
  1. Soxta `РТ-XXXXXX` fallback javobini olib tashlash.
  2. 1C bilan aloqa uzilganda (agar tashqi Redis/DB navbati ulanmagan bo‘lsa) foydalanuvchiga soxta muvaffaqiyat o‘rniga `503 Service Unavailable` qaytarib, UI da qayta urinish yoki operator bilan bog‘lanish imkonini ko‘rsatish.
  3. Kelgusida B-ro‘yxatda Redis/Postgres qo‘shilishi bilan ulanishga tayyor `OrderQueueAdapter` interfeysini kodda tayyorlab qo‘yish.

### A3. `/api/1c/test` ommaviy endpointini yopish (`#40`, `#102`, `#108`)
- **Muammo:** [`src/app/api/1c/test/route.ts`](file:///d:/web_sora_uz/src/app/api/1c/test/route.ts) hech qanday autentifikatsiyasiz `https://sora.uz/api/1c/test` manzilida ochiq turibdi va 1C serverining ichki URL/porti hamda hardcoded Basic Auth ma’lumotlarini ishlatadi.
- **Kodda qilinadigan ish:**
  - Ushbu faylni butunlay o‘chirish (yoki `process.env.NODE_ENV === "production"` da `404` qaytaradigan qilib, `CRON_SECRET` Bearer tekshiruvi bilan yopish) hamda ichki IP/URL ma’lumotlarini javobdan olib tashlash.

### A4. Maxfiy kalitlarni va hardcoded parollarni manba kodidan tozalash (`#20`, `#21`, `#23` — kod qismi)
- **Muammo:** Kod va hujjatlarda 1C Basic Auth (`web_user:977540910`), revalidate paroli (`sora_revalidate_secret_2026`) va Eskiz SMS jonli paroli ochiq fallback sifatida yozilgan.
- **Kodda qilinadigan ish:**
  1. [`src/lib/api/client.ts`](file:///d:/web_sora_uz/src/lib/api/client.ts), [`src/app/api/1c/test/route.ts`](file:///d:/web_sora_uz/src/app/api/1c/test/route.ts), [`src/app/api/revalidate/route.ts`](file:///d:/web_sora_uz/src/app/api/revalidate/route.ts), [`src/app/api/indexnow/route.ts`](file:///d:/web_sora_uz/src/app/api/indexnow/route.ts) dan barcha hardcoded fallback parol va loginlarni olib tashlab, qat’iy `process.env.*` talabiga o‘tkazish.
  2. `Loyixa_xujjatlari/` ichidagi eski hujjatlarda (masalan, [`plan_sms_otp.md`](file:///d:/web_sora_uz/Loyixa_xujjatlari/Api/user_api/OTP/plan_sms_otp.md), `Api basic auth.txt`) qolib ketgan haqiqiy parollarni `<REDACTED>` ga almashtirish.
  3. `.gitignore` faylini kuchaytirish (`*.secret.*`, `*.pem`, `*.key`, `*password*`, `scratch/` kabi qoidalarni qo‘shish).
  - *Izoh:* Haqiqiy parollarni almashtirish va Git tarixini tozalash B-ro‘yxatda bajariladi.

### A5. `sora_session` cookie-ni kriptografik imzolash va shifrlash (`#26`, `#27`, `#29`, `#41`, `#102` — kod qismi)
- **Muammo:** [`src/app/api/auth/otp/verify/route.ts`](file:///d:/web_sora_uz/src/app/api/auth/otp/verify/route.ts), `login/route.ts`, `complete/route.ts` va `me/route.ts` da `sora_session` cookie oddiy imzolanmagan JSON sifatida saqlanadi (Session Forgery).
- **Kodda qilinadigan ish:**
  1. `jose` (yoki Node.js o‘rnatilgan `crypto` HMAC-SHA256 + AES-256-GCM) yordamida umumiy `src/lib/auth/session.ts` modulini yozish.
  2. `createSessionCookie(user)` va `verifySessionCookie(cookieValue)` funksiyalarini yaratib, barcha auth endpointlarni (`login`, `register`, `otp/verify`, `otp/complete`, `me`) shu modulga o‘tkazish.
  3. `process.env.SESSION_SECRET` mavjud bo‘lmasa productionda xato beradigan qilib sozlash.
  - *Izoh:* Production Vercel muhitiga `SESSION_SECRET` o‘zgaruvchisini kiritish B-ro‘yxatda bajariladi.

---

## 🟠 2-BOSQICH: XAVFSIZLIK SARLAVHALARI, SEO HIMOYA VA API BARQARORLIGI (P1 — Yuqori)

### A6. [BAJARILDI ✅] Security Headers (`CSP`, `X-Frame-Options`, `X-Content-Type-Options`) qo‘shish (`#39`)
- **Holati:** ✅ **To‘liq bajarildi va testdan o‘tkazildi** (13-noyabr, 2026-yil).
- **Qilingan o‘zgarish:** [`next.config.ts`](file:///d:/web_sora_uz/next.config.ts) faylida barcha yo‘llar (`/:path*`) uchun global xavfsizlik sarlavhalari kiritildi:
  - `X-Frame-Options: DENY` (Clickjacking dan to‘liq himoya);
  - `X-Content-Type-Options: nosniff` (MIME-sniffing hujumlaridan himoya);
  - `Referrer-Policy: strict-origin-when-cross-origin` (Foydalanuvchi ma’lumotlari sizib chiqishini to‘xtatish);
  - `Permissions-Policy: camera=(), microphone=(), geolocation=(self)` (Ruxsatsiz qurilma sensorlaridan himoya);
  - `X-DNS-Prefetch-Control: on` (Xavfsiz DNS prefetch);
  - `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload` (Qat’iy HTTPS himoyasi);
  - `Content-Security-Policy`: Saytda ishlatilayotgan barcha manbalar (`sora.uz`, `cdn.sora.uz`, Cloudinary, ImgBB, Google Tag Manager/GA4, Yandex Metrika, Vercel Analytics/Speed Insights, OpenStreetMap/ArcGIS xaritalari, Leaflet) to‘liq hisobga olingan holda 100% zararsiz va qat’iy CSP joriy etildi. Hech qanday funksionallik buzilmasdan, build muvaffaqiyatli yakunlandi.
- **Dastlabki muammo:** [`next.config.ts`](file:///d:/web_sora_uz/next.config.ts) da faqat `Cache-Control` sarlavhalari bor edi, HTTP xavfsizlik sarlavhalari yo‘q edi.

### A7. `*.vercel.app` texnik domenlarini indekslanishdan himoyalash (`#46`, `#149` — kod qismi)
- **Muammo:** `websorauz.vercel.app` HTTP 200 OK beradi va `X-Robots-Tag: noindex` sarlavhasi yo‘q.
- **Kodda qilinadigan ish:**
  - [`src/proxy.ts`](file:///d:/web_sora_uz/src/proxy.ts) ichida `request.headers.get("host")` ni tekshirib, agar host `.vercel.app` bilan tugasa, javobga `X-Robots-Tag: noindex, nofollow` sarlavhasini qo‘shish (yoki asosiy `https://sora.uz` domeniga yo‘naltirish).

### A8. 1C API so‘rovlariga Retry + Exponential Backoff qo‘shish (`#104`)
- **Muammo:** [`src/lib/api/client.ts`](file:///d:/web_sora_uz/src/lib/api/client.ts) da vaqtinchalik tarmoq uzilishida (502/504/timeout) so‘rov qayta urinilmasdan darhol xato beradi.
- **Kodda qilinadigan ish:**
  - Faqat o‘qish (`GET`) va xavfsiz idempotent so‘rovlar uchun 2-3 martagacha eksponentsial kutish (masalan, 400ms -> 1200ms) bilan qayta urinish helperini qo‘shish (`POST /order` ga avtomatik retry qo‘ymaslik yoki faqat idempotency key bilan cheklash).

### A9. Kod darajasidagi Rate Limiting va Idempotency himoyasi (`#35`, `#105`, `#119`, `#132` — kod qismi)
- **Muammo:** `/api/search/suggestions` va `/api/order/create` da so‘rovlar cheklovi va buyurtma dublikatidan backend himoyasi yo‘q.
- **Kodda qilinadigan ish:**
  1. `/api/auth/otp/send` dagi kabi umumiy in-memory sliding-window rate limiter utilitini (`/api/search/suggestions`, `/api/order/create`, `/api/auth/login`) uchun ham ulash (eslatma: serverless muhitda bu bitta instance doirasida ishlaydi, global himoya uchun B-ro‘yxatda Cloudflare WAF kerak).
  2. Checkout formasida har bir savat sessiyasi uchun `crypto.randomUUID()` ko‘rinishida `idempotencyKey` generatsiya qilish va `/api/order/create` da qisqa muddatli dublikat so‘rovlarni (masalan, 60 soniya ichida bir xil telefon + bir xil mahsulotlar + bir xil key) bloklash.

### A10. Takroriy mahsulot sluglarining oldini olish (`#93`)
- **Muammo:** Katalog auditida 3 ta mahsulotda bir xil slug aniqlandi.
- **Kodda qilinadigan ish:**
  - `src/lib/` dagi slug generatsiya qiluvchi funksiyada (yoki mahsulotlar ro‘yxatini normalizatsiya qilish joyida) to‘qnashuv aniqlansa, avtomatik ravishda mahsulotning noyob `kod` ini qo‘shimcha sifatida biriktirish (`slug-${kod.toLowerCase()}`).

### A11. GitHub Actions CI va Husky + ESLint tozalanishi (`#8`, `#15`, `#16`, `#19`, `#185`, `#186`)
- **Muammo:** `.github/workflows/` yo‘q; ESLint da 48 ta xato va 34 ta ogohlantirish mavjud; `npm audit` da zaifliklar bor; pre-commit hook yo‘q.
- **Kodda qilinadigan ish:**
  1. `.github/workflows/ci.yml` faylini yaratish: har bir `push` va `pull_request` da `npm ci`, `npx tsc --noEmit`, `npm run lint`, `npm run build` va Playwright E2E testlarini (mock/smoke rejimi) ishga tushirish.
  2. Kod bazasidagi 48 ta ESLint xatosini (28 ta `no-unused-vars`, 20 ta `react-hooks/set-state-in-effect`) va `no-explicit-any` joylarini tozalash.
  3. `husky` + `lint-staged` o‘rnatib, har bir commit oldidan lint/typecheck avtomatik tekshiruvini sozlash.
  4. `npm audit fix` bilan xavfsiz dependency yangilanishlarini bajarish va `build` + Playwright testlari buzilmaganini tekshirish.
  5. `package.json` ga `"typecheck": "tsc --noEmit"` skriptini qo‘shish.

---

## 🟡 3-BOSQICH: TEZLIK (PERFORMANCE), QIDIRUV VA UI/UX YAXSHILANISHI (P2 — O‘rta)

### A12. Bosh sahifa (Home) Tezligi va Server Components optimizatsiyasi (`#7`, `#96`, `#161`, `#162`, `#163`, `#167`, `#168`)
- **Muammo:** Bosh sahifada 35 ta `'use client'` komponenti ishlatilgan, butun katalog massivi brauzerga uzatilmoqda, natijada mobil Lighthouse balli **60/100**, TBT **~9,240 ms**, DOM elementlar **2,821 ta**.
- **Kodda qilinadigan ish:**
  1. `src/app/[locale]/page.tsx` va `src/components/home/` bloklarini tahlil qilib, statik ko‘rinadigan qismlarni (sarlavhalar, kategoriya kartalari, mahsulot kartalari markupini) Server Components ga o‘tkazish.
  2. Client komponentlarga uzatilayotgan mahsulot obyektlaridan faqat ko‘rsatiladigan minimal maydonlarni (`id`, `kod`, `name`, `slug`, `price`, `image`, `stock`, `unit`) ajratib uzatish (payload ni keskin kamaytirish).
  3. Bosh sahifadagi karusel va slayderlarda dastlabki ko‘rinadigan tovarlar sonini cheklash.
  4. Hero banner birinchi rasmiga `priority={true}` va `fetchPriority="high"` berish (LCP ni yaxshilash).
  5. `lucide-react` va boshqa kutubxonalar importini optimallashtirish (`next.config.ts` da `experimental.optimizePackageImports: ["lucide-react"]`).

### A13. Qidiruv tizimiga Fuzzy Search (xato yozuvlarni tushunish) qo‘shish (`#78`)
- **Muammo:** Foydalanuvchi mahsulot nomini 1-2 harf xato yoki lotin/kirill aralash yozsa, qidiruv natija topa olmaydi.
- **Kodda qilinadigan ish:**
  - `fuse.js` (yoki yengil Levenshtein / transliteratsiya normalizatori) o‘rnatib, `/api/search/suggestions` va qidiruv sahifasida imlo xatolarini hamda o‘zbekcha-ruscha transliteratsiya farqlarini (`sh/ш`, `ch/ч`, `o'/ў`) kechiradigan qidiruvni joriy qilish.

### A14. Internet uzilishi va tarmoq holati bildirishnomasi (`#82`)
- **Muammo:** Foydalanuvchining interneti butunlay uzilganda sahifada doimiy tushunarli offline xabari ko‘rinmaydi.
- **Kodda qilinadigan ish:**
  - Global layoutda `online` / `offline` brauzer hodisalarini tinglovchi yengil banner komponentini qo‘shish (internet uzilganda tepada «Internet aloqasi uzildi» ogohlantirishi chiqadi va qaytganda yo‘qoladi).

### A15. Accessibility (WCAG kontrast nisbati) xatolarini tuzatish (`#84`)
- **Muammo:** Lighthouse Accessibility 88/100; ayrim kulrang yordamchi matnlar (`text-gray-400` / `text-slate-400`) oq fonda yetarli kontrast bermaydi.
- **Kodda qilinadigan ish:**
  - Matn va tugmalardagi past kontrastli ranglarni `text-gray-600` yoki `text-slate-600` (kamida 4.5:1 kontrast) darajasiga ko‘tarish, ikonkali tugmalarda `aria-label` to‘liq ekanligini tekshirish.

### A16. Cloudflare R2 rasm keshi yangilanishi uchun URL versiyalash tayyorlovi (`#68` — kod qismi)
- **Muammo:** R2 rasmlari 1 yil keshlanadi (`immutable`), lekin URL da versiya parametri yo‘q.
- **Kodda qilinadigan ish:**
  - Agar 1C API mahsulot rasmining yangilangan sanasi yoki versiyasini qaytarsa (yoki R2 metadata orqali), rasm URL lariga `?v=...` parametrini ulaydigan umumiy helper (`getProductImageUrl`) tayyorlash.

---

## 🟢 4-BOSQICH: TESTLASH, HUJJATLASHTIRISH VA SHABLON TAYYORLASH (P3 — Qo‘shimcha sifat)

### A17. Unit testlar tizimini (Vitest) joriy qilish (`#176`)
- **Muammo:** Loyihada faqat Playwright E2E testlari bor, biznes funksiyalar (narx, QQS, slug, telefon validatsiyasi) uchun tezkor unit testlar yo‘q.
- **Kodda qilinadigan ish:**
  - `vitest` o‘rnatib, `src/lib/utils/` (narx hisoblash, formatlash, slug, QQS 12%, schema builder) va API validatsiya sxemalari uchun unit testlar yozish va `npm run test:unit` skriptini qo‘shish.

### A18. Arxitektura va Incident Response texnik hujjatlarini yozish (`#3`, `#197` — texnik shablon)
- **Muammo:** Komponentlararo ma’lumotlar oqimi diagrammasi va texnik hodisalarga javob berish qo‘llanmasi yozilmagan.
- **Kodda qilinadigan ish:**
  - `Loyixa_xujjatlari/architecture_flow.md` (Mermaid diagrammasi: Next.js <-> Vercel <-> Cloudflare R2 <-> 1C <-> Eskiz SMS) va `Loyixa_xujjatlari/incident_response.md` (Rollback qilish, 1C uzilganda tekshirish bosqichlari bo‘yicha texnik shablon) fayllarini yaratish.

### A19. Huquqiy sahifalar UI va Cookie Banner shablonini kodda tayyorlash (`#199`, `#200`, `#201`, `#202`, `#205`, `#207` — UI qismi)
- **Muammo:** Saytda `/terms`, `/privacy`, `/returns` sahifalari, Checkout rozilik checkboxi va Cookie banneri yo‘q.
- **Kodda qilinadigan ish:**
  - Next.js da `/[locale]/terms`, `/[locale]/privacy`, `/[locale]/returns` sahifalari shablonini, Checkout dagi majburiy rozilik checkboxini va Footer havolalarini hamda Cookie Consent Banner komponentini kodda yaratib qo‘yish (biroq **rasmiy yuridik matn tasdig‘i B-ro‘yxatda** olinishi shart!).

---

## 📋 A-ro‘yxat bo‘yicha qamrab olingan audit savollari xaritasi

| Bo‘lim | Qamrab olingan savol raqamlari |
|---|---|
| 1. Arxitektura | `#3`, `#7`, `#8` |
| 2. GitHub & Kod sifati | `#15`, `#16`, `#19`, `#20`, `#21 (kod)`, `#23 (kod)` |
| 3. Xavfsizlik | `#26 (kod)`, `#27 (kod)`, `#29`, `#31`, `#35 (lokal)`, `#39`, `#40`, `#41` |
| 4. Vercel & SEO himoya | `#46 (proxy)`, `#149 (proxy)` |
| 5. R2 Media | `#68 (URL helper)` |
| 6. UI/UX | `#78`, `#82`, `#84` |
| 7. Katalog | `#93`, `#96` |
| 8. Backend & API | `#101`, `#102`, `#104`, `#105 (kod)`, `#108` |
| 9. 1C Integratsiya | `#117 (logger)`, `#118 (fallback olib tashlash)`, `#119 (kod)` |
| 10. Savatcha & Buyurtma | `#127`, `#128`, `#132 (kod)` |
| 12. Tezlik (Performance) | `#161`, `#162`, `#163`, `#167`, `#168` |
| 13. Testlash (QA) | `#176`, `#185 (CI fayl)`, `#186 (CI fayl)` |
| 14. Monitoring & Hujjat | `#192 (kod tayyorlovi)`, `#197 (shablon)` |
| 15. Huquqiy sahifalar (UI) | `#199–#202 (UI shablon)`, `#205 (UI shablon)` |
