# 1C ERP Yangi `POST /order` API Integratsiyasi — Amaliy Reja

> **Asosiy hujjat:** `Loyixa_xujjatlari/Api/user_api/Buyurtma yaratish.txt`  
> **Endpoint:** `POST http://1cloud.uz:777/SORA/hs/for_msp/order` (1C:Предприятие 8.3.20, Basic Auth)  
> **Maqsad:** 1C dasturchilari kiritgan yangi javob formati (`status_code`, `status`, `posted`, `total_amount`), qat’iy validatsiya (`400`/`404`/`500`) va chernovik buyurtma (`201 Created`, `posted: false`) mantiqini Sora.uz veb-ilovasiga to‘liq va xavfsiz tatbiq etish.

---

## 1. Hozirgi Kod va Yangi 1C API O‘rtasidagi Tafovutlar (Audit)

Loyihadagi mavjud kod (`order.ts`, `client.ts`, `api/order/create`, `CheckoutForm.tsx`, `OrderSuccessView.tsx`, `OrderTrackerModal.tsx`) yangi 1C spetsifikatsiyasi bilan solishtirilganda quyidagi **6 ta muhim nomuvofiqlik** aniqlandi:

| № | Bo‘lim / Fayl | Hozirgi holat | Yangi 1C API talabi | Xavf darajasi |
| :-: | :--- | :--- | :--- | :---: |
| 1 | `src/lib/schemas/order.ts` | `OneCOrderResponseSchema` faqat `message`, `order_number`, `order_id` ni o‘qiydi | `status_code` (`CONFIRMED`/`PENDING`), `status`, `posted`, `total_amount` qaytadi — hozirgi Zod ularni tashlab yubormoqda | **Yuqori** |
| 2 | `src/lib/api/client.ts` (`createOrder`) | `500` yoki tarmoq xatosida soxta `РТ-XXXXXX` buyurtma yasab `201` (`success: true`) qaytarmoqda | Endi qoldiq yetmaganda 1C o‘zi `201 (posted: false)` beradi; `500` esa faqat buyurtma **saqlanmaganda** chiqadi — soxta muvaffaqiyat ko‘rsatish mijozni chalg‘itadi! | **Kritik** |
| 3 | `src/app/api/order/create/route.ts` | `/register` vaqtincha xato bersa, soxta `crypto.randomUUID()` yuboriladi | 1C endi bazada yo‘q GUID’ga qat’iy `404 Not Found` qaytaradi | **Yuqori** |
| 4 | `src/components/checkout/OrderSuccessView.tsx` | Faqat `liveStatus === "Tasdiqlangan"` matnini tekshiradi | Yangi 1C `status_code: "CONFIRMED"` / `"PENDING"` va `status: "Qabul qilindi / Tasdiqlandi"` / `"Tekshirilmoqda"` qaytaradi — eski matn tekshiruvi noto‘g‘ri status ko‘rsatib qo‘yadi | **Kritik** |
| 5 | `src/components/checkout/CheckoutForm.tsx` | Chekda va analitikada faqat frontend hisoblagan `total` ishlatiladi; `posted`/`status_code` saqlanmaydi | Chek va hisobda 1C qaytargan `total_amount` (2 xona yaxlitlangan) ishlatilishi, `posted: false` da qayta yubormasdan savat tozalanishi shart | **O‘rta** |
| 6 | `src/components/checkout/OrderTrackerModal.tsx` | Faqat `status` matnini ko‘rsatadi, yagona `status_code` rang/ikonka xaritasi yo‘q | `POST /order` va `GET /order` bir xil `status_code` (`CONFIRMED`, `PENDING`, `CANCELLED`) qaytaradi — yagona UI badge xaritasi kerak | **O‘rta** |

---

## 2. Bosqichma-Bosqich Amalga Oshirish Rejasi

### 1-Bosqich: Schemalar va Yagona Status Xaritasi (`Data Layer`)

1. **`src/lib/schemas/order.ts` ni yangilash:**
   - Yangi `OrderStatusCodeSchema`: `z.enum(["CONFIRMED", "PENDING", "CANCELLED"])` (noma’lum yangi kodlar uchun xavfsiz fallback bilan).
   - `OneCOrderResponseSchema` ni kengaytirish:
     - `message`: `string` (ixtiyoriy)
     - `order_number`: `string`
     - `order_id`: `string`
     - `status_code`: `"CONFIRMED" | "PENDING"` (ixtiyoriy — orqaga moslik uchun)
     - `status`: `string` (ixtiyoriy)
     - `posted`: `boolean` (ixtiyoriy, standart `true` emas — aniq tekshiriladi)
     - `total_amount`: `number` (ixtiyoriy, `nonnegative`)
   - `OneCOrderStatusResponseSchema` (`GET /order`) ga ham ixtiyoriy `status_code` va `posted` maydonlarini qo‘shish.
   - Request validatsiyasi (`OrderProductItemSchema`): `quantity > 0` va `price >= 0` qoidalarini saqlash, `null` qiymatlarni oldindan rad etish.

