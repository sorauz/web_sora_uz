# Sora.uz — E-commerce Veb-Ilova uchun Yangilangan Dizayn Ranglari Tizimi

## 0. Maqsad va dizayn yo'nalishi

Ushbu hujjat Sora.uz logotipi va uning ostidagi **“Sizga mos ishonchli tanlov”** shiori uchun e-commerce interfeys rang tizimini qayta aniqlaydi.

Asosiy vizual signal — logotipdagi yorqin magenta/pushti rang. Logo tasviridagi asosiy magenta rangning markaziy qiymati taxminan **`#DD0576`**, shior esa juda to'q qora rangga yaqin. Shu sababli interfeysda:

- **Magenta** — brendning asosiy identifikatori va asosiy CTA;
- **Slate / neutral** — sahifaning skeleti, matn, fon va chegaralar;
- **Amber** — tijoriy urg'u, reyting va “top” holatlari;
- **Emerald** — muvaffaqiyat, mavjudlik va ERP sinxronizatsiyasi;
- **Red / Rose** — xatolik, chegirma va sevimlilar kabi alohida semantik holatlar;
- **Purple / Indigo** — faqat maxsus korporativ funksiyalar uchun cheklangan accent.

### Asosiy o'zgarishlar

Oldingi tizim funksional jihatdan ishlaydi, lekin ranglar soni va kuchi bo'yicha biroz “rang-barang” ko'rinishga olib kelishi mumkin. Yangilangan tizimda ranglarning **vizual ierarxiyasi** kuchaytiriladi:

1. Brend rangini boshqa ranglardan aniq ajratish.
2. Har bir rangga bitta aniq semantik rol berish.
3. Bir sahifada ko'p rangli CTA'lar paydo bo'lishining oldini olish.
4. Dark Mode'da yorqin ranglarni to'g'ridan-to'g'ri takrorlamaslik.
5. Kichik matn va CTA'larda kontrastni hisobga olish.

---

# 1. Rang arxitekturasi

Sora.uz interfeysi uch qatlamli rang arxitekturasiga ega:

### Layer A — Brand

Brendning barcha asosiy interaktiv harakatlari:

- Primary CTA
- Logo
- Aktiv navigation
- Aktiv tab
- Selected state
- Focus ring
- Muhim linklar

**Asosiy rang: `Sora Magenta`**

### Layer B — Semantic

Holatni bildiruvchi ranglar:

- Success → Emerald
- Warning / commercial highlight → Amber
- Error / danger → Red
- Favorite → Rose

### Layer C — Neutral

UI strukturasi:

- Background
- Card
- Border
- Text
- Muted text
- Disabled
- Input

**Asosiy oila: Slate**

---

# 2. Sora Brand Palette

## 2.1. Asosiy brend ranglari

| Token | HEX | Vazifasi |
|---|---|---|
| `sora-50` | `#FFF2F8` | Juda yengil brend fonlari |
| `sora-100` | `#FFE4F0` | Badge/icon fonlari |
| `sora-200` | `#FFC7DF` | Yengil accent, selected background |
| `sora-300` | `#FF9FC5` | Dark Mode'dagi yengil accent |
| `sora-400` | `#F85A9D` | Dark Mode link/accent |
| `sora-500` | `#E92A86` | Secondary brand actions |
| `sora-600` | `#DD0576` | **PRIMARY BRAND** |
| `sora-700` | `#C70468` | Hover |
| `sora-800` | `#B80460` | Active / pressed / deep brand |
| `sora-900` | `#8C0349` | Hero va chuqur brend fonlari |
| `sora-950` | `#56022D` | Dark Mode deep brand |

### Brand qoidasi

`#DD0576` — Sora.uz ning asosiy identifikatsion rangi.

Quyidagi komponentlar uchun default primary sifatida aynan shu token ishlatiladi:

- “Savatga qo'shish”
- “Buyurtma berish”
- “Katalog”
- Aktiv menyu bandi
- Aktiv tab
- Primary links
- Selected filters
- Focus ring

---

# 3. Neutral Palette

Neutral ranglar interfeysning eng katta qismini tashkil qiladi. E-commerce interfeysda mahsulot rasmlari, narxlar va CTA'lar asosiy vizual markaz bo'lishi kerak.

