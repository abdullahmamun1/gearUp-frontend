const currency = new Intl.NumberFormat("en-BD", {
  style: "currency",
  currency: "BDT",
  maximumFractionDigits: 0,
})

/** Prices arrive from Prisma's Decimal columns as strings. */
export function formatPrice(value: string | number) {
  const amount = typeof value === "string" ? Number(value) : value
  return Number.isFinite(amount) ? currency.format(amount) : "—"
}

const date = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
})

export function formatDate(value: string) {
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? "—" : date.format(parsed)
}

const dateTime = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  hour: "numeric",
  minute: "2-digit",
  hour12: true,
})

/** For deadlines: "20 Oct, 3:00 pm". */
export function formatDateTime(value: string) {
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? "—" : dateTime.format(parsed)
}
