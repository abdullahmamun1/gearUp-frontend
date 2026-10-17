import type { CancelReason, DepositStatus, RentalStatus } from "@/types"

const MS_PER_DAY = 1000 * 60 * 60 * 24

/** Mirrors the backend's RENTAL_POLICY (src/modules/rental/rental.policy.ts). */
export const RENTAL_POLICY = {
  maxRentalDays: 30,
  maxDaysAhead: 120,
  respondWithinHours: 48,
  payWithinHours: 24,
  freeCancellationHours: 24,
} as const

export function rentalDays(start: Date, end: Date) {
  const diff = end.getTime() - start.getTime()
  return diff > 0 ? Math.ceil(diff / MS_PER_DAY) : 0
}

export function rentalTotal(
  pricePerDay: string | number,
  quantity: number,
  days: number
) {
  return Number(pricePerDay) * quantity * days
}

/** Calendar-day arithmetic that stays right across daylight-saving shifts. */
export function addDays(date: Date, days: number) {
  const next = new Date(date)
  next.setDate(next.getDate() + days)
  return next
}

/** Local-midnight Date for a "YYYY-MM-DD" key, for the calendar. */
export function fromDateValue(value: string) {
  const [year, month, day] = value.slice(0, 10).split("-").map(Number)
  return new Date(year!, month! - 1, day!)
}

export function toDateValue(date: Date) {
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${date.getFullYear()}-${month}-${day}`
}

export const RENTAL_STATUSES: RentalStatus[] = [
  "PLACED",
  "CONFIRMED",
  "PAID",
  "PICKED_UP",
  "RETURNED",
  "CANCELLED",
]

export const PROVIDER_NEXT_STATUS: Partial<
  Record<RentalStatus, { next: RentalStatus; label: string }>
> = {
  PLACED: { next: "CONFIRMED", label: "Confirm order" },
  PAID: { next: "PICKED_UP", label: "Mark picked up" },
  PICKED_UP: { next: "RETURNED", label: "Mark returned" },
}

export const CANCEL_REASON_LABEL: Record<CancelReason, string> = {
  CUSTOMER: "Cancelled by the customer",
  PROVIDER_DECLINED: "Declined by the provider",
  PAYMENT_EXPIRED: "Not paid in time",
  NO_PROVIDER_RESPONSE: "The provider didn't respond in time",
  ADMIN: "Cancelled by GearUp",
}

/**
 * NONE means "nothing held yet": an order with a deposit stays NONE until
 * it is paid, so describe it as a future charge, not as "no deposit".
 */
export const DEPOSIT_STATUS_LABEL: Record<DepositStatus, string> = {
  NONE: "Charged with payment, refunded on return",
  HELD: "Held until return",
  REFUNDED: "Refunded",
  PARTIALLY_REFUNDED: "Partly refunded",
  CLAIMED: "Damage claim under review",
}

/** The day starts at 00:00 in Dhaka (UTC+6, no daylight saving). */
const DHAKA_OFFSET_MS = 6 * 60 * 60 * 1000

/** Paid rentals are fully refundable until 24 h before the start day begins. */
export function freeCancellationUntil(startDate: string) {
  const dayStart = new Date(startDate).getTime() - DHAKA_OFFSET_MS
  return new Date(
    dayStart - RENTAL_POLICY.freeCancellationHours * 60 * 60 * 1000
  )
}

export function isFreeCancellationOpen(startDate: string) {
  return Date.now() < freeCancellationUntil(startDate).getTime()
}

export function canCancel(order: { status: RentalStatus; startDate: string }) {
  if (order.status === "PLACED" || order.status === "CONFIRMED") return true
  return order.status === "PAID" && isFreeCancellationOpen(order.startDate)
}

export const RENTAL_STATUS_SHORT_LABEL: Record<RentalStatus, string> = {
  PLACED: "Placed",
  CONFIRMED: "Confirmed",
  PAID: "Paid",
  PICKED_UP: "Picked up",
  RETURNED: "Returned",
  CANCELLED: "Cancelled",
}

export function startOfToday() {
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  return now
}