| Token | HEX | Vazifasi |
|---|---|---|
| `white` | `#FFFFFF` | Card, modal, input va asosiy surface |
| `slate-50` | `#F8FAFC` | Sahifa background |
| `slate-100` | `#F1F5F9` | Secondary surface |
| `slate-200` | `#E2E8F0` | Border |
| `slate-300` | `#CBD5E1` | Disabled / kuchsiz border |
| `slate-400` | `#94A3B8` | Placeholder / secondary icon |
| `slate-500` | `#64748B` | Muted text |
| `slate-600` | `#475569` | Secondary text |
| `slate-700` | `#334155` | Body text |
| `slate-800` | `#1E293B` | Strong dark surface/border |
| `slate-900` | `#0F172A` | Heading va primary text |
| `slate-950` | `#020617` | Darkest surface |

### Neutral qoidasi

Interfeysning taxminan asosiy katta qismi neutral bo'lishi maqsadga muvofiq. Magenta, amber, emerald va red ranglari faqat ma'noli yoki interaktiv elementlarda ishlatiladi.

---

# 4. Semantic Palettes

## 4.1. Success — Emerald

1C ERP, ombordagi mavjudlik, buyurtma muvaffaqiyati va tasdiqlash.

| Token | HEX | Vazifasi |
|---|---|---|
| `emerald-50` | `#ECFDF5` | Success background |
| `emerald-100` | `#D1FAE5` | Success icon background |
| `emerald-400` | `#34D399` | Dark Mode accent |
| `emerald-500` | `#10B981` | Status indicator |
| `emerald-600` | `#059669` | Filled success control |
| `emerald-700` | `#047857` | Hover / deep success |
| `emerald-950` | `#064E3B` | Dark Mode deep background |

**Semantik qoida:** “mavjud”, “muvaffaqiyatli”, “sinxron”, “qabul qilindi” → Emerald.

---

## 4.2. Warning / Commercial Highlight — Amber

Reyting, “Xit”, “Top”, premium commercial highlight va ikkilamchi CTA.

| Token | HEX | Vazifasi |
|---|---|---|
| `amber-50` | `#FFFBEB` | Light background |
| `amber-100` | `#FEF3C7` | Icon/badge background |
| `amber-400` | `#FBBF24` | Rating stars |
| `amber-500` | `#F59E0B` | Accent |
| `amber-600` | `#D97706` | **White-text CTA / hover** |
| `amber-700` | `#B45309` | Darker hover/pressed |
| `amber-950` | `#451A03` | Dark Mode deep background |

### Muhim kontrast qoidasi

`amber-500` (`#F59E0B`) ustiga oq kichik matn qo'yilmaydi. White-text button uchun `amber-600` yoki undan quyuqroq rang ishlatiladi.

Rating yulduzlari uchun `amber-400` ishlatilishi mumkin, chunki u matn tugmasi emas, ikonografik signal hisoblanadi.

---

## 4.3. Error / Discount — Red

Xatolik, o'chirish, tugagan mahsulot va chegirma foizlari.

| Token | HEX | Vazifasi |
|---|---|---|
| `red-50` | `#FEF2F2` | Error/discount background |
| `red-100` | `#FEE2E2` | Error icon background |
| `red-400` | `#F87171` | Dark Mode accent |
| `red-500` | `#EF4444` | Badge / alert |
| `red-600` | `#DC2626` | Strong action |
| `red-700` | `#B91C1C` | Hover/pressed |
| `red-950` | `#450A0A` | Dark Mode deep background |

**Semantik qoida:** xatolik, xavf, o'chirish, “Tugagan”, chegirma foizi → Red.

---

## 4.4. Favorite — Rose

Favorite/yurakcha uchun Red'dan alohida, lekin brandga yaqinroq rose signal ishlatiladi.

| Token | HEX | Vazifasi |
|---|---|---|
| `rose-50` | `#FFF1F2` | Active favorite background |
| `rose-100` | `#FFE4E6` | Favorite surface |
| `rose-500` | `#F43F5E` | Favorite icon |
| `rose-600` | `#E11D48` | Strong favorite state |
| `rose-950` | `#4C0519` | Dark Mode background |

