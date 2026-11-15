# 🏛️ SORA.UZ — BOSH SAHIFA DIZAYNI VA STRUKTURASI BO‘YICHA MUKAMMAL REJA

> **Hujjat nomi:** `boshshaxifa_dizayni_va_strukturasi.md`  
> **Loyiha:** Sora.uz — Kanselyariya, ofis jihozlari va xo‘jalik mahsulotlari internet-do‘koni  
> **Maqsad:** Bosh sahifaning yangilangan tuzilmasi, har bir bo‘limning joylashuv tartibi, vizual ko‘rinishi, ichki tarkibi va biznes talablarini belgilovchi bosh yo‘riqnoma.  
> **Til standarti:** O‘zbek va Rus tillarida sof adabiy me’yorlar asosida.

---

## 1. Umumiy Konsepsiya va Asosiy Tamoyillar

Yangilangan bosh sahifa **ikki toifa xaridorlar** uchun birdek qulay, tushunarli va ishonchli bo‘lishi shart:
1. **Korporativ mijozlar (Tashkilotlar, banklar, o‘quv muassasalari, kompaniyalar):** Ularga kerakli bo‘limni tez topish, ulgurji shartlar, rasmiy hujjatlar (shartnoma va elektron hisob-faktura), hamkor tashkilotlar ishonchi hamda aniq manzil/aloqa ma’lumotlari muhim.
2. **Chakana xaridorlar (Ota-onalar, talabalar, ofis xodimlari):** Ularga chiroyli vizual toifalar, aksiyalar, arzon narxlar, boshqa xaridorlarning real sharhlari va tezkor yetkazib berish shartlari muhim.

### Matn va Vizual Qoidalar:
- **Sof o‘zbek tili:** O‘zbekcha sahifada rus tilidan o‘zlashgan «tovar» so‘zi o‘rniga sof adabiy **«mahsulot»** (masalan: *«153 xil mahsulot»*, *«Top mahsulotlar»*, *«Yangi kelgan mahsulotlar»*) atamasi ishlatiladi.
- **Yagona vizual uslub:** Barcha bo‘limlar oq va och kulrang-moviy fonda, yumshoq burchakli kartochkalar, aniq sarlavhalar hamda ko‘zni charchatmaydigan uyg‘un ranglarda aks ettiriladi.
- **Dinamik va jonli ko‘rsatkichlar:** Kategoriyalar va maxsus bo‘limlardagi mahsulotlar soni ombordagi o‘zgarishlarga qarab avtomatik yangilanib turadi.

---

## 2. Bosh Sahifaning Yuqoridan Pastga Qarab Umumiy Xaritasi (Maket)

Bosh sahifa yuqoridan pastga qarab **12 ta mantiqiy qatlamdan** tashkil topadi:

