# 1C ERP Yangi `GET /order` (Buyurtma Holati va Tarixi) API Integratsiyasi — Amaliy Reja

> **Asosiy hujjat:** `Loyixa_xujjatlari/Api/user_api/Buyurtma holati va tarixini olish.txt`  
> **Endpoint:** `GET http://1cloud.uz:777/SORA/hs/for_msp/order` (1C:Предприятие 8.3.20, Basic Auth)  
> **Bog‘liq reja:** `Loyixa_xujjatlari/new_order.md` (`POST /order` yangilanishi bilan birgalikda yagona status tizimida ishlaydi)  
> **Maqsad:** `GET /order` servisining breaking change talablarini (majburiy egalik tekshiruvi, yangi `delivery` tuzilmasi, 7 xil `status_code`, dinamik `timeline`, to‘liq `products` tarkibi va sahifalangan buyurtmalar tarixi) Sora.uz veb-ilovasiga xavfsiz hamda ikki tilda (UZ/RU) joriy etish.

---

## 1. Hozirgi Kod va Yangi 1C `GET /order` API O‘rtasidagi Tafovutlar (Audit)

Mavjud kod (`order.ts`, `client.ts`, `api/order/status`, `OrderSuccessView.tsx`, `OrderTrackerModal.tsx`, `Header.tsx`, `sora_session` cookie) yangi 1C spetsifikatsiyasi bilan solishtirilganda **8 ta muhim nomuvofiqlik (jumladan 4 ta kritik breaking change)** aniqlandi:

| № | Bo‘lim / Fayl | Hozirgi holat | Yangi 1C `GET /order` talabi | Xavf darajasi |
| :-: | :--- | :--- | :--- | :---: |
| 1 | `src/lib/api/client.ts` (`getOrderStatus`) va `src/app/api/order/status/route.ts` | Faqat `?order_id={GUID}` yuboriladi; foydalanuvchi sessiyasi o‘qilmaydi | **Breaking Change:** Har bir so‘rovda `type` (`B2C`/`B2B`) va `contact_id` yoki `client_id` majburiy. Aks holda `400 Bad Request`, begona buyurtmaga `403 Forbidden` qaytadi | **Kritik** |
| 2 | `src/lib/schemas/order.ts` (`OneCOrderStatusResponseSchema`) | `without_delivery` ildiz darajasida, `order_date` qat’iy `string`, faqat 6 ta maydon kutiladi | **Breaking Change:** Bitta buyurtma tafsilotida `without_delivery` endi `delivery.without_delivery` ichida keladi; `order_date`, `online_date`, `geolocation`, `pickup_point`, `customer.contact`, `timeline[].date` qiymatlari `null` bo‘lishi mumkin | **Kritik** |
| 3 | `src/app/api/order/status/route.ts` | `400`/`404` dan boshqa barcha xatolarda (jumladan `403` va `500` da) soxta `РТ-0000...` buyurtma yasab `200 OK` qaytarmoqda | `403 Forbidden` da begona buyurtma ekani aniq ko‘rsatilishi, `401 Unauthorized` da tizimga kirish so‘ralishi, `500` da esa soxta ma’lumot ko‘rsatilmasligi shart | **Kritik** |
| 4 | `sora_session` cookie (`api/auth/*`, `api/order/create`) | `httpOnly` cookie ichida imzolanmagan oddiy JSON saqlanadi (`JSON.parse`) | Endi sessiyadagi `id` (`contact_id`/`client_id`) mijozning **barcha buyurtmalar tarixi va shaxsiy ma’lumotlariga (telefon, geolokatsiya, B2B oflayn xaridlar)** kalit vazifasini bajaradi — cookie HMAC-SHA256 bilan imzolanmasa, uni almashtirib begona GUID yuborish xavfi tug‘iladi | **Kritik (Xavfsizlik)** |
| 5 | `src/components/checkout/OrderSuccessView.tsx` | Faqat 3 ta qattiq yozilgan qadam va `liveStatus === "Tasdiqlangan"` matn tekshiruvi mavjud | 7 ta standart `status_code` va 1C dan keladigan dinamik 4/5 qadamli `timeline` (`completed: true, date: null` va `PENDING` holati qoidalari bilan) ko‘rsatilishi kerak | **Yuqori** |
| 6 | `src/components/checkout/OrderTrackerModal.tsx` | Avtorizatsiyasiz ochiq GUID qidiruvi; faqat eski 6 maydon va `result.without_delivery` o‘qiladi | Foydalanuvchi sessiyasisiz ishlay olmaydi (`401`/`403`); yangi javobdagi `delivery.without_delivery`, `timeline` va `products` tarkibini qo‘llab-quvvatlashi kerak | **Yuqori** |
| 7 | Shaxsiy kabinet / Buyurtmalar tarixi (`src/app/[locale]/orders`) | Loyihada buyurtmalar tarixi sahifasi umuman mavjud emas | **2-Rejim (`GET /order` — `order_id` siz):** Mijozning barcha buyurtmalari ro‘yxati (`limit`, `offset`, `has_more`, `only_online`) uchun alohida *"Mening buyurtmalarim"* sahifasi va tafsilot paneli kerak | **Yangi imkoniyat** |
| 8 | Ikki tillilik (UZ / RU) | 1C qaytargan `status` matni to‘g‘ridan-to‘g‘ri UI ga chiqariladi | 1C `status` va `timeline[].title` ni faqat o‘zbek tilida qaytaradi — ruscha interfeysda (`locale === "ru"`) barcha nomlar qat’iy `status_code` / `timeline[].code` va `without_delivery` bo‘yicha lokal lug‘atdan chiqarilishi shart | **O‘rta** |