**Muhim qoida:** Favorite uchun `Rose`; discount/error uchun `Red`; primary brand uchun `Sora Magenta`.

Bu uch signalni vizual jihatdan aralashtirmaslik kerak.

---

## 4.5. Purple — B2B

B2B, korporativ hisob, tashkilot va maxsus biznes funksiyalarida ishlatiladi.

| Token | HEX | Vazifasi |
|---|---|---|
| `purple-50` | `#FAF5FF` | B2B background |
| `purple-100` | `#F3E8FF` | B2B icon |
| `purple-500` | `#A855F7` | Accent |
| `purple-600` | `#9333EA` | B2B interactive |
| `purple-800` | `#6B21A8` | Hero/deep surface |
| `purple-950` | `#3B0764` | Dark Mode |

**Qoida:** Purple umumiy shopping CTA uchun ishlatilmaydi.

---

# 5. Global CSS Design Tokens

`src/app/globals.css` uchun tavsiya:

## Light Mode

```css
:root {
  --background: #f8fafc;
  --foreground: #0f172a;

  --card: #ffffff;
  --card-foreground: #0f172a;

  --popover: #ffffff;
  --popover-foreground: #0f172a;

  --primary: #dd0576;
  --primary-foreground: #ffffff;
  --primary-hover: #c70468;
  --primary-active: #b80460;

  --secondary: #f1f5f9;
  --secondary-foreground: #1e293b;

  --accent: #f59e0b;
  --accent-foreground: #0f172a;

  --muted: #f1f5f9;
  --muted-foreground: #64748b;

  --destructive: #dc2626;
  --destructive-foreground: #ffffff;

  --success: #059669;
  --success-foreground: #ffffff;

  --border: #e2e8f0;
  --input: #cbd5e1;
  --ring: #dd0576;
}
```

## Dark Mode

```css
.dark {
  --background: #080B12;
  --foreground: #F8FAFC;

  --card: #111827;
  --card-foreground: #F8FAFC;

  --popover: #111827;
  --popover-foreground: #F8FAFC;

  --primary: #F45A9D;
  --primary-foreground: #180711;
  --primary-hover: #FF72AC;
  --primary-active: #FF9FC5;

  --secondary: #1e293b;
  --secondary-foreground: #f8fafc;

  --accent: #FBBF24;
  --accent-foreground: #111827;

  --muted: #1e293b;
  --muted-foreground: #94a3b8;

  --destructive: #F87171;
  --destructive-foreground: #450a0a;

  --success: #34D399;
  --success-foreground: #064e3b;

  --border: #1e293b;
  --input: #334155;
  --ring: #F45A9D;
}
```

### Dark Mode qoidasi

Dark Mode'da `#F45A9D` kabi ochroq magenta asosiy accent sifatida ishlatiladi, lekin oq matn bilan avtomatik kombinatsiya qilinmaydi. Primary foreground kontrastga qarab juda to'q rang bo'ladi.

---

# 6. Component Color Map

## 6.1. Header

```text
Background:       bg-white/95 dark:bg-slate-950/95
Border:            border-slate-200 dark:border-slate-800
Logo:              text-[#DD0576] / sora-600
Primary link:      text-sora-600
Hover:             text-sora-700
Cart/Favorite:     text-slate-700
Badge:             bg-red-500 text-white
```

Header'da Amber faqat kichik aksent sifatida ishlatiladi; ikkinchi darajali asosiy rangga aylantirilmaydi.

---

## 6.2. Search

```text
Background:        bg-slate-100 dark:bg-slate-800
Text:              text-slate-900 dark:text-slate-100
Placeholder:       text-slate-400
Border:             border-slate-200
Focus:              border-sora-500
Focus ring:         ring-sora-500/20
```

Qidiruv maydoni doimo neutral ko'rinishda boshlanadi va faqat focus vaqtida brand rangiga o'tadi.

---

## 6.3. Promo Navigation

```text
Container:         bg-slate-50/80 dark:bg-slate-900/80
Catalog:           bg-sora-600 hover:bg-sora-700 text-white
Discounts:         text-red-600
Top/Xit:           text-amber-600
New:               text-emerald-600
B2B:               text-purple-600
```