```text
╔══════════════════════════════════════════════════════════════════════════════╗
║  1. YUQORI BOSHQARUV QISMI (Logotip, Katalog, Qidiruv, Til, Savat, Profil)   ║
║     + TEZKOR BO‘LIMLAR QATORI (Aksiyalar, Arzon narx, Xit, Yangi, Brendlar)  ║  <-- O‘zgarishsiz
╠══════════════════════════════════════════════════════════════════════════════╣
║  2. ASOSIY REKLAMA KARUSELI (4 ta interaktiv katta banner slayd)             ║  <-- O‘zgarishsiz
╠══════════════════════════════════════════════════════════════════════════════╣
║  3. OMMABOP KATEGORIYALAR (30 tagacha kengaytirilgan vizual katalog)         ║  <-- Kengaytiriladi
║     [ 1-karta ] [ 2-karta ] [ 3-karta ] [ 4-karta ] [ 5-karta ]              ║
║     ... (Jami 30 ta asosiy va xaridorgir bo‘limlar)                          ║
╠══════════════════════════════════════════════════════════════════════════════╣
║  4. MAXSUS TAKLIFLAR VITRINALARI (Kategoriya kartalari uslubida 4 ta blok)   ║  <-- Yangi format
║     [ 🔥 Chegirmalar ] [ 🛡️ Eng arzon narx ] [ ⭐ Top mahsulot ] [ 🆕 Yangilar ] ║
╠══════════════════════════════════════════════════════════════════════════════╣
║  5. BIZGA ISHONCH BILDIRGAN TASHKILOTLAR (Mijoz va hamkorlar logotiplari)    ║  <-- YANGI BO‘LIM
║     [ Tashkilot 1 ] [ Tashkilot 2 ] [ Tashkilot 3 ] [ Tashkilot 4 ] ...      ║
╠══════════════════════════════════════════════════════════════════════════════╣
║  6. RASMIY BRENDLAR (3 qatorli uzluksiz aylanuvchi brendlar lentasi)         ║  <-- O‘zgarishsiz
╠══════════════════════════════════════════════════════════════════════════════╣
║  7. XARIDORLAR IZOHI VA SHARHLARI (Mijozlarning haqiqiy fikrlari)            ║  <-- YANGI BO‘LIM
║     [ ⭐⭐⭐⭐⭐ Sharh 1 ]   [ ⭐⭐⭐⭐⭐ Sharh 2 ]   [ ⭐⭐⭐⭐⭐ Sharh 3 ]          ║
╠══════════════════════════════════════════════════════════════════════════════╣
║  8. NEGA AYNAN SORA.UZ? (4 ta asosiy ustunlik kartochkasi)                   ║  <-- O‘zgarishsiz
╠══════════════════════════════════════════════════════════════════════════════╣
║  9. KO‘P BERILADIGAN SAVOLLAR — FAQ (Ochilib-yopiladigan savol-javoblar)     ║  <-- YANGI BO‘LIM
║     [ + Buyurtma qanday rasmiylashtiriladi?                              ]   ║
║     [ + Korporativ mijozlar uchun shartnoma va hisob-faktura bormi?      ]   ║
╠══════════════════════════════════════════════════════════════════════════════╣
║ 10. ALOQA VA MANZIL + KORXONA GEOLOKATSIYA XARITASI                          ║  <-- YANGI BO‘LIM
║     [ 📞 Telefonlar ] [ ✉️ Pochta ] [ 🕒 Ish vaqti ] [ 📍 Aniq manzil ]      ║
║     [ 🗺️ KENG INTERAKTIV XARITA — Olmazor tumani, Dilsaroy ko‘chasi, 1-uy ]   ║
╠══════════════════════════════════════════════════════════════════════════════╣
║ 11. SAYTNING QUYI QISMI — FOOTER (Yangilangan: Ijtimoiy tarmoqlar bilan)     ║  <-- Yangilanadi
║     [ Brend va Ish vaqti ] [ Katalog ] [ Kompaniya ] [ 🌐 Ijtimoiy tarmoqlar ]║
╠══════════════════════════════════════════════════════════════════════════════╣
║ 12. MOBIL QUYI MENYU (Faqat telefon ekranlarida ko‘rinuvchi tezkor panel)    ║  <-- O‘zgarishsiz
╚══════════════════════════════════════════════════════════════════════════════╝
```

---

## 3. Bo‘limlarning Batafsil Talablari va Joylashuv Qoidalari

---

### 1-BO‘LIM: Yuqori Boshqaruv Qismi va Tezkor Navigatsiya *(O‘zgarishsiz qoladi)*

- **Joylashuvi:** Sahifaning eng yuqori qismida qotirilgan holda (foydalanuvchi pastga tushganda ham qidiruv va savatcha doimo qo‘l ostida turadi).
- **Tarkibi:**
  1. **Chap tomonda:** Sora.uz rasmiy logotipi va shiori (*«Sizga mos ishonchli tanlov»*) hamda ko‘k rangli **«Katalog»** tugmasi.
  2. **Markazda:** Keng qidiruv maydoni (yozishni boshlaganda mahsulot va bo‘limlarni tezkor tavsiya qiluvchi oyna bilan).
  3. **O‘ng tomonda:** Til almashtirgich (`O'Z / РУ`), Taqqoslash, Sevimlilar, Savatcha (ichidagi mahsulotlar soni bilan) va Kirish/Profil tugmasi.
  4. **Pastki qatorda (Promo qator):** Maxsus bo‘limlarga tezkor o‘tish havolalari (*Aksiyalar, Kafolatlangan arzon narx, Xit mahsulotlar, Yangi mahsulotlar, Brendlar, B2B hamkorlik, Yetkazib berish*).

---

### 2-BO‘LIM: Asosiy Reklama Karuseli — Hero Banner *(O‘zgarishsiz qoladi)*

- **Joylashuvi:** Yuqori menyudan keyin, sahifaning asosiy e’tibor markazida.
- **Tarkibi:** 4 ta almashinuvchi keng slayd:
  1. *Kanselyariya va ofis jihozlari ulgurji narxlarda* (30% gacha chegirma chaqirig‘i bilan);
  2. *Ofisingiz uchun barcha anjomlar — 24 soatda yetkazamiz* (B2B va elektron hisob-faktura);
  3. *Deli: Perpletka, laminator va professional ofis texnikasi* (Rasmiy kafolat);
  4. *Toshkent bo‘ylab 24 soatda, viloyatlarga 1–3 kunda yetkazib berish* (500 000 so‘mdan yuqori xaridga bepul kuryer).

---

### 3-BO‘LIM: Ommabop Kategoriyalar *(8 tadan ~30 tagacha kengaytiriladi)*