---

## 2. Yagona Status va Timeline Xaritasi (`new_order.md` bilan Muvofiqlashtirilgan)

`POST /order` (`new_order.md`) va `GET /order` (`new_order_get_st.md`) bitta umumiy `src/lib/utils/order-status.ts` modulidan foydalanadi. 1C spetsifikatsiyasining 4-bo‘limidagi barcha **7 ta `status_code`** qiymati yetkazib berish usuliga (`without_delivery`) va tilga (`uz` / `ru`) qarab quyidagicha xaritalanadi:

| `status_code` | Yetkazib berish (`without_delivery: false`) — UZ / RU | Samovivoz (`without_delivery: true`) — UZ / RU | UI Rangi / Ikonka |
| :--- | :--- | :--- | :--- |
| `PENDING` | **UZ:** Tekshirilmoqda<br>**RU:** На проверке | **UZ:** Tekshirilmoqda<br>**RU:** На проверке | Sariq (`amber`) · `Clock` |
| `CONFIRMED` | **UZ:** Qabul qilindi / Tasdiqlandi<br>**RU:** Принят / Подтверждён | **UZ:** Qabul qilindi / Tasdiqlandi<br>**RU:** Принят / Подтверждён | Ko‘k (`sky`) · `CheckCircle2` |
| `ASSEMBLED` | **UZ:** Omborda yig‘ildi<br>**RU:** Собран на складе | **UZ:** Olib ketishga tayyor<br>**RU:** Готов к выдаче | Binafsha/Indigo (`indigo`) · `PackageCheck` |
| `SHIPPED` | **UZ:** Kuryerga topshirildi / Yo‘lda<br>**RU:** Передан курьеру / В пути | — *(faqat yetkazib berishda)* | Moviy (`blue`) · `Truck` |
| `READY_FOR_PICKUP` | — *(faqat samovivozda)* | **UZ:** Topshirishga tayyor<br>**RU:** Готов к самовывозу | Zangori (`teal`) · `Store` |
| `DELIVERED` | **UZ:** Yetkazib berildi<br>**RU:** Доставлен | **UZ:** Mijozga topshirildi<br>**RU:** Выдан клиенту | Yashil (`emerald`) · `BadgeCheck` |
| `CANCELLED` | **UZ:** Bekor qilingan<br>**RU:** Отменён | **UZ:** Bekor qilingan<br>**RU:** Отменён | Qizil (`rose`) · `XCircle` |