PromoNav'dagi barcha linklarni bir xil kuch bilan ko'rsatmaslik kerak. “Katalog” — yagona dominant navigation CTA.

---

# 7. Hero Banner

### Tavsiya etilgan gradient

```text
from-[#C70468]
via-[#B80460]
to-[#56022D]
```

Fuchsia/indigo gradientlari default Hero'dan chiqariladi. Sabab: logo allaqachon kuchli magenta identifikatoriga ega.

### Hero elementlari

```text
Hero background:   sora-700 → sora-800 → sora-950
Main text:          white
Secondary text:     pink-100
ERP badge:          white/10 + border-white/20
ERP status icon:    emerald-400
Primary CTA:        amber-600 + dark text yoki white text faqat kontrast tekshirilganda
Secondary CTA:      white/10 + border-white/20
```

### CTA qoidasi

Hero'da faqat bitta dominant CTA bo'lishi kerak:

**“Katalogga o'tish” → Sora Magenta yoki chuqur Amber**

Ikkinchi CTA outline/ghost bo'ladi.

---

# 8. Category Cards

```text
Card background:       white
Card border:           slate-200
Hover border:          sora-300
Icon background:       sora-50
Icon:                  sora-600
Title:                 slate-900
Description:           slate-500
Chevron:               slate-400
Chevron hover:         sora-600
```

Category komponentlarida Emerald/Amber/Purple ranglarini navbat bilan ishlatish shart emas. Brand consistency uchun default kategoriya signali Sora rangida qoladi.

---

# 9. Product Card

## Card

```text
Background:       bg-white dark:bg-slate-900
Border:           border-slate-200 dark:border-slate-800
Hover border:     border-sora-300 dark:border-sora-700
Hover shadow:     shadow-lg
```

## Image area

```text
Light:            bg-slate-50
Dark:             bg-slate-800/60
```

## Brand name

```text
text-sora-600 dark:text-sora-400
uppercase
```

## Product title

```text
text-slate-900 dark:text-slate-100
hover:text-sora-600
```

## Rating

```text
Star:             text-amber-400 fill-current
Score:            text-slate-700
Review count:     text-slate-400
```

## Price

```text
Old price:        text-slate-400 line-through
Current price:    text-slate-900 dark:text-white font-black
Negotiable:       text-sora-600 dark:text-sora-400
```

## Badges

```text
Sale %:           bg-red-500 text-white
Out of stock:     bg-slate-700 text-white
Top/Hit:          bg-amber-600 text-white
New:              bg-emerald-600 text-white
```

## Favorite

```text
Default:          text-slate-400
Hover:            text-rose-500
Active:           bg-rose-50 text-rose-600
Dark active:      bg-rose-950/50 text-rose-400
```

## Add to cart

```text
Default:           bg-sora-600 text-white
Hover:             bg-sora-700
Pressed:           bg-sora-800
Success:           bg-emerald-600 text-white
Disabled:          bg-slate-100 text-slate-400
```

---

# 10. PDP — Product Detail Page

## Breadcrumb

```text
Links:             text-sora-600
Separator:         text-slate-400
Current:           text-slate-700
```

## Gallery

```text
Selected image:    border-sora-600 ring-2 ring-sora-500/20
Other images:      border-slate-200
```

## Stock status

```text
In stock:           bg-emerald-50 text-emerald-700
Out of stock:       bg-red-50 text-red-700
```

## Wholesale / B2B price box

Brandning o'z rangidan foydalaniladi:

```text
Background:         bg-sora-50/70
Border:             border-sora-100
Dealer price:       text-sora-700
Wholesale price:    text-emerald-700
```

## Buy now CTA

```text
Primary purchase:   bg-sora-600 hover:bg-sora-700 text-white
Secondary action:   bg-amber-600 hover:bg-amber-700 text-white
```

---

# 11. Cart & Checkout

## Cart

```text
Quantity control:   border-slate-300
Delete:             text-slate-400 hover:text-red-600
Empty cart icon:    bg-sora-50 text-sora-600
```

## Free delivery progress