2. **Yangi yagona status yordamchi moduli (`src/lib/utils/order-status.ts`):**
   - `POST /order` va `GET /order` uchun umumiy `normalizeOrderStatus(statusCode?, statusText?, posted?)` va `getOrderStatusUiMeta(normalized, locale)` funksiyalari:
     - **`CONFIRMED`** (`status_code === "CONFIRMED"` yoki `posted === true` yoki eski `"Tasdiqlangan"` / `"Qabul qilindi / Tasdiqlandi"`):
       - Rang: **Yashil (`emerald`)** · Ikonka: `CheckCircle2`
       - UZ: *«Tasdiqlangan (1C da o‘tkazilgan)»* · RU: *«Подтверждён (проведён в 1С)»*
     - **`PENDING`** (`status_code === "PENDING"` yoki `posted === false` yoki eski `"Jarayonda"` / `"Tekshirilmoqda"`):
       - Rang: **Sariq (`amber`)** · Ikonka: `Clock`
       - UZ: *«Qabul qilindi — menejer tekshiruvida»* · RU: *«Принят — на проверке у менеджера»*
     - **`CANCELLED`** (`status_code === "CANCELLED"` yoki `"Bekor qilingan"`):
       - Rang: **Qizil (`rose`)** · Ikonka: `XCircle`
       - UZ: *«Bekor qilingan»* · RU: *«Отменён»*

---

### 2-Bosqich: 1C API Klienti (`src/lib/api/client.ts`) — Halol Xatolar va `404`/`500` Boshqaruvi

1. **`createOrder(payload)` da soxta fallback (`РТ-XXXXXX`) ni olib tashlash:**
   - Avval 1C qoldiq yetmaganda `500` bergani uchun vaqtincha soxta `РТ-...` buyurtma qaytarish qo‘yilgan edi.
   - Endi 1C bunday holatlarda o‘zi **`201 Created` (`posted: false`, `status_code: "PENDING"`)** qaytargani sababli:
     - **`200` / `201`:** Yangi `OneCOrderResponseSchema` bilan parse qilib, barcha maydonlarni (`order_id`, `order_number`, `status_code`, `status`, `posted`, `total_amount`, `message`) qaytarish.
     - **`400 Bad Request`:** 1C qaytargan `{"error": "..."}` matnini `statusCode: 400` bilan qaytarish (o‘chirishga belgilangan mahsulot/mijoz yoki noto‘g‘ri miqdor/narx).
     - **`404 Not Found`:** 1C qaytargan `{"error": "..."}` matnini `statusCode: 404` bilan qaytarish (bazada topilmagan `product_id`, `contact_id` yoki `client_id`).
     - **`500 Internal Server Error` va tarmoq uzilishi:** Endi soxta `201` emas, `success: false, statusCode: 500, retryable: true` qaytarish — shunda foydalanuvchi savatchasi saqlanib qoladi va qayta urinish tugmasini bosa oladi!
   - **`null` himoyasi:** So‘rov yuborishdan oldin `payload` ichida `null` qiymatlar ketmasligini (barcha ixtiyoriy matn maydonlari `""` yoki tushirib qoldirilganini) kafolatlash.

---

### 3-Bosqich: Buyurtma Yaratish Backend Route (`src/app/api/order/create/route.ts`)

1. **Soxta GUID (`crypto.randomUUID()`) yuborilishini to‘xtatish:**
   - **B2C:** Agar 1C `/register` dan haqiqiy `contactId` olinmasa, soxta UUID bilan `POST /order` ga urmasdan, `503 Service Unavailable` (`retryable: true`) qaytarish.
   - **B2B:** Agar 1C `/register` dan haqiqiy `clientId` olinmasa, xuddi shunday `503` qaytarish. `contactId` esa B2B da ixtiyoriy bo‘lgani uchun topilmasa `undefined` qoldiriladi (1C hujjatiga 100% mos: *"B2B da noto‘g‘ri yoki bo‘sh yuborilsa e’tiborsiz qoldiriladi"*).
2. **Kengaytirilgan `201 Created` javobi:**
   - Frontendga quyidagi to‘liq ma’lumot qaytariladi:
     - `success: true`
     - `order_id`, `order_number`, `message`
     - `status_code` (`"CONFIRMED"` | `"PENDING"`)
     - `status`, `posted` (`boolean`), `total_amount` (`number`)
3. **Xato kodlarini aniq uzatish:** `400`, `404`, `500`/`503` kodlari va `retryable` bayrog‘ini 1C ning ekranlangan `error` matni bilan birga aniq uzatish.

---

### 4-Bosqich: Frontend (`CheckoutForm`, `OrderSuccessView`, `OrderTrackerModal`)