### `timeline` chizishning 3 ta majburiy qoidasi:
1. **4 yoki 5 qadamli tuzilma:** Standart buyurtmada `timeline` 4 ta qadamdan iborat (`CONFIRMED` → `ASSEMBLED` → `SHIPPED` yoki `READY_FOR_PICKUP` → `DELIVERED`). Faqat buyurtma bekor qilinganda 5-element sifatida `CANCELLED` qo‘shiladi va qizil holatda ajratib ko‘rsatiladi.
2. **O‘tkazib yuborilgan bosqich (`completed: true, date: null`):** Omborchi oraliq bosqichni belgilamasdan keyingisiga o‘tgan bo‘lsa, qadam bajarilgan (**yashil belgi**) ko‘rinishida chiqadi, lekin sana/vaqt satri ko‘rsatilmaydi (`null` xavfsiz tekshiriladi).
3. **`PENDING` holati:** Barcha 4 ta `timeline` qadami `completed: false` bo‘lib keladi — UI da bosqichlar ustida alohida sariq ogohlantirish chizig‘i (*«Buyurtma qabul qilindi, menejer tasdig‘ida»*) chiqariladi.

---

## 3. Arxitektura va Xavfsizlik Qarorlari

1. **Imzolangan `sora_session` cookie (`HMAC-SHA256`):**
   - `src/lib/auth/session.ts` yagona sessiya moduli yaratiladi (loyihadagi `src/lib/utils/audit-auth.ts` va `src/lib/sms/otp-store.ts` dagi HMAC yondashuvi asosida).
   - Cookie qiymati `base64url(payload).hmacSignature` ko‘rinishida saqlanadi; `getSessionUser()` funktsiyasi avval imzoni `crypto.timingSafeEqual` bilan tekshiradi, so‘ngra `AuthUserSchema` dan o‘tkazadi.
   - Barcha 5 ta auth nuqtasi (`login`, `register`, `otp/verify`, `otp/complete`, `order/create`) cookie yozishda aynan `setSessionCookie(user)` dan foydalanadi.
2. **Server-side egalik kafolati (`Zero Trust` brauzerga):**
   - Next.js API route’lari (`/api/order/status` va `/api/orders`) `type`, `contact_id` va `client_id` parametrlarini **hech qachon** query string yoki request body dan olmaydi — faqat tekshirilgan `sora_session` cookie dan oladi:
     - `session.type === "B2C"` → 1C ga `type=B2C&contact_id={session.id}`
     - `session.type === "B2B"` → 1C ga `type=B2B&client_id={session.id}`
   - Agar foydalanuvchi tizimga kirmagan bo‘lsa (`!session`), 1C ga so‘rov yuborilmasdan darhol `401 Unauthorized` qaytadi.
3. **B2C ↔ B2B checkout chetki holati (Edge Case):**
   - Hozir `api/order/create/route.ts` faqat `!sessionUser` bo‘lgandagina cookie yozadi. Agar B2C sifatida kirgan foydalanuvchi checkoutda B2B (yoki aksincha) buyurtma bersa, `OrderSuccessView` dagi `GET /api/order/status` eski sessiya turi bilan urilib `403 Forbidden` olishi mumkin.
   - **Yechim:** `api/order/create` buyurtma muvaffaqiyatli yaratilganda, yaratilgan buyurtma egasi (`type` + `clientId`/`contactId`) joriy sessiyadan farq qilsa, sessiyani yangilash yoki `OrderSuccessView` uchun qisqa muddatli (masalan, 24 soatlik) imzolangan `sora_last_order_access` (`{ orderId, type, ownerId }`) `httpOnly` cookie qo‘yish. Bunda `api/order/status` avval `sora_session` ni, u mos kelmasa shu `order_id` uchun `sora_last_order_access` ni tekshiradi — xavfsizlik ham, UX ham buzilmaydi.
4. **B2B uchun `only_online` filtri:**
   - 1C hujjatiga ko‘ra `only_online` sukut bo‘yicha `B2C: true`, `B2B: false` (ya’ni B2B da menejer orqali kiritilgan oflayn realizatsiyalar ham qaytadi).
   - B2B foydalanuvchilar uchun *"Mening buyurtmalarim"* sahifasida qulay **2 tugmali filtr** qo‘yiladi: **«Barcha buyurtmalar (sayt + oflayn)»** (`only_online=false`) va **«Faqat sayt buyurtmalari»** (`only_online=true`). B2C da esa standart `only_online=true` ishlatiladi.

---

## 4. Bosqichma-Bosqich Amalga Oshirish Rejasi