```text
Progress:           emerald
Text:               text-emerald-700
Background:         bg-emerald-50
```

## Payment method

```text
Selected:
border-sora-600
bg-sora-50/50
text-sora-900

Unselected:
border-slate-200
hover:border-slate-300
```

## Order success

```text
Icon:               bg-emerald-50 text-emerald-600
Heading:            text-slate-900
Order information:  bg-slate-50 border-slate-200
```

---

# 12. Footer

```text
Background:        bg-slate-950
Heading:           text-white
Body:              text-slate-300
Links:             text-slate-400 hover:text-sora-400
Social icon:       bg-slate-800
Social hover:      bg-sora-600 text-white
Border:             border-slate-800
```

Footer'da Magenta kichik interaktiv signal sifatida ko'rinadi; fonning o'zi neutral bo'lib qoladi.

---

# 13. Mobile Navigation

```text
Container:         bg-white/95 dark:bg-slate-950/95
Border:            border-slate-200 dark:border-slate-800

Inactive:          text-slate-500
Active:            text-sora-600
Cart badge:        bg-red-500 text-white
```

Aktiv navigation uchun faqat Sora ishlatiladi.

---

# 14. State Matrix

| State | Light | Dark | Semantika |
|---|---|---|---|
| Default Primary | `sora-600` | `sora-400` | Brand |
| Hover Primary | `sora-700` | `#FF72AC` | Interaction |
| Active Primary | `sora-800` | `sora-300` | Pressed |
| Focus | `ring-sora-500/20` | `ring-sora-400/25` | Accessibility |
| Disabled | `slate-100 / slate-400` | `slate-800 / slate-500` | Disabled |
| Loading | `slate-200` | `slate-800` | Skeleton |
| Success | `emerald-600` | `emerald-500` | Success |
| Error | `red-600` | `red-500` | Error |
| Favorite | `rose-600` | `rose-400` | Favorite |
| Rating | `amber-400` | `amber-400` | Rating |

---

# 15. Ranglardan foydalanish foizi

Aniq grafik qoida sifatida quyidagi vizual nisbat tavsiya qilinadi:

```text
Neutral     ≈ 70–80%
Sora        ≈ 10–15%
Semantic    ≈ 5–10%
Other       ≈ 2–5%
```

Bu matematik cheklov emas, balki vizual hierarchy uchun yo'nalish.

### Muhim qoida

Bir ekranda bir nechta **dominant** rangli CTA yaratmang.

Masalan:

```text
GOOD:
[Sora — Katalogga o'tish]
[Ghost — Batafsil]

NOT RECOMMENDED:
[Pink — Katalog]
[Amber — Buyurtma]
[Purple — B2B]
[Green — Yangi]
```

Ikkinchi holatda foydalanuvchining vizual diqqati haddan tashqari ko'p yo'nalishga bo'linadi.

---

# 16. Gradient qoidalari

### Default brand gradient

```css
background:
linear-gradient(
  135deg,
  #c70468 0%,
  #b80460 52%,
  #56022d 100%
);
```

### Light decorative gradient

```css
background:
radial-gradient(
  circle at top right,
  rgba(255, 159, 197, .30),
  transparent 45%
);
```

### Dark decorative gradient

```css
background:
radial-gradient(
  circle at top right,
  rgba(244, 90, 157, .16),
  transparent 42%
);
```

Gradientlar butun ilovada emas, asosan Hero va maxsus marketing bloklarida ishlatiladi.

---

# 17. Typography va rang

Logo ostidagi shior qora va kuchli kontrastli bo'lgani uchun interfeys tipografiyasi ham toza neutral tizimga tayanishi kerak.

### Heading

```text
Light:  slate-900
Dark:   slate-50
```

### Body

```text
Light:  slate-700
Dark:   slate-300
```

### Muted

```text
Light:  slate-500
Dark:   slate-400
```

### Link

```text
Light:  sora-600
Dark:   sora-400
```

---

# 18. Accessibility

Rang faqat dekoratsiya sifatida emas, semantik signal sifatida ishlatiladi.

### Asosiy qoidalar

