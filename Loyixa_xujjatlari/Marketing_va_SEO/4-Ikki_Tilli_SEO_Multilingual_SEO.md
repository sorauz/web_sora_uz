# Ikki Tilli SEO (Multilingual SEO)

> Ushbu hujjat `SEO.md` faylidan **4-qism: Ko‘p Tilli SEO (Multilingual SEO)** mavzusi bo‘yicha tartibli jamlangan material hisoblanadi.

---

## 1. Ko‘p tilli SEO nima?

Har bir mahsulot sahifasini 2 ta tilda (uz, ru) alohida havola (URL) bilan yaratish **Ko‘p Tilli SEO (Multilingual SEO)** deb ataladi.

Bu Sora.uz loyihasining qidiruv tizimlaridagi o‘rnini kafolatlamaydi. URL tilining o‘zi 1-o‘rinni kafolatlamaydi; sahifaning nufuzi (PageRank), havolalar profili (backlinks) va qidiruv niyatiga (Search Intent) javob berishi ancha ustun turadi.

---

## 2. Nega bu katta ustunlik beradi?

### Turli tillardagi auditoriyani qamrab olish

- O‘zbek tilida qidirgan foydalanuvchiga:

```text
sora.uz/uz/products/elektr-choynak-1025
```

- Rus tilida qidirgan foydalanuvchiga:

```text
sora.uz/ru/products/elektricheskiy-chaynik-1025
```

### Tildagi kalit so‘zlar SEO vazni

Rus tilida qidiruv bergan odamga Google ruscha URL va ruscha sarlavhali sahifani birinchi o‘rinlarga chiqarib beradi.

---

## 3. Google dublikat masalasiga munosabati

Google ko‘p tilli yoki texnik parametrlarga ega e-commerce sahifalaridagi dublikatlar uchun saytga **sanksiya (jarima)** qo‘llamaydi.

Google shunchaki bunday sahifalarning bittasini asosiy (kanonik) deb tanlaydi, qolganlarini esa indeksda yashiradi (konsolidatsiya qiladi). Bu jazo emas, resurslarni tejash mexanizmidir.

Ammo bu **hreflang va kontent mosligi** qoidalariga rioya qilinsa, to‘g‘ri ishlaydi. Aks holda muammolar yuzaga keladi.

---

## 4. Qoida 1: hreflang metabiriktirmasi

Google’ga ushbu 2 ta havola bitta mahsulotning turli tillardagi rasmiy tarjimalari ekanligini bildirish kerak.

Server Component har bir sahifaga quyidagi teglarni joylaydi:

- `hreflang="uz"` → O‘zbekcha manzilga ishora;
- `hreflang="ru"` → Ruscha manzilga ishora.

Server Component teglarni dasturchi `metadata` funksiyasi orqali har bir til uchun havolalarni to‘g‘ri generatsiya qilishi, o‘zaro bog‘lashi (**reciprocal links**) va `x-default` manzilini qo‘lda dasturlashi mumkin.

Bu teg Google’ga “bu sahifalar dublikat emas, tarjima” degan xabarni beradi.

### hreflang qoidalaridagi x-default va hududiy kodlar

Faqat `hreflang="uz"`, `hreflang="ru"` yozish yetarli emas.

Saytga O‘zbekistondan tashqaridagi yoki brauzer tili boshqa bo‘lgan foydalanuvchi kirganda qaysi sahifa ochilishi kerakligini belgilovchi **`x-default`** ko‘rsatilishi kerak.

- `x-default` — majburiy emas, lekin tavsiya etiladi.
- Agar til/region topilmasa, qaysi sahifa ko‘rsatilishini belgilaydi.
- Google `x-default`ni mos til/region topilmaganda fallback sahifani ko‘rsatish uchun tavsiya qiladi.

Shuningdek, O‘zbekistondagi rusiyzabon auditoriya uchun mintaqaviy aniqlik (masalan, `ru-UZ`) ko‘rsatilishi qidiruv aniqligini ancha oshiradi.

### Self-referencing hreflang

Har bir til versiyasi **o‘zini ham (self-referencing)** hreflang ro‘yxatiga qo‘shishi shart. Aks holda Google bu bog‘lanishni bir tomonlama deb hisoblab, inkor etishi mumkin.

### hreflang va canonical birgalikda

Google ko‘p tilli sahifalarni boshqarishda hreflang annotatsiyalaridan foydalanishni tavsiya qiladi, lekin bu indexlanish yoki ranking uchun majburiy talab emas.

