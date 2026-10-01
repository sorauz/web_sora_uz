# 2-TUR REJA: Amalga Oshirish Uchun Ma'lumotlar Ham, Texnik Imkoniyatlar Ham Hozirda Loyihada Mavjud Bo'lmagan Ishlar

> **Tavsif:** Ushbu rejaga loyihada hozirgi vaqtda amalga oshirish imkoni bo'lmagan vazifalar kiritilgan. Ularni bajarish uchun tashqi tomonlar (1C backend dasturchisi, to'lov tizimlari, banklar, SMS provayderlar, domen egalari yoki alohida ma'lumotlar bazasi) tomonidan yangi API'lar, shartnomalar, maxfiy kalitlar va ma'lumotlar taqdim etilishi shart.

---

## 1. 1C ERP Tizimi Bilan Bog'liq Yetishmayotgan Texnik Imkoniyatlar

### 1.1. 1C Tomondan Buyurtmalarni Qabul Qilish Endpointi (`POST /order`)
- **Nega hozir amalga oshirib bo'lmaydi:**
  - Hozirda 1C da faqat ma'lumotlarni o'qish (GET) uchun 6 ta endpoint mavjud (`/categories`, `/units`, `/brands`, `/price`, `/all_product`, `/product?id=...`).
  - Sayt orqali rasmiylashtirilgan buyurtmalarni to'g'ridan-to'g'ri 1C bazasiga tushirish uchun hech qanday `POST` xizmati mavjud emas.
  - Hozirgi saytda buyurtma faqat foydalanuvchi brauzerida simulyatsiya qilinadi.
- **Nimalar talab etiladi:**
  - 1C dasturchisi tomonidan yangi `POST /order` yoki `POST /create_order` HTTP xizmati ishlab chiqilishi;
  - Qabul qilinadigan JSON strukturasi (kontragent, telefon, yetkazish manzili, tovarlar ro'yxati, narxlar, to'lov turi);
  - 1C da buyurtma yaratilgach, uning unikal ID raqamini saytga qaytaruvchi javob formati.

### 1.2. Mahsulot Variantlari va Guruhlash (Parent-Child / ProductGroup) Arxitekturasi
- **Nega hozir amalga oshirib bo'lmaydi:**
  - 1C bazasida bir xil mahsulotning ranglari yoki o'lchamlari (masalan, bitta modeldagi kalkulyatorning yashil, pushti va qora ranglari) alohida mustaqil mahsulot sifatida yotibdi.
  - 1C ma'lumotlarida ularni bitta guruhga birlashtiruvchi `parent_id` yoki `characteristics: { color, size }` mantiqiy bog'lanishi yo'q.
  - Frontend tomonlama ularni bitta sahifada "Rangini tanlang" tugmalari orqali avtomatik almashtirish uchun ma'lumotlar bazasi tuzilishi yetishmaydi.
- **Nimalar talab etiladi:**
  - 1C mutaxassisi tomonidan tovarlarga xususiyatlar (modifikatsiyalar/xarakteristikalar) bog'lanishi;
  - `/product` va `/all_product` API'larida ushbu variantlar strukturasining uzatilishi.

### 1.3. Real-Time Ombordagi Qoldiqni Band Qilish (Stock Reservation API)
- **Nega hozir amalga oshirib bo'lmaydi:**
  - Saytdagi narx va qoldiqlar kesh orqali ishlaydi. Agar 2 ta xaridor omborda qolgan oxirgi 1 dona tovar uchun bir vaqtda to'lov qilsa, zaxira yetishmovchiligi yuzaga keladi.
- **Nimalar talab etiladi:**
  - 1C da xarid jarayonida tovarni vaqtincha (masalan, 15 daqiqaga to'lov tugaguncha) band qilib turuvchi maxsus tranzaksion API xizmati.

---

## 2. To'lov Tizimlari va Moliyaviy Integratsiyalar

### 2.1. Payme, Click va Uzum Pay Onlayn To'lov Shlyuzlari
- **Nega hozir amalga oshirib bo'lmaydi:**
  - Saytda to'lov usullari (Payme, Click, Uzum, Humo/Uzcard) faqat vizual variant sifatida tanlanadi, ammo pul yechib olinmaydi.
  - To'lov tizimlari bilan integratsiya qilish uchun rasmiy bank hisob-raqami va provayderlar bilan tuzilgan shartnomalar kerak.
- **Nimalar talab etiladi:**
  - Payme Business, Click Merchant va Uzum Pay kabinetlaridan olinadigan maxfiy kalitlar:
    - `PAYME_MERCHANT_ID`, `PAYME_SECRET_KEY`;
    - `CLICK_SERVICE_ID`, `CLICK_MERCHANT_ID`, `CLICK_SECRET_KEY`;
  - To'lov holatini tekshiruvchi (Check / Perform Transaction / Webhook) xavfsiz server endpointlari.

### 2.2. B2B Avtomatik Elektron Hisob-Faktura (Didox / Soliq API)
- **Nega hozir amalga oshirib bo'lmaydi:**
  - Yuridik shaxslar xarid qilganda hisob-fakturani avtomatik Didox orqali jo'natish uchun Soliq/Didox integratsiya kalitlari mavjud emas (hozirda bu jarayon menejerlar tomonidan qo'lda qilinadi).