1. Faqat rang bilan muhim holatni bildirmang. Icon yoki text ham bo'lsin.
2. `amber-500 + white text` kombinatsiyasini kichik matn va asosiy CTA uchun ishlatmang.
3. Dark Mode'da light accent ranglar bilan foreground ranglarini alohida tekshiring.
4. Focus holati keyboard navigation uchun doimo ko'rinadigan bo'lsin.
5. Product price, stock va discount matni background bilan yetarli kontrastga ega bo'lsin.

### Tavsiya

Primary button:

```text
Light Mode:
background = #DD0576
text       = #FFFFFF
```

Dark Mode:

```text
background = #F45A9D
text       = #180711
```

---

# 19. Tailwind foydalanish qoidalari

## Hech qachon

```css
#123456
#ff00aa
#333333
```

kabi yangi ranglarni komponent ichida tasodifiy yozmang.

## Faqat

```text
sora-600
sora-700
slate-200
emerald-600
amber-400
red-600
rose-500
purple-600
```

yoki semantic CSS variables ishlatiladi.

---

# 20. Rang tanlashning semantik xaritasi

```text
SORAUZ MAGENTA
     │
     ├── Brand
     ├── Primary CTA
     ├── Navigation Active
     ├── Links
     └── Focus

EMERALD
     │
     ├── Success
     ├── In Stock
     ├── ERP Sync
     └── Order Accepted

AMBER
     │
     ├── Rating
     ├── Top / Hit
     ├── Commercial Highlight
     └── Secondary CTA

RED
     │
     ├── Discount
     ├── Error
     ├── Delete
     └── Out of Stock

ROSE
     │
     └── Favorite

PURPLE
     │
     └── B2B / Corporate

SLATE
     │
     ├── Background
     ├── Surface
     ├── Border
     └── Typography
```

---

# 21. Yakuniy Design Decision

Sora.uz uchun asosiy vizual identifikatsiya quyidagi tartibda saqlanadi:

```text
1. Sora Magenta  — Brand
2. Slate         — Structure
3. Emerald       — Success
4. Amber         — Rating / Commercial Highlight
5. Red           — Discount / Error
6. Rose          — Favorite
7. Purple        — B2B
```

Fuchsia va Indigo kabi qo'shimcha ranglar umumiy UI rang tizimining markaziy qismi bo'lmaydi. Ular faqat maxsus marketing yoki korporativ sahifalarda qo'shimcha accent sifatida ishlatilishi mumkin.

Asosiy maqsad — foydalanuvchi Sora.uz interfeysini ko'rganda **birinchi navbatda Sora Magenta brendini**, ikkinchi navbatda esa mahsulot, narx va CTA'larni ko'rishi.

---

# 22. Qisqa Developer Cheat Sheet

```text
PRIMARY
bg-sora-600
hover:bg-sora-700
active:bg-sora-800
text-white

LINK
text-sora-600
hover:text-sora-700

SUCCESS
bg-emerald-600
text-white

DISCOUNT / ERROR
bg-red-600
text-white

FAVORITE
text-rose-500
active:bg-rose-50

RATING
text-amber-400

TOP / HIT
bg-amber-600
text-white

B2B
text-purple-600

PAGE
bg-slate-50

CARD
bg-white
border-slate-200

MAIN TEXT
text-slate-900

BODY TEXT
text-slate-700

MUTED
text-slate-500
```

---

# 23. Yakuniy xulosa

Ushbu rang tizimining asosiy printsipi:

> **Sora.uz ranglari ko'p bo'lishi mumkin, lekin dominant rang faqat bittadir — Sora Magenta.**

Qolgan ranglar foydalanuvchiga **“nima holat yuz berdi?”** degan savolga javob berish uchun ishlatiladi:

- Magenta → “Bu Sora.uz harakati”
- Emerald → “Muvaffaqiyat / mavjud”
- Amber → “Muhim / top / reyting”
- Red → “Chegirma / xatolik / xavf”
- Rose → “Sevimli”
- Purple → “B2B”
- Slate → “Oddiy interfeys”

Shu yondashuv Sora.uz'ning e-commerce UI'sini brendga mos, tizimli va kengaytirish oson bo'lgan rang arxitekturasiga keltiradi.
