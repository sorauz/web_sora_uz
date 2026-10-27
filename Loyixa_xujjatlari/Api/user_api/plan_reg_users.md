# Sora.uz — SMS OTP Asosida Mijozlarni Ro'yxatdan O'tkazish va Avtorizatsiya Qilish Rejasi (Kengaytirilgan va To'liq Tahlil)

> **Hujjat maqomi:** Tasdiqlash uchun to'liq texnik loyiha (Complete Technical Specification)  
> **Asos hujjatlar:**  
> - [`Loyixa_xujjatlari/Api/user_api/OTP/SMS_OTP.txt`](file:///d:/web_sora_uz/Loyixa_xujjatlari/Api/user_api/OTP/SMS_OTP.txt) (Eskiz.uz SMS API)  
> - [`Loyixa_xujjatlari/Api/user_api/Yangi foydalanuvchini ro'yxatdan o'tkazish.txt`](file:///d:/web_sora_uz/Loyixa_xujjatlari/Api/user_api/Yangi%20foydalanuvchini%20ro'yxatdan%20o'tkazish.txt) (1C ERP POST /register)  
> - [`Loyixa_xujjatlari/Api/user_api/Foydalanuvchini bazadan qidirish.txt`](file:///d:/web_sora_uz/Loyixa_xujjatlari/Api/user_api/Foydalanuvchini%20bazadan%20qidirish.txt) (1C ERP GET /register)  
> **Platforma:** Next.js 16 (App Router), TypeScript, Tailwind CSS, Zustand, 1C ERP, Eskiz.uz SMS Gateway  

---

## 1. Loyihaning Maqsadi va Dolzarbligi

Hozirgi kunda Sora.uz tizimida ro'yxatdan o'tish an'anaviy login/parol asosida ishlamoqda. Biroq zamonaviy O'zbekiston e-commerce bozorida (Uzum, Yandex Go, Express24 standartlarida):
1. **Foydalanuvchilar murakkab parollarni eslab qolishni xohlamaydi** — eng qulay va ishonchli identifikator bu ularning mobil telefon raqamidir.
2. **Soxta (fake) akkauntlar va spam buyurtmalarning oldi olinadi** — buyurtma beruvchining telefon raqami haqiqatda mavjudligi va qo'lida ekanligi ro'yxatdan o'tishdayoq SMS kod orqali 100% isbotlanadi.
3. **1C ERP bazasi bilan benuqson bog'lanish** — tasdiqlangan telefon raqami orqali 1C dagi mavjud mijozlar o'z akkauntiga parolsiz tezkor kiradi (Seamless OTP Login), yangi mijozlar esa avtomatik ravishda 1C bazasiga `B2C` yoki `B2B` sifatida yoziladi.

---

## 2. Texnik Arxitektura va Ma'lumotlar Oqimi (Mermaid)

Quyidagi ketma-ketlik diagrammasi mijoz saytga kirgandan boshlab, SMS orqali tasdiqlanib, 1C ERP tizimiga bog'lanishigacha bo'lgan barcha bo'g'inlarni ko'rsatadi:

```mermaid
sequenceDiagram
    autonumber
    actor User as Mijoz (Brauzer / Mobil)
    participant Front as Next.js Frontend (AuthModal)
    participant API as Next.js Backend (/api/auth/otp)
    participant Eskiz as Eskiz.uz SMS Gateway
    participant OneC as 1C ERP Cloud (1cloud.uz:777)

    %% Step 1: Request OTP
    User->>Front: Telefon raqamini kiritadi (+998 90 123 45 67)
    Front->>API: POST /api/auth/otp/send { phone, type }
    API->>API: Rate limit & format tekshiruvi, 4 xonali OTP generatsiyasi (masalan: 4892)
    API->>API: Kodni shifrlab keshga/sessiyaga saqlash (TTL: 120s)
    API->>Eskiz: POST /api/message/sms/send (Bearer Token, 998901234567, "Tasdiqlash kodi: 4892")
    Eskiz-->>API: 200 OK (status: waiting / sent)
    API-->>Front: { success: true, resendCooldown: 60 }
    Front-->>User: OTP kiritish oynasi + 60s taymer (WebOTP kutish)

    %% Step 2: Verify OTP
    User->>Front: SMS orqali kelgan 4 xonali kodni kiritadi (yoki WebOTP orqali avto-joylanadi)
    Front->>API: POST /api/auth/otp/verify { phone, code, name?, type, inn? }
    API->>API: Koddagi muddat (TTL) va urinishlar sonini tekshiradi
    
    alt Kod noto'g'ri yoki muddati o'tgan
        API-->>Front: 400 Bad Request ("Kod xato yoki muddati tugagan")
        Front-->>User: Xatolik xabari, qayta urinish imkoniyati
    else Kod to'g'ri tasdiqlandi
        %% Step 3: Check / Register in 1C
        API->>OneC: GET /register?type=B2C&phone=+998901234567
        alt Mijoz 1C bazasida allaqachon mavjud
            OneC-->>API: 200 OK { id: "UUID", name: "Tohir Arislonov", type: "B2C" }
        else Yangi mijoz (1C da topilmadi - 404)
            API->>OneC: POST /register { type: "B2C", name, phone1 }
            OneC-->>API: 201 Created { id: "UUID", message: "..." }
        end
        API->>API: Keshdan OTP ni tozalash, sora_session (httpOnly cookie) yaratish
        API-->>Front: 200 OK { success: true, user: { id, name, phone, type } }
        Front-->>User: Avtorizatsiya muvaffaqiyatli! Shaxsiy kabinetga yo'naltirish
    end
```

---

## 3. Bosqichma-bosqich Amalga Oshirish Rejasi

### 1-BOSQICH: Eskiz.uz Servis Qatlami (`src/lib/sms/eskiz.ts`)

Eskiz.uz API orqali barqaror ishlash uchun serverda maxsus adapter sinfi yaratiladi.

1. **Token menejeri va avtomatik kesh:**
   - Eskiz.uz beradigan Bearer token 30 kun amal qiladi. Har bir SMS yuborishda tokenni qayta olish tizimni sekinlashtiradi va Eskiz serveriga ortiqcha yuklama beradi.
   - Servis tokenni xotirada (yoki vaqtinchalik server faylida) saqlaydi va muddati tugashiga 1 kun qolganda avtomatik `POST https://notify.eskiz.uz/api/auth/login` chaqirib yangilab oladi.
2. **Telefon raqami normalizatori:**
   - Eskiz.uz talabi: faqat raqamlar, `+` belgisisiz (`998901234567`).
   - Sora.uz frontendidan kelgan har qanday format (`+998 (90) 123-45-67`, `90 123 45 67`) avtomatik `998XXXXXXXXX` formatiga o'tkaziladi.
3. **SMS xabari shablonlari:**
   - O'zbekcha: `"Sora.uz: Tasdiqlash kodingiz: 1234. Xavfsizlik maqsadida uni hech kimga bermang."`
   - Ruscha: `"Sora.uz: Ваш код подтверждения: 1234. Не сообщайте его никому."`
4. **Muhit o'zgaruvchilari (`.env.local`):**
   ```env
   ESKIZ_EMAIL="info@sora.uz"
   ESKIZ_PASSWORD="sizning_eskiz_parolingiz"
   ESKIZ_FROM="4546" # yoki Eskiz tasdiqlagan rasmiy nom: "Sora"
   MOCK_SMS_OTP="false" # development rejimida bepul sinash uchun "true"
   ```

---

### 2-BOSQICH: OTP Generatsiyasi, Kesh va Xavfsizlik (Security & Anti-Fraud)

SMS orqali pul sarflanishi sababli, tizimni spammerlar, botlar va firibgarlardan himoya qilish muhimdir.

1. **Kod formati va Yaroqlilik muddati (TTL):**
   - Kod: 4 xonali tasodifiy son (`Math.floor(1000 + Math.random() * 9000)`). 4 xona mobil telefonlar uchun eng tez va qulay format.
   - Yaroqlilik muddati: **120 soniya (2 daqiqa)**. 2 daqiqadan so'ng kod bazadan/keshdan avtomatik o'chadi.
2. **Qayta yuborish cheklovi (Cooldown):**
   - Bitta raqamga yangi kod so'rash uchun kamida **60 soniya** kutish majburiy qilinadi.
3. **Brute-force (kodni taxmin qilish) himoyasi:**
   - 1 ta kod uchun ko'pi bilan **3 ta noto'g'ri urinish** ruxsat etiladi. 3 marta xato kiritilgach, OTP bekor qilinadi va mijoz yangi kod so'rashi kerak bo'ladi.
4. **IP va Raqam bo'yicha Rate Limiting (Spamdan himoya):**
   - 1 ta telefon raqamiga: 1 soatda ko'pi bilan 4 ta SMS.
   - 1 ta IP-manzildan: 1 soatda ko'pi bilan 10 ta SMS so'rovi.
5. **Kriptografik xavfsiz saqlash:**
   - Keshda ochiq kod saqlanmaydi, balki `SHA-256(phone + code + secret_salt)` xeshi saqlanadi. Bu ma'lumotlar bazasi ko'rilganda ham kodlar xavfsizligini kafolatlaydi.

---

### 3-BOSQICH: Yangi Backend API Marshrutlari (Next.js App Router)

Next.js `src/app/api/auth/otp/` katalogida 2 ta asosiy API yaratiladi:

#### 1. `POST /api/auth/otp/send`
- **Vazifasi:** Telefon raqamini qabul qilish, tekshirish, kod generatsiya qilib Eskiz orqali jo'natish.
- **Request Body:**
  ```json
  {
    "phone": "+998 90 123 45 67",
    "type": "B2C",
    "locale": "uz"
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "message": "Tasdiqlash kodi yuborildi",
    "cooldown": 60,
    "expiresIn": 120
  }
  ```

#### 2. `POST /api/auth/otp/verify`
- **Vazifasi:** Mijoz kiritgan kodni tekshirish, to'g'ri bo'lsa 1C ERP bilan bog'lanish va sessiya ochish.
- **Request Body:**
  ```json
  {
    "phone": "+998 90 123 45 67",
    "code": "4892",
    "name": "Jasur Aliyev", // Yangi ro'yxatdan o'tuvchilar uchun
    "type": "B2C",
    "inn": "204393073" // Faqat B2B uchun
  }
  ```
- **Mantiq:**
  1. Kod tekshiriladi (agar xato bo'lsa `400 Bad Request`).
  2. 1C dan tekshiriladi: `GET /SORA/hs/for_msp/register?type=B2C&phone=...`.
  3. Agar 1C da mavjud bo'lsa — uning mavjud `id` si olinadi.
  4. Agar 1C da yo'q bo'lsa — 1C ga `POST /register` yuborilib, yangi kontakt shaxs yaratiladi va yangi `id` olinadi.
  5. Xavfsiz `sora_session` httpOnly cookie o'rnatiladi.
- **Response:**
  ```json
  {
    "success": true,
    "isNewUser": false,
    "user": {
      "id": "79d1f6cb-3178-11e8-812c-d43d7e011714",
      "name": "Jasur Aliyev",
      "type": "B2C",
      "phone": "+998901234567"
    }
  }
  ```

---

### 4-BOSQICH: Frontend UI/UX — Zamonaviy 3 Bosqichli Kirish/Ro'yxatdan O'tish Modali

Mavjud [`src/components/auth/AuthModal.tsx`](file:///d:/web_sora_uz/src/components/auth/AuthModal.tsx) komponenti yangilanadi:

#### 1-qadam: Telefon raqami kiritish (Step 1)
- Foydalanuvchidan faqat telefon raqami so'raladi (avtomatik `+998 ` maskasi bilan).
- "Davom etish" yoki "Kodni olish" tugmasi bosiladi.
- Tizim fonida `POST /api/auth/otp/send` chaqiriladi.

#### 2-qadam: 4 xonali SMS kod kiritish (Step 2 - OTP Screen)
- 4 ta alohida kvadrat katakchalar (Pin Input / OTP Box).
- Birinchi katakchaga raqam yozilishi bilan fokus keyingi katakchaga avtomatik o'tadi.
- Klaviaturadan Paste (Nusxalash-joylash) qilinganda butun 4 ta raqam to'g'ri taqsimlanadi.
- **WebOTP API qo'llab-quvvatlash:** Android (Chrome) va iOS (Safari) da SMS kelganda bir marta bosish bilan kod avtomatik kiritiladi (`autocomplete="one-time-code"`).
- Pastda jonli teskari hisoblash taymeri: `00:59 soniyadan so'ng qayta yuborish mumkin`.
- Taymer tugagach, "Kodni qayta yuborish" havolasi faollashadi.
- "Raqamni o'zgartirish" tugmasi (agar mijoz raqamda xato qilgan bo'lsa, ortga qaytish uchun).

#### 3-qadam: Yangi mijoz profilini to'ldirish (Step 3 - faqat birinchi marta kirganda)
- Agar telefon raqami 1C bazasida avval ro'yxatdan o'tmagan bo'lsa, OTP tasdiqlangach, chiroyli oyna chiqadi:
  * *"Xush kelibsiz! Buyurtmalarni rasmiylashtirish uchun ism-sharifingizni kiriting"*.
  * Ism kiritiladi va "Saqlash" bosiladi.
  * Tizim darhol 1C ga `POST /register` qilib hisob ochadi.
- Agar foydalanuvchi avval ro'yxatdan o'tgan bo'lsa — bu qadam avtomatik o'tkazib yuboriladi va darhol tizimga kiradi.

---

### 5-BOSQICH: Savat (Checkout) va 1-Klikda Xarid Integratsiyasi

Mijozlar buyurtma berayotganda ([`CheckoutForm.tsx`](file:///d:/web_sora_uz/src/components/checkout/CheckoutForm.tsx) va [`ProductActions.tsx`](file:///d:/web_sora_uz/src/components/pdp/ProductActions.tsx)):
1. Agar mijoz allaqachon tizimga kirgan bo'lsa, uning ismi va telefoni avtomatik to'ldiriladi.
2. Agar tizimga kirmagan bo'lsa, telefon raqamini kiritgandan so'ng, checkout ichida 1 marta SMS kod orqali tasdiqlab, darhol tizimda ro'yxatdan o'tib ketish taklif qilinadi. Bu xaridorning kelgusida buyurtma tarixini kuzatib borishiga imkon beradi.

---

### 6-BOSQICH: B2B (Yuridik Shaxslar) Uchun O'ziga Xosliklar

1C arxitekturasiga binoan ([`Foydalanuvchini bazadan qidirish.txt`](file:///d:/web_sora_uz/Loyixa_xujjatlari/Api/user_api/Foydalanuvchini%20bazadan%20qidirish.txt)):
- B2B mijozlar 1C bazasida **STIR (INN)** orqali qidiriladi va ro'yxatga olinadi.
- Ro'yxatdan o'tishda:
  1. Tashkilot vakilining telefon raqamiga OTP SMS yuborilib tasdiqlanadi (mas'ul shaxs haqiqiyligini tekshirish uchun).
  2. Tashkilot nomi va 9 xonali STIR (INN) kiritiladi.
  3. 1C da alohida `B2B` kontragent ochiladi.

---

## 7. 1C Dasturchisi Tomonidan Qilinishi Kerak Bo'lgan Amaliyotlar (1C Checklist)

1C dasturchisi bilan o'rganilgan API asosida quyidagi aniqlashtirishlar tahlil qilindi:

### 1C da nimalar allaqachon tayyor va yetarli?
- `POST /SORA/hs/for_msp/register` — Yangi mijoz yaratish HTTP xizmati mavjud.
- `GET /SORA/hs/for_msp/register` — Telefon raqami (`phone`) yoki STIR (`inn`) bo'yicha mijozni qidirish HTTP xizmati mavjud.
- 1C tomonida yangi maxsus endpoint yaratish shart emas!

### 1C dasturchisi tekshirishi va bajarishi kerak bo'lgan 4 ta muhim nuqta:
1. **Parol (password) talabini olib tashlash (yoki ixtiyoriy qilish):**
   - Hozirgi `client.ts` da `password` maydoni yuborilmoqda edi. SMS OTP tizimida telefon raqami SMS orqali 100% tasdiqlangani sababli parolsiz kirish (Passwordless) amalga oshiriladi.
   - *1C topshirig'i:* `POST /register` xizmatida `password` maydoni majburiy bo'lmasligi yoki bo'sh kelsa ham xato bermasligi kerak. Agar 1C parolni talab qilsa, sayt serveri foniy avtomatik xesh yuboradi.
2. **Telefon raqamini tozalab qidirish (Sanitization in 1C):**
   - 1C bazasidagi `Тел1` maydonida raqamlar turlicha saqlangan bo'lishi mumkin (masalan, `+998901234567`, `998901234567`, `+998 (90) 123-45-67`).
   - *1C topshirig'i:* `GET /register?type=B2C&phone=...` qidiruvida kiruvchi parametr va bazadagi maydon faqat raqamlar (raqamlar ketma-ketligi) bo'yicha taqqoslanishi kerak. Veb-sayt har doim toza `+998901234567` yuboradi.
3. **Mijoz ismini yangilash (UPDATE operatsiyasi):**
   - Agar telefon raqami 1C da oldin "ОДНОРАЗОВЫЕ_КЛИЕНТЫ" ichida nomsiz yoki "Mijoz" nomi bilan ochilgan bo'lsa, xaridor veb-saytda o'z ismini to'ldirganda uning nomini 1C da yangilab qo'yish (UPDATE / PUT) kerakmi yoki yo'qmi kelishib olinadi (veb-sayt tomonidan `id` va yangi `name` yuboriladi).
4. **Indekslash va Javob tezligi (Performance):**
   - 1C HTTP xizmatida `Тел1`, `Тел2` va `ИНН` rekvizitlari indekslangan bo'lishi shart, aks holda baza kattalashganda qidiruv 3-5 soniyagacha cho'zilib ketishi mumkin. Qidiruv tezligi 500ms dan oshmasligi tavsiya etiladi.

---

## 8. SMS Uchun Integratsiya Ma'lumotlari Yetarliligi Tahlili

[`Loyixa_xujjatlari/Api/user_api/OTP/SMS_OTP.txt`](file:///d:/web_sora_uz/Loyixa_xujjatlari/Api/user_api/OTP/SMS_OTP.txt) hujjati dasturiy kod yozish uchun yetarli texnik endpointlarni bergan:
- Avtorizatsiya: `POST https://notify.eskiz.uz/api/auth/login`
- SMS yuborish: `POST https://notify.eskiz.uz/api/message/sms/send`

### Biroq tizimni to'liq ishga tushirish (Go-Live) uchun quyidagi 4 ta amaliy ma'lumot talab etiladi:
1. **Eskiz.uz hisob rekvizitlari (Hisob ochilganmi?):**
   - Kompaniya nomidan [Eskiz.uz](https://eskiz.uz) da ochilgan shaxsiy kabinetning `email` va `password` i kerak. (Hozircha `.env` da faqat test placeholderlari bor).
2. **SMS balansi (Hisobda mablag' mavjudligi):**
   - Eskiz.uz da har bir SMS narxi o'rtacha 40–50 so'm. Sayt ishga tushganda hisobda kamida 50 000 – 100 000 so'm (1000–2000 ta SMS paketi) bo'lishi shart. Aks holda Eskiz `402 Payment Required` qaytaradi va yangi xaridorlar SMS ololmay qoladi.
3. **Jo'natuvchi nomi (Sender ID / Alfa-nom):**
   - SMS kim nomidan boradi?
     * **Standart nom:** `4546` (Eskiz tomonidan taqdim etiladi, zudlik bilan ishlatish mumkin).
     * **Rasmiy brend nomi:** `Sora` yoki `Sora.uz`. O'zbekiston aloqa operatorlari qoidasiga ko'ra, brend nomidan SMS yuborish uchun Eskiz.uz orqali operatorlarga ariza topshirilib, Alfa-nom tasdiqlanishi kerak (1-3 ish kuni oladi). Boshlanishida `4546` dan boshlab, ariza chiqqach `Sora` ga o'tkazish mumkin.
4. **Balans monitoringi va Admin ogohlantirish (Avtomatlashtirish):**
   - Eskiz.uz ning `GET https://notify.eskiz.uz/api/user/get-limit` endpointi mavjud. Sayt backendiga kunlik yoki har 50 ta SMS da balansni tekshirib, hisobda 300 tadan kam SMS qolganda administratorning Telegram botiga ogohlantirish jo'natuvchi xizmat qo'shiladi.

---

## 9. Tizim Kamchiliklari, Xavflar va Foydalanuvchi Qiyinchiliklari Tahlili (Edge Cases & Fallbacks)

Har qanday tizimda eng muhim qism — kutilmagan vaziyatlar va noqulayliklarning oldini olishdir.

| № | Ehtimoliy Muammo / Qiyinchilik | Xavf darajasi | Texnik Yechim va Zaxira Mexanizmi |
| :--- | :--- | :---: | :--- |
| **1** | **SMS kechikishi yoki kelmasligi** (Mobil operator nosozligi yoki telefon o'chiqligi) | 🟡 O'rta | 60 soniyalik taymer. 60s dan keyin "Kodni qayta yuborish" ochiladi. Agar 2 marta ham kelmasa, "Raqamni to'g'rilash" yoki Telegram bot orqali kod olish taklif etiladi. |
| **2** | **Kodni qo'lda yozish noqulayligi** (Ayniqsa mobil foydalanuvchilar uchun) | 🟢 Qulaylik | **WebOTP API** va `autocomplete="one-time-code"` kiritiladi. iOS Safari va Android Chrome brauzerlarida SMS kelishi bilan klaviatura tepasida kod chiqadi va 1 marta bosishda avtomatik to'ldiriladi. |
| **3** | **Sahifani yangilab yuborish (Page Refresh)** | 🟡 O'rta | Mijoz kod kutayotganda sahifani yangilab yuborsa, telefon raqami va taymer yo'qolmaydi — holat vaqtinchalik `sessionStorage` da saqlanadi. |
| **4** | **Spammerlar tomonidan SMS balansni bo'shatish (SMS Bombing / DDoS)** | 🔴 Yuqori | **IP va Raqam bo'yicha Rate Limiting:** 1 ta raqamga soatiga ko'pi bilan 4 ta SMS. 1 ta IP dan soatiga ko'pi bilan 10 ta SMS. 3 marta noto'g'ri kod kiritilsa — bloklash. |
| **5** | **Eskiz.uz da mablag' tugab qolishi** | 🔴 Yuqori | Har soatlik avtomatik balans monitoringi (`get-limit`). Balans 300 tadan kam qolganda Telegram orqali mas'ul shaxsga xabar jo'natish. |
| **6** | **Xalqaro raqamlar (Chet el fuqarolari)** | 🟢 Qulaylik | Hozircha tizim faqat O'zbekiston raqamlari (`+998`) uchun moslanadi. Chet el fuqarolari uchun login formasida alohida Email orqali yoki Telegram orqali kirish imkoniyati saqlanadi. |
| **7** | **Oldin parolli tizimda ro'yxatdan o'tgan mijozlar** | 🟢 O'tish davri | Ularning hisobiga hech narsa qilmaydi. Ular telefon raqamini kiritib, 1 marta OTP tasdiqlashi bilan darhol o'zlarining eski hisoblariga bog'lanadilar (Parolsiz migratsiya). |

---

## 10. Zaxira Kanal: Telegram Bot Orqali OTP (Kelajakdagi Kengaytma)

SMS har doim pullik va aloqa operatorlariga bog'liq. Kelgusida xarajatlarni tejash va SMS yetib bormagan holatlarda muqobil kanal sifatida:
- Saytda: *"SMS kelmadimi? Telegram orqali kod olish"* tugmasi qo'yiladi.
- Mijoz [@sora_uz_bot](https://t.me/sora_uz) ga o'tib, bitta `[ Kontaktni ulashish ]` tugmasini bosadi va Telegram bot unga bepul OTP kod taqdim etadi.

---

## 11. Sinov va Tekshiruv Rejasi (Testing Scenarios)

| № | Sinov holati (Test Case) | Kutilayotgan natija |
| :--- | :--- | :--- |
| **1** | To'g'ri raqamga kod so'rash (`+998901234567`) | SMS 3-5 soniyada yetib keladi, 60s cooldown ishlaydi |
| **2** | To'g'ri kodni kiritish | Yangi mijoz bo'lsa ism so'raydi, mavjud bo'lsa tizimga kiritadi |
| **3** | Noto'g'ri kod kiritish | Xatolik ko'rsatiladi ("Kod noto'g'ri, 2 ta urinish qoldi") |
| **4** | 3 marta noto'g'ri kod kiritish | Kod bekor qilinadi, yangi kod olish talab etiladi |
| **5** | 120 soniya kutib, eskirgan kodni kiritish | "Kodning amal qilish muddati tugadi" xabari chiqadi |
| **6** | 60 soniya ichida qayta kod so'rashga urinish | Tugma nofaol, so'rov bloklanadi |
| **7** | Spammer bir xil raqamga ketma-ket SMS yuborishi | 4-urinishdan so'ng 1 soatga cheklov (Rate limit: 429 Too Many Requests) |
| **8** | 1C ERP da mavjud raqam bilan OTP dan o'tish | 1C ga dublikat yaratmaydi, mavjud UUID bilan sessiya ochiladi |
| **9** | WebOTP avto-to'ldirish sinovi | Mobil Chrome/Safari da SMS kelgach 1-bosishda kod katakchalarga tushadi |
| **10** | Dev muhitda (`MOCK_SMS_OTP=true`) | SMS Eskizga ketmaydi, kod konsolda va javobda ko'rinadi (bepul test) |

---

## 12. Ishni Boshlash Uchun Zarur Ma'lumotlar Ro'yxati (Pre-requisites)

Dasturlashni boshlash va uni jonli (production) rejimga chiqarish uchun quyidagi 3 ta narsa kerak bo'ladi:
1. **Eskiz.uz hisobining Login (Email) va Paroli** (loyihaning `.env.local` fayliga kiritish uchun).
2. **Eskiz.uz hisobida SMS balansi mavjudligi**.
3. **1C dasturchisi bilan qidiruv formati (`phone`) va parol maydoni ixtiyoriyligini 1 marta tasdiqlab olish**.