#### A. Joylashuv va Ekran Moslashuvchanligi:
- **Sarlavha qismi:** Chapda **«Ommabop kategoriyalar»** (RU: *«Популярные категории»*), o‘ngda **«Barchasini ko‘rish →»** havolasi.
- **Ustunlar soni:**
  - **Kompyuterda:** 1 qatorda **5 ta** (yoki 6 ta) kartochka -> 30 ta kategoriya **5–6 qator** bo‘lib tekis va tartibli joylashadi.
  - **Planshetda:** 1 qatorda **3 yoki 4 ta** kartochka.
  - **Mobil telefonda:** 1 qatorda **2 ta** kartochka.
- **Foydalanuvchi qulayligi (Sahifa cho‘zilib ketmasligi uchun muhim qoida):**
  - Kompyuterda dastlabki **10–15 ta** (mobil telefonda dastlabki **8–10 ta**) eng asosiy kategoriya darhol ko‘rinib turadi;
  - Uning ostida markazlashgan chiroyli **«Barcha kategoriyalarni ko‘rish (yana 18 ta) ⌄»** tugmasi bo‘ladi. Foydalanuvchi uni bossa, qolgan barcha 30 ta kategoriya boshqa sahifaga o‘tmasdan shu joyning o‘zida silliq ochiladi (yoki barcha 30 tasi ixchamroq balandlikdagi kartochkalarda to‘liq ko‘rsatiladi).

#### B. Har bir kategoriya kartochkasining ichki tuzilishi:
1. **Yuqori qism:** Maxsus belgi (masalan: *«Xit savdo»*, *«Ommabop»*, *«Maktab»*), Kategoriya nomi, uning ostida **dinamik mahsulotlar soni** (*«153 xil mahsulot»* / *«153 товаров»*) va o‘ng burchakda diagonal yo‘naltiruvchi strelka.
2. **Markaziy qism:** Shu bo‘limga tegishli haqiqiy, tiniq mahsulotlar to‘plami fotosurati (orqa foni toza, hajmli ko‘rinishda).
3. **Quyi qism:** Bo‘lim ichidagi eng xaridorgir 3 ta kichik guruh nomi (masalan: *A4 Qog‘oz • Bloknotlar • Stikerlar*).

#### C. Bosh sahifaga chiqariladigan ~30 ta asosiy kategoriya ro‘yxati:
1. **Qog‘oz mahsulotlari** *(A4 formatli qog‘ozlar, rangli qog‘ozlar, eslatma bloklari)*
2. **Daftarlar va bloknotlar** *(Maktab daftarlari, umumiy daftarlar, kundaliklar, yozuv kitoblari)*
3. **Yozuv qurollari** *(Sharikli va gelli ruchkalar, kapillyar ruchkalar, sterjenlar)*
4. **Markerlar va tekst-ajratgichlar** *(Tekstmarkerlar, doska markerlari, doimiy markerlar)*
5. **Qalamlar va chizmachilik** *(Oddiy qalamlar, mexanik qalamlar, chizg‘ichlar, sirkullar)*
6. **Papkalar va arxivlash tizimi** *(Registrator papkalar, burchakli papkalar, tugmali va rezinkali papkalar)*
7. **Fayllar va hujjat saqlagichlar** *(Perfofayllar, katalog-papkalar, klipbordlar)*
8. **Steplerlar, teshgichlar va sarf materiallari** *(Steplerlar, dirokollar, stepler o‘qlari, anti-steplerlar)*
9. **Ofis mayda anjomlari** *(Skrepkalar, qisqichlar/binderlar, kanselyariya ignalari va knopkalar)*
10. **Qaychilar va kanselyariya pichoqlari** *(Ofis qaychilari, qog‘oz kesgichlar, ehtiyot tig‘lar)*
11. **Yelimlar va yopishtiruvchi lentalar** *(Skochlar, ikki tomonlama lentalar, qalam-yelimlar, PVA)*
12. **Korrektorlar va o‘chirg‘ichlar** *(Lentali va suyuq korrektorlar, yumshoq o‘chirg‘ichlar)*
13. **Ish stoli jihozlari va organayzerlar** *(Ruchka idishlar, qog‘oz lotoklari, stol usti to‘plamlari)*
14. **Kalkulyatorlar** *(Stol usti, buxgalteriya, ilmiy va cho‘ntak kalkulyatorlari)*
15. **Muhr va shtamplar** *(Avtomatik osnastkalar, shtamp bo‘yoqlari, yostiqchalar, numeratolar)*
16. **Namoyish va taqdimot doskalari** *(Magnit-markerli doskalar, flipchartlar, probkali doskalar, gubkalar)*
17. **Beydjlar va aksessuarlar** *(Tasmalar, plastik beydjlar, stol usti ma’lumot tutqichlari)*
18. **Savdo va kassa sarf materiallari** *(Kassa chek lentalari, termolentalar, narx yopishtirgichlar/etiket-pistoletlar)*
19. **Maktab va ijodiyot mahsulotlari** *(Akvarel va guash bo‘yoqlar, rangli qalamlar, flomasterlar, plastilin)*
20. **Maktab ryukzaklari va penallar** *(O‘quvchi sumkalari, penallar, oyoq kiyim xaltalari)*
21. **Ofis texnikasi (Deli va boshqalar)** *(Perpletka mashinalari, laminatorlar, qog‘oz maydalagichlar — shredderlar)*
22. **Laminatsiya va muqovalash materiallari** *(Laminatsiya plyonkalari, plastik va metall prujinalar, muqovalar)*
23. **Pul sanash va tekshirish uskunalari** *(Banknot sanagichlar, ultrabinafsha detektorlar, pul bog‘ichlar)*
24. **Seyflar va metall shkaflar** *(Ofis seyflari, kalit qutilari, naqd pul qutilari — keshbokslar)*
25. **Kompyuter aksessuarlari** *(Sichqonchalar, klaviaturalar, gilamchalar, flesh-xotiralar, kabellar)*
26. **Printer va kartridj sarf materiallari** *(Lazer kartridjlar, tonerlar, siyohlar, fotobumagalar)*
27. **Tarmoq va elektr jihozlari** *(Uzaytirgichlar/pilotlar, batareykalar, quvvatlagichlar)*
28. **Xo‘jalik va tozalik mahsulotlari** *(Salfetkalar, qog‘oz sochiqlar, hojatxona qog‘ozi, axlat qoplari, sovunlar)*
29. **Ofis oshxonasi va bir martalik idishlar** *(Qog‘oz va plastik stakanlar, choy/qahva, suv dispenser aksessuarlari)*
30. **Sovg‘abop va VIP kanselyariya to‘plamlari** *(Premium ruchkalar, charm kundaliklar, korporativ sovg‘a to‘plamlari)*