- **Nimalar talab etiladi:**
  - Didox API shartnomasi va integratsiya tokeni;
  - Korxona nomidan schyot-fakturani tasdiqlovchi ERI (Elektron raqamli imzo) xizmati.

---

## 3. Foydalanuvchi Shaxsi va Ma'lumotlar Bazasi (Backend & Database)

### 3.1. SMS OTP Shlyuzi va Telefon Orqali Avtorizatsiya (Eskiz / PlayMobile)
- **Nega hozir amalga oshirib bo'lmaydi:**
  - Saytda foydalanuvchilar ro'yxatdan o'tishi yoki SMS orqali tasdiqlash kodi olishi uchun SMS provayder ulanmagan.
- **Nimalar talab etiladi:**
  - SMS shlyuz (Eskiz.uz yoki PlayMobile) bilan rasmiy shartnoma;
  - `ESKIZ_EMAIL`, `ESKIZ_API_TOKEN` kabi kirish rekvizitlari;
  - SMS xabarnoma shablonlarining provayder tomonidan tasdiqlanishi.

### 3.2. Foydalanuvchilar va Haqiqiy Sharhlar Ma'lumotlar Bazasi (Database)
- **Nega hozir amalga oshirib bo'lmaydi:**
  - Saytda foydalanuvchi akkauntlarini, parollarini, yetkazish manzillarini va saytda yozilgan yangi sharhlarni saqlaydigan mustaqil ma'lumotlar bazasi (PostgreSQL / Supabase / MongoDB) ulanmagan.
  - Hozirgi sharhlar va buyurtmalar faqat mijoz brauzeri keshida (Zustand) saqlanadi.
- **Nimalar talab etiladi:**
  - Cloud ma'lumotlar bazasi (masalan, PostgreSQL/Prisma yoki Supabase);
  - Yangi sharhlarni moderator tomonidan tekshirish (Admin Panel) tizimi.

---

## 4. Tashqi Ma'muriy va Qidiruv Xizmatlarini Tasdiqlash

### 4.1. Google Search Console va Bing Webmaster Tools Domenni Tasdiqlash
- **Nega hozir dasturchi tomonidan to'liq yakunlanmaydi:**
  - Sayt kodi, sitemap va robots tayyor, ammo domenga egalik huquqini tasdiqlash uchun sayt egasi DNS sozlamalariga kirishi kerak.
- **Nimalar talab etiladi:**
  - Domen boshqaruv panelida (DNS) Google va Bing taqdim etgan maxsus TXT yozuvini joylashtirish;
  - GSC panelida `sitemap.xml` manzilini qo'lda tasdiqlash.

### 4.2. Google Business Profile (Google Xaritalar) Verifikatsiyasi
- **Nega hozir dasturchi tomonidan to'liq yakunlanmaydi:**
  - Do'konning jismoniy manzilini xaritada tasdiqlash Google tomonidan pochta xati (PIN kodli xat) yoki video tasdiq orqali amalga oshiriladi.
- **Nimalar talab etiladi:**
  - Google Business Profile ochish va do'kon joylashuvini rasmiy tasdiqlash.

---

## 5. Mazkur Vazifalarni Bajarish Uchun Talablar Xulosasi

| № | Yo'nalish | Kerakli manba / Mutaxassis | Kerakli ma'lumot yoki imkoniyat |
|---|---|---|---|
| 1 | **1C Buyurtma API** | 1C Backend dasturchisi | `POST /order` endpointi va JSON formati |
| 2 | **1C Mahsulot Variantlari** | 1C Mutaxassisi | Tovarlarga `parent_id` / modifikatsiyalar kiritish |
| 3 | **Onlayn To'lovlar** | Payme, Click, Uzum | Rasmiy shartnoma, Merchant ID va Secret Key |
| 4 | **SMS Tasdiqlash** | Eskiz.uz / PlayMobile | SMS API tokeni va tasdiqlangan SMS shabloni |
| 5 | **Foydalanuvchilar Bazasi** | Loyiha egasi / DevOps | PostgreSQL ma'lumotlar bazasi ulanishi |
| 6 | **Domen Tasdiqlash** | Domen egasi | DNS paneliga kirish va TXT yozuvlarini kiritish |
| 7 | **Google Maps Profile** | Do'kon ma'muriyati | Do'konning jismoniy fotosuratlari va verifikatsiya |
