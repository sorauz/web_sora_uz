# 1C ERP va Sora.uz Veb-Saytini Zudlik Bilan Sinxronizatsiya Qilish Qo‘llanmasi (On-Demand Revalidation)

## 1. Umumiy Ma'lumot va Maqsad

Vercel serverless platformasida xarajatlarni (Fast Origin Transfer va ISR Writes) **90-95% ga qisqartirish** maqsadida loyihada avtomatik fon kesh muddati **24 soat (86 400 soniya)** qilib belgilangan.

Biroq, 1C ERP tizimida quyidagi amallar bajarilganda:
* Yangi mahsulot qo‘shilganda;
* Mahsulot narxi yoki qoldiq soni o‘zgarganda;
* Aksiya yoki chegirmalar yangilanganda;
* Kategoriyalar tuzilmasi tahrirlanganda;

veb-saytda bu o‘zgarishlar **24 soat kutmasdan, 0 soniyada (zudlik bilan)** paydo bo‘lishi uchun **On-Demand Revalidation Webhook** arxitekturasi joriy etilgan.

---

## 2. API Endpoint Parametrlari

* **Asosiy URL:** `https://sora.uz/api/revalidate`
* **Qo‘llab-quvvatlanadigan HTTP Metodlar:** `GET` va `POST`
* **Xavfsizlik Maxfiy Kaliti (Secret Token):** `sora_revalidate_secret_2026`
  *(Ushbu kalit loyiha muhitida `REVALIDATION_SECRET` orqali boshqariladi)*

---

## 3. GET Metodi Orqali Havolalar (Tezkor Havolalar)

1C dasturchisi yoki administrator quyidagi havolalarga HTTP GET so‘rovini yuborish orqali tegishli keshni bir zumda tozalashi mumkin:

### 3.1. Narxlar o‘zgarganda
Barcha tovarlarning narxlari va chegirmalar keshini yangilaydi:
```http
GET https://sora.uz/api/revalidate?secret=sora_revalidate_secret_2026&tag=prices
```

### 3.2. Yangi tovar qo‘shilganda yoki tovarlar ro‘yxati o‘zgarganda
Katalog, toifalar va tovar sahifalarini to‘liq yangilaydi:
```http
GET https://sora.uz/api/revalidate?secret=sora_revalidate_secret_2026&tag=products
```

### 3.3. Muayyan bitta tovar ma'lumoti o‘zgarganda (⭐️ ENG TEJAMKOR USUL)
Faqatgina o‘sha aniq tovar sahifasini yangilaydi, qolgan yuzlab sahifalar keshiga tegmaydi (Vercel ISR Writes tejaladi):
```http
GET https://sora.uz/api/revalidate?secret=sora_revalidate_secret_2026&tag=product-{TOVAR_ID}
```
*Misol:* `https://sora.uz/api/revalidate?secret=sora_revalidate_secret_2026&tag=product-E1589`

### 3.4. Aksiyalar va maxsus takliflar yangilanganda
Bosh sahifadagi 4 ta maxsus blok, `/catalog/promotions`, `/catalog/popular`, `/catalog/new_products`, `/catalog/low_price_guarantee` sahifalarini yangilaydi:
```http
GET https://sora.uz/api/revalidate?secret=sora_revalidate_secret_2026&tag=offers
```

### 3.5. Kategoriyalar va katalog daraxti o‘zgarganda
Katalog navigatsiyasi, toifalar ro‘yxati va Header menyusini yangilaydi:
```http
GET https://sora.uz/api/revalidate?secret=sora_revalidate_secret_2026&tag=categories
```

### 3.6. Brendlar o‘zgarganda
Brendlar ro‘yxati va filtrlarni yangilaydi:
```http
GET https://sora.uz/api/revalidate?secret=sora_revalidate_secret_2026&tag=brands
```

### 3.7. Yangi sharhlar tasdiqlanganda
Tovar sharhlari va yulduzlar reytingini yangilaydi:
```http
GET https://sora.uz/api/revalidate?secret=sora_revalidate_secret_2026&tag=reviews
```
*Aniq bitta tovar sharhi uchun:*
```http
GET https://sora.uz/api/revalidate?secret=sora_revalidate_secret_2026&tag=reviews-{TOVAR_ID}
```

### 3.8. Muayyan URL yo‘lini (Path) yangilash
Masalan, faqat bosh sahifani yangilash:
```http
GET https://sora.uz/api/revalidate?secret=sora_revalidate_secret_2026&path=/uz
GET https://sora.uz/api/revalidate?secret=sora_revalidate_secret_2026&path=/ru
```

