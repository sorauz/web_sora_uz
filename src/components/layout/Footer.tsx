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
  BadgeCheck,
  Send,
  AlertCircle,
} from "lucide-react";

export function Footer() {
  const locale = useLocale();
  const isUz = locale === "uz";

  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 pt-14 pb-24 sm:pb-12 mt-16 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Top Section: Main 4-column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 pb-10 border-b border-slate-800">
          {/* Col 1: Brand & Identity (Span 4 on large screens) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="flex flex-col">
              <span className="text-2xl font-black tracking-tight text-sora-400 leading-none">
                SORAUZ
              </span>
              <span className="text-[10px] font-bold tracking-tight text-slate-300 leading-tight mt-1">
                {isUz ? "Sizga mos ishonchli tanlov" : "Надежный выбор для вас"}
              </span>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              {isUz
                ? "2018-yildan buyon O'zbekistonda kanselyariya, ofis qog'ozi, sarf materiallari va orgtexnika bo'yicha ishonchli yetkazib beruvchi. 10 000 dan ortiq mahsulotlar 1C ERP tizimi bilan real vaqtda sinxronlangan."
                : "С 2018 года надежный поставщик канцелярских товаров, офисной бумаги и оргтехники в Узбекистане. Более 10 000 наименований с синхронизацией 1С ERP в реальном времени."}
            </p>

            {/* Deli Official Partner Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-950/40 border border-red-800/50 text-red-300 font-semibold text-[11px]">
              <BadgeCheck className="w-4 h-4 text-red-400 shrink-0" />
              <span>{isUz ? "Deli rasmiy hamkori" : "Официальный партнер Deli"}</span>
            </div>

            {/* Working Hours */}
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-800/70 border border-slate-700/60 max-w-sm">
              <Clock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <p className="font-bold text-slate-200">
                  {isUz ? "Ish vaqti: 09:00 — 19:00" : "График работы: 09:00 — 19:00"}
                </p>
                <p className="text-[11px] text-slate-400">
                  {isUz ? "Dushanba – Shanba (Yakshanba — dam olish)" : "Понедельник – Суббота (Вс — выходной)"}
                </p>
              </div>
            </div>

            {/* Social Links */}
            <div className="space-y-2 pt-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                {isUz ? "Ijtimoiy tarmoqlarimiz" : "Мы в соцсетях"}
              </span>
              <div className="flex flex-wrap items-center gap-2">
                <a
                  href="https://t.me/sorauz"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-950/60 hover:bg-blue-900 border border-blue-800/60 text-blue-300 text-xs font-semibold transition-colors"
                  title="Telegram Kanal"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Telegram Kanal</span>
                </a>
                <a
                  href="https://t.me/sora_uz"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-950/60 hover:bg-sky-900 border border-sky-800/60 text-sky-300 text-xs font-semibold transition-colors"
                  title="Telegram Menejer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>@sora_uz</span>
                </a>
                <a
                  href="https://www.instagram.com/sorauz/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900 border border-rose-800/60 text-rose-300 text-xs font-semibold transition-colors"
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
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">
              {isUz ? "Katalog" : "Каталог"}
            </h4>
            <ul className="space-y-2 text-slate-400">
              <li>
                <Link href="/catalog" className="hover:text-white transition-colors">
                  {isUz ? "Barcha toifalar" : "Все категории"}
                </Link>
              </li>
              <li>
                <Link href="/catalog/promotions" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400"></span>
                  {isUz ? "Aksiya va chegirmalar" : "Акции и скидки"}
                </Link>
              </li>
              <li>
                <Link href="/catalog/low_price_guarantee" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  {isUz ? "Eng arzon narx kafolati" : "Гарантия низкой цены"}
                </Link>
              </li>
              <li>
                <Link href="/catalog/new_products" className="hover:text-white transition-colors">
                  {isUz ? "Yangi tovarlar" : "Новые товары"}
                </Link>
              </li>
              <li>
                <Link href="/catalog/popular" className="hover:text-white transition-colors">
                  {isUz ? "Top mahsulotlar" : "Популярные товары"}
                </Link>
              </li>
              <li>
                <Link href="/brands" className="hover:text-white transition-colors">
                  {isUz ? "Rasmiy brendlar" : "Официальные бренды"}
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Kompaniya va Xizmatlar (Span 3) */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">
              {isUz ? "Kompaniya va Xizmatlar" : "Компания и Сервис"}
            </h4>
            <ul className="space-y-2 text-slate-400">
              <li>
                <Link href="/about" className="hover:text-white transition-colors">
                  {isUz ? "Biz haqimizda" : "О компании"}
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition-colors">
                  {isUz ? "Aloqa va manzil" : "Контакты и адрес"}
                </Link>
              </li>
              <li>
                <Link href="/delivery" className="hover:text-white transition-colors">
                  {isUz ? "Yetkazib berish shartlari" : "Условия доставки"}
                </Link>
              </li>
              <li>
                <Link href="/payment" className="hover:text-white transition-colors">
                  {isUz ? "To'lov usullari" : "Способы оплаты"}
                </Link>
              </li>
              <li>
                <Link href="/warranty" className="hover:text-white transition-colors">
                  {isUz ? "Kafolat va qaytarish (14 kun)" : "Гарантия и возврат (14 дней)"}
                </Link>
              </li>
              <li>
                <Link href="/b2b" className="hover:text-white transition-colors text-purple-400 hover:text-purple-300 font-semibold flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5" />
                  {isUz ? "B2B Korporativ xizmat (ESF)" : "B2B Корпоративным клиентам (ЭСФ)"}
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Bog'lanish va Manzil (Span 3) */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">
              {isUz ? "Aloqa va Manzil" : "Контакты и Адрес"}
            </h4>
            <div className="space-y-3 text-slate-400">
              {/* Phones */}
              <div className="flex items-start gap-2.5">
                <Phone className="w-4 h-4 text-sora-400 shrink-0 mt-0.5" />
                <div className="flex flex-col gap-1">
                  <a href="tel:+998903264757" className="font-semibold text-white hover:text-sora-300 transition-colors">
                    +998 (90) 326-47-57
                  </a>
                  <a href="tel:+998909699090" className="hover:text-white transition-colors">
                    +998 (90) 969-90-90
                  </a>
                  <a href="tel:+998712280578" className="hover:text-white transition-colors">
                    +998 (71) 228-05-78
                  </a>
                </div>
              </div>

              {/* Emails */}
              <div className="flex items-start gap-2.5">
                <Mail className="w-4 h-4 text-sora-400 shrink-0 mt-0.5" />
                <div className="flex flex-col gap-1">
                  <a href="mailto:info@sora.uz" className="hover:text-white transition-colors">
                    info@sora.uz <span className="text-[10px] text-slate-500">({isUz ? "Mijozlar" : "Клиентам"})</span>
                  </a>
                  <a href="mailto:b2b@sora.uz" className="hover:text-white transition-colors">
                    b2b@sora.uz <span className="text-[10px] text-slate-500">({isUz ? "Korporativ" : "B2B"})</span>
                  </a>
                </div>
              </div>

              {/* Address */}
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-sora-400 shrink-0 mt-0.5" />
                <span className="leading-snug">
                  {isUz
                    ? "Toshkent shahri, Olmazor tumani, Dilsaroy ko'chasi, 1-uy"
                    : "г. Ташкент, Алмазарский район, ул. Дилсарой, дом 1"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Middle Section: Trust, Delivery & Payment Badges */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-5 rounded-2xl bg-slate-800/40 border border-slate-800">
          {/* Card 1: Yetkazib berish */}
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-sora-950 text-sora-400 flex items-center justify-center shrink-0 border border-sora-800">
              <Truck className="w-4 h-4" />
            </div>
            <div>
              <p className="font-bold text-white">
                {isUz ? "Tezkor va bepul yetkazish" : "Быстрая и бесплатная доставка"}
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                {isUz
                  ? "Toshkentda 500 000 so'mdan yuqori xaridga bepul. Viloyatlarga BTS, Fargo, EMU orqali (1–3 kun)."
                  : "По Ташкенту от 500 000 сум бесплатно. В регионы через BTS, Fargo, EMU (1–3 дня)."}
              </p>
            </div>
          </div>

          {/* Card 2: To'lov tizimlari va Eslatma */}
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-950 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-800">
              <CreditCard className="w-4 h-4" />
            </div>
            <div className="space-y-1.5 w-full">
              <p className="font-bold text-white">
                {isUz ? "Qulay to'lov usullari" : "Способы оплаты"}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {["Payme", "Click", "Uzcard", "Humo", "Visa", "Naqd pul", "B2B"].map((item) => (
                  <span
                    key={item}
                    className="px-2 py-0.5 rounded bg-slate-800 text-[10px] font-semibold text-slate-300 border border-slate-700"
                  >
                    {item}
                  </span>
                ))}
              </div>
              <p className="text-[10px] text-amber-400/90 font-medium flex items-center gap-1 pt-0.5">
                <AlertCircle className="w-3 h-3 shrink-0" />
                <span>
                  {isUz
                    ? "Kredit va muddatli to'lov (nasiya) mavjud emas"
                    : "Кредит и рассрочка отсутствуют"}
                </span>
              </p>
            </div>
          </div>

          {/* Card 3: 100% Sifat va Kafolat */}
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-950 text-purple-400 flex items-center justify-center shrink-0 border border-purple-800">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <p className="font-bold text-white">
                {isUz ? "14 kunlik qaytarish va kafolat" : "Гарантия и возврат 14 дней"}
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                {isUz
                  ? "Sifat kafolati, mahsulotni 14 kun ichida almashtirish va texnikaga 1 yilgacha rasmiy kafolat."
                  : "Официальная гарантия до 1 года, возврат в течение 14 дней в строгом соответствии с законом."}
              </p>
            </div>
          </div>
        </div>

        {/* Legal Details / Yuridik rekvizitlar */}
        <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 text-[11px] text-slate-400 space-y-1">
          <p className="font-semibold text-slate-300">
            {isUz ? "Yuridik rekvizitlar:" : "Юридические реквизиты:"}
          </p>
          <p className="leading-relaxed">
            {isUz
              ? 'Tashkilot: «SORAUZ» MCHJ | STIR (INN): 306286447 | H/r: 20208000905524274001 | Bank: AIKB "IPAK YO\'LI BANK" Sag\'bon filiali, Toshkent shahar | MFO: 01036'
              : 'Организация: ООО «SORAUZ» | ИНН: 306286447 | Р/с: 20208000905524274001 | Банк: АИКБ «ИПАК ЙУЛИ БАНК» филиал Сагбан, г. Ташкент | МФО: 01036'}
          </p>
          <p className="text-slate-500 text-[10px]">
            {isUz
              ? "Barcha to'lovlar va shartnomalar O'zbekiston Respublikasi qonunchiligiga binoan rasmiylashtiriladi."
              : "Все договоры и расчеты осуществляются в строгом соответствии с законодательством Республики Узбекистан."}
          </p>
        </div>

        {/* Bottom Bar: Copyright & 1C Cert */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 border-t border-slate-800/80">
          <p>© 2018–2026 SORAUZ. {isUz ? "Barcha huquqlar himoyalangan." : "Все права защищены."}</p>
          <p className="flex items-center gap-1.5 text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>1C ERP Certified Integration</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
