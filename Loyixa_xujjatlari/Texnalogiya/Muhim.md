Muhim jihat: sizning sayt 1C/API → Vercel → Next.js → Google/Bing/Merchant Center modelida ishlaydi. Shuning uchun React SPA uslubida “hamma narsani browserda bajarish” emas, server-first e-commerce arxitekturasi asosiy bo‘lishi kerak.
Men tavsiya qiladigan asosiy Stack
| Qism                  | Tavsiya                    | Vazifasi                                               |
| --------------------- | -------------------------- | ------------------------------------------------------ |
| Frontend framework    | **Next.js 16.3.x**         | App Router, SSR, SEO, routing, caching                 |
| UI engine             | **React 19.3**             | Interaktiv UI va Server/Client Components              |
| Til                   | **TypeScript**             | Katta loyiha va API bilan type-safety                  |
| CSS                   | **Tailwind CSS 4.x**       | Responsive dizayn va Design System                     |
| UI Components         | **shadcn/ui + Base UI**    | Professional, customizable UI                          |
| i18n                  | **next-intl 4.x**          | `/uz` va `/ru`, translations, localized routing        |
| Validation            | **Zod 4.x**                | API/Form ma'lumotlarini tekshirish                     |
| URL filter state      | **nuqs**                   | Filter/sort/search parametrlarini URL bilan bog‘lash   |
| UI/client state       | **Zustand**                | Savat/favorite/UI vaqtinchalik holatlari               |
| Component development | **Storybook 10.6**         | Design System va komponentlarni alohida ishlab chiqish |
| Testing               | **Playwright**             | Real browser/e2e testlar                               |
| Analytics             | **GA4 + Vercel Analytics** | Foydalanuvchi va conversion analitikasi                |
| Performance           | **Vercel Speed Insights**  | LCP, INP, CLS va real-user monitoring                  |
| Images                | **Next.js Image**          | Responsive/optimized image pipeline                    |
| Structured Data       | **Schema.org + JSON-LD**   | Product, Breadcrumb, Organization va h.k.              |

Next.js 16.3 hozir Active LTS liniyasida; 2026-yil 22-sentyabrda 16.3.6 xavfsizlik yangilanishi chiqarilgan va 30-sentyabrga 16.3.7 rejalashtirilgan. Vercel ham 16.3'ni bevosita optimallashtirib qo‘llab-quvvatlaydi. React 19.3 esa 2026-yil 9-sentyabrda chiqarilgan.

Eng muhim tanlov: Next.js 16 + Server Components [Next.js App Router + React Server Components]
Serverda qoladigan qismlar {SEO va performance talablaringizga juda mos}:
[Mahsulot ma'lumoti
Kategoriya
Brend
SEO text
Metadata
Breadcrumb
Product Schema
Reviews
Related Products
Sitemap
Robots]
Clientga tushadigan qismlar:
[Add to Cart
Favorite
Quantity
Gallery interaction
Filter
Sort
Search autocomplete
Modal
Drawer
Checkout forms]
Next.js 16.3 + Cache Components
[CACHED + STATIC + DYNAMIC]
Masalan:
[PRODUCT PAGE
Cached:
- product name
- description
- specifications
- images
- category
- brand
Dynamic:
- current price
- current stock
- cart state
- user-specific information]
[Product API + Price API + Stock API]
1C bilan bevosita browserdan ishlashni tavsiya qilmayman
Quyidagicha arxitektura bo‘lishi kerak:INTERNET->VERCEL->NEXT.JS SERVER->[{PRODUCT API};{PRICE/STOCK API}]->1C.
Yana katta loyiha uchun undan ham yaxshi variant:``
1C
 ↓
Integration/API Layer
 ↓
Read Model / Cache
 ↓
Next.js
 ↓
Vercel CDN
 ↓
User + Google + Bing``.
“Google → 1C”ga yaqinlashib ketmaslik, balki Next.js/API layer orqali ishlash g‘oyasi aynan shu yerda muhim.