### 1-Bosqich: Xavfsiz Sessiya Qatlami (`src/lib/auth/session.ts`)
1. `src/lib/auth/session.ts` yaratish:
   - `setSessionCookie(cookieStore, user)` — `AuthUser` ni HMAC-SHA256 bilan imzolab `sora_session` `httpOnly` cookie ga yozish.
   - `getSessionUser(cookieStore?)` — imzoni va Zod sxemasini tekshirib `AuthUser | null` qaytarish (imzosiz eski cookie kelganda xavfsiz `null` qaytarish).
   - `clearSessionCookie(cookieStore)` — `logout` uchun.
   - Ixtiyoriy `setRecentOrderAccessCookie` / `getRecentOrderAccess` — checkoutdan keyin B2C↔B2B farqida `OrderSuccessView` uzilmasligi uchun.
2. Mavjud cookie yozish/o‘qish joylarini (`api/auth/login`, `register`, `logout`, `me`, `otp/verify`, `otp/complete`, `api/order/create`) shu yagona helper ga o‘tkazish.

### 2-Bosqich: Zod Sxemalari va Yagona Status Moduli (`Data Layer`)
1. **`src/lib/schemas/order.ts` ni kengaytirish:**
   - `OrderStatusCodeSchema`: barcha 7 ta kod (`PENDING`, `CONFIRMED`, `ASSEMBLED`, `SHIPPED`, `READY_FOR_PICKUP`, `DELIVERED`, `CANCELLED`).
   - `OrderPaymentTypeSchema`: `z.enum(["TRANSFER", "CASH_OR_CARD"]).or(z.string())`.
   - `OneCOrderDeliverySchema`: `{ without_delivery: boolean, geolocation: string | null, pickup_point: string | null }`.
   - `OneCOrderCustomerContactSchema`: `{ contact_id: string, name: string, phone_1: string | null, phone_2: string | null, tg_username: string | null }`.
   - `OneCOrderCustomerSchema`: `{ type: "B2B" | "B2C", client_id: string | null, client_name: string | null, contact: OneCOrderCustomerContactSchema | null }`.
   - `OneCOrderTimelineStepSchema`: `{ code: string, title: string, completed: boolean, date: string | null }`.
   - `OneCOrderProductLineSchema`: `{ line_number: number, product_id: string, product_name: string, unit: string, quantity: number, price: number, amount: number }`.
   - **`OneCOrderDetailResponseSchema` (1-Rejim):** yuqoridagi barcha bloklar + `order_id`, `order_number`, `order_date: string | null`, `online: boolean`, `online_date: string | null`, `payment_type`, `status_code`, `status`, `total_amount`, `comment`.
   - **`OneCOrderHistoryItemSchema` va `OneCOrderHistoryResponseSchema` (2-Rejim):** `{ limit, offset, has_more, orders: [{ order_id, order_number, order_date, online, status_code, status, without_delivery, total_amount, items_count }] }`.
2. **`src/lib/utils/order-status.ts` yaratish:**
   - `normalizeOrderStatus(statusCode?, statusText?, posted?)` — barcha 7 kod hamda eski o‘zbekcha matnlar uchun.
   - `getOrderStatusUiMeta(code, { locale, withoutDelivery })` — rang klasslari, badge stili, ikonka kaliti va UZ/RU tarjima.
   - `getTimelineStepLabel(code, { locale, withoutDelivery, fallbackTitle })` — UZ/RU timeline sarlavhasi.
   - `formatOrderDate(isoOrNull, locale)` — `null` kelganda bo‘sh qaytaradigan, aks holda `DD.MM.YYYY, HH:mm` formatlaydigan yordamchi funksiya.

### 3-Bosqich: 1C API Klienti (`src/lib/api/client.ts`)
1. **`getOrderDetail(params)`** (eski `getOrderStatus(orderId)` o‘rniga / yangilangan ko‘rinishi):
   - Kirish: `{ orderId: string; type: "B2C" | "B2B"; contactId?: string; clientId?: string }`.
   - URL: `GET /order?order_id=...&type=...&(contact_id=... | client_id=...)`.
   - `200 OK` → `OneCOrderDetailResponseSchema.safeParse(resJson)` (parse xatosi bo‘lsa logga yozib `502` qaytarish).
   - `400`, `403`, `404`, `500` → 1C qaytargan `{"error": "..."}` matnini aniq `statusCode` bilan qaytarish (hech qanday soxta fallback yo‘q!).
