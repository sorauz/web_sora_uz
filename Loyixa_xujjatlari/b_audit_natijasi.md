# B — TASHQI OMIL, SHAXSIY AKKAUNT VA BIZNES QARORI TALAB QILADIGAN ISHLAR RO‘YXATI

> **Manba:** [`audit_natija.md`](file:///D:/web_sora_uz/Loyixa_xujjatlari/audit_natija.md) asosida tuzildi  
> **Maqsad:** Faqat kod yozish bilan hal bo‘lmaydigan — **loyiha egasi, 1C server administratori, DevOps panellari (GitHub, Vercel, Cloudflare, Eskiz), tashqi xizmat akkauntlari hamda yurist/rahbariyat qarorini** talab qiladigan vazifalar ro‘yxati.  
> **Sana:** 12-noyabr, 2026-yil  

---

## Umumiy tamoyil

Bu ro‘yxatdagi bandlar bo‘yicha dasturchi/AI mustaqil qaror qabul qila olmaydi yoki tizim tashqarisidagi hisoblarga kirish huquqiga ega emas. Quyidagi har bir vazifa tegishli mas’ul shaxs tomonidan bajarilgach (kalitlar, ruxsatlar yoki tasdiqlangan matnlar berilgach), ularning kod integratsiyasi qismi amalga oshiriladi.

---

## 🔴 1. LOYIHA EGASI VA GITHUB / XAVFSIZLIK ADMINI (P0 — Zudlik bilan 24–48 soat ichida)

### B1. Sizib chiqqan barcha parollarni almashtirish va GitHub repozitoriyani yopish (`#21`, `#23`)
- **Nima uchun mustaqil hal qilinmaydi:** Parollarni almashtirish 1C va Eskiz shaxsiy kabinetlarida amalga oshiriladi; GitHub repozitoriyani `Private` qilish va Vercel Environment Variables ni yangilash egasining akkauntidan bajariladi.
- **Bajarilishi kerak bo‘lgan amallar:**
  - [ ] 1C serverida `web_user` foydalanuvchisi parolini (`977540910` o‘rniga) yangi murakkab parolga o‘zgartirish.
  - [ ] **Eskiz.uz** shaxsiy kabinetiga kirib, `ESKIZ_SECRET_PASSWORD` ni yangilash (avvalgi kalit GitHubda ochiq qolgan).
  - [ ] `REVALIDATE_SECRET` (`sora_revalidate_secret_2026` o‘rniga) uchun yangi tasodifiy token o‘ylab topish.
  - [ ] Yangi parollarni **Vercel Dashboard -> Project Settings -> Environment Variables** (`Production` va `Preview` uchun alohida) ga kiritish.
  - [ ] **GitHub Repository Settings** da `sorauz/web_sora_uz` ni darhol **`Private`** holatiga o‘tkazish.
  - [ ] *(Tavsiya)* Eski commitlar tarixidagi parollarni butunlay o‘chirish uchun `BFG Repo-Cleaner` yoki `git filter-repo` bilan git tarixini tozalab `force push` qilish (jamoa bilan kelishilgan holda).

### B2. Sessiya shifrlash kalitini (`SESSION_SECRET`) yaratish va Vercelga qo‘shish (`#26`, `#27`)
- **Nima uchun mustaqil hal qilinmaydi:** Production muhitidagi maxfiy kalit kodga yozilmasligi, faqat Vercel server muhitida saqlanishi shart.
- **Bajarilishi kerak bo‘lgan amallar:**
  - [ ] Kamida 32 baytli tasodifiy maxfiy kalit yaratish (masalan, `openssl rand -base64 32`).
  - [ ] Uni Vercel Environment Variables bo‘limiga `SESSION_SECRET` nomi bilan saqlash (`a_audit_natijasi.md` dagi A5 kod qismi ishlashi uchun shart).

### B3. GitHub Branch Protection va Pull Request tartibini yoqish (`#11`, `#12`, `#13`, `#14`, `#185`, `#186`)
- **Nima uchun mustaqil hal qilinmaydi:** GitHub branch himoyasi veb-panelda repo egasi tomonidan yoqiladi va jamoa ish intizomi (to‘g‘ridan-to‘g‘ri `main` ga push qilmaslik) qarori hisoblanadi.
- **Bajarilishi kerak bo‘lgan amallar:**
  - [ ] GitHub -> **Settings -> Branches -> Add branch ruleset** orqali `main` branchini himoyalash.
  - [ ] **Require a pull request before merging** va **Require status checks to pass before merging** (CI build + lint + test) ni yoqish.
  - [ ] Barcha ishlab chiquvchilarga bundan buyon faqat alohida branch va PR orqali kod kiritish tartibini belgilash.

---

## 🗄️ 2. 1C:ENTERPRISE SERVER ADMINI VA BACKEND INFRASTRUKTURASI (P0/P1)

### B4. 1C API aloqasini HTTPS (SSL) yoki VPN/Tunnel orqali shifrlash (`#122`)
- **Nima uchun mustaqil hal qilinmaydi:** 1C serveri (`1cloud.uz:777`) Toshkentdagi tashqi serverda joylashgan bo‘lib, uning veb-serveri (Apache/IIS/Nginx) va SSL sertifikati Next.js kodidan tashqarida sozlanadi.
- **Bajarilishi kerak bo‘lgan amallar:**
  - [ ] 1C serveri oldiga Nginx/Caddy reverse-proxy qo‘yib Let's Encrypt **HTTPS SSL sertifikat** o‘rnatish YOKI **Cloudflare Tunnel** (`cloudflared`) / WireGuard VPN o‘rnatish.
  - [ ] Yangi shifrlangan HTTPS manzilni Vercel `ONEC_API_URL` o‘zgaruvchisiga kiritish.

### B5. Zaxira ma’lumotlar bazasi va navbat xizmatini (Upstash Redis / Vercel Postgres) ochish (`#35`, `#105`, `#118`, `#125`, `#129`)
- **Nima uchun mustaqil hal qilinmaydi:** Hozirgi loyihada **hech qanday doimiy ma’lumotlar bazasi yoki Redis yo‘q** (hamma narsa 1C da yoki brauzer `localStorage` da). Vercel Serverless funksiyalari esa har so‘rovdan keyin o‘chib ketadi (stateless).
- **Bajarilishi kerak bo‘lgan amallar:**
  - [ ] **Upstash Redis** (Vercel Marketplace orqali bepul/tarif rejasi) va/yoki **Vercel Postgres / Supabase** akkauntini ulash.
  - [ ] `UPSTASH_REDIS_REST_URL` va `UPSTASH_REDIS_REST_TOKEN` (yoki `DATABASE_URL`) ni Vercelga qo‘shish.
  - *Bu nimalarni hal qiladi:*
    1. 1C o‘chib qolganda buyurtmalar yo‘qolmasligi uchun zaxira navbat (**#118**);
    2. Barcha serverless tugunlar uchun yagona Idempotency (dublikat buyurtma himoyasi **#105**, **#132**) va global Rate Limit (**#35**);
    3. Savatchani qurilmalararo sinxronlash (**#125**) va aksiyalarda tovarni vaqtincha band qilish (**#129**).

### B6. 1C tomonidan buyurtma holatlarini ikki tomonlama sinxronlash (`#120`, `#136`)
- **Nima uchun mustaqil hal qilinmaydi:** Saytda [`src/app/api/order/status/route.ts`](file:///d:/web_sora_uz/src/app/api/order/status/route.ts) mavjud, biroq 1C ERP tizimida menejer buyurtma statusini («Tasdiqlandi», «Yetkazilmoqda», «Yakunlandi», «Bekor qilindi») o‘zgartirganda 1C bu ma’lumotni avtomatik yubormaydi yoki ochiq API bermagan.
- **Bajarilishi kerak bo‘lgan amallar:**
  - [ ] 1C dasturchisi bilan kelishib, 1C da buyurtma hujjati holati o‘zgarganda saytga HTTP webhook yuborish yoki buyurtma kodi bo‘yicha joriy statusni qaytaruvchi endpoint ochish.

### B7. Cloudflare R2 ga rasm yuklovchi 1C/lokal sinxronizatsiya skriptini takomillashtirish (`#58`, `#60`)
- **Nima uchun mustaqil hal qilinmaydi:** Mahsulot rasmlarini 1C kompyuteridan R2 bucketiga yuklash jarayoni tashqi muhitda (operator/1C skripti orqali) ishlaydi.
- **Bajarilishi kerak bo‘lgan amallar:**
  - [ ] Yuklash skriptiga rasmning MD5/SHA-256 hashini tekshirib, bir xil rasmni qayta-qayta yuklamaslik qoidasini qo‘shish (**#58** — hozir 52 ta rasm 158 ta mahsulotda takrorlangan).
  - [ ] Yuklashdan oldin rasmning haqiqiy formatini (magic bytes) va maksimal o‘lchamini (masalan, 2 MB / 2000px) tekshiruvchi validatsiyani yoqish (**#60**).

### B8. 1C ma’lumotlar bazasi zaxira nusxasidan tiklash (Restore) mashqini o‘tkazish (`#194`)
- **Nima uchun mustaqil hal qilinmaydi:** 1C bazasi zaxira nusxalari (backup) ichki korxona serverida joylashgan.
- **Bajarilishi kerak bo‘lgan amallar:**
  - [ ] Korxona IT bo‘limi bilan hamkorlikda test serverida 1C zaxira nusxasidan to‘liq tiklash (Restore Drill) o‘tkazish va ishlashini tasdiqlash.

---

## ☁️ 3. VERCEL VA CLOUDFLARE BOSHQARUV PANELLARI (DevOps / Ega — P1/P2)

### B9. Vercel texnik domenini (`websorauz.vercel.app`) yo‘naltirish (`#46`, `#149`)
- **Nima uchun mustaqil hal qilinmaydi:** A-ro‘yxatda `src/proxy.ts` orqali `noindex` qo‘yish mumkin, ammo Vercel darajasida domenni to‘liq 301 Redirect qilish Vercel Dashboard orqali bajariladi.
- **Bajarilishi kerak bo‘lgan amallar:**
  - [ ] Vercel -> **Project Settings -> Domains** bo‘limida `websorauz.vercel.app` ni `https://sora.uz` ga 301 Redirect qilib sozlash.

### B10. Vercel Function mintaqasi (Region) bo‘yicha qaror (`#52`)
- **Nima uchun mustaqil hal qilinmaydi:** Vercel server mintaqasi (`fra1` — Frankfurt) tanlovi va pro tarif imkoniyatlari loyiha boshqaruv panelida belgilanadi.
- **Bajarilishi kerak bo‘lgan amallar:**
  - [ ] Toshkent (`1cloud.uz`) bilan kechikishni kamaytirish uchun Vercel mintaqasini eng maqbul Yevropa/Yaqin Sharq tugunida (`fra1` yoki `dxb1` agar mavjud bo‘lsa) ushlab turish va kesh muddatlarini tasdiqlash.

### B11. Cloudflare WAF Rate Limiting va Turnstile bot himoyasini yoqish (`#35`, `#36`)
- **Nima uchun mustaqil hal qilinmaydi:** Global DDoS/bot himoyasi va Turnstile kalitlari Cloudflare Dashboard akkauntidan olinadi.
- **Bajarilishi kerak bo‘lgan amallar:**
  - [ ] Cloudflare Dashboard -> **Security -> WAF -> Rate limiting rules** da `/api/order/create`, `/api/auth/*`, `/api/search/*` uchun IP cheklovlari o‘rnatish.
  - [ ] Cloudflare **Turnstile** bo‘limida bepul widget yaratib, `NEXT_PUBLIC_TURNSTILE_SITE_KEY` va `TURNSTILE_SECRET_KEY` ni taqdim etish (shundan so‘ng kodga qo‘shiladi).

### B12. Cloudflare Purge Cache API tokenini taqdim etish (`#68`)
- **Nima uchun mustaqil hal qilinmaydi:** R2 dagi mahsulot rasmi yangilanganda CDN keshini avtomatik tozalash uchun Cloudflare API ruxsati kerak.
- **Bajarilishi kerak bo‘lgan amallar:**
  - [ ] Cloudflare Dashboard da faqat `Cache Purge` huquqiga ega API Token yaratib, R2 yuklash skriptiga yoki `/api/revalidate` ga ulash uchun berish.

---

## 💳 4. TO‘LOV TIZIMLARI, SMS VA MONITORING AKKAUNTLARI (Biznes + Tashqi xizmatlar — P1/P2)

### B13. Payme / Click onlayn to‘lov shlyuzlarini rasmiylashtirish (`#133`, `#134`, `#135`, `#182`)
- **Nima uchun mustaqil hal qilinmaydi:** To‘lov tizimlarini ulash uchun yuridik shaxs («ALFA PRINT SERVIS» MChJ) nomidan Payme/Click bilan rasmiy shartnoma imzolanishi, merchant ID, maxfiy kalit va test kartalari olinishi shart.
- **Bajarilishi kerak bo‘lgan amallar:**
  - [ ] Qaysi to‘lov tizimlari (Payme, Click, Uzum) ulanishini hal qilish va merchant shartnomalarini imzolash.
  - [ ] Merchant ID, Secret Key va Sandbox test ma’lumotlarini dasturchiga berish (shundan keyingina callback/webhook imzo tekshiruvi `#134` va testlar `#182` yoziladi).

### B14. Eskiz.uz da buyurtma haqida SMS yuborish shablonini tasdiqlatish (`#137`)
- **Nima uchun mustaqil hal qilinmaydi:** O‘zbekiston qonunchiligi va Eskiz.uz qoidalariga ko‘ra, har qanday yangi SMS matni oldindan Eskiz shaxsiy kabinetida moderatorlar tomonidan tasdiqlanishi shart hamda har bir SMS pullik (biznes byudjeti masalasi).
- **Bajarilishi kerak bo‘lgan amallar:**
  - [ ] Buyurtma tasdiqlanganda SMS yuborish kerakligini tasdiqlash.
  - [ ] Eskiz kabinetida rasmiy SMS shablonini (masalan: *"SORA.UZ: Sizning #{id} raqamli buyurtmangiz qabul qilindi. Summa: {sum} so'm."*) moderatsiyadan o‘tkazish.

### B15. Tashqi Monitoring, Error Tracking va Telegram Alert akkauntlarini ulash (`#117`, `#187`, `#189`, `#190`, `#191`, `#192`)
- **Nima uchun mustaqil hal qilinmaydi:** Sentry, BetterStack/UptimeRobot va Telegram Bot xizmatlari tashqi akkaunt ochishni va maxfiy token/chat ID berishni talab qiladi.
- **Bajarilishi kerak bo‘lgan amallar:**
  - [ ] **Sentry.io** da bepul Next.js loyihasi ochib, `NEXT_PUBLIC_SENTRY_DSN` va `SENTRY_AUTH_TOKEN` berish (**#192**).
  - [ ] **BetterStack** yoki **UptimeRobot** da `https://sora.uz` uchun 5 daqiqalik uptime tekshiruvi yoqish (**#187**).
  - [ ] Telegramda `@BotFather` orqali ogohlantirish boti ochib, `TELEGRAM_ALERT_BOT_TOKEN` va IT/menejer guruhining `CHAT_ID` sini berish (**#117**, **#191** — sayt yoki 1C yiqilganda zudlik bilan xabar borishi uchun).
  - [ ] **Google Search Console** va **Yandex Webmaster** da 404/500 indeksatsiya xatolarini haftalik ko‘rib borish uchun mas’ul xodim tayinlash (**#189**).

---

## ⚖️ 5. YURIST VA BIZNES RAHBARIYATI QARORLARI (P0 Kritik / P2)

### B16. Rasmiy huquqiy hujjatlar matnini tayyorlash va tasdiqlash (`#199`, `#200`, `#201`, `#202`, `#205`, `#207`)
- **Nima uchun mustaqil hal qilinmaydi:** AI yoki dasturchi yuridik javobgarlikka ega bo‘lgan shartnoma matnlarini kompaniya rahbariyati/yuristi roziligisiz mustaqil tasdiqlay olmaydi. O‘zbekiston Respublikasi **O‘RQ-547 ("Shaxsiy ma’lumotlar to‘g‘risida"gi Qonun)** va **Elektron tijorat to‘g‘risidagi Qonun** bo‘yicha kompaniya nomi («ALFA PRINT SERVIS» MChJ) dan rasmiy matn bo‘lishi shart.
- **Bajarilishi kerak bo‘lgan amallar:**
  - [ ] Yurist bilan birgalikda o‘zbek va rus tillarida quyidagi hujjatlar matnini tasdiqlash:
    1. **Ommaviy oferta (`/terms`)** — elektron savdo, B2B/B2C hisob-kitob va javobgarlik shartlari (**#199**).
    2. **Maxfiylik siyosati (`/privacy`)** — mijoz telefon raqami, ismi, STIR va manzilini yig‘ish, saqlash va Eskiz/1C ga uzatish tartibi (**#200**, **#201**, **#207**).
    3. **Tovarni qaytarish va buyurtmani bekor qilish shartlari (`/returns`)** — muddat, tovar ko‘rinishi va pul qaytarish tartibi (**#205**).
    4. **Cookie siyosati** — qaysi tahlil (Vercel/GA/Yandex) cookie'lari ishlatilishi haqida bayonot (**#202**).

### B17. Strategik biznes va reglament qarorlari (`#63`, `#106`, `#129`, `#197`)
- **Nima uchun mustaqil hal qilinmaydi:** Bular loyihaning kelgusi rivojlanish yo‘nalishi va ichki jamoa intizomiga oid boshqaruv qarorlaridir.
- **Qabul qilinishi kerak bo‘lgan qarorlar:**
  - [ ] **Sharhlarga rasm yuklash (`#63`):** Kelajakda xaridorlar saytga rasm/fayl yuklaydimi? (Agar "Ha" bo‘lsa — R2 Signed URL yoziladi; "Yo‘q" bo‘lsa — talab qilinmaydi).
  - [ ] **API versiyalash (`#106`):** Yaqin kelajakda mobil ilova (iOS/Android) yoki tashqi hamkorlar uchun API ochiladimi? (Agar "Ha" bo‘lsa — `/api/v1/` standarti joriy etiladi).
  - [ ] **Qoldiqni bron qilish (`#129`):** Oxirgi 1 ta mahsulotni bir vaqtda ikkita mijoz sotib olmoqchi bo‘lsa, sayt tovarni 10 daqiqaga band qilishi kerakmi yoki operator telefon orqali hal qiladimi?
  - [ ] **Hodisalarga javob berish reglamenti (`#197`):** Sayt to‘xtab qolganda yoki 1C uzilganda kim birinchi bo‘lib javob berishi, telefon raqamlari va navbatchilik tartibini tasdiqlash.

---

## 📋 B-ro‘yxat bo‘yicha qamrab olingan audit savollari xaritasi

| Bo‘lim | Qamrab olingan savol raqamlari |
|---|---|
| 2. GitHub boshqaruvi | `#11`, `#12`, `#13`, `#14`, `#21 (parol/repo)`, `#23 (Vercel Env)` |
| 3. Xavfsizlik (Tashqi kalit) | `#26 (env)`, `#27 (SESSION_SECRET)`, `#35 (WAF)`, `#36 (Turnstile)` |
| 4. Vercel Sozlamalari | `#46 (redirect)`, `#52 (region)`, `#149 (redirect)` |
| 5. R2 & 1C Rasm yuklash | `#58`, `#60`, `#63`, `#68 (CF Purge token)` |
| 8. Backend & API qarori | `#105 (Redis)`, `#106 (API versiya qarori)` |
| 9. 1C Serveri | `#117 (Telegram bot)`, `#118 (Redis/DB)`, `#119 (Redis)`, `#120 (1C webhook)`, `#122 (HTTPS/SSL)` |
| 10. Savat, Qoldiq, To‘lov | `#125 (DB)`, `#129 (biznes qoida)`, `#132 (Redis)`, `#133–#137 (Payme/Click, 1C status, Eskiz shablon)` |
| 13. QA & CI nazorat | `#182 (Payme sandbox)`, `#185–#186 (Branch Protection)` |
| 14. Monitoring & Zaxira | `#187`, `#189–#192 (Sentry/Uptime/Bot)`, `#194 (1C Restore)`, `#197 (mas’ullar)` |
| 15. Huquqiy & Qonunchilik | `#199–#202 (Yurist matni)`, `#205 (Qaytarish qoidasi)`, `#207 (O‘RQ-547)` |