---

### 4-BO‘LIM: Maxsus Takliflar Vitrinalari *(Mahsulotlar o‘rniga kategoriya kartasi ko‘rinishida)*

Bosh sahifada 40 ta alohida mahsulot kartochkasi ketma-ket chiqmasdan, ularning o‘rniga **xuddi «Ommabop kategoriyalar» uslubidagi 4 ta yirik, jozibador Vitrina Kartasi** joylashtiriladi. Shunda bosh sahifada alohida mahsulotlar ro‘yxati bo‘lmaydi, sahifa nihoyatda toza, tezkor va tartibli ko‘rinishga keladi.

```text
┌──────────────────────────────────────────────────────────────────────────────────┐
│  Maxsus takliflar va saralangan to‘plamlar                                       │
├──────────────────────────────────────────────────────────────────────────────────┤
│ ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐ │
│ │ 🔥 AKSIYA VA     │  │ 🛡️ ENG ARZON     │  │ ⭐ TOP           │  │ 🆕 YANGI KELGAN  │ │
│ │ CHEGIRMALAR      │  │ NARX KAFOLATI    │  │ MAHSULOTLAR      │  │ MAHSULOTLAR      │ │
│ │                  │  │                  │  │                  │  │                  │ │
│ │ [Yorqin Vitrina  │  │ [Yorqin Vitrina  │  │ [Yorqin Vitrina  │  │ [Yorqin Vitrina  │ │
│ │     Rasmi]       │  │     Rasmi]       │  │     Rasmi]       │  │     Rasmi]       │ │
│ │                  │  │                  │  │                  │  │                  │ │
│ │ -30% gacha       │  │ Ulgurji narxda   │  │ Eng ko‘p xarid   │  │ Hafta yangiligi  │ │
│ │ [Ko‘rish ->]     │  │ [Ko‘rish ->]     │  │ [Ko‘rish ->]     │  │ [Ko‘rish ->]     │ │
│ └──────────────────┘  └──────────────────┘  └──────────────────┘  └──────────────────┘ │
└──────────────────────────────────────────────────────────────────────────────────┘
```

- **Joylashuvi:** «Ommabop kategoriyalar» blokidan keyin. Kompyuterda **1 qatorda 4 ta ustun**, planshet va mobil telefonda **2x2 setka** (2 ustun, 2 qator).
- **4 ta Vitrina Kartasining tavsifi:**
  1. **Chegirmalar va maxsus takliflar** *(«Aksiya va chegirmalar» sahifasiga olib o‘tadi)*:
     - *Rang ohangi:* Yorqin qizg‘ish-pushti gradient fon, «-30% gacha aksiya» belgisi.
     - *Ko‘rsatkich:* Aksiya amal qilayotgan mahsulotlar soni (*«... xil mahsulot»*).
     - *Teglar:* *Mavsumiy chegirmalar • Maxsus narx • Ulgurji aksiya*.
  2. **Kafolatlangan eng arzon narx** *(«Eng arzon narx kafolati» sahifasiga olib o‘tadi)*:
     - *Rang ohangi:* Moviy-ko‘k gradient fon, himoya qalqoni belgisi, «Arzon narx kafolati» yorlig‘i.
     - *Ko‘rsatkich:* Eng arzon narxlar guruhidagi mahsulotlar soni.
     - *Teglar:* *Bozordagi eng past narx • Birinchi qo‘l • Byudjet tanlov*.
  3. **Top mahsulotlar — Xit savdo** *(«Ommabop va xit mahsulotlar» sahifasiga olib o‘tadi)*:
     - *Rang ohangi:* Oltin-qahrabo gradient fon, «Xit savdo» yorlig‘i.
     - *Ko‘rsatkich:* Eng ko‘p sotilayotgan mahsulotlar soni.
     - *Teglar:* *Xaridorlar tanlovi • Har bir ofis uchun • Doimiy talabda*.
  4. **Yangi kelgan mahsulotlar** *(«Yangi mahsulotlar» sahifasiga olib o‘tadi)*:
     - *Rang ohangi:* Zumrad-yashil gradient fon, «Yangi» yorlig‘i.
     - *Ko‘rsatkich:* Yaqinda omborga kelib tushgan yangi mahsulotlar soni.
     - *Teglar:* *Yangi kolleksiya • Zamonaviy dizayn • Omborda mavjud*.

---

### 5-BO‘LIM: Bizga Ishonch Bildirgan Tashkilotlar *(YANGI BO‘LIM)*

- **Biznes maqsadi:** Sora.uz bilan doimiy ishlovchi korporativ mijozlar, davlat va xususiy tashkilotlar, banklar, universitet va maktablar hamda hamkor kompaniyalarni ko‘rsatish orqali yangi B2B va B2C xaridorlarda kuchli ishonch uyg‘otish.
- **Joylashuvi:** «Maxsus takliflar» blokidan keyin, «Rasmiy brendlar» blokidan oldin.
- **Sarlavha va tavsif:**
  - *Sarlavha (UZ):* **«Bizga ishonch bildirgan tashkilotlar»** (RU: *«Нам доверяют ведущие организации»*).
  - *Qo‘shimcha kichik matn:* *«500 dan ortiq davlat muassasalari, banklar, ta’lim dargohlari va yirik kompaniyalar ofis ta’minotini bizga ishonib topshirgan»*.
  - *O‘ng tomonda:* **«B2B hamkorlik shartlari →»** *(Korporativ mijozlar sahifasiga havola)*.
- **Vizual tuzilishi:**
  - Kompyuterda **4 yoki 6 ustunli** nafis kartochkalar setkasi (yoki silliq suriluvchi gorizontal qator); mobil telefonda **2 ustunli** setka.
  - Har bir kartochkada:
    1. Tashkilotning rasmiy logotipi (toza, tartibli o‘lchamda);
    2. Tashkilotning rasmiy nomi (masalan: *Banklar, Sug‘urta kompaniyalari, Xususiy maktab va universitetlar, Ishlab chiqarish korxonalari, Logistika va savdo tarmoqlari, Davlat tashkilotlari*);
    3. Tashkilot yo‘nalishi bo‘yicha qisqa yorliq (masalan: *«Moliya va Bank»*, *«Ta’lim muassasasi»*, *«Sanoat va Ishlab chiqarish»*, *«Davlat sektori»*).

---

### 6-BO‘LIM: Rasmiy Brendlar *(O‘zgarishsiz qoladi)*

- **Joylashuvi:** «Bizga ishonch bildirgan tashkilotlar» bo‘limidan keyin.
- **Tuzilishi:** Chapda **«Rasmiy brendlar»** sarlavhasi, o‘ngda **«Barchasini ko‘rish →»** *(Barcha brendlar sahifasiga havola)*.
- **Ko‘rinishi:** 3 qatorli, qarama-qarshi yo‘nalishlarda to‘xtovsiz va silliq harakatlanuvchi brend kartochkalari (*Deli, SvetoCopy, Double A, ErichKrause, Schneider, Brauberg, Kangaro, Casio, Citizen* va boshqa rasmiy brendlar). Har bir brend ustiga bosilganda shu brendning mahsulotlari sahifasiga o‘tiladi.

---

### 7-BO‘LIM: Xaridorlar Izohi va Sharhlari *(YANGI BO‘LIM)*

- **Biznes maqsadi:** Xaridorlarning xizmat sifati, yetkazib berish tezligi, mahsulotlar sifati va hujjatlar (Didox hisob-faktura) bo‘yicha haqiqiy fikrlarini ko‘rsatish.
- **Joylashuvi:** «Rasmiy brendlar» blokidan keyin, «Nega aynan Sora.uz?» blokidan oldin.
- **Sarlavha qismi:**
  - *Sarlavha (UZ):* **«Xaridorlarimiz fikri va sharhlari»** (RU: *«Отзывы наших клиентов»*).
  - *Yonida umumiy reyting ko‘rsatkichi:* **«★ 4.9 / 5.0 — Mijozlar bahosi»**.
- **Vizual tuzilishi:**
  - Kompyuterda **3 ta ustun** (yoki 4 ta ustunli suriluvchi karusel), planshetda **2 ta ustun**, mobil telefonda **1 ta ustun** (yon tomonga barmoq bilan suriluvchi kartochkalar).
  - Jami **6 ta** eng namunali va turli soha vakillaridan olingan sharhlar (masalan: 3 ta korporativ/ofis xaridori, 3 ta chakana/maktab va o‘quv markazi xaridori).
- **Har bir sharh kartochkasining ichki tarkibi:**
  1. **Yuqori qism:** 5 ta oltin yulduzcha (`★★★★★`) va yashil rangdagi **«✓ Tasdiqlangan xaridor»** belgisi.
  2. **Asosiy qism:** Xaridorning samimiy va aniq izohi (3–4 qator, masalan: *«Kompaniyamiz uchun har oy A4 qog‘oz va kanselyariya buyurtma qilamiz. Narxlar ulgurji, Didox orqali hisob-fakturani o‘z vaqtida yuborishadi va Toshkent bo‘ylab 1 kunda ofisimizgacha bepul olib kelib berishadi»*).
  3. **Quyi qism:** Xaridorning bosh harflari tushirilgan dumaloq belgi (avatar), ismi-sharifi, lavozimi yoki mijoz turi (masalan: *«Azizbek R. — Ta’minot bo‘limi boshlig‘i»*, *«Dilnoza M. — Bosh hisobchi»*, *«Sardor K. — O‘quv markazi rahbari»*) hamda sharh qoldirilgan sana.

---

### 8-BO‘LIM: Nega Aynan Sora.uz? *(O‘zgarishsiz qoladi)*

- **Joylashuvi:** «Xaridorlar sharhlari»dan keyin.
- **Tuzilishi:** Katta oq ramkali blok ichida markazlashgan **«Nega aynan Sora.uz?»** sarlavhasi va **4 ta ustunli** ustunlik kartochkalari:
  1. **Tezkor yetkazib berish:** Toshkent bo‘ylab 24 soat ichida, viloyatlarga 1–3 kunda yetkazamiz.
  2. **100% Asl mahsulotlar:** Barcha mahsulotlar ombor hisobidan rasmiy kafolat bilan taqdim etiladi.
  3. **Qulay to‘lov turlari:** Naqd pul, Uzum, Payme, Click va yuridik shaxslar uchun pul o‘tkazish (shartnoma) orqali.
  4. **B2B va B2C yechimlar:** Ofislar va korxonalar uchun ulgurji narxlar va elektron hisob-fakturalar.

---

### 9-BO‘LIM: Ko‘p Beriladigan Savollar — FAQ *(YANGI BO‘LIM)*

- **Biznes va Qidiruv maqsadi:** Xaridorlarda tug‘iladigan eng muhim savollarga operatorga qo‘ng‘iroq qilmasdan darhol javob berish hamda Google/Yandex qidiruv tizimlarida tayyor savol-javob ko‘rinishida chiqish.
- **Joylashuvi:** «Nega aynan Sora.uz?» blokidan keyin, «Aloqa va Manzil» blokidan oldin.
- **Vizual tuzilishi:**
  - Yuqorida markazlashgan **«Ko‘p beriladigan savollar (FAQ)»** sarlavhasi va qisqa izoh.
  - Kompyuterda **2 ta ustun** (har bir ustunda 4 tadan savol = jami 8 ta savol) yoki markazlashgan keng ro‘yxat; mobil telefonda **1 ta ustun** ketma-ketlikda.
  - Savol ustiga bosilganda u silliq ochilib, to‘liq javob ko‘rinadi (`+` belgisi `-` ga aylanadi).
- **Bo‘limda bo‘lishi shart bo‘lgan 8 ta asosiy savol:**
  1. *Buyurtmani qanday rasmiylashtirish mumkin?*
  2. *Toshkent shahri va viloyatlarga yetkazib berish muddati hamda narxi qanday?* (500 000 so‘mdan yuqori xaridlarga Toshkentda bepul kuryer xizmati haqida aniq ma’lumot).
  3. *Yuridik shaxslar (korxonalar) bilan shartnoma va Didox elektron hisob-faktura (EHF) orqali ishlaysizlarmi?*
  4. *Qanday to‘lov usullari mavjud? QQS (NDS) bilan to‘lash mumkinmi?*
  5. *Katta hajmdagi (ulgurji) xaridlar uchun maxsus chegirmalar bormi?*
  6. *Mahsulotlar sifatiga kafolat bormi? Nuqsonli mahsulotni qaytarish yoki almashtirish tartibi qanday?* (10 kunlik kafolat sharti).
  7. *Saytdagi narxlar va ombor qoldig‘i haqiqiy vaqtda yangilanadimi?*
  8. *Buyurtmani do‘kon yoki ombordan o‘zimiz olib ketsak (samovivoz) bo‘ladimi?*

---

### 10-BO‘LIM: Aloqa va Manzil + Korxona Geolokatsiya Xaritasi *(YANGI BO‘LIM)*

Ushbu bo‘lim **xuddi «Nega aynan Sora.uz?» bloki kabi** yirik, chiroyli oq konteyner ichida joylashadi va **2 qavatdan** iborat bo‘ladi:

```text
┌──────────────────────────────────────────────────────────────────────────────────┐
│                              Aloqa va Manzil                                     │
│                                                                                  │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐ │
│  │ 📞 TELEFON       │  │ ✉️ ELEKTRON      │  │ 🕒 ISH VAQTI     │  │ 📍 DO‘KON VA     │ │
│  │ RAQAMLARIMIZ     │  │ POCHTA VA ALOQA  │  │                  │  │ OFIS MANZILI     │ │
│  │ +998 90 326-47-57│  │ info@sora.uz     │  │ 09:00 — 19:00    │  │ Toshkent sh.,    │ │
│  │ +998 90 969-90-90│  │ b2b@sora.uz      │  │ Dushanba–Shanba  │  │ Olmazor tumani,  │ │
│  │ +998 71 228-05-78│  │ @sora_uz (TG)    │  │ Yak: Dam olish   │  │ Dilsaroy ko‘ch,1 │ │
│  └──────────────────┘  └──────────────────┘  └──────────────────┘  └──────────────────┘ │
│                                                                                  │
│  ┌────────────────────────────────────────────────────────────────────────────┐  │
│  │                                                                            │  │
│  │                     🗺️ INTERAKTIV GEOLOKATSIYA XARITASI                    │  │
│  │                                                                            │  │
│  │                         📍 [ SORA.UZ — Bosh Ofis va Do‘kon ]               │  │
│  │                                                                            │  │
│  │                                       [ 🧭 Xaritada yo‘nalishni ochish -> ]│  │
│  └────────────────────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────────────────────┘
```

#### 1-Qavat: 4 ta Aloqa Kartochkasi («Nega aynan Sora.uz?» dizayni bilan bir xil qolipda)
- Kompyuterda **4 ta ustun**, planshetda **2x2**, mobil telefonda **1 ta ustun**:
  1. **1-karta (Ko‘k belgi — Telefon raqamlar):**
     - `+998 (90) 326-47-57` (Asosiy savdo bo‘limi)
     - `+998 (90) 969-90-90` (Qo‘shimcha aloqa)
     - `+998 (71) 228-05-78` (Shahar telefoni)
     - Ustiga bosilganda telefonda darhol qo‘ng‘iroq qilish oynasi ochiladi.
  2. **2-karta (Yashil belgi — Elektron pochta va Telegram):**
     - `info@sora.uz` (Chakana mijozlar uchun)
     - `b2b@sora.uz` (Korporativ mijozlar va shartnomalar uchun)
     - `@sora_uz` (Telegram orqali tezkor menejer)
  3. **3-karta (Binafsha belgi — Ish vaqti):**
     - **09:00 — 19:00**
     - Dushanba – Shanba (Yakshanba — dam olish kuni; sayt orqali buyurtmalar 24/7 qabul qilinadi).
  4. **4-karta (Qahrabo/Oltin belgi — Aniq manzil):**
     - **Toshkent shahri, Olmazor tumani, Dilsaroy ko‘chasi, 1-uy.**
     - Mo‘ljal va olib ketish (samovivoz) nuqtasi.

#### 2-Qavat: Korxona Geolokatsiya Xaritasi
- **Joylashuvi:** 4 ta aloqa kartochkasining shundoq pastida, konteynerning to‘liq kengligida (burchaklari yumaloqlangan, balandligi kompyuterda `360–400 piksel`, telefonda `280–300 piksel`).
- **Ko‘rinishi va qulayligi:**
  - Xarita markazida **Sora.uz** korxonasining aniq geolokatsiya nuqtasi (belgisi) ko‘rinib turadi;
  - Xarita burchagida foydalanuvchi bir bosishda Yandex Navigator yoki Google Xarita orqali yo‘nalish olishi uchun **«Yo‘nalishni ochish (Navigator)»** tugmasi joylashadi;
  - Xarita sahifa tezligiga zarar yetkazmasligi uchun foydalanuvchi sahifaning pastki qismiga yaqinlashganda avtomatik tarzda yuklanadi.

---

### 11-BO‘LIM: Saytning Quyi Qismi — Footer *(Kichik o‘zgarish bilan)*

Bosh sahifada «Aloqa va Manzil» alohida katta blok sifatida shundoq Footer’ning tepasiga chiqarilganligi sababli, Footer’dagi 4-ustun yangilanadi:

#### Footer’ning yangi 4 ustunli tuzilmasi:
1. **1-Ustun (Brend va Ish vaqti):**
   - `SORAUZ — Sizga mos ishonchli tanlov` logotipi;
   - Kompaniya haqida qisqacha ma’lumot (2018-yildan buyon faoliyat);
   - Ish vaqti kartochkasi (`09:00 — 19:00, Dushanba – Shanba`).
2. **2-Ustun (Katalog):**
   - Barcha toifalar, Aksiya va chegirmalar, Eng arzon narx kafolati, Yangi mahsulotlar, Top mahsulotlar, Rasmiy brendlar.
3. **3-Ustun (Kompaniya va Xizmatlar):**
   - Biz haqimizda, Aloqa va manzil sahifasi, Yetkazib berish shartlari, To‘lov usullari, Kafolat va qaytarish (10 kun), B2B Korporativ xizmat (EHF).
4. **4-Ustun (YANGI: «Ijtimoiy tarmoqlarimiz» — sobiq «Aloqa va Manzil» o‘rniga):**
   - Ustun sarlavhasi: **«Ijtimoiy tarmoqlarimiz»** (RU: *«Мы в социальных сетях»*);
   - Qisqa chorlov matni: *«Yangi mahsulotlar, yopiq aksiyalar va ulgurji chegirmalardan birinchi bo‘lib xabardor bo‘lish uchun rasmiy sahifalarimizga obuna bo‘ling:»*;
   - **Yirik va chiroyli ijtimoiy tarmoq kartochka-tugmalari:**
     - **Telegram Rasmiy Kanal** (`@sorauz`) — *Yangiliklar va aksiyalar*;
     - **Telegram Online Menejer** (`@sora_uz`) — *Tezkor savol-javob va buyurtma*;
     - **Instagram Rasmiy Sahifasi** (`@sorauz`) — *Jonli video-obzorlar va katalog*;
     - *(Kelgusida qo‘shiladigan Facebook / YouTube sahifalari uchun tayyor o‘rin)*.

> *Izoh:* Footer’ning o‘rta qismidagi 3 ta ishonch bloki (*Tezkor va bepul yetkazish*, *To‘lov tizimlari: Click, Payme, Uzum, Didox*, *10 kunlik qaytarish kafolati*) hamda eng pastki mualliflik huquqi qatori o‘z o‘rnida saqlab qolinadi.

---

### 12-BO‘LIM: Mobil Quyi Menyu *(O‘zgarishsiz qoladi)*

- **Joylashuvi:** Faqat mobil telefon ekranlarida ekranning eng pastki qismida doimiy ko‘rinib turadi.
- **Tarkibi:** 5 ta asosiy tugma — *Bosh sahifa, Katalog, Savatcha, Sevimlilar, Profil*.

---

## 4. Kutilayotgan Natija va Biznes Samaradorlik

1. **Bosh sahifa tartibli va yengil bo‘ladi:** 40 ta tarqoq mahsulot o‘rniga 4 ta aniq «Maxsus takliflar» vitrinasi hamda 30 ta to‘liq kategoriya tizimi xaridorga kerakli yo‘nalishni 2 soniya ichida topish imkonini beradi.
2. **Korporativ (B2B) va chakana (B2C) ishonch maksimal darajaga chiqadi:** «Bizga ishonch bildirgan tashkilotlar», «Xaridorlar sharhlari», «FAQ» hamda «Xarita va Aloqa» bloklari mijozdagi barcha ikkilanishlarni bartaraf etadi.
3. **Qidiruv tizimlari (Google va Yandex) uchun boyitilgan tuzilma:** 30 ta asosiy kategoriyaga to‘g‘ridan-to‘g‘ri havola, sof adabiy o‘zbekcha terminologiya («mahsulot»), savol-javoblar (FAQ) va aniq geolokatsiya saytning qidiruvdagi o‘rnini mustahkamlaydi.