1. **`CheckoutForm.tsx`:**
   - **`201 Created` (`posted: true` va `posted: false` ikkalasida ham):**
     - **Hech qachon qayta yubormaslik (`no retry`)!**
     - 1C qaytargan **`total_amount`** ni rasmiy mahsulotlar summasi sifatida qabul qilish (`1C total_amount` + yetkazib berish narxi `deliveryFee` ni aniq saqlash).
     - `localStorage("sora_last_order")` ga `statusCode`, `statusText`, `posted`, `serverMessage`, `totalAmount1C` maydonlarini yozish.
     - Yandex Metrika (`PURCHASE_SUCCESS` va ecommerce `purchase`) ga 1C ning aniq `total_amount` qiymatini uzatish.
     - Darhol `/checkout/success?orderId=...&orderNumber=...` ga yo‘naltirish (savat `OrderSuccessView` da tozalanadi).
   - **`400` / `404` xato kelganda:**
     - 1C dan kelgan aniq xabarni qizil ogohlantirish blokida ko‘rsatish (masalan, o‘chirilgan yoki bazadan topilmagan mahsulot bo‘lsa *"Savatchaga qaytish"* havolasi bilan).
   - **`500` / `503` / tarmoq uzilishida:**
     - Savatchani saqlab qolish, `isSubmitting` ni yechish va xaridorga **"Server vaqtincha band, iltimos 'Buyurtmani tasdiqlash' tugmasini qayta bosing"** xabarini ko‘rsatish.

2. **`OrderSuccessView.tsx`:**
   - Sahifa ochilgan zahoti `order.statusCode` / `order.posted` dan boshlang‘ich holatni ko‘rsatish (miltillamasdan!) va fonda `GET /api/order/status` bilan jonli holatni yangilash.
   - **`CONFIRMED` (`posted: true`) holatida:**
     - Yashil belgi, sarlavha *"Buyurtmangiz qabul qilindi va tasdiqlandi!"*, 1C `message` matni, timeline’da 2-bosqich yashil.
   - **`PENDING` (`posted: false`) holatida:**
     - Tinch sariq/ko‘k badge *"Qabul qilindi — menejer tekshiruvida"*, 1C `message` (*"Buyurtma qabul qilindi va menejer tekshiruviga yuborildi"*), aniq eslatma: **"Buyurtmangiz 1C tizimiga saqlandi — qayta buyurtma berish shart emas, menejerimiz tez orada bog‘lanadi."**
   - **Chek summasi:** 1C qaytargan `total_amount` (mahsulotlar summasi) va yetkazib berish haqi alohida hamda jami aniq ko‘rsatiladi.

3. **`OrderTrackerModal.tsx`:**
   - Yangi `getOrderStatusUiMeta()` dan foydalanib, `CONFIRMED`, `PENDING` va `CANCELLED` statuslarini bir xil rang, ikonka va UZ/RU nomlar bilan chiqarish.

---

### 5-Bosqich: Sifat Nazorati va Testlar

| Tekshiruv turi | Nimani tekshiradi |
| :--- | :--- |
| **Unit testlar (`tests/order.spec.ts`)** | • `OneCOrderResponseSchema` — `CONFIRMED` (`posted: true`, `total_amount`), `PENDING` (`posted: false`), hamda eski format bilan orqaga moslik<br>• `normalizeOrderStatus` & `getOrderStatusUiMeta` — `CONFIRMED`, `PENDING`, `CANCELLED` va eski o‘zbekcha matnlar (`Tasdiqlangan`, `Jarayonda`, `Bekor qilingan`) |
| **API / Integratsiya testlari** | • `400` validatsiya (manfiy narx, 0 miqdor, bo‘sh savat)<br>• `401` SMS tasdiqlashsiz B2C va B2B bloklanishi<br>• `404`/`500` da soxta `РТ-` muvaffaqiyat qaytmasligi |
| **Build & Lint** | • `npx tsc --noEmit`<br>• `npx eslint` (barcha o‘zgargan fayllar)<br>• `npm run build` |

---

## 3. O‘zgaradigan Fayllar Ro‘yxati (Xulosa)

1. `src/lib/schemas/order.ts` — yangi `POST /order` va `GET /order` javob maydonlari (`status_code`, `status`, `posted`, `total_amount`).
2. `src/lib/utils/order-status.ts` *(yangi)* — yagona `CONFIRMED` / `PENDING` / `CANCELLED` status va UI rang/matn xaritasi.
3. `src/lib/api/client.ts` — soxta `500 → 201` fallback’ni olib tashlash, `400`/`404`/`500` ni aniq uzatish, yangi javob maydonlarini qaytarish.
4. `src/app/api/order/create/route.ts` — soxta `crypto.randomUUID()` ni to‘xtatish, kengaytirilgan `201` javobini qaytarish.
5. `src/components/checkout/CheckoutForm.tsx` — `total_amount`, `posted`, `status_code` ni saqlash, `posted: false` da retry qilmaslik, `400`/`404`/`500` xatolarni aniq ko‘rsatish.
6. `src/components/checkout/OrderSuccessView.tsx` — `CONFIRMED` va `PENDING` (`posted: false`) uchun aniq UI, 1C `total_amount` cheki va yagona status badge.
7. `src/components/checkout/OrderTrackerModal.tsx` — yagona status badge xaritasiga o‘tkazish.
8. `tests/order.spec.ts` — yangi javob formati va status normalizatsiyasi uchun testlar.
