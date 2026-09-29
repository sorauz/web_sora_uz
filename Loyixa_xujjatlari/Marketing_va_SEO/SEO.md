Har bir mahsulot sahifasini  2 ta tilda (uz, ru) alohida havola (URL) bilan yaratish Ko'p Tilli SEO (Multilingual SEO) deb ataladi. Bu Sora.uz loyihasining qidiruv tizimlaridagi : URL tilining o‘zi 1-o‘rinni kafolatlamaydi; sahifaning nufuzi (PageRank), havolalar profili (backlinks) va qidiruv niyatiga (Search Intent) javob berishi ancha ustun turadi.
Quyida buning foydalari va uni to'g'ri amalga oshirishning oltin qoidalari keltirilgan:
1. Nega bu juda katta ustunlik beradi?
Turli tillardagi auditoriyani qamrab olish:
O'zbek tilida qidirgan foydalanuvchiga: sora.uz/uz/products/elektr-choynak-1025
Rus tilida qidirgan foydalanuvchiga: sora.uz/ru/products/elektricheskiy-chaynik-1025
Tildagi kalit so'zlar SEO vazni:
Rus tilida qidiruv bergan odamga Google ruscha URL va ruscha sarlavhali sahifani birinchi o'rinlarga chiqarib beradi.
2. Buni amalga oshirishda 2 ta MUHIM SHART (Zarar yetkazib qo'ymaslik uchun):
Bunday usul faqat quyidagi 2 ta qoidaga amal qilinsa SEO-da katta natija beradi. Aks holda Google dublicat deb : Google ko‘p tilli yoki texnik parametrlarga ega e-commerce sahifalaridagi dublikatlar uchun saytga sanksiya (jarima) qo‘llamaydi. Google shunchaki bunday sahifalarning bittasini asosiy (kanonik) deb tanlaydi, qolganlarini esa indeksda yashiradi (konsolidatsiya qiladi). Bu jazo emas, resurslarni tejash mexanizmidir.

Qoida 1: hreflang metabiriktirmasi:
Google-ga ushbu 2 ta havola bitta mahsulotning turli tillardagi rasmiy tarjimalari ekanligini bildirish kerak. Server Component har bir sahifaga quyidagi teglarni joylaydi:
hreflang="uz" ➔ O'zbekcha manzilga ishora
hreflang="ru" ➔ Ruscha manzilga ishora

Server Component teglarni dasturchi metadata funksiyasi orqali har bir til uchun havolalarni to‘g‘ri generatsiya qilishi, o‘zaro bog‘lashi (reciprocal links) va x-default manzilini qo‘lda dasturlashi mumkin.
Bu teg Google-ga "bu sahifalar dublikat emas, tarjima" degan xabarni beradi.

-hreflang qoidalaridagi x-default va hududiy kodlar Faylda faqat hreflang="uz", ru  yozilgan. Bu yetarli emas:  Saytga O‘zbekistondan tashqaridagi yoki brauzer tili boshqa bo‘lgan foydalanuvchi kirganda qaysi sahifa ochilishi kerakligini belgilovchi x-default ko‘rsatilishi Google x-defaultni mos til/region topilmaganda fallback sahifani ko‘rsatish uchun tavsiya qiladi. Shuningdek, O‘zbekistondagi rusiyzabon auditoriya uchun mintaqaviy aniqlik (masalan, ru-UZ) ko‘rsatilishi qidiruv aniqligini ancha oshiradi. 
x-default — bu majburiy emas, lekin tavsiya etiladi. Agar til/region topilmasa, qaysi sahifa ko‘rsatilishini belgilaydi.
Har bir til versiyasi o‘zini ham (self-referencing) hreflang ro‘yxatiga qo‘shishi shart. Aks holda Google bu bog‘lanishni bir tomonlama deb hisoblab, inkor etishi mumkin.
2026-yilda o‘tkazilgan tadqiqotga ko‘ra, ko‘p tilli korporativ saytlarning 65%ida hreflang-kanonik konflikti mavjud bo‘lib, bu klasterning butunlay ishdan chiqishiga sabab bo‘ladi

Google ko‘p tilli sahifalarni boshqarishda hreflang annotatsiyalaridan foydalanishni tavsiya qiladi, lekin bu indexlanish yoki ranking uchun majburiy talab emas. hreflangning vazifasi asosan Google’ga bir-biriga ekvivalent bo‘lgan lokal/tillararo variantlarni tushunishga va mos variantni foydalanuvchiga ko‘rsatishga yordam berishdir. Bundan tashqari, Google canonical va hreflangni birgalikda ishlatishni tavsiya qiladi va hreflang ishlatilganda canonical o‘sha tilning o‘zidagi URL bo‘lishi kerak.

“Ko‘p tilli Sora.uz uchun hreflang juda tavsiya etiladi; u til/region variantlarini to‘g‘ri bog‘lashga yordam beradi, ammo Google Search’da ranking yoki indexing uchun majburiy shart emas.”

Qoida 2: Kontent haqiqatdan ham o'sha tilda bo'lishi shart
URL o'zgargani bilan ichidagi ma'lumot (mahsulot nomi, tavsifi) 1C API-dan o'sha tilda kelishi lozim. Agar uz va ru havolalarining ichidagi matn bir xil (masalan faqat ruscha yoki o’zbekcha) bo'lib qolsa, Google buni "Dublikat kontent" deb baholab, qidiruvdan chiqarib tashlaydi.

Agar 1C bazasidan mahsulot ma'lumotlari 2 tilda keladigan bo'lsa, 2 tilda alohida URL-lar yaratish to'liq va eng to'g'ri strategiya hisoblanadi.






1.  Rasmlar optimizatsiyasi va alt matnlari (Image SEO)
Elektron tijoratda rasmlar SEO-ning eng muhim qismlaridan biridir.

Format: Rasmlar Next.js orqali avtomatik WebP yoki AVIF formatga o'tkazilishi lozim (bu next.config.ts faylingizda allaqachon sozlandi).
alt atributi: Har bir mahsulot rasmining HTML-dagi alt atributiga mahsulot nomi va kalit so'zi yozilishi shart (Masalan: alt="Sora elektr choynak 1.8L qora"). Google Images qidiruvida bu rasm orqali minglab xaridorlar kirib keladi. { alt tasvirni aniq va tabiiy tasvirlashi kerak.}
2.  Breadcrumbs (Non ushoqlari / Yo'nalishlar)
Sahifa yuqori qismida iyerarxik yo'nalish zanjiri ko'rsatilishi lozim:
Bosh sahifa ➔ Maishiy texnika ➔ Oshxona ➔ Elektr choynak

SEO foydasi: Google botlari sayt tuzilishini mukammal tushunadi va qidiruv natijalarida havolangiz ostida ushbu bo'limlar chiroyli ko'rinib turadi.
3. Avtomatik Dinamik sitemap.xml va robots.txt
sitemap.xml: 1C bazasida 10,000 ta mahsulot bo'lsa, Next.js avtomatik ravishda barcha mahsulot havolalarini jamlagan xarita hosil qilishi kerak. sitemap.xml — qidiruv botlari uchun qat’iy buyruq emas, shunchaki tavsiyaviy xaritadir. Googlebot sitemap’ni tekshirishi, sahifani navbatga qo‘yishi, skanerlashi (crawl) va indeksga kiritishi bir necha soatdan bir necha kungacha, ba’zan esa haftalargacha vaqt oladi , ammo Google indexing umuman kafolatlanmasligini ta’kidlaydi.

robots.txt: Qidiruv botlariga shaxsiy sahifalarni (savatcha, checkout, login va API yo'nalishlarini) indekslashni taqiqlab, faqat mahsulot va katalog sahifalarini ochiq qoldirish lozim.
4. Rich Snippets (Schema.org / JSON-LD)
Google qidiruvida oddiy matn emas, balki narx va ombordagi holati ko'rinadigan Strukturaviy Ma'lumotlar (Microdata) joylash:

Natija: Google-da qidirganda Sora.uz mahsuloti yonida:
⭐ Narxi: 250,000 UZS
✅ Mavjudligi: Omborda bor (In Stock)
gohida rating va sharhlar ko'rinadi. Bu xaridorlar bosish sonini oshirishi mumkin.
5. 🔗 Ichki havolalar zanjiri (Internal Linking)
Mahsulot sahifasi pastida quyidagi bo'limlarni joylashtirish:

"O'xshash mahsulotlar"
"Boshqalar ushbu mahsulot bilan birga sotib oldi"
SEO foydasi: Bu sayt ichidagi sahifalarni bir-biri bilan bog'laydi, foydalanuvchining saytda qolish vaqtini uzaytirishi mumkin hamda Google botiga sayt bo'ylab chuqur kirib borishga yordam beradi.
Internal linkingning kuchli jihatlari:

discovery;
crawl path;
topical relationships;
site hierarchy;
contextual relevance.
Google crawlable links'ni asosiy discovery mexanizmlaridan biri sifatida ko‘rsatadi.
6. ⚡ Sayt yuklanish tezligi (Core Web Vitals)
Google sahifa yuklanish tezligi 2.5 soniyadan sekin bo'lgan saytlarning reytingini tushirib mumkin va “LCP — 2.5 soniyadan past (“Good”)  hamda  INP — 200 millisekunddan past (“Good”)  hamda CLS — 0.1 dan past chiqadi va foydalanuvchi tajribasi hamda Search performance uchun salbiy omil bo‘lishi mumkin; bu avtomatik ranking penalty degani emas.” Bundan tashqari, 2026-yil mart oyidan boshlab Google Core Web Vitals’ni kompozit (umumiy) ball sifatida baholaydi — ya’ni saytning eng yomon sahifasi eng yaxshi sahifasiga ham salbiy ta’sir ko‘rsatishi mumkin.

Core Web Vitals (CWV) — faqat server javob tezligi (TTFB) emas. U real foydalanuvchilarning qurilmasida o‘lchanadi (CrUX ma’lumotlari). Agar sahifada og‘ir rasmlar, shriftlar sakrashi (CLS muammosi) yoki foydalanuvchi tugmani bosganda sahifaning qotib qolishi yuz bersa, server qanchalik tez bo‘lmasin, sayt CWV testidan yiqiladi.

Agar loyihada Next.js Server Components va 2 daqiqalik kesh (revalidate: 120) — bu umumiy yuklanish tezligi emas, balki CWV’ning LCP (Largest Contentful Paint) ko‘rsatkichi uchun belgilangan "yaxshi" (Good) chegarasidir. Eng muhimi, hujjatda interaktivlik mezoni bo‘lgan INP (Interaction to Next Paint) parametri to‘liq e’tiborga olinmagan (u 2024-yildan buyon eskirgan FID o‘rniga asosiy metrika hisoblanadi).
Keshlashtirish va 1C tizimiga yuklama xavfi (On-demand Revalidation) har 2 daqiqada keshni yangilash (revalidate: 120) taklif xardoim xam to’g’ri emas : Agar internet-do‘konda 10 000 yoki 50 000 ta mahsulot bo‘lsa va Googlebot saytni faol skanerlashni boshlasa, har 2 daqiqada server orqa fonda 1C API’siga qayta-qayta so‘rov yuboradi. Bu 1C serverini ortiqcha yuklama bilan qotirib qo‘yishi va server xarajatlarini keskin oshirib yuborishi mumkin. Bu katta e-commerce uchun vaqt asosidagi umumiy revalidation'dan ko‘ra ancha nazoratli arxitektura bo‘lishi mumkin.
Lekin bu yagona to‘g‘ri usul emas. Gibrid model ko‘pincha yaxshiroq:
inventory/price uchun qisqa TTL;
kontent uchun uzun TTL;
muhim o‘zgarishda on-demand invalidation.

To‘g‘ri yondashuv: Vaqtga bog‘liq kesh emas, balki voqeaga asoslangan kesh tozalash (On-demand Revalidation) kerak. Ya’ni tovar narxi yoki qoldig‘i 1C bazasida o‘zgargandagina Next.js serveriga xabar (webhook) yuborilib, aynan o‘sha tovar sahifasining keshi yangilanishi lozim.

Next.js + E-commerce uchun to‘liq SEO tizimi:
Mahsulot ma’lumotlari boshqa API’dan kelayotgan bo‘lsa ham, Google mahsulot sahifasini to‘liq tushuna oladigan qilib Next.js orqali server tomonda tayyor HTML va metadata berilishi kerak.
Ya’ni:
1C/API → Next.js server → SEO-friendly HTML → Google/Bing
arxitekturasi juda muhim.

Saytning barcha muhim sahifalari qidiruv tizimiga ochiq bo‘lishi kerak
E-commerce sayt odatda quyidagi sahifalarga ega bo‘ladi:
Bosh sahifa
→ Kategoriya
→ Subkategoriya
→ Mahsulot
→ Brend
→ Blog / maqola
→ FAQ / qo‘llanmalar
Google mahsulotni faqat sitemap orqali emas, balki crawlable internal link orqali ham topishi kerak.
Masalan:
Bosh sahifa → Kategoriya → Mahsulot
Bu zanjir izchil bo‘lishi kerak.
Bing ham XML sitemap, crawlable internal links, tashqi havolalar va IndexNow orqali URL’larning topilishini tavsiya qiladi.

URL strukturasi juda muhim
E-commerce uchun URL'larni odam ham, qidiruv tizimi ham tushuna olishi kerak.
Masalan: /telefonlar/samsung/galaxy-s25
kabi strukturali URL:
/product?id=842731
ga qaraganda ancha tushunarli.
Yaxshi URL:
qisqa + mantiqiy + o‘zgarmaydigan + mahsulotni ifodalovchi
bo‘lsin.
Mahsulot nomi yoki slug o‘zgarganda eski URL’ni shunchaki yo‘qotmasdan, kerak bo‘lsa 301 redirect bilan yangi URL'ga o'tkazish kerak.
Duplicate URL'larni nazorat qilish — e-commerce'dagi eng katta muammolardan biri
E-commerce saytning juda katta SEO muammosi:
filter + sort + pagination + query parameter
Masalan:
/telefonlar
/telefonlar?brand=samsung
/telefonlar?brand=samsung&color=black
/telefonlar?sort=price
/telefonlar?sort=rating
/telefonlar?price=5000000-10000000
Shunday qilib minglab yoki millionlab URL paydo bo‘lishi mumkin.
Google bunday URL'larni duplicate yoki juda o‘xshash sahifalar sifatida guruhlashtirishi mumkin. Canonical shu holatda asosiy URL'ni ko‘rsatish uchun muhim signal hisoblanadi, lekin Google canonical'ni yakuniy buyruq emas, signal sifatida ko‘radi.
Shuning uchun:
SEO sahifa bo‘lishi kerak bo‘lgan filterlar → index
faqat navigatsiya uchun bo‘lgan kombinatsiyalar → odatda index qilinmasligi yoki canonicalizatsiya qilinishi kerak.
Ammo eng katta e-commerce SEO masalalaridan biri shu:
Har bir filter SEO landing page bo‘ladimi?
Masalan:
/noutbuklar/lenovo
SEO qiymatli.
Lekin:
/noutbuklar?brand=lenovo&ram=16&color=black&sort=price
SEO qiymatli bo‘lmasligi mumkin.
Shuning uchun filterlar uchun aniq indexing policy kerak:
Index qilinadigan kombinatsiyalar
vs
crawl qilinishi mumkin, lekin index qilinmaydiganlar
vs
umuman crawl qilinmasligi kerak bo‘lgan kombinatsiyalar.

Bu e-commerce SEO'da juda katta farq beradi.

faceted navigation strategiyasi E-commerce'da:
Category → brand → model → specification → filters → pagination
SEO architecture'ning markaziy qismi.
Hujjat filterlarni tilga oladi, ammo quyidagi savollarga aniq javob bermagan:
Qaysi filter kombinatsiyasi index qilinadi?
Qaysi filter canonical bo‘ladi?
Qaysi biri noindex?
Qaysi biri robots bilan cheklanadi?
SEO landing page qachon yaratiladi?
100 000 filter kombinatsiyasidan qaysilarini Google'ga ochamiz?

Google sitemap documentation'da lastmod sahifaning muhim o‘zgarish sanasini ifodalashi kerakligi ko‘rsatilgan. 1C'da:
narx o‘zgardi;
availability o‘zgardi;
description o‘zgardi;
asosiy rasm o‘zgardi;
category o‘zgardi
kabi o‘zgarishlarda sitemap freshness signalini ham to‘g‘ri boshqarish mumkin.

Ammo lastmodni har soatda “hozirgi vaqt”ga qo‘yish kerak emas. Faqat sezilarli o‘zgarish bo‘lganda yangilanishi kerak.

Lekin SEO nuqtai nazaridan quyidagilar alohida entity sifatida ajratilmagan:
Product ID
SKU
Brand
MPN
GTIN
Variant ID
ProductGroup ID
Canonical URL
Language
Availability
Price
Price validity
Main image
Additional images
Shipping
Return policy
Bu aslida Sora.uz'ning SEO ma'lumotlar modelining yuragi.

Har bir mahsulotning alohida, kuchli URL'i bo‘lsin
Har bir mahsulot uchun:
1 mahsulot = 1 asosiy canonical URL
bo‘lishi maqsadga muvofiq.
Mahsulot sahifasida qidiruv tizimiga quyidagilar aniq ko‘rinishi kerak:
mahsulot nomi
ishlab chiqaruvchi/brend
model
narx
valyuta
mavjudlik
SKU
mahsulot rasmi
asosiy xususiyatlar
texnik parametrlar
variantlar
sharhlar
reyting
yetkazib berish
qaytarish shartlari
kafolat
o‘lcham/rang va boshqa variantlar
Google mahsulot ma’lumotlarini Search va Shopping ekotizimida tobora ko‘proq strukturaviy tarzda ishlatmoqda. 2026-yilda Product variantlar uchun ham alohida hujjatlar va imkoniyatlar mavjud.

Product Structured Data — e-commerce uchun juda muhim
Bu oddiy meta tag emas.
Qidiruv tizimiga:
“Bu sahifa aynan mahsulot sahifasi.”
degan strukturali signal beriladi.
Mahsulot uchun:
Product
va tegishli holatlarda:
Product variant
kabi structured data ishlatilishi kerak.
Bu ma'lumotlar Google’ga mahsulot nomi, narx, availability, variant va boshqa ma'lumotlarni yaxshiroq tushunishga yordam beradi.
Muhim:
structured data = yuqori ranking kafolati emas.
Lekin u sahifaning mazmunini mashinalarga tushunarliroq qiladi va mavjud bo‘lsa, rich result/merchant ko‘rinishlariga mos kelish imkonini oshiradi.
Biroq 2026-yil 7-iyulda Google Product.category xususiyatini yangiladi:
Endi Product.category ikkita ma’lumot turini qabul qiladi: Text (o‘z ichki kategoriyangiz) va CategoryCode (Google’ning rasmiy mahsulot taksonomiyasiga mos).
Sale duration (chegirma muddati) uchun validFrom, validThrough, priceValidUntil xususiyatlari qo‘shildi.
Maxsus kategoriya matnlarini 750 belgidan pastroq saqlash tavsiya etiladi

Google Merchant Center'ni albatta ko‘rib chiqing
E-commerce uchun faqat oddiy Google Search SEO bilan chegaralanib qolish xato.
Mahsulotlarni Google Merchant Center orqali ham Google ekotizimiga berish kerak.
2026-yilda Google Merchant Center’da:
Free product listings
mavjud va mahsulotlar Google'da bepul product listing sifatida ko‘rinishi mumkin.
Ya'ni sizning strategiyangiz:
SEO + Product structured data + Merchant Center
bo‘lishi kerak.
Bu uchalasi bir-birining o‘rnini bosmaydi.

Narx va mavjudlik doim yangilanib turishi kerak
E-commerce'da juda xavfli holat:
Google mahsulotni ko‘radi:
Narx: 4 500 000 so‘m
saytda esa keyin:
5 200 000 so‘m
bo‘lib qoladi.
Yoki:
Google:
In stock
sayt:
Out of stock
bo‘ladi.
Shu sababli API → Next.js → structured data → Merchant Center o‘rtasidagi ma'lumotlar imkon qadar sinxron bo‘lishi kerak.
Merchant Center bo‘yicha: Amaliyotda alohida:

Merchant Center product feed / data source
strategiyasi kerak.
Bu yerda quyidagilar boshqariladi:
ID
title
description
link
image
price
availability
brand
GTIN/MPN
condition
shipping
returns
country
language
variantlar
Shuningdek Google mahsulot landing page tili bilan product data source tili mos kelishiga e’tibor beradi; nom, description va variant ma’lumotlari landing page bilan mos bo‘lmasa performance yomonlashishi yoki ma’lumot source language bilan mos kelmasa disapproval bo‘lishi mumkin
Google Merchant API 2026-yil holatida mahsulot narxi va availability kabi tez-tez o‘zgaruvchi atributlarni yangilash imkonini beradi va mahsulotlarni muntazam yangilab turishni tavsiya qiladi.

Omborda tugagan tovarlar (Out of Stock) strategiyasi1C bilan ishlaydigan har qanday do‘konda tovar qoldig‘i nolga tushishi oddiy holat. Agar faqat 404 yoki 301 xatolari aytilgan.  Agar tovar vaqtincha tugasa, uni 404 qilish qidiruvdagi to‘plangan barcha nufuzni (SEO reytingni) yo‘q qiladi.Zarur fakt: Sahifa 200 kodi bilan ochiq qolishi, Schema.org ma’lumotlarida mahsulot holati "mavjud emas" (OutOfStock) qilib ko‘rsatilishi va sahifada xaridorga o‘xshash boshqa modellar tavsiya etilishi kerak.

E-E-A-T va Tijorat ishonch signallari (Merchant Trust)
Google 2026-yilda e-commerce saytlarga sun’iy intellekt bilan yaratilgan soxta do‘kon deb qaramasligi uchun quyidagi ma’lumotlar bo‘lishini qat’iy talab qiladi:
Kompaniya haqidagi:
aloqa ma’lumotlari
qaytarish siyosati
yetkazib berish
to‘lov
biznes identifikatsiyasi
ishonchlilik va merchant quality uchun juda muhim.

Maslan: (yuridik nomi, STIR/INN, jismoniy do‘kon yoki ofis manzili, rasmiy telefonlar).

Merchant Center siyosatlari esa alohida masala. Google free listings uchun alohida siyosatlarga ega va siyosatni buzuvchi merchantlar cheklanishi mumkin.

Tovarlarni qaytarish va almashtirish siyosati (Refund/Return policy) uchun alohida to‘liq sahifalar.
Yetkazib berish shartlari va to‘lov turlari bo‘yicha ochiq ma’lumotlar. Bularsiz Google Merchant Center akkauntni to‘sib qo‘yadi (ayniqsa O‘zbekiston kabi rivojlanayotgan bozorlarda).

Title har bir mahsulot uchun individual bo‘lsin
Masalan yomon:
Mahsulot | Online Shop
hamma mahsulotlarda bir xil.
Yaxshi:
Samsung Galaxy S25 256GB — narxi, xususiyatlari | BRAND
Title ichida foydalanuvchi qidiradigan asosiy ma'lumot bo‘lishi mumkin:
brend + model + muhim variant + mahsulot turi
Lekin keyword'larni sun’iy takrorlash kerak emas.
Next.js metadata tizimi dinamik mahsulot sahifalariga mos title va description berishga juda mos.

Google ham har bir sahifada descriptive, concise <title> bo‘lishini tavsiya qiladi. Google kerak bo‘lsa search-result title'ini <title>dan emas, sahifadagi boshqa manbalardan ham qayta yaratishi mumkin.

H1, H2, H3 strukturasini to‘g‘ri tashkil qiling
Bing’ning 2026-yilgi webmaster ko‘rsatmalarida ham:
title
meta description
mantiqiy H1–H6
semantic HTML
kabi strukturalar muhimligi qayd etilgan.
Masalan mahsulot:
H1 — Samsung Galaxy S25 256GB
keyin:
H2 — Texnik xususiyatlari
H2 — Afzalliklari
H2 — Savol-javob
H2 — Sharhlar
kabi mantiqiy tuzilma.

Hujjatdagi semantik HTML g‘oyasi yaxshi, ammo buni strukturaviy va accessibility/understanding foydasi sifatida ko‘rish kerak.

Mahsulot tavsifi API'dan keladigan "oddiy copy-paste" bo‘lib qolmasin
Tasavvur qiling:
1000 ta do‘kon bir xil ishlab chiqaruvchi description'ini ishlatadi.
Siz ham aynan o‘sha textni qo‘ysangiz, sizning saytingiz Google uchun noyob qiymat yaratmaydi.
Google 2026-yilda ham original va foydalanuvchiga foydali kontentni alohida ta'kidlamoqda. Katta miqdorda foydasiz, takroriy yoki faqat rankingni manipulyatsiya qilish uchun avtomatik yaratilgan kontent spam siyosatiga tushishi mumkin.
Shuning uchun API’dan kelgan:
nom + texnik parametr + ishlab chiqaruvchi description
asos bo‘lishi mumkin.
Ammo SEO qiymatini:
o‘z izohlaringiz + taqqoslash + foydalanish holatlari + FAQ + afzallik/kamchilik + real ma'lumotlar
orqali oshirish kerak.

AI bilan 100 000 ta mahsulot uchun avtomatik matn yaratishdan ehtiyot bo‘ling
2026-yilda juda muhim masala.
AI ishlatishning o‘zi taqiqlanmagan.
Ammo:
100 000 mahsulot → avtomatik AI text → deyarli bir xil sahifalar → faqat Google'da ko‘rinish uchun
strategiyasi xavfli.
Google katta miqdorda foydasiz, original qiymat qo‘shmaydigan AI-generated pages'ni spam sifatida baholashi mumkin. 

Google 2026-yilgi yo‘riqnomalarida ham AI ishlatishning o‘zi muammo emasligini, lekin foydalanuvchiga qiymat qo‘shmasdan katta miqdorda sahifalar yaratish scaled content abuse muammosiga aylanishi mumkinligini aytadi. Bu ayniqsa Sora.uz uchun juda muhim.
Masalan 50 000 mahsulot uchun:
“[brand] [model] sotiladi. Yuqori sifatli…”
kabi 50 000 deyarli bir xil AI matn yaratish — yomon strategiya.

Demak:
AI = yordamchi
AI ≠ SEO kontent fabrikasi
bo‘lishi kerak.

Kategoriya sahifalari ham SEO uchun alohida kuchli bo‘lishi kerak
Masalan:
/telefonlar
shunchaki mahsulot grid'i bo‘lmasin.
Unda:
H1: Smartfonlar
keyin qisqa kategoriya tavsifi:
qaysi telefonlar bor
kim uchun
asosiy brendlar
asosiy parametrlar
qanday tanlash
va mahsulotlar.
Bu Google'ga kategoriya sahifasining nima haqda ekanini yaxshiroq tushunishga yordam beradi.

Brend sahifalarini ham SEO obyektiga aylantiring
Masalan:
/brand/samsung
oddiy mahsulot ro‘yxati bo‘lmasin.
Unda:
Samsung haqida
Samsung telefonlari
Samsung planshetlari
Samsung mahsulotlarini qanday tanlash
kabi foydali kontekst bo‘lsin.
Shunda:
Brand → Category → Product
ichki SEO ekotizimi hosil bo‘ladi.

Ichki linking juda katta rol o‘ynaydi
Mahsulot sahifasida:
o‘xshash mahsulotlar
birga olinadigan mahsulotlar
shu kategoriya
shu brend
alternativlar
premium alternativ
arzonroq variant
kabi havolalar bo‘lsin.
Bu nafaqat foydalanuvchi uchun qulay.
Bu qidiruv crawler'lariga ham saytning:
entity relationship
tuzilishini tushunishga yordam beradi.



Image SEO'ni e'tiborsiz qoldirmang
E-commerce'da rasmlar juda muhim.
Har bir mahsulot rasmi:
aniq nomlangan
tegishli alt matnga ega
optimallashtirilgan
crawl qilinadigan URL
orqali berilishi kerak.
2026-yilda Google image SEO hujjatlarida ham image URL'larini izchil va crawl qilish oson holatda saqlashga e'tibor qaratilgan.
Sizning holatingizda API'dan kelayotgan JPG rasmlar ayniqsa muhim.

Faqat WebP/AVIF qilib qo‘yishning o‘zi yetarli emas
Rasm SEO'sining maqsadi faqat:
kichik fayl hajmi
emas.
Yana:
-asosiy rasmning aniq bo‘lishi
-mahsulot markazda bo‘lishi
-yaxshi resolution
-to‘g‘ri image URL
-alt text
-sahifa bilan semantik bog‘liqlik
-tez yuklanish
ham muhim.

Core Web Vitals va UX
SEO'da faqat keywordlar bilan yutib bo‘lmaydi.
Sayt:
tez
responsive
mobile-first
interaktiv
bo‘lishi kerak.
Ayniqsa:
LCP
INP
CLS
kabi Core Web Vitals ko‘rsatkichlarini nazorat qilish kerak.
E-commerce'da bu yanada muhim, chunki mahsulot sahifasida odatda:
rasm + gallery + narx + variant + review + tavsif + recommendation
ko‘p elementlar mavjud.

Mobile-first SEO
2026-yilda e-commerce uchun saytni desktopdan boshlab keyin mobile'ga moslashtirishdan ko‘ra:
mobile-first
yondashuv ma'qul.
Google foydalanuvchi mobil qurilmada nima ko‘rishini juda muhim deb hisoblaydi.
Shuning uchun mobil versiyada:
mahsulot nomi
narx
availability
rasm
asosiy parametrlar
buy button
review
description
kabi asosiy ma'lumotlar yo‘qolib qolmasligi kerak.

JavaScript haqida muhim nuqta
2026-yilda Google JavaScript'ni yillar davomida render qilib kelmoqda va "JavaScript ishlatsa Google index qilmaydi" degan eski qarash noto‘g‘ri. Google JavaScript renderingni qo‘llaydi. Shu bilan birga, JS rendering uchun resurslar, timing va ayrim cheklovlar mavjud, shuning uchun critical contentni server-side HTML’da olish juda foydali.

E-commerce'da ideal holat:
Crawler keladi → sahifaning mazmunli HTML'ini oladi → mahsulot nomi/narxi/tavsifi kabi asosiy ma'lumotlar mavjud.
Shuning uchun Next.js'ning server rendering imkoniyatlaridan to‘g‘ri foydalanish katta ustunlik beradi.

Status code'lar to‘g‘ri ishlashi kerak
E-commerce'da:
mahsulot mavjud → 200
mahsulot butunlay o‘chirilgan → vaziyatga qarab 404 yoki 410
mahsulot boshqa URL'ga ko‘chirilgan → 301
kabi mantiq ishlashi kerak.
"O‘chirilgan mahsulot URL'iga yana boshqa mahsulotni chiqarib qo‘yish" kabi noto‘g‘ri soft-404 strukturalar SEO uchun zararli bo‘lishi mumkin.
Next.js'ning SEO materiallarida HTTP status code va indexing alohida mavzu sifatida ko‘rsatilgan.

404 sahifa yaxshi ishlashi kerak
Masalan:
/iphone-15-pro-max-256gb
mahsulot o‘chdi.
404 sahifada:
Mahsulot topilmadi
va unga yaqin:
iPhone
Smartfonlar
Yangi mahsulotlar
kabi ichki navigatsiya bo‘lishi foydali.

robots.txt to‘g‘ri bo‘lishi kerak
Robots.txt orqali:
admin
account
checkout
private API
kabi crawler'ga kerak bo‘lmagan joylarni cheklash mumkin.
Ammo muhim:
robots.txt orqali URL'ni yopish bilan noindex bir xil narsa emas.
Next.js va Google hujjatlarida ham robots va noindex o‘rtasidagi farq alohida ko‘rsatilgan. Google robots.txt bilan bloklangan URL ichidagi noindexni ko‘rmasligi mumkin. noindex ishlashi uchun crawler sahifaga kira olishi kerak. Shuning uchun:
“Google indexlamasin” → ko‘pincha noindex
“Google bu URL'ga umuman crawl qilmasin” → robots.txt
degan farq saqlanishi kerak.

Sitemap juda muhim
E-commerce uchun men:
dynamic XML sitemap
strategiyasini tavsiya qilaman.
Unda asosiy:
kategoriya
mahsulot
brend
SEO article
URL'lari bo‘lishi kerak.
Google sitemap'ni yangi URL'larni topish va crawl qilishni yengillashtiruvchi signal sifatida ko‘radi. Next.js ham dinamik saytlar uchun dynamic sitemap yondashuvini tavsiya qiladi.

Sitemap'ga hamma URLni tiqib tashlamang
Masalan:
❌ filter URL
❌ sort URL
❌ cart
❌ account
❌ login
❌ checkout
❌ internal search
❌ duplicate URL
emas.
Sitemap:
Indexda bo‘lishini xohlagan canonical sahifalar
uchun bo‘lishi kerak.
Bing ham sitemap'da faqat canonical URL'larni ko‘rsatishni tavsiya qiladi.

hreflang — ko‘p tilli sayt uchun
Siz O‘zbekiston bozori uchun sayt qilayotgan bo‘lsangiz, kelajakda:
Uzbek
Russian
versiyalarini ochishingiz mumkin.
Bunda SEO arxitekturasi boshidan rejalashtirilgani yaxshi.

Masalan:
/uz/...
/ru/...
yoki boshqa mantiqiy lokalizatsiya.
Bir tildagi sahifa boshqa til versiyasi bilan to‘g‘ri bog‘lanishi kerak.
Google regional/til variantlarida canonical va hreflang birgalikda ishlatilishini tavsiya qiladi.

Breadcrumb juda foydali
Masalan:
Bosh sahifa → Telefonlar → Samsung → Galaxy S25
Bu:
foydalanuvchi
uchun ham,
search engine
uchun ham sahifaning joylashuvini tushunarli qiladi.

Review va rating — e-commerce uchun kuchli signal
Agar real foydalanuvchi sharhlari mavjud bo‘lsa:
rating
review count
real comments
katta qiymat beradi.
Ammo review'larni sun'iy yaratish yoki fake rating qo‘yish kerak emas.
Structured data'dagi rating ham real sahifada ko‘rsatilayotgan ma'lumotga mos kelishi kerak; noto‘g‘ri structured data Google/Bing tomonidan e'tiborsiz qoldirilishi yoki muammoga olib kelishi mumkin.

FAQ — lekin faqat foydali bo‘lsa
Mahsulot uchun:
Bu telefon 5G'ni qo‘llaydimi?
Qancha kafolat bor?
Yetkazib berish qancha vaqt?
Qaysi zaryadlovchi mos?
kabi real savollar foydali.
FAQ'ni faqat SEO uchun sun’iy ravishda to‘ldirish kerak emas.

Blog SEO e-commerce uchun juda katta qurol
Faqat:
"Samsung Galaxy S25 sotiladi"
bilan reyting olish qiyin bo‘lishi mumkin.
Buning o‘rniga:
Samsung Galaxy S25 va S25 Ultra farqi
2026-yilda telefon tanlash bo‘yicha qo‘llanma
AMOLED va IPS farqi
Telefon kamerasi qanday tanlanadi?
256 GB yoki 512 GB?
kabi foydali kontent yaratiladi.
Keyin:
Blog → Category → Product
orqali mahsulotlarga ichki linklar beriladi.
Google 2026-yilgi AI Search yo‘riqnomasida ham noyob va foydali, non-commodity contentga urg‘u bermoqda.  2026-yil may oyida Google I/O’da qidiruv tizimi 25 yil ichidagi eng katta o‘zgarishga uchradi: klassik qidiruv qutisi endi konversatsion, ko‘p formatli (matn, rasm, video) kirish nuqtasiga aylandi. Google AI Overviews hozirda so‘rovlarning taxminan 48%ida ko‘rinadi (2025-yilda 30% edi). AI Overview mavjud bo‘lganda, foydalanuvchilarning atigi 8%i an’anaviy havolalarni bosadi (AI Overview bo‘lmaganda bu ko‘rsatkich 15%) . AI Overview’da keltirilish (citation) reytingdan ham muhimroq bo‘lib bormoqda

2026-yilda AI Search'ni ham hisobga olish kerak
Bu juda muhim yangilik.
Google 2026-yilgi rasmiy AI Search yo‘riqnomasida:
AI Overviews
AI Mode
kabi generativ qidiruv tajribalarida ham odatiy SEO asoslari hali ham muhimligini aytmoqda.
Demak alohida:
"AI SEO" uchun sirli algoritm izlash shart emas.
Shuning uchun: AEO/GEO/LLMO
nomlari bilan yuzlab alohida “optimization tricks” yig‘ishdan ko‘ra:
crawlable + useful + original + structured + trustworthy
modeli kerak. 
Asosiy maqsad:
crawlable + structured + original + useful + verifiable content
bo‘lishi.

Bing va Copilot'ni ham unutmaslik kerak
2026-yilda Bing o‘zining Webmaster Guidelines sahifasida SEO asoslari Bing Search + Copilot + AI grounding uchun bir xil texnik poydevor bo‘lib xizmat qilishini ochiq ko‘rsatmoqda.
Shuning uchun:
Google SEO
emas,
Search ecosystem SEO
qilish kerak.
Ya'ni:
Google Search
Google Shopping
Bing
Copilot
AI search experiences
uchun bir xil kuchli ma'lumot arxitekturasi.

IndexNow — Bing uchun foydali
Bing 2026-yilgi hujjatlarida yangi yoki o‘zgargan URL'larni tezroq bildirish uchun:
IndexNow-ni sitemap va internal links bilan birga discovery usullaridan biri sifatida ko‘rsatmoqda.
Mahsulotlari tez-tez o‘zgaradigan katta e-commerce uchun bu ayniqsa foydali bo‘lishi mumkin.

E-commerce uchun "SEO Architecture" qanday bo‘lishi kerak?

Men sizning Next.js loyihangiz uchun konseptual jihatdan quyidagi tuzilmani ma'qul deb hisoblayman:

Home
↓
Categories
↓
Subcategories
↓
Brands
↓
Products
↓
Product variants
va parallel ravishda:
Blog / Guides
↓
Comparisons
↓
FAQ / Educational content
↓
Products
Bularning barchasi internal linking bilan bog‘lanadi.

Sizning API arxitekturangizda eng muhim masala
Sizning oldingi tavsifingizga ko‘ra mahsulot ma'lumotlari boshqa API'dan keladi.
Bu holatda SEO uchun ideal model:
1C / API
→ mahsulot ma'lumotlari
→ Next.js server
→ canonical URL
→ server-rendered product HTML
→ metadata
→ Product structured data
→ sitemap
→ Merchant Center feed
→ Google/Bing
Bu arxitektura juda kuchli.
Eng katta xato esa:
Browser ochildi → JS ishga tushdi → API'dan product oldi → keyin HTML paydo bo‘ldi
ni asosiy SEO mexanizmi sifatida qoldirish.

Kategoriya sahifasini oddiy product grid qilmaslik , hamda kategoriya sahifasiga shunchaki SEO text qo‘shishning o‘zi yetarli emas.

Masalan “Telefonlar” sahifasida 1 500 so‘zli sun’iy SEO text va pastda product grid qilish emas, balki foydalanuvchi haqiqatan foydalanadigan:
filter;
category taxonomy;
brands;
price ranges;
comparison;
FAQ;
buying guide
bo‘lishi kerak.


Next.js server tomonidagi imkoniyatlardan foydalanish yaxshiroq.
SEO uchun "technical checklist"
Sayt ishga tushishidan oldin quyidagilar tekshirilishi kerak:
Yo‘nalish	Holat
HTTPS	✅
Canonical	✅
Dynamic title	✅
Dynamic description	✅
H1	✅
Structured Data	✅
Product schema	✅
Product variants	✅
Breadcrumb	✅
XML Sitemap	✅
Robots.txt	✅
404	✅
301	✅
Internal linking	✅
Image SEO	✅
Mobile UX	✅
Core Web Vitals	✅
Google Search Console	✅
Bing Webmaster Tools	✅
Merchant Center	✅
IndexNow	✅
Reviews	✅
FAQ	✅
Unique category content	✅
Unique product value	✅
Filter URL control	✅
Pagination control	✅
Out-of-stock strategy	✅
Multilingual/hreflang, kerak bo‘lsa

Eng katta SEO xatolari
E-commerce'da ayniqsa quyidagilardan saqlaning:
1. Barcha mahsulotlarda bir xil title.
2. Barcha mahsulotlarda bir xil description.
3. Faqat ishlab chiqaruvchining copy-paste description'i.
4. Har bir filter kombinatsiyasini Google'ga index qildirish.
5. Sitemap'ga yuz minglab keraksiz URL qo‘shish.
6. O‘chgan mahsulotni 200 status bilan bo‘sh sahifada qoldirish.
7. Fake review.
8. Keyword stuffing.
9. AI orqali minglab bir xil foydasiz SEO maqolalari yaratish.
10. Faqat Google'ga qarab, Bing/Copilot'ni hisobga olmaslik.

Google va Bing ikkalasi ham manipulyativ, takroriy yoki past qiymatli kontentga qarshi ancha aniq siyosatlarga ega.

Siz uchun eng muhim 10 ta ustuvor vazifa

Agar hammasini birdan qilish imkoniyati bo‘lmasa, men quyidagi tartibda ishlagan bo‘lardim:

1. SEO-friendly URL architecture
2. Server-rendered product/category pages
3. Dynamic metadata
4. Canonical + filter/indexing strategy
5. Product structured data
6. Dynamic sitemap + robots
7. Google Merchant Center
8. Original product/category content
9. Core Web Vitals + mobile performance
10. Search Console + Bing Webmaster Tools orqali doimiy monitoring

Mana shu 10 ta yo‘nalish to‘g‘ri bajarilsa, Next.js e-commerce loyiha uchun juda mustahkam SEO poydevori hosil bo‘ladi.

Eng muhim xulosa
2026-yilda e-commerce SEO'ni quyidagicha tasavvur qilish to‘g‘ri:
SEO ≠ keyword + meta tag
Balki:
SEO =
Texnik SEO
Crawlability
Indexability
Canonicalization
Fast/mobile UX
Product structured data
Merchant Center
Original content
Internal linking
Trust/reviews
Image SEO
Search Console monitoring
AI Search readiness

Google'ning 2026-yilgi materiallari AI Search paydo bo‘lishiga qaramay, odatiy SEO asoslari hanuz markaziy ekanini tasdiqlaydi; Bing esa ayni texnik poydevor Copilot va AI-grounding uchun ham ishlashini ochiq aytmoqda.

Sizning konkret loyihangiz uchun esa eng katta SEO imkoniyati — mahsulot ma’lumotlari tashqi API/1C’dan kelayotganining o‘zidan emas, balki shu ma’lumotlarni Next.js orqali Google/Bing uchun semantik, server-rendered, structured va doimiy yangilanadigan product ecosystemga aylantirishdan keladi.

2026-yil uchun men tavsiya qiladigan yakuniy model:
1C / API
↓
Next.js server
↓
SEO Product Page
↓
Product Schema + Metadata + Canonical
↓
Dynamic Sitemap
↓
Google Search + Google Shopping
↓
Bing + Copilot
↓
AI Search / AI Overviews / AI Mode
Bu yondashuv sizning hozirgi Next.js + tashqi API + Vercel arxitekturangiz uchun ayniqsa mos.

Next.js App Router arxitekturasi asosan Server Komponentlari va fayl tizimiga asoslangan Dinamik Marshrutlash ustiga qurilgan bo'lib, unumdorlik va SEO uchun kuchli vositalarni taqdim etadi.
Server Components (React Server Komponentlari)

Afzalliklari:
Server Components client JS bundle'ini kamaytirishga yordam beradi; ular butun sahifani avtomatik ravishda JavaScript'siz qilib qo'ymaydi. Xavfsiz Backend integratsiyasi: API kalitlari va ma'lumotlar bazasi ruxsatnomalari serverda qoladi. To'g'ridan-to'g'ri tashqi tizimlar bilan ishlash qulay — masalan, yangi buyurtmalarni (ISO-8601 UTC sanalari bilan JSON formatida) qabul qiluvchi 1C HTTP REST xizmatiga frontend orqali maxfiy tokenlar yordamida, brauzerga ko'rsatmasdan ishonchli murojaat qilish imkonini beradi.
Keshlashtirish va SEO: Ma'lumotlar serverning o'zida avtomatik keshlanganligi sababli, takroriy tarmoq trafigi tejaladi hamda qidiruv tizimlari (Google botlari) tayyor to'laqonli HTML sahifani tez o'qiy oladi.
Server rendering juda foydali.
Ammo Google JavaScript'ni ham render qiladi. Google 2026 hujjatlarida JavaScript saytlar indexlanishi mumkinligi va Googlebot JavaScript rendering bosqichiga ega ekanligi ochiq ko‘rsatilgan.
Shuning uchun:
Next.js Server Component SEO uchun kuchli arxitektura


Kamchiliklari:
Interaktivlikning yo'qligi: Server komponentlarida useState, useEffect yoki useReducer kabi React hook-larini umuman ishlatish mumkin emas.
Brauzer API cheklovlari: window, document, xarita integratsiyalari yoki localStorage kabi faqat brauzerda mavjud bo'lgan obyektlarga to'g'ridan-to'g'ri kirish imkoni yo'q.
O'rganishdagi murakkablik: Dasturchi server va mijoz o'rtasida ma'lumot almashinish chegaralarini (Boundary) to'g'ri anglashi kerak, aks holda gidratatsiya (hydration) xatoliklari ko'payadi.

Qo'llash tavsiya etilmagan holatlar:
Foydalanuvchi amallariga darhol reaksiya beruvchi qismlar (tugmalar, modallar, dinamik filtrlar, "drag-and-drop" elementlari). Bunday vidjetlar uchun komponent faylining eng yuqori qismida "use client" direktivasi orqali Client Component ishlatilishi shart.
Foydalanuvchi qurilmasiga bog'liq real vaqt hisob-kitoblari kerak bo'lganda (geolokatsiyani aniqlash, qurilma kamerasiga ulanish).
Dynamic Routing (Dinamik Marshrutlash - [id] yoki [...slug])

Afzalliklari:
Masshtablash qulayligi: Katta axborot bazalari uchun bitta shablon yetarli. Masalan, B2B ulgurji parfyumeriya savdo platformasida har bir mahsulot uchun alohida statik sahifa yaratmasdan, app/catalog/[id]/page.tsx papka tuzilmasi orqali ma'lumotlar bazasidagi cheksiz tovarlarni bitta kod orqali namoyish qilish mumkin.
Parametrlarni chuqur ushlash (Catch-all segments): [...slug] ko'rinishidagi marshrutlar orqali ko'p qatlamli, ixtiyoriy chuqurlikdagi kategoriyalarni bitta marshrutizator orqali boshqarish oson.
SSG (Static Site Generation) bilan mosligi: generateStaticParams funksiyasi yordamida tez-tez kiriladigan dinamik sahifalarni loyihani serverga yuklash (build qilish) vaqtidayoq tayyor statik HTML ga aylantirib qo'yish mumkin (Vercel tarmog'ida mukammal keshlanadi).

Kamchiliklari:
Dastlabki yuklanish kechikishi (Cold Start): Agar dinamik sahifa oldindan generatsiya qilinmagan bo'lsa (SSR rejimida ishlasa), serverga tushgan birinchi so'rov vaqtida ma'lumotlar bazasidan ma'lumot kelgunicha biroz kechikish yuzaga keladi.
Marshrutlash konfliktlari: Juda ko'p turli xil dinamik segmentlar bitta darajadagi papkalarda joylashsa (masalan, /app/[category] va /app/[product]), tizim qaysi sahifa ochilishi kerakligi bo'yicha mantiqiy chalkashlikka uchrashi mumkin.

Qo'llash tavsiya etilmagan holatlar:
Strukturasida o'zgarish bo'lmaydigan, soni va manzili oldindan aniq bo'lgan sahifalar (masalan, faqat /about, /contact, /terms kerak bo'lgan landing-page loyihalarda).
Dynamic routing SPA uchun taqiqlangan emas. SEO talab qilinadigan e-commerce sahifalarida esa server-rendered yoki static/hybrid rendering afzal.

Ammo katta e-commerce uchun bundan tashqari:
canonicalization
pagination
faceted navigation
filters
sort
index/noindex
product availability
URL slug lifecycle
redirects
sitemap segmentation
ham kerak.

Sora.uz O‘zbekiston bozori uchun ishlasa, SEO keyword research'da:
lotincha o‘zbekcha;
kirillcha o‘zbekcha;
ruscha;
mahsulot model/SKU;
xalq orasidagi yozilish variantlari;
xatoli yozuvlar
alohida tekshirilishi kerak.
Bu Google’ning “foydalanuvchilar foydalanadigan so‘zlarni ishlating” degan umumiy SEO prinsipi bilan mos.

1C → Next.js → Google
ko‘rinishi bor.
Ammo katta e-commerce uchun yaxshiroq model ko‘pincha:
1C
↓
Integration/API layer
↓
SEO/Product read model
↓
Next.js
↓
CDN/Search engines
bo‘ladi.

Sababi Google crawler'ni 1C'ning transactional API'siga yaqin olib borish yaxshi arxitektura emas.
Ayniqsa 1C Enterprise backend bo‘lsa, SEO traffic uchun alohida read-oriented product API/cache ishlatish ancha xavfsiz.
Bu hujjatdagi revalidate muammosini ham sezilarli darajada kamaytiradi.

Men buni kengaytirib:
Google → Next.js → cache/read model → 1C
qilishni tavsiya qilaman.
Ya’ni Google hech qachon to‘g‘ridan-to‘g‘ri 1C API'ga chiqmasligi kerak.
1C:
source of truth
bo‘lishi mumkin.
Ammo SEO traffic uchun:
SEO read layer
kerak.

Sora.uz uchun quyidagilarni muntazam kuzatish kerak:

Indexed
Not indexed
Crawled – currently not indexed
Discovered – currently not indexed
Duplicate, Google chose different canonical
Alternate page with proper canonical
Soft 404
Server errors
Sitemap status
Core Web Vitals
Search queries
CTR
Product rich result issues
Merchant listings
AI Search visibility

Bu amalda SEO monitoring platformasining asosiy qismi bo‘ladi.

Sora.uz SEO strategiyasida:
Technical SEO + Content + Merchant/Search data + Authority + Brand
birgalikda ko‘rilishi kerak.

Agar Sora.uz real O‘zbekiston do‘koni bo‘lsa, quyidagilar juda muhim:
Google Business Profile
kompaniya nomi
telefon
manzil
ish vaqti
do‘konlar
xarita
local inventory
local landing pages
Google 2026-yilda e-commerce content'ni Maps kabi boshqa Google surfaces’da ham chiqarishi mumkinligini ko‘rsatadi.

SEO-friendly URL” yaxshi, ammo URL ichiga category hierarchy'ni haddan tashqari qattiq bog‘lamang

Hujjat:
/telefonlar/samsung/galaxy-s25
kabi URL'ni tavsiya qiladi.
Yaxshi.
Lekin e-commerce'da juda chuqur URL:
/electronics/phones/smartphones/android/samsung/galaxy/s25/256gb
kabi bo‘lishi kelajakda muammo tug‘dirishi mumkin.
Sora.uz uchun:
stabil product canonical URL
muhim.
Kategoriya ko‘chsa ham mahsulot URL'ini o‘zgartirmaslik ko‘pincha yaxshi.
Masalan:
/product/samsung-galaxy-s25-256gb
yoki
/p/samsung-galaxy-s25-256gb
va kategoriya alohida relation sifatida saqlanishi mumkin.
Bu slug o‘zgarishi sababli 301 sonini kamaytiradi.

Google I/O 2026 — qidiruv paradigmasi o‘zgargan
2026-yil 19-mayda Google I/O’da Sundar Pichai qidiruvni 25 yil ichidagi eng katta o‘zgarishga uchratdi:
•	Gemini 3.5 Flash AI Mode’da standart modelga aylandi
•	Qidiruv qutisi endi ko‘p formatli (matn, rasm, video, Chrome tablari) kirish nuqtasiga aylandi
•	Foydalanuvchilar endi 2-3 so‘zli kalit so‘zlar bilan emas, uzun, kontekstli savollar bilan murojaat qilmoqda
•	Bu klassik kalit so‘z tadqiqoti modelini butunlay o‘zgartirmoqda

So’ngi yangiliklar: https://developers.google.com/search/updates?hl=ru#faq-deprecation

Bizning loyiha quydagi talablarga javo berishini zarur:
https://llmstxt.org/
https://schema.org/Product
https://developers.google.com/search/updates
