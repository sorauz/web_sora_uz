import { Link } from "@/i18n/routing";
import { useLocale } from "next-intl";
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  ShieldCheck,
  Truck,
  CreditCard,
  Building2,
  Send,
  AlertCircle,
} from "lucide-react";

export function Footer() {
  const locale = useLocale();
  const isUz = locale === "uz";

  return (
    <footer className="bg-white text-slate-600 border-t border-slate-200 pt-14 pb-24 sm:pb-12 mt-16 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Top Section: Main 4-column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 pb-10 border-b border-slate-200">
          {/* Col 1: Brand & Identity (Span 4 on large screens) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="flex flex-col">
              <span className="text-2xl font-black tracking-tight text-sora-600 leading-none">
                SORAUZ
              </span>
              <span className="text-[10px] font-bold tracking-tight text-slate-700 leading-tight mt-1">
                {isUz ? "Sizga mos ishonchli tanlov" : "Надежный выбор для вас"}
              </span>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed max-w-sm">
              {isUz
                ? "2018-yildan buyon O'zbekistonda kanselyariya, ofis qog'ozi, sarf materiallari va orgtexnika bo'yicha ishonchli yetkazib beruvchi. 10 000 dan ortiq mahsulotlar 1C ERP tizimi bilan real vaqtda sinxronlangan."
                : "С 2018 года надежный поставщик канцелярских товаров, офисной бумаги и оргтехники в Узбекистане. Более 10 000 наименований с синхронизацией 1С ERP в реальном времени."}
            </p>

            {/* Working Hours */}
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200/90 max-w-sm">
              <Clock className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <p className="font-bold text-slate-800">
                  {isUz ? "Ish vaqti: 09:00 — 19:00" : "График работы: 09:00 — 19:00"}
                </p>
                <p className="text-[11px] text-slate-500">
                  {isUz ? "Dushanba – Shanba (Yakshanba — dam olish)" : "Понедельник – Суббота (Вс — выходной)"}
                </p>
              </div>
            </div>

            {/* Social Links */}
            <div className="space-y-2 pt-1">
              <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                {isUz ? "Ijtimoiy tarmoqlarimiz" : "Мы в соцсетях"}
              </span>
              <div className="flex flex-wrap items-center gap-2">
                <a
                  href="https://t.me/sorauz"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-50 hover:bg-sky-100 border border-sky-200 text-sky-700 text-xs font-semibold transition-colors"
                  title="Telegram Kanal"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Telegram Kanal</span>
                </a>
                <a
                  href="https://t.me/sora_uz"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 text-xs font-semibold transition-colors"
                  title="Telegram Menejer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>@sora_uz</span>
                </a>
                <a
                  href="https://www.instagram.com/sorauz/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 text-xs font-semibold transition-colors"
                  title="Instagram"
                >
                  <svg className="w-3.5 h-3.5 fill-current shrink-0" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                  <span>@sorauz</span>
                </a>
              </div>
            </div>
          </div>

          {/* Col 2: Katalog & Aksiyalar (Span 2 or 3) */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              {isUz ? "Katalog" : "Каталог"}
            </h4>
            <ul className="space-y-1 text-slate-600">
              <li>
                <Link href="/catalog" className="inline-block py-1 hover:text-sora-600 transition-colors font-medium">
                  {isUz ? "Barcha toifalar" : "Все категории"}
                </Link>
              </li>
              <li>
                <Link href="/catalog/promotions" className="inline-flex items-center gap-1.5 py-1 hover:text-sora-600 transition-colors font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                  {isUz ? "Aksiya va chegirmalar" : "Акции и скидки"}
                </Link>
              </li>
              <li>
                <Link href="/catalog/low_price_guarantee" className="inline-flex items-center gap-1.5 py-1 hover:text-sora-600 transition-colors font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  {isUz ? "Eng arzon narx kafolati" : "Гарантия низкой цены"}
                </Link>
              </li>
              <li>
                <Link href="/catalog/new_products" className="inline-block py-1 hover:text-sora-600 transition-colors font-medium">
                  {isUz ? "Yangi tovarlar" : "Новые товары"}
                </Link>
              </li>
              <li>
                <Link href="/catalog/popular" className="inline-block py-1 hover:text-sora-600 transition-colors font-medium">
                  {isUz ? "Top mahsulotlar" : "Популярные товары"}
                </Link>
              </li>
              <li>
                <Link href="/brands" className="inline-block py-1 hover:text-sora-600 transition-colors font-medium">
                  {isUz ? "Rasmiy brendlar" : "Официальные бренды"}
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Kompaniya va Xizmatlar (Span 3) */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              {isUz ? "Kompaniya va Xizmatlar" : "Компания и Сервис"}
            </h4>
            <ul className="space-y-1 text-slate-600">
              <li>
                <Link href="/about" className="inline-block py-1 hover:text-sora-600 transition-colors font-medium">
                  {isUz ? "Biz haqimizda" : "О компании"}
                </Link>
              </li>
              <li>
                <Link href="/contact" className="inline-block py-1 hover:text-sora-600 transition-colors font-medium">
                  {isUz ? "Aloqa va manzil" : "Контакты и адрес"}
                </Link>
              </li>
              <li>
                <Link href="/delivery" className="inline-block py-1 hover:text-sora-600 transition-colors font-medium">
                  {isUz ? "Yetkazib berish shartlari" : "Условия доставки"}
                </Link>
              </li>
              <li>
                <Link href="/payment" className="inline-block py-1 hover:text-sora-600 transition-colors font-medium">
                  {isUz ? "To'lov usullari" : "Способы оплаты"}
                </Link>
              </li>
              <li>
                <Link href="/warranty" className="inline-block py-1 hover:text-sora-600 transition-colors font-medium">
                  {isUz ? "Kafolat va qaytarish (10 kun)" : "Гарантия и возврат (10 дней)"}
                </Link>
              </li>
              <li>
                <Link href="/b2b" className="inline-flex items-center gap-1.5 py-1 text-purple-600 hover:text-purple-700 font-semibold transition-colors">
                  <Building2 className="w-3.5 h-3.5" />
                  {isUz ? "B2B Korporativ xizmat (ESF)" : "B2B Корпоративным клиентам (ЭСФ)"}
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Bog'lanish va Manzil (Span 3) */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              {isUz ? "Aloqa va Manzil" : "Контакты и Адрес"}
            </h4>
            <div className="space-y-3 text-slate-600">
              {/* Phones */}
              <div className="flex items-start gap-2.5">
                <Phone className="w-4 h-4 text-sora-600 shrink-0 mt-0.5" />
                <div className="flex flex-col gap-1">
                  <a href="tel:+998903264757" className="font-bold text-slate-900 hover:text-sora-600 transition-colors">
                    +998 (90) 326-47-57
                  </a>
                  <a href="tel:+998909699090" className="hover:text-sora-600 transition-colors">
                    +998 (90) 969-90-90
                  </a>
                  <a href="tel:+998712280578" className="hover:text-sora-600 transition-colors">
                    +998 (71) 228-05-78
                  </a>
                </div>
              </div>

              {/* Emails */}
              <div className="flex items-start gap-2.5">
                <Mail className="w-4 h-4 text-sora-600 shrink-0 mt-0.5" />
                <div className="flex flex-col gap-1">
                  <a href="mailto:info@sora.uz" className="hover:text-sora-600 transition-colors">
                    info@sora.uz <span className="text-[10px] text-slate-400">({isUz ? "Mijozlar" : "Клиентам"})</span>
                  </a>
                  <a href="mailto:b2b@sora.uz" className="hover:text-sora-600 transition-colors">
                    b2b@sora.uz <span className="text-[10px] text-slate-400">({isUz ? "Korporativ" : "B2B"})</span>
                  </a>
                </div>
              </div>

              {/* Address */}
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-sora-600 shrink-0 mt-0.5" />
                <span className="leading-snug text-slate-600">
                  {isUz
                    ? "Toshkent shahri, Olmazor tumani, Dilsaroy ko'chasi, 1-uy"
                    : "г. Ташкент, Алмазарский район, ул. Дилсарой, дом 1"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Middle Section: Trust, Delivery & Payment Badges */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-5 rounded-2xl bg-slate-50/70 border border-slate-200/90 shadow-xs">
          {/* Card 1: Yetkazib berish */}
          <Link
            href="/delivery"
            className="flex items-start gap-3 p-2 -m-2 rounded-xl hover:bg-white/80 transition-all group cursor-pointer"
          >
            <div className="w-9 h-9 rounded-xl bg-sora-50 text-sora-600 flex items-center justify-center shrink-0 border border-sora-100 group-hover:bg-sora-100 transition-colors">
              <Truck className="w-4 h-4" />
            </div>
            <div>
              <p className="font-bold text-slate-900 group-hover:text-sora-600 transition-colors">
                {isUz ? "Tezkor va bepul yetkazish" : "Быстрая и бесплатная доставка"}
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                {isUz
                  ? "Toshkentda 500 000 so'mdan yuqori xaridga bepul. Viloyatlarga BTS, Fargo, EMU orqali (1–3 kun)."
                  : "По Ташкенту от 500 000 сум бесплатно. В регионы через BTS, Fargo, EMU (1–3 дня)."}
              </p>
            </div>
          </Link>

          {/* Card 2: To'lov tizimlari va Eslatma */}
          <Link
            href="/payment"
            className="flex items-start gap-3 p-2 -m-2 rounded-xl hover:bg-white/80 transition-all group cursor-pointer"
          >
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100 group-hover:bg-emerald-100 transition-colors">
              <CreditCard className="w-4 h-4" />
            </div>
            <div className="space-y-1.5 w-full">
              <p className="font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                {isUz ? "Qulay to'lov usullari" : "Способы оплаты"}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {["Payme", "Click", "Uzcard", "Humo", "Visa", "Naqd pul", "B2B"].map((item) => (
                  <span
                    key={item}
                    className="px-2 py-0.5 rounded bg-white text-[10px] font-semibold text-slate-700 border border-slate-200 shadow-xs"
                  >
                    {item}
                  </span>
                ))}
              </div>
              <p className="text-[10px] text-amber-700 font-medium flex items-center gap-1 pt-0.5">
                <AlertCircle className="w-3 h-3 text-amber-600 shrink-0" />
                <span>
                  {isUz
                    ? "Kredit va muddatli to'lov (nasiya) mavjud emas"
                    : "Кредит и рассрочка отсутствуют"}
                </span>
              </p>
            </div>
          </Link>

          {/* Card 3: 100% Sifat va Kafolat */}
          <Link
            href="/warranty"
            className="flex items-start gap-3 p-2 -m-2 rounded-xl hover:bg-white/80 transition-all group cursor-pointer"
          >
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 border border-purple-100 group-hover:bg-purple-100 transition-colors">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <p className="font-bold text-slate-900 group-hover:text-purple-700 transition-colors">
                {isUz ? "10 kunlik qaytarish va kafolat" : "Гарантия и возврат 10 дней"}
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                {isUz
                  ? "Sifat kafolati, mahsulotni 10 kun ichida almashtirish va texnikaga 1 yilgacha rasmiy kafolat."
                  : "Официальная гарантия до 1 года, возврат в течение 10 дней в строгом соответствии с законом."}
              </p>
            </div>
          </Link>
        </div>

        {/* Legal Details / Yuridik rekvizitlar */}
        <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200 text-[11px] text-slate-600 space-y-1">
          <p className="font-semibold text-slate-800">
            {isUz ? "Yuridik rekvizitlar:" : "Юридические реквизиты:"}
          </p>
          <p className="leading-relaxed">
            {isUz
              ? 'Tashkilot: «SORAUZ» MCHJ | STIR (INN): 306286447 | H/r: 20208000905524274001 | Bank: AIKB "IPAK YO\'LI BANK" Sag\'bon filiali, Toshkent shahar | MFO: 01036'
              : 'Организация: ООО «SORAUZ» | ИНН: 306286447 | Р/с: 20208000905524274001 | Банк: АИКБ «ИПАК ЙУЛИ БАНК» филиал Сагбан, г. Ташкент | МФО: 01036'}
          </p>
          <p className="text-slate-400 text-[10px]">
            {isUz
              ? "Barcha to'lovlar va shartnomalar O'zbekiston Respublikasi qonunchiligiga binoan rasmiylashtiriladi."
              : "Все договоры и расчеты осуществляются в строгом соответствии с законодательством Республики Узбекистан."}
          </p>
        </div>

        {/* Bottom Bar: Copyright & 1C Cert */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 border-t border-slate-200">
          <p>© 2018–2026 SORAUZ. {isUz ? "Barcha huquqlar himoyalangan." : "Все права защищены."}</p>
          <p className="flex items-center gap-1.5 text-slate-600 font-medium">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>1C ERP Certified Integration</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
