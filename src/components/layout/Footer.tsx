import { Link } from "@/i18n/routing";
import { useLocale, useTranslations } from "next-intl";
import { Phone, Mail, MapPin, ShieldCheck, Truck, CreditCard } from "lucide-react";

export function Footer() {
  const locale = useLocale();
  const t = useTranslations("common");
  const isUz = locale === "uz";

  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 pt-12 pb-24 sm:pb-12 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 pb-12 border-b border-slate-800">
          {/* Col 1: Brand */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex flex-col">
              <span className="text-2xl font-black tracking-tight text-sora-400 leading-none">
                SORAUZ
              </span>
              <span className="text-[9.5px] font-bold tracking-tight text-slate-300 leading-tight mt-0.5">
                Sizga mos ishonchli tanlov
              </span>
            </div>
            <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
              {isUz
                ? "1C ERP bilan to'liq sinxronlangan zamonaviy internet-do'kon. Ofis jihozlari, kanselyariya mollari va elektronika to'g'ridan-to'g'ri kafolat bilan yetkaziladi."
                : "Современный интернет-магазин с синхронизацией 1С ERP. Офисная техника, канцелярия и электроника с официальной гарантией и доставкой."}
            </p>
            <div className="space-y-2.5 text-xs text-slate-400 pt-2">
              <div className="flex items-start gap-2">
                <Phone className="w-3.5 h-3.5 text-sora-400 shrink-0 mt-0.5" />
                <div className="flex flex-col gap-1">
                  <a href="tel:+998903264757" className="hover:text-white transition-colors">
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
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-sora-400 shrink-0" />
                <a href="mailto:info@sora.uz" className="hover:text-white transition-colors">
                  info@sora.uz
                </a>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-sora-400 shrink-0 mt-0.5" />
                <span>
                  {isUz
                    ? "Toshkent shahri, Dilsaroy ko'chasi, 1 uy"
                    : "г. Ташкент, ул. Дилсарой, дом 1"}
                </span>
              </div>
            </div>
          </div>

          {/* Col 2: Catalog */}
          <div className="space-y-3 text-xs">
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
                <Link href="/category/ofis-jihozlari-va-kanselyariya" className="hover:text-white transition-colors">
                  {isUz ? "Ofis jihozlari" : "Офисная техника"}
                </Link>
              </li>
              <li>
                <Link href="/category/smartfonlar" className="hover:text-white transition-colors">
                  {isUz ? "Smartfonlar" : "Смартфоны"}
                </Link>
              </li>
              <li>
                <Link href="/category/kalkulyatorlar" className="hover:text-white transition-colors">
                  {isUz ? "Kalkulyatorlar" : "Калькуляторы"}
                </Link>
              </li>
              <li>
                <Link href="/brands" className="hover:text-white transition-colors">
                  {isUz ? "Barcha brendlar" : "Все бренды"}
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Customer Service & Company */}
          <div className="space-y-3 text-xs">
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
                  {isUz ? "Kafolat va qaytarish" : "Гарантия и возврат"}
                </Link>
              </li>
              <li>
                <Link href="/b2b" className="hover:text-white transition-colors">
                  {isUz ? "Korporativ mijozlarga (B2B)" : "Корпоративным клиентам (B2B)"}
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Payments & Security */}
          <div className="space-y-3 text-xs">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">
              {isUz ? "To'lov tizimlari" : "Оплата"}
            </h4>
            <div className="flex flex-wrap gap-2 pt-1">
              <span className="px-2.5 py-1 rounded-md bg-slate-800 text-[11px] font-bold text-slate-300 border border-slate-700">
                Payme
              </span>
              <span className="px-2.5 py-1 rounded-md bg-slate-800 text-[11px] font-bold text-slate-300 border border-slate-700">
                Click
              </span>
              <span className="px-2.5 py-1 rounded-md bg-slate-800 text-[11px] font-bold text-slate-300 border border-slate-700">
                Uzum
              </span>
              <span className="px-2.5 py-1 rounded-md bg-slate-800 text-[11px] font-bold text-slate-300 border border-slate-700">
                Humo / Uzcard
              </span>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© 2026 Sora.uz. Barcha huquqlar himoyalangan.</p>
          <p className="flex items-center gap-1.5 text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>1C ERP Certified Integration</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
