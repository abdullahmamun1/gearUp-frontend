/**
 * Locale-aware prices, numbers and dates. Always Bangladesh time, so
 * prerendered HTML (UTC servers) and browsers produce the same text.
 *
 * Bangla shows Bengali digits (১২৩) unless `digits` is "latin" (a dashboard
 * preference; public pages always use the locale's own digits).
 */
export type Digits = "native" | "latin"

export const DIGITS_COOKIE = "NEXT_DIGITS"

const TIME_ZONE = "Asia/Dhaka"

function intlLocale(locale: string, digits: Digits) {
  if (locale === "bn") return digits === "latin" ? "bn-BD-u-nu-latn" : "bn-BD"
  return "en-GB"
}

const cache = new Map<string, ReturnType<typeof build>>()

function build(locale: string, digits: Digits) {
  const tag = intlLocale(locale, digits)
  // English keeps en-BD ("BDT 1,250"), as before; Bangla gives "১,২৫০৳".
  const currency = new Intl.NumberFormat(locale === "bn" ? tag : "en-BD", {
    style: "currency",
    currency: "BDT",
    maximumFractionDigits: 0,
  })
  const number = new Intl.NumberFormat(tag)
  const date = new Intl.DateTimeFormat(tag, {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: TIME_ZONE,
  })
  const dateTime = new Intl.DateTimeFormat(tag, {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
    // Bangla gets "৪:০০ বিকাল" rather than a Latin "PM".
    ...(locale === "bn"
      ? { hourCycle: "h12" as const, dayPeriod: "short" as const }
      : { hour12: true }),
    timeZone: TIME_ZONE,
  })
  const month = new Intl.DateTimeFormat(tag, {
    month: "short",
    year: "2-digit",
    timeZone: "UTC",
  })
  const dayMonth = new Intl.DateTimeFormat(tag, {
    day: "numeric",
    month: "short",
    timeZone: TIME_ZONE,
  })
  const parse = (value: string | Date) => {
    const parsed = value instanceof Date ? value : new Date(value)
    return Number.isNaN(parsed.getTime()) ? null : parsed
  }

  return {
    locale,
    /** Prices arrive from Prisma's Decimal columns as strings. */
    price(value: string | number) {
      const amount = typeof value === "string" ? Number(value) : value
      return Number.isFinite(amount) ? currency.format(amount) : "—"
    },
    number(value: number) {
      return number.format(value)
    },
    /** "18 Oct 2026" / "১৮ অক্টো, ২০২৬" */
    date(value: string | Date) {
      const parsed = parse(value)
      return parsed ? date.format(parsed) : "—"
    },
    /** For deadlines: "20 Oct, 3:00 pm". */
    dateTime(value: string | Date) {
      const parsed = parse(value)
      return parsed ? dateTime.format(parsed) : "—"
    },
    /** A chart month: "2026-10" → "Oct 26" / "অক্টো ২৬". */
    month(key: string) {
      const parsed = parse(`${key}-01T00:00:00Z`)
      return parsed ? month.format(parsed) : key
    },
    /** "18 Oct" */
    dayMonth(value: string | Date) {
      const parsed = parse(value)
      return parsed ? dayMonth.format(parsed) : "—"
    },
  }
}

export type Format = ReturnType<typeof build>

/** Formatters for a locale (memoised; safe to call per render). */
export function createFormat(
  locale: string,
  digits: Digits = "native"
): Format {
  const key = `${locale}:${digits}`
  let format = cache.get(key)
  if (!format) {
    format = build(locale, digits)
    cache.set(key, format)
  }
  return format
}
