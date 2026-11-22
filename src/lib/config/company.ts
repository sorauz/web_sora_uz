export const SORA_COMPANY_INFO = {
  brandName: "SORAUZ",
  website: "https://sora.uz",
  emailPrimary: "b2b@sora.uz",
  emailSupport: "info@sora.uz",
  telegram: "@sora_uz",
  phones: ["+998 (90) 326-47-57", "+998 (90) 969-90-90", "+998 (71) 228-05-78"],
  inn: "306286447",
  bankAccount: "20208000905524274001",
  mfo: "01036",
  uz: {
    legalName: "«SORAUZ» MCHJ",
    tagline: "Ofis va korporativ ta’minot markazi",
    address: "Toshkent shahri, Olmazor tumani, Dilsaroy ko‘chasi, 1-uy",
    bankName: "AIKB «IPAK YO‘LI BANK» Sag‘bon filiali, Toshkent shahar",
    directorRole: "Direktor",
    paymentTerms:
      "To‘lov shartlari: 100% pul o‘tkazish (Didox EHF elektron hisob-faktura). 500 000 so‘mdan yuqori xaridlarda Toshkent shahri bo‘ylab yetkazib berish bepul.",
    warrantyNote:
      "Ushbu tijorat taklifidagi narxlar Sora.uz 1C ERP bazasida amal qilish muddati tugagunga qadar kafolatlanadi.",
  },
  ru: {
    legalName: "ООО «SORAUZ»",
    tagline: "Центр офисного и корпоративного снабжения",
    address: "г. Ташкент, Алмазарский район, ул. Дилсарой, дом 1",
    bankName: "АИКБ «ИПАК ЙУЛИ БАНК» филиал Сагбан, г. Ташкент",
    directorRole: "Директор",
    paymentTerms:
      "Условия оплаты: 100% безналичный расчёт (ЭСФ через Didox). Бесплатная доставка по г. Ташкенту при заказе от 500 000 сум.",
    warrantyNote:
      "Цены в данном коммерческом предложении зафиксированы в базе 1С ERP Sora.uz до окончания срока его действия.",
  },
  kpDefaultValidDays: 5,
  freeDeliveryThreshold: 500_000,
  standardDeliveryFee: 30_000,
} as const;