hreflangning vazifasi asosan Google’ga bir-biriga ekvivalent bo‘lgan lokal/tillararo variantlarni tushunishga va mos variantni foydalanuvchiga ko‘rsatishga yordam berishdir.

Google **canonical va hreflangni birgalikda ishlatishni** tavsiya qiladi. hreflang ishlatilganda **canonical o‘sha tilning o‘zidagi URL bo‘lishi kerak**.

> “Ko‘p tilli Sora.uz uchun hreflang juda tavsiya etiladi; u til/region variantlarini to‘g‘ri bog‘lashga yordam beradi, ammo Google Search’da ranking yoki indexing uchun majburiy shart emas.”

### Muhim statistika

2026-yilda o‘tkazilgan tadqiqotga ko‘ra, ko‘p tilli korporativ saytlarning **65%ida hreflang-kanonik konflikti** mavjud bo‘lib, bu klasterning butunlay ishdan chiqishiga sabab bo‘ladi.

---

## 5. Qoida 2: Kontent haqiqatdan ham o‘sha tilda bo‘lishi shart

URL o‘zgargani bilan ichidagi ma’lumot (mahsulot nomi, tavsifi) 1C API’dan **o‘sha tilda** kelishi lozim.

Agar `uz` va `ru` havolalarining ichidagi matn bir xil (masalan faqat ruscha yoki faqat o‘zbekcha) bo‘lib qolsa, Google buni **“Dublikat kontent”** deb baholab, qidiruvdan chiqarib tashlaydi.

### 1C integratsiyasi

Agar 1C bazasidan mahsulot ma’lumotlari 2 tilda keladigan bo‘lsa, 2 tilda alohida URL’lar yaratish **to‘liq va eng to‘g‘ri strategiya** hisoblanadi.

---

## 6. URL strukturasi

Ideal URL strukturasi til prefiksi bilan boshlanadi:

```text
/uz/...
/ru/...
```

Bu Google’ga til variantlarini aniq ko‘rsatadi va hreflang bilan birgalikda ishlatilganda samarali bo‘ladi.

---

## 7. Sora.uz uchun keyword research

Sora.uz O‘zbekiston bozori uchun ishlasa, SEO keyword research’da quyidagilar alohida tekshirilishi kerak:

- lotincha o‘zbekcha;
- kirillcha o‘zbekcha;
- ruscha;
- mahsulot model/SKU;
- xalq orasidagi yozilish variantlari;
- xatoli yozuvlar.

Bu Google’ning “foydalanuvchilar foydalanadigan so‘zlarni ishlating” degan umumiy SEO prinsipi bilan mos.

---

## 8. Nazorat ro‘yxati

| Yo‘nalish | Holat |
|---|---|
| Har bir mahsulot uchun 2 tilda alohida URL | ✅ |
| O‘zbekcha URL (`/uz/...`) | ✅ |
| Ruscha URL (`/ru/...`) | ✅ |
| `hreflang="uz"` | ✅ |
| `hreflang="ru"` | ✅ |
| `hreflang="ru-UZ"` (hududiy aniqlik) | ✅ |
| `x-default` (fallback) | ✅ |
| Self-referencing hreflang | ✅ |
| Reciprocal links (o‘zaro bog‘lanish) | ✅ |
| Canonical — o‘sha tilning URL’i | ✅ |
| hreflang va canonical birgalikda | ✅ |
| Kontent haqiqatdan ham o‘sha tilda | ✅ |
| 1C API’dan 2 tilda ma’lumot kelishi | ✅ |
| Dublikat kontent qoidabuzarligi oldini olish | ✅ |
| Lotin/kirill o‘zbekcha keyword tekshiruv | ✅ |
| Ruscha keyword tekshiruv | ✅ |

---

## 9. Eng muhim xulosalar

- Ko‘p tilli SEO — bu faqat URL’ni o‘zgartirish emas, balki **kontent, metadata, canonical va hreflangning to‘liq mosligi**.
- `hreflang` — Google’ga sahifalar dublikat emas, tarjima ekanligini bildiruvchi signal.
- `x-default` — mos til/region topilmaganda fallback sahifani ko‘rsatadi.
- Har bir til versiyasi o‘zini hreflang ro‘yxatiga qo‘shishi shart.
- `canonical` har bir til sahifasida o‘sha tilning o‘z URL’iga ishora qilishi kerak.
- Agar kontent bir xil bo‘lsa, Google buni dublikat deb baholaydi.
- 1C’dan 2 tilda ma’lumot kelishi — bu strategiyaning asosiy sharti.
- hreflang-kanonik konflikti ko‘p tilli saytlarning eng katta muammolaridan biri.