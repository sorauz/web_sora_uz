# Sora.uz — Veb-Ilova Yangilangan Dizayn Ranglari Tizimi (Design Colors Documentation)

Ushbu hujjat **Sora.uz** elektron tijorat (e-commerce) platformasining rasmiy korxona logotipi (`logo.png`) hamda **“Sizga mos ishonchli tanlov”** shiori asosida to'liq yangilangan brend rang tizimi, dizayn tokenlari, Tailwind CSS sinflari va ularning qat'iy semantik vazifalarini ifodalaydi.

---

## 1. Logotip Tahlili va Konseptual Tanlov

### 1.1. `logo.png` Tahlili
- **Logotip matni ("SORAUZ"):** To'yingan, chuqur magenta/malina rangi — **`#C92F74`** (RGB: 201, 47, 116).
- **Logotip shiori ("Sizga mos ishonchli tanlov"):** Chuqur neytral qora — **`#010000`** (RGB: 1, 0, 0).

### 1.2. `design_color_1.md` va `design_color_2.md` Qiyosiy Tahlili va Xulosa
- **`design_color_1.md` kamchiliklari:**
  1. Tailwind-ning standart umumiy `pink-600` (`#db2777`) rangini mexanik tarzda moviy rang o'rniga almashtirgan, natijada korxona logotipidagi o'ziga xos to'q magenta tusiga to'liq mos kelmagan.
  2. Bir ekranda bir nechta turfa rangli CTA paydo bo'lish xavfini bartaraf etmagan.
  3. `amber-500` ustida oq matn ishlatilishi oqibatida WCAG kontrast talablari (accessibility) buzilgan.
- **`design_color_2.md` afzalliklari:**
  1. **3 qatlamli rang arxitekturasi** (Brand, Semantic, Neutral) ishlab chiqilgan.
  2. Nisbatlar qoidasi kiritilgan: **70–80% Neytral**, **10–15% Sora Magenta**, **5–10% Semantik**, **2–5% Aksent**.
  3. Dark Mode va Light Mode o'rtasida aniq kontrast qoidalari (masalan, Dark Mode'da `--primary: #f45a9d;`, tugma matni esa qora/to'q tusda) ko'rsatilgan.
  4. Har bir semantik holatga bitta aniq rang ajratilgan: Favorite uchun `Rose`, Chegirma uchun `Red`, 1C/Mavjudlik uchun `Emerald`, Reyting/Xit uchun `Amber`, B2B uchun `Purple`.
- **Yakuniy qaror:** **`design_color_2.md`** asos qilib olindi va logotipning haqiqiy piksellaridan olingan **`#C92F74`** asosiy brend to'lqini bilan kalibrlandi.

---

## 2. Rang Arxitekturasi

Platforma 3 ta aniq qatlamdan iborat:

### Qatlam A — Brand (Sora Magenta)
Barcha asosiy interaktiv harakatlar, brend atributlari va konversiya nuqtalari:
- Sayt logotipi va shiori
- Birlamchi CTA ("Savatga qo'shish", "Buyurtma berish")
- MegaMenu trigger tugmasi va aktiv kategoriyalar
- Qidiruv maydoni focus konturi (`ring-sora-500/20`, `border-sora-500`)
- Navigatsiyadagi aktiv havolalar va tablar
- Mahsulot kartasi hover konturi

### Qatlam B — Semantic (Holat Ranglari)
- **Success (Emerald):** Omborda bor, buyurtma qabul qilindi, 1C ERP bilan sinxron.
- **Commercial / Highlight (Amber):** Xit tovarlar, kafolatlangan eng arzon narx, reyting yulduzlari (kontrast talabi: oq matnli tugmalar uchun `amber-600`).
- **Discount / Alert (Red):** Chegirmalar foizi, xatoliklar, tugagan tovar.
- **Favorite (Rose):** Sevimlilar ro'yxati va yurakcha ikonkasi (brend magentasidan va qizildan ajratilgan toza atirgul pushti).
- **Corporate (Purple):** B2B hamkorlik, ulgurji hisob-kitoblar, korporativ shartnomalar.

### Qatlam C — Neutral (Struktura va Matn)
- **Slate oilasi (`slate-50` dan `slate-950` gacha):** Sahifa foni, kartochkalar, chegaralar, tana matnlari va yordamchi izohlar.

---

## 3. Global CSS Dizayn Tokenlari (`src/app/globals.css`)

### 3.1. Light Mode
```css
:root {
  --background: #f8fafc;        /* slate-50 */
  --foreground: #0f172a;        /* slate-900 */
  --card: #ffffff;
  --card-foreground: #0f172a;
  --popover: #ffffff;
  --popover-foreground: #0f172a;
  --primary: #c92f74;           /* Sora Magenta (Logo) */
  --primary-foreground: #ffffff;
  --primary-hover: #b01f60;
  --primary-active: #921c51;
  --secondary: #f1f5f9;         /* slate-100 */
  --secondary-foreground: #1e293b;
  --accent: #d97706;            /* amber-600 */
  --accent-foreground: #ffffff;
  --muted: #f1f5f9;
  --muted-foreground: #64748b;  /* slate-500 */
  --destructive: #dc2626;       /* red-600 */
  --destructive-foreground: #ffffff;
  --success: #059669;           /* emerald-600 */
  --success-foreground: #ffffff;
  --border: #e2e8f0;            /* slate-200 */
  --input: #cbd5e1;             /* slate-300 */
  --ring: #c92f74;
}
```

### 3.2. Dark Mode
```css
.dark {
  --background: #080b12;
  --foreground: #f8fafc;
  --card: #111827;
  --card-foreground: #f8fafc;
  --popover: #111827;
  --popover-foreground: #f8fafc;
  --primary: #f45a9d;           /* sora-400 */
  --primary-foreground: #180711;
  --primary-hover: #ff72ac;
  --primary-active: #ff9fc5;
  --secondary: #1e293b;
  --secondary-foreground: #f8fafc;
  --accent: #fbbf24;            /* amber-400 */
  --accent-foreground: #111827;
  --muted: #1e293b;
  --muted-foreground: #94a3b8;
  --destructive: #f87171;
  --destructive-foreground: #450a0a;
  --success: #34d399;
  --success-foreground: #064e3b;
  --border: #1e293b;
  --input: #334155;
  --ring: #f45a9d;
}
```

---

## 4. Sora Brand Palette (Tailwind `@theme inline`)

Logotipdagi `#C92F74` rangi asosida tuzilgan maxsus 11 bosqichli rang shkalasi:

| Token | HEX | Qo'llanish Maqsadi |
| :--- | :--- | :--- |
| `sora-50` | `#fff1f7` | Kategoriya ikonka foni, info-bannerlar, tanlangan filtr foni |
| `sora-100` | `#fce7f1` | Badge va yordamchi piktogramma foni |
| `sora-200` | `#f9cfe3` | Yengil aksent, yetkazib berish progress treki |
| `sora-300` | `#f4a7cb` | Dark mode yengil chegaralari |
| `sora-400` | `#ec6ea9` | Dark mode havolalari, matn aksentlari |
| `sora-500` | `#e03c8b` | Input va qidiruv aktiv fokus konturi (`ring-sora-500/20`) |
| `sora-600` | `#c92f74` | **PRIMARY BRAND** — tugmalar, brend logotipi, narxlar, asosiy havolalar |
| `sora-700` | `#b01f60` | Tugma ustiga sichqoncha borgandagi (hover) holat |
| `sora-800` | `#921c51` | Tugma bosilgandagi (active/pressed) holat, Hero gradient gavdasi |
| `sora-900` | `#7a1b46` | Chuqur brend gradientlari |
| `sora-950` | `#4a0927` | Qorong'i rejimdagi chuqur fon yostiqchalari, Hero gradient tubi |

---

## 5. Neytral va Semantik Ranglar

### 5.1. Neytral Oila (Slate)
- `slate-50` (`#f8fafc`): Butun ilova sahifa foni, mahsulot rasm yostiqchalari.
- `slate-100` (`#f1f5f9`): Noaktiv elementlar, input fonlari.
- `slate-200` (`#e2e8f0`): Standart kartochka va ajratuvchi chiziqlar chegarasi.
- `slate-300` (`#cbd5e1`): Qorong'i rejimdagi ikkilamchi matnlar.
- `slate-400` (`#94a3b8`): Eski narxlar (`line-through`), chevronlar, placeholderlar.
- `slate-500` (`#64748b`): Izohlar, SKU, yordamchi matnlar.
- `slate-700` (`#334155`): Tana matnlari.
- `slate-800` (`#1e293b`): Dark mode kartochka chegaralari va elementlari.
- `slate-900` (`#0f172a`): Asosiy to'q sarlavhalar, Dark mode kartochkalar foni.
- `slate-950` (`#020617`): Dark mode sahifa tubi, Footer foni.

### 5.2. Muvaffaqiyat (Emerald)
- `emerald-50` / `emerald-100`: "Omborda bor" va "Yetkazildi" fonlari.
- `emerald-500`: "1C ERP Sinxron" status indikatori, puls nuqtasi.
- `emerald-600`: Savatga muvaffaqiyatli qo'shilgandagi tasdiq holati, bepul yetkazish.

### 5.3. Tijoriy Diqqat va Reyting (Amber)
- `amber-400`: Reyting yulduzlari (`Star className="fill-current text-amber-400"`).
- `amber-500`: "Xit" va "Kafolatlangan narx" beydjlari.
- `amber-600`: Yuqori kontrastli ikkilamchi CTA tugmalari (oq matn bilan WCAG standartiga javob beradi).

### 5.4. Chegirma va Ogohlantirish (Red)
- `red-500` / `red-600`: Chegirma foizlari (`-15%`), tovar tugaganlik ogohlantirishi, savatdan o'chirish.

### 5.5. Sevimlilar (Rose)
- `rose-50`: Faol sevimli yurakcha foni.
- `rose-500` / `rose-600`: Sevimlilar yurakcha ikonkasi (`Heart fill-current`).

### 5.6. B2B va Korporativ (Purple)
- `purple-50` / `purple-950`: B2B sahifasi ikonka va info fonlari.
- `purple-600`: B2B "Bog'lanish" va shartnoma tugmalari.

---

## 6. Komponentlar Bo'yicha Rang Xaritasi

| Komponent | Element | Ishlatilgan Tailwind Sinflari | Vazifasi |
| :--- | :--- | :--- | :--- |
| **Header** | Logo matni | `text-sora-600 dark:text-sora-400` | "SORAUZ" brend identifikatsiyasi |
| | Shior | `text-slate-800 dark:text-slate-300` | "Sizga mos ishonchli tanlov" |
| | Savat hisoblagichi | `bg-sora-600 text-white` | Savatdagi mahsulotlar soni beydji |
| **MegaMenu** | "Katalog" tugmasi | `bg-sora-600 hover:bg-sora-700 text-white` | Asosiy katalog ochish tugmasi |
| | Aktiv toifa | `text-sora-600 dark:text-sora-400` | Tanlangan toifa sarlavhasi |
| | Ikonkalar & havolalar | `text-sora-500`, `text-sora-600` | Subkategoriya yo'naltiruvchilari |
| **SearchAutocomplete** | Fokus konturi | `focus:border-sora-500 focus:ring-2 focus:ring-sora-500/20` | Qidiruv kiritish maydoni |
| | Natija havolalari | `hover:text-sora-600` | Qidiruv natijasi hover holati |
| **PromoNav** | Navigatsiya linklari | `text-sora-600`, `hover:text-sora-600` | Tezkor sahifalar ro'yxati |
| **Hero Banner** | Asosiy fon gradienti | `bg-gradient-to-br from-sora-700 via-sora-800 to-sora-950` | Bosh sahifa bosh banneri |
| | Yordamchi nur effekti | `from-sora-400/20` | Radial fon nuri |
| | Beydj foni | `bg-sora-500/30 border-sora-400/40 text-sora-200` | 1C ERP chipi |
| | CTA tugmasi | `bg-amber-600 hover:bg-amber-700 text-white` | "Katalogga o'tish" yuqori konversiyali tugma |
| **RandomCategories** | Tasodifiy 4 toifa | `bg-sora-50 dark:bg-sora-950/60 text-sora-600` | Toifa piktogrammasi |
| | Shuffle tugmasi | `hover:text-sora-600` | Yangilash tugmasi hover holati |
| **ProductCard** | Brend nomi | `text-sora-600 dark:text-sora-400 uppercase` | Mahsulot ishlab chiqaruvchisi |
| | Sarlavha hover | `hover:text-sora-600 dark:hover:text-sora-400` | Tovarga o'tish havolasi |
| | Kartochka konturi | `hover:border-sora-300 dark:hover:border-sora-700` | Hover paytidagi yengil jilo |
| | "Savatga" tugmasi | `bg-sora-600 hover:bg-sora-700 text-white` | Birlamchi xarid tugmasi |
| | Sevimli yurakcha | `text-rose-500`, `active:bg-rose-50` | Sevimlilar belgisi |
| **PDP (Mahsulot Sahifasi)** | Asosiy narx | `text-sora-600 dark:text-sora-400` | Kelishiladigan narx yoki valyuta |
| | Galereya tanlovi | `border-sora-600 ring-2 ring-sora-500/20` | Aktiv miniatyura rasmi |
| | "Savatga" tugmasi | `bg-sora-600 hover:bg-sora-700 shadow-sora-500/25` | Asosiy xarid tugmasi |
| | Tab navigatsiyasi | `border-sora-600 text-sora-600` | Aktiv tab (Xususiyatlar, Sharhlar) |
| | Mobile Sticky CTA | `bg-sora-600 text-white shadow-sora-500/20` | Mobil ekran pastki xarid paneli |
| **Cart & Checkout** | Bepul yetkazish treki | `bg-sora-50/70 border-sora-100`, progress: `bg-sora-600` | Yetkazib berish progress bar |
| | To'lov radio-kartasi | `border-sora-600 bg-sora-50/40 dark:bg-sora-950/20` | Tanlangan to'lov usuli (Payme, Click, Naqd) |
| | "Buyurtmani tasdiqlash" | `bg-sora-600 hover:bg-sora-700 shadow-sora-500/25` | Yakuniy buyurtma berish tugmasi |
| | Muvaffaqiyat statusi | `bg-sora-600`, `text-sora-600` | "Tekshirilmoqda" vaqti taymeri |
| **B2B Sahifasi** | Fon va tugmalar | `from-slate-900 via-purple-950`, `bg-purple-600` | Korporativ mijozlar alohida vizual yo'nalishi |
| **Footer** | Havolalar hover | `hover:text-sora-400` | Pastki menyu faol holatlari |
| | Shior | `text-slate-300` | "Sizga mos ishonchli tanlov" |
| **MobileNav** | Aktiv bo'lim ikonkasi | `text-sora-600` | Mobil menyu pastki faol holati |
| | Savat soni beydji | `bg-sora-600 text-white` | Mobil savat ko'rsatkichi |

---

## 7. Ishlab Chiquvchilar Uchun Qoidalar (Developer Rules)

1. **Hech qachon inline ixtiyoriy HEX rang yozmang:** Komponentlar ichida `#123456`, `#ff00aa` kabi o'zboshimcha ranglar taqiqlangan. Faqat `sora-*`, `slate-*`, `emerald-*`, `amber-*`, `red-*`, `rose-*`, `purple-*` tokenlaridan foydalaniladi.
2. **Bir ekranda ranglar xaosiga yo'l qo'ymang:** Dominant interaktiv rang — **Sora Magenta** (`sora-600`). Boshqa ranglar faqat holatni bildirish uchun (status, reyting, chegirma) ishlatiladi.
3. **WCAG Kontrastini saqlang:** Oq matn faqat `sora-600`, `sora-700`, `amber-600`, `emerald-600`, `red-600` va `purple-600` ustiga qo'yiladi. `amber-500` yoki `sora-400` ustiga oq matn qo'yilmaydi.
4. **Dark Mode muvofiqligi:** Har bir `text-sora-600` elementi dark rejimda `dark:text-sora-400` bilan juftlangan bo'lishi shart.
