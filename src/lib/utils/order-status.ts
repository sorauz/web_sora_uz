export type NormalizedOrderStatus =
  | "CONFIRMED"
  | "PENDING"
  | "ASSEMBLED"
  | "SHIPPED"
  | "READY_FOR_PICKUP"
  | "DELIVERED"
  | "CANCELLED"
  | "KP_ACTIVE"
  | "KP_EXPIRED";

export type OrderStatusTone =
  | "emerald"
  | "amber"
  | "rose"
  | "indigo"
  | "blue"
  | "teal"
  | "violet";

export interface OrderStatusInput {
  statusCode?: string | null;
  statusText?: string | null;
  posted?: boolean | null;
  withoutDelivery?: boolean;
  isKp?: boolean;
}

export interface OrderStatusUiMeta {
  code: NormalizedOrderStatus;
  tone: OrderStatusTone;
  badgeClassName: string;
  textClassName: string;
  label: string;
  shortLabel: string;
  isConfirmedLike: boolean;
  isPending: boolean;
  isCancelled: boolean;
  isKpActive: boolean;
  isKpExpired: boolean;
}

const KNOWN_STATUS_CODES = new Set<NormalizedOrderStatus>([
  "CONFIRMED",
  "PENDING",
  "ASSEMBLED",
  "SHIPPED",
  "READY_FOR_PICKUP",
  "DELIVERED",
  "CANCELLED",
  "KP_ACTIVE",
  "KP_EXPIRED",
]);

/**
 * Normalizes 1C `POST /order`, `GET /order`, and `POST /order_action` statuses
 * (`status_code`, `posted`, `is_kp`, and legacy Uzbek status strings) into a single canonical status code.
 */
export function normalizeOrderStatus(
  input: OrderStatusInput
): NormalizedOrderStatus {
  const rawCode = input.statusCode?.trim().toUpperCase();
  if (rawCode && KNOWN_STATUS_CODES.has(rawCode as NormalizedOrderStatus)) {
    if (input.isKp && rawCode === "PENDING") {
      return "KP_ACTIVE";
    }
    return rawCode as NormalizedOrderStatus;
  }

  if (input.isKp) {
    const rawKpText = (input.statusText || "").trim().toLowerCase();
    if (rawKpText.includes("bekor") || rawKpText.includes("отмен")) {
      return "CANCELLED";
    }
    if (rawKpText.includes("muddat") || rawKpText.includes("истек") || rawKpText.includes("истёк")) {
      return "KP_EXPIRED";
    }
    return "KP_ACTIVE";
  }

  if (input.posted === false) {
    return "PENDING";
  }

  const rawText = (input.statusText || "").trim().toLowerCase();
  if (rawText) {
    if (rawText.includes("bekor") || rawText.includes("отмен")) {
      return "CANCELLED";
    }
    if (rawText.includes("muddat") || rawText.includes("истек") || rawText.includes("истёк")) {
      return "KP_EXPIRED";
    }
    if (
      rawText.includes("tijorat taklifi") ||
      rawText.includes("коммерческое предложение")
    ) {
      return "KP_ACTIVE";
    }
    if (
      rawText.includes("yetkazib berildi") ||
      rawText.includes("mijozga topshirildi") ||
      rawText.includes("доставлен") ||
      rawText.includes("выдан")
    ) {
      return "DELIVERED";
    }
    if (
      rawText.includes("kuryerga") ||
      rawText.includes("yo'lda") ||
      rawText.includes("передан курьеру") ||
      rawText.includes("в пути")
    ) {
      return "SHIPPED";
    }
    if (
      rawText.includes("topshirishga tayyor") ||
      rawText.includes("готов к самовывозу")
    ) {
      return "READY_FOR_PICKUP";
    }
    if (
      rawText.includes("omborda") ||
      rawText.includes("olib ketishga tayyor") ||
      rawText.includes("собран")
    ) {
      return "ASSEMBLED";
    }
    if (rawText.includes("tasdiqlan") || rawText.includes("подтвержд")) {
      return "CONFIRMED";
    }
    if (
      rawText.includes("tekshiril") ||
      rawText.includes("jarayonda") ||
      rawText.includes("провер") ||
      rawText.includes("обработ")
    ) {
      return "PENDING";
    }
  }

  if (input.posted === true) {
    return "CONFIRMED";
  }

  return "PENDING";
}

interface LocalizedStatusCopy {
  full: string;
  short: string;
}

interface StatusSpec {
  tone: OrderStatusTone;
  delivery: { uz: LocalizedStatusCopy; ru: LocalizedStatusCopy };
  pickup?: { uz: LocalizedStatusCopy; ru: LocalizedStatusCopy };
}

const STATUS_SPECS: Record<NormalizedOrderStatus, StatusSpec> = {
  PENDING: {
    tone: "amber",
    delivery: {
      uz: {
        full: "Qabul qilindi — menejer tekshiruvida",
        short: "Tekshirilmoqda",
      },
      ru: {
        full: "Принят — на проверке у менеджера",
        short: "На проверке",
      },
    },
  },
  CONFIRMED: {
    tone: "emerald",
    delivery: {
      uz: {
        full: "Qabul qilindi / Tasdiqlandi",
        short: "Tasdiqlandi",
      },
      ru: {
        full: "Принят / Подтверждён",
        short: "Подтверждён",
      },
    },
  },
  ASSEMBLED: {
    tone: "indigo",
    delivery: {
      uz: {
        full: "Omborda yig'ildi",
        short: "Yig'ildi",
      },
      ru: {
        full: "Собран на складе",
        short: "Собран",
      },
    },
    pickup: {
      uz: {
        full: "Olib ketishga tayyor",
        short: "Tayyor",
      },
      ru: {
        full: "Готов к выдаче",
        short: "Готов",
      },
    },
  },
  SHIPPED: {
    tone: "blue",
    delivery: {
      uz: {
        full: "Kuryerga topshirildi / Yo'lda",
        short: "Yo'lda",
      },
      ru: {
        full: "Передан курьеру / В пути",
        short: "В пути",
      },
    },
  },
  READY_FOR_PICKUP: {
    tone: "teal",
    delivery: {
      uz: {
        full: "Topshirishga tayyor",
        short: "Topshirishga tayyor",
      },
      ru: {
        full: "Готов к самовывозу",
        short: "Готов к самовывозу",
      },
    },
  },
  DELIVERED: {
    tone: "emerald",
    delivery: {
      uz: {
        full: "Yetkazib berildi",
        short: "Yetkazib berildi",
      },
      ru: {
        full: "Доставлен",
        short: "Доставлен",
      },
    },
    pickup: {
      uz: {
        full: "Mijozga topshirildi",
        short: "Topshirildi",
      },
      ru: {
        full: "Выдан клиенту",
        short: "Выдан",
      },
    },
  },
  CANCELLED: {
    tone: "rose",
    delivery: {
      uz: {
        full: "Bekor qilingan",
        short: "Bekor qilingan",
      },
      ru: {
        full: "Отменён",
        short: "Отменён",
      },
    },
  },
  KP_ACTIVE: {
    tone: "violet",
    delivery: {
      uz: {
        full: "Tijorat taklifi (Faol)",
        short: "KP (Faol)",
      },
      ru: {
        full: "Коммерческое предложение (Активно)",
        short: "КП (Активно)",
      },
    },
  },
  KP_EXPIRED: {
    tone: "amber",
    delivery: {
      uz: {
        full: "Muddati tugagan (KP)",
        short: "Muddati tugagan",
      },
      ru: {
        full: "Срок действия истёк (КП)",
        short: "Срок истёк",
      },
    },
  },
};

const TONE_CLASSES: Record<
  OrderStatusTone,
  { badge: string; text: string }
> = {
  emerald: {
    badge:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300",
    text: "text-emerald-600 dark:text-emerald-400",
  },
  amber: {
    badge:
      "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300",
    text: "text-amber-600 dark:text-amber-400",
  },
  rose: {
    badge:
      "bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300",
    text: "text-rose-600 dark:text-rose-400",
  },
  indigo: {
    badge:
      "bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300",
    text: "text-indigo-600 dark:text-indigo-400",
  },
  blue: {
    badge:
      "bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300",
    text: "text-blue-600 dark:text-blue-400",
  },
  teal: {
    badge:
      "bg-teal-100 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300",
    text: "text-teal-600 dark:text-teal-400",
  },
  violet: {
    badge:
      "bg-violet-100 text-violet-700 dark:bg-violet-950/60 dark:text-violet-300",
    text: "text-violet-600 dark:text-violet-400",
  },
};

/**
 * Returns unified badge styles, tone, and localized UZ/RU labels for an order or KP status.
 */
export function getOrderStatusUiMeta(
  input: OrderStatusInput,
  locale: "uz" | "ru"
): OrderStatusUiMeta {
  const code = normalizeOrderStatus(input);
  const spec = STATUS_SPECS[code];
  const toneClasses = TONE_CLASSES[spec.tone];
  const variant =
    input.withoutDelivery && spec.pickup ? spec.pickup : spec.delivery;
  const copy = locale === "ru" ? variant.ru : variant.uz;

  return {
    code,
    tone: spec.tone,
    badgeClassName: toneClasses.badge,
    textClassName: toneClasses.text,
    label: copy.full,
    shortLabel: copy.short,
    isConfirmedLike:
      code !== "PENDING" &&
      code !== "CANCELLED" &&
      code !== "KP_ACTIVE" &&
      code !== "KP_EXPIRED",
    isPending: code === "PENDING",
    isCancelled: code === "CANCELLED",
    isKpActive: code === "KP_ACTIVE",
    isKpExpired: code === "KP_EXPIRED",
  };
}

/**
 * Resolves a localized UZ/RU label for a 1C `timeline[]` step based on `code` and `withoutDelivery`.
 * Always maps strictly from `code` in Russian UI because 1C returns Uzbek `title` strings.
 */
export function getTimelineStepLabel(
  code: string,
  options: {
    locale: "uz" | "ru";
    withoutDelivery?: boolean;
    fallbackTitle?: string;
  }
): string {
  const normalized = code.trim().toUpperCase();
  if (KNOWN_STATUS_CODES.has(normalized as NormalizedOrderStatus)) {
    const spec = STATUS_SPECS[normalized as NormalizedOrderStatus];
    const variant =
      options.withoutDelivery && spec.pickup ? spec.pickup : spec.delivery;
    if (options.locale === "uz" && options.fallbackTitle?.trim()) {
      return options.fallbackTitle.trim();
    }
    return options.locale === "ru" ? variant.ru.full : variant.uz.full;
  }

  return options.fallbackTitle?.trim() || code;
}

/**
 * Formats 1C ISO timestamps (`YYYY-MM-DDTHH:mm:ss`) safely, returning "" when null or invalid.
 */
export function formatOrderDate(
  isoOrNull: string | null | undefined,
  locale: "uz" | "ru"
): string {
  if (!isoOrNull) return "";
  const parsed = new Date(isoOrNull);
  if (Number.isNaN(parsed.getTime())) return isoOrNull;

  const day = String(parsed.getDate()).padStart(2, "0");
  const month = String(parsed.getMonth() + 1).padStart(2, "0");
  const year = parsed.getFullYear();
  const hours = String(parsed.getHours()).padStart(2, "0");
  const minutes = String(parsed.getMinutes()).padStart(2, "0");

  return locale === "ru"
    ? `${day}.${month}.${year}, ${hours}:${minutes}`
    : `${day}.${month}.${year} • ${hours}:${minutes}`;
}