### 3.9. Global to‘liq keshni tozalash (Favqulodda holatlar uchun)
Butun sayt keshini noldan qayta qurish:
```http
GET https://sora.uz/api/revalidate?secret=sora_revalidate_secret_2026&tag=all
```

---

## 4. POST Metodi Orqali Webhook Integratsiyasi (JSON Format)

Agar 1C yoki oraliq backend tizimi `POST` orqali ma'lumot yuborishni ma'qul ko‘rsa:

* **URL:** `https://sora.uz/api/revalidate`
* **Header:** `Content-Type: application/json`

### 4.1. Tag bo‘yicha yangilash:
```json
{
  "secret": "sora_revalidate_secret_2026",
  "tag": "prices"
}
```

### 4.2. Alohida tovar bo‘yicha yangilash:
```json
{
  "secret": "sora_revalidate_secret_2026",
  "tag": "product-E1589"
}
```

### 4.3. URL yo‘li bo‘yicha yangilash:
```json
{
  "secret": "sora_revalidate_secret_2026",
  "path": "/uz"
}
```

---

## 5. 1C:Enterprise (1С:Предприятие) Dasturchisi Uchun Tayyor Kod Namunasi

1C dasturida narxlar yoki tovarlar qaydnomasi (документ установки цен / поступление товаров) o‘tkazilganda avtomatik veb-saytga xabar beruvchi funksiya:

```bsl
// 1C moduliga qo'shiladigan protsedura
&НаСервере
Процедура ОтправитьВебхукОбновленияЦен()
    Сервер = "sora.uz";
    Секрет = "sora_revalidate_secret_2026";
    Тег    = "prices"; // yoki "products", "offers"
    
    ПутьЗапроса = "/api/revalidate?secret=" + Секрет + "&tag=" + Тег;
    
    Попытка
        Соединение = Новый HTTPСоединение(Сервер, 443, , , , 10, Новый ЗащищенноеСоединениеOpenSSL());
        Запрос = Новый HTTPЗапрос(ПутьЗапроса);
        Запрос.Заголовки.Вставить("Accept", "application/json");
        
        Ответ = Соединение.Получить(Запрос);
        
        Если Ответ.КодСостояния = 200 Тогда
            ЗаписьЖурналаРегистрации("Sora.uz Синхронизация", УровеньЖурналаРегистрации.Информация, , , "Кэш успешно сброшен: " + Тег);
        Иначе
            ЗаписьЖурналаРегистрации("Sora.uz Синхронизация", УровеньЖурналаРегистрации.Ошибка, , , "Ошибка сброса кэша. Код: " + Ответ.КодСостояния);
        КонецЕсли;
    Исключение
        ЗаписьЖурналаРегистрации("Sora.uz Синхронизация", УровеньЖурналаРегистрации.Ошибка, , , "Исключение при вызове вебхука: " + ОписаниеОшибки());
    КонецПопытки;
КонецПроцедуры
```

---

## 6. Server Javoblari (HTTP Responses)

### Muvaffaqiyatli (200 OK):
```json
{
  "revalidated": true,
  "tag": "prices",
  "path": null,
  "now": 1773489600000
}
```

### Xato token (401 Unauthorized):
```json
{
  "revalidated": false,
  "message": "Invalid secret token"
}
```

### Parametr berilmagan (400 Bad Request):
```json
{
  "revalidated": false,
  "message": "Missing 'tag' or 'path' parameter to revalidate"
}
```

---

## 7. Vercel Xarajatlarini Tejash Bo‘yicha 3 Ta Oltin Qoida

1. **Har bir tovar uchun alohida umumiy so‘rov yubormang:**
   Agar 1C da 500 ta tovar narxi birdan o‘zgarsa, 500 marta `tag=prices` yubormang. O‘zgarishlar 1C bazasiga to‘liq yozilib bo‘lgach, jarayon oxirida **faqat 1 marta** `tag=prices` so‘rovini yuborish kifoya.
2. **Yagona tovar tahrirlanganda tovar ID'sini yuboring:**
   Faqat bitta mahsulot rasm yoki tavsifi o‘zgarsa, `tag=products` emas, `tag=product-[ID]` yuboring. Bu Vercel'da yuzlab sahifalar qayta hisoblanishining oldini oladi.
3. **Davriy sinxronizatsiyani to‘g‘ri sozlang:**
   Agar avtomatik har 15-30 daqiqada sinxronizatsiya bo‘lsa, faqat ma'lumotlar haqiqatda o‘zgargan taqdirdagina ushbu webhook'ni chaqiring. O‘zgarish bo‘lmagan paytda so‘rov yuborish shart emas.