2. **`getOrderHistory(params)`** (yangi metod):
   - Kirish: `{ type: "B2C" | "B2B"; contactId?: string; clientId?: string; limit?: number; offset?: number; onlyOnline?: boolean }`.
   - `limit` ni `1..100` oralig‘ida, `offset` ni `>= 0` qilib xavfsiz tekshirish.
   - `onlyOnline` uzatilganda `&only_online=true|false` parametrini qo‘shish.
   - `200 OK` → `OneCOrderHistoryResponseSchema.safeParse(resJson)`.
   - `400`, `500` va tarmoq xatolarini aniq qaytarish (`cache: "no-store"`).

### 4-Bosqich: Next.js API Route’lari
1. **`src/app/api/order/status/route.ts` ni qayta yozish (1-Rejim — Bitta buyurtma tafsiloti):**
   - `orderId` (`orderId` yoki `order_id`) majburiyligini va bazaviy GUID formatini tekshirish (`400`).
   - `getSessionUser()` orqali joriy foydalanuvchini olish (yoki `sora_last_order_access` orqali yangi yaratilgan buyurtma egasini aniqlash).
   - Sessiya yo‘q bo‘lsa → `401 Unauthorized` (`code: "AUTH_REQUIRED"`).
   - `api.getOrderDetail({ orderId, type, contactId, clientId })` ni chaqirish.
   - `200`, `400`, `403`, `404`, `500` javoblarini aniq uzatish; eski soxta `РТ-0000...` fallback blokini **butunlay olib tashlash**.
2. **Yangi `src/app/api/orders/route.ts` yaratish (2-Rejim — Buyurtmalar tarixi):**
   - `getSessionUser()` ni tekshirish; yo‘q bo‘lsa `401 Unauthorized`.
   - Query parametrlarini o‘qish: `limit` (standart `20`, max `100`), `offset` (standart `0`), `only_online` (ixtiyoriy `"true"` / `"false"`).
   - `type` va `contact_id`/`client_id` ni **faqat** `session` dan olib `api.getOrderHistory(...)` ni chaqirish.
   - Javob: `{ success: true, limit, offset, has_more, orders, customerType: session.type }`.

### 5-Bosqich: Frontend UI Yangilanishlari (UZ & RU)
1. **Qayta ishlatiladigan `OrderTimeline.tsx` komponenti (`src/components/orders/OrderTimeline.tsx`):**
   - 1C dan kelgan `timeline` massivini 4/5 qadamli vertikal (mobil) va gorizontal (desktop) ko‘rinishda chizadi.
   - `status_code === "PENDING"` da ustida sariq *"Menejer tasdig‘ida"* bannerini ko‘rsatadi.
   - `completed: true, date: null` holatida yashil belgi chiqarib, vaqtni yashiradi.
   - `CANCELLED` qadami kelsa, qizil indikator bilan ajratib ko‘rsatadi.
   - `locale === "ru"` da barcha qadam sarlavhalarini `timeline[].code` + `without_delivery` orqali rus tiliga tarjima qiladi.
2. **Yangi *"Mening buyurtmalarim"* sahifasi (`src/app/[locale]/orders/page.tsx` + `OrdersHistoryClient.tsx` + `OrderDetailDrawer.tsx`):**
   - **Avtorizatsiya holati:** Kirilmagan foydalanuvchiga chiroyli *"Buyurtmalaringiz tarixini ko‘rish uchun telefon raqamingiz orqali kiring"* kartochkasi va `openModal({ tab: "login" })` tugmasi.
   - **Ro‘yxat ko‘rinishi (2-Rejim):**
     - Har bir buyurtma kartasida: `order_number`, `order_date`, rangli `status_code` badge, `items_count` ta mahsulot, `without_delivery` (Kuryer / Samovivoz) belgisi, `online: false` bo‘lsa *"Oflayn xarid"* yorlig‘i, `total_amount` (UZS).
     - B2B foydalanuvchilar uchun `only_online` filtri (*«Barchasi»* / *«Faqat sayt»*).
     - `has_more: true` bo‘lsa **«Yana yuklash»** (`offset = offset + limit`) tugmasi.
   - **Buyurtma tafsiloti oynasi/sahifasi (1-Rejim):**
     - Kartochkani bosganda `GET /api/order/status?orderId={order_id}` chaqiriladi va quyidagilar ko‘rsatiladi:
       - `OrderTimeline` (jonli bosqichlar tarixi)
       - Mahsulotlar jadvali (`products`: `line_number`, `product_name`, `quantity` + `unit`, `price`, `amount`) va 1C dagi eng aktual `total_amount` (menejer tahrirlagan bo‘lsa ham yangi summa ko‘rinadi)
       - Yetkazib berish bloki (`delivery.without_delivery`: samovivozda `delivery.pickup_point`, kuryerda `delivery.geolocation` xarita havolasi)
       - To‘lov turi (`TRANSFER` → Pul o‘tkazish / `CASH_OR_CARD` → Naqd yoki karta), `comment`, `customer` ma’lumotlari (`client_name`, `contact.name`, `phone_1`, `phone_2`, `tg_username` — barchasi `null`-xavfsiz).
3. **`OrderSuccessView.tsx` ni yangilash:**
   - Eski qattiq 3-qadamli timeline va `liveStatus === "Tasdiqlangan"` o‘rniga yangi `OrderTimeline` va `getOrderStatusUiMeta()` ni ulash.
   - `GET /api/order/status` muvaffaqiyatli qaytsa, 1C ning aktual `total_amount`, `delivery.pickup_point` va `products` tarkibini ko‘rsatish.
   - Pastki tugmalar qatoriga **«Mening buyurtmalarim»** (`/orders`) havolasini qo‘shish.
4. **`OrderTrackerModal.tsx` va `Header.tsx` ni yangilash:**
   - `Header.tsx` foydalanuvchi menyusiga birinchi qator sifatida **«Mening buyurtmalarim»** (`Link href="/orders"`) qo‘shish, `"Buyurtma holati"` modalini esa GUID bo‘yicha tezkor tekshirish sifatida saqlab qolish.
   - `OrderTrackerModal.tsx` da:
     - `user` yo‘q bo‘lsa kirishga yo‘naltirish (`openModal`).
     - `result.delivery.without_delivery`, 7 xil `status_code` badge, ixcham `OrderTimeline` va mahsulotlar soni/summasini ko‘rsatish.
     - `403 Forbidden` da *"Ushbu buyurtma sizning hisobingizga tegishli emas"* xabarini tushunarli chiqarish.
5. **Tarjimalar (`messages/uz.json` va `messages/ru.json`):**
   - `orders` bo‘limi (sahifa sarlavhasi, 7 ta status nomi yetkazib berish va samovivoz uchun, filtrlar, bo‘sh holat, `401`/`403`/`404` xato matnlari, mahsulotlar jadvali ustunlari).

### 6-Bosqich: Sifat Nazorati, Testlar va Hujjatlashtirish

| Tekshiruv turi | Nimani tekshiradi |
| :--- | :--- |
| **Unit testlar (`tests/order.spec.ts`)** | • `OneCOrderDetailResponseSchema` — `delivery.without_delivery`, `null` maydonlar (`order_date`, `pickup_point`, `geolocation`, `contact`, `timeline[].date`), 4 va 5 qadamli `timeline`, `products`<br>• `OneCOrderHistoryResponseSchema` — `limit`, `offset`, `has_more`, ildizdagi `without_delivery`<br>• `getOrderStatusUiMeta` va `getTimelineStepLabel` — barcha 7 ta `status_code`, `without_delivery: true/false`, `uz`/`ru`<br>• `session.ts` — HMAC imzo tekshiruvi va o‘zgartirilgan (tampered) cookie’ni rad etish |
| **API testlari** | • `/api/order/status` va `/api/orders` — sessiyasiz `401`, noto‘g‘ri GUID `400`, begona buyurtma `403`, topilmagan `404`, soxta `РТ-0000` fallback qaytmasligi |
| **Build & Lint** | • `npx tsc --noEmit`<br>• `npx eslint` (barcha yangi va o‘zgargan fayllar)<br>• `npm run build` |
| **Hujjat yangilash** | • `Loyixa_xujjatlari/api_1c.md` da `GET /order` ning 1-Rejim va 2-Rejim qatorlarini yangilash |

---

## 5. `POST /order` (`new_order.md`) bilan Bog‘liqlik va Tavsiya Etilgan Tartib

Har ikkala hujjat (`new_order.md` va `new_order_get_st.md`) bir xil umumiy fayllarga tayanadi (`src/lib/schemas/order.ts`, `src/lib/utils/order-status.ts`, `src/lib/api/client.ts`, `OrderSuccessView.tsx`, `OrderTrackerModal.tsx`). Shuning uchun ularni **bitta yaxlit sprint** sifatida quyidagi ketma-ketlikda joriy etish eng samarali hisoblanadi:

1. **Umumiy poydevor:** `src/lib/auth/session.ts` (HMAC sessiya) + `src/lib/schemas/order.ts` (`POST` va `GET` sxemalari birgalikda) + `src/lib/utils/order-status.ts` (barcha 7 ta status kodi).
2. **1C Klienti va Backend Route’lar:** `client.ts` (`createOrder`, `getOrderDetail`, `getOrderHistory`), `/api/order/create`, `/api/order/status`, `/api/orders`.
3. **Frontend UI:** `CheckoutForm.tsx` → `OrderTimeline.tsx` → `OrderSuccessView.tsx` → `OrderTrackerModal.tsx` → `/[locale]/orders` (*"Mening buyurtmalarim"*).
4. **Testlar va Build:** `tests/order.spec.ts` + `tsc` + `eslint` + `npm run build`.

---

## 6. O‘zgaradigan va Yangi Yaratiladigan Fayllar Ro‘yxati

| Fayl | Holat | Vazifasi |
| :--- | :---: | :--- |
| `src/lib/auth/session.ts` | **Yangi** | HMAC-SHA256 imzolangan `sora_session` va `sora_last_order_access` cookie boshqaruvi |
| `src/lib/utils/order-status.ts` | **Yangi** | 7 ta `status_code` va `timeline` qadamlari uchun UZ/RU tarjima, rang va ikonka xaritasi |
| `src/lib/schemas/order.ts` | O‘zgaradi | 1-Rejim (`OneCOrderDetailResponseSchema`) va 2-Rejim (`OneCOrderHistoryResponseSchema`) Zod sxemalari |
| `src/lib/api/client.ts` | O‘zgaradi | `getOrderDetail()` (egalik parametrlari bilan) va `getOrderHistory()` metodlari |
| `src/app/api/auth/*` (5 ta route) | O‘zgaradi | Yagona imzolangan `session.ts` helper’iga o‘tish |
| `src/app/api/order/create/route.ts` | O‘zgaradi | Imzolangan sessiya + `sora_last_order_access` cookie qo‘yish |
| `src/app/api/order/status/route.ts` | O‘zgaradi | Sessiyadan `type` + `contact_id`/`client_id` uzatish, `401`/`403` boshqaruvi, soxta fallbackni o‘chirish |
| `src/app/api/orders/route.ts` | **Yangi** | Sahifalangan buyurtmalar tarixi API (`limit`, `offset`, `only_online`) |
| `src/components/orders/OrderTimeline.tsx` | **Yangi** | Dinamik 4/5 qadamli timeline (`PENDING`, `date: null`, `CANCELLED` qo‘llab-quvvatlashi bilan) |
| `src/app/[locale]/orders/page.tsx` | **Yangi** | *"Mening buyurtmalarim"* shaxsiy tarix sahifasi |
| `src/components/orders/OrdersHistoryClient.tsx` | **Yangi** | Tarix ro‘yxati, B2B `only_online` filtri, *"Yana yuklash"* sahifalash va tafsilot oynasi |
| `src/components/checkout/OrderSuccessView.tsx` | O‘zgaradi | `OrderTimeline`, 7 status kodi, 1C aktual summasi va `/orders` havolasi |
| `src/components/checkout/OrderTrackerModal.tsx` | O‘zgaradi | Sessiya tekshiruvi, `delivery.without_delivery`, `403` xabari va ixcham timeline |
| `src/components/layout/Header.tsx` | O‘zgaradi | Foydalanuvchi menyusiga *"Mening buyurtmalarim"* (`/orders`) qo‘shish |
| `messages/uz.json`, `messages/ru.json` | O‘zgaradi | `orders` bo‘limi tarjimalari (UZ va RU) |
| `tests/order.spec.ts` | O‘zgaradi | Yangi sxemalar, 7 ta status, `timeline` va HMAC sessiya testlari |
