import type { RentalStatus } from "@/types"

const MS_PER_DAY = 1000 * 60 * 60 * 24

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

export function toDateValue(date: Date) {
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${date.getFullYear()}-${month}-${day}`
}

export const PROVIDER_NEXT_STATUS: Partial<
  Record<RentalStatus, { next: RentalStatus; label: string }>
> = {
  PLACED: { next: "CONFIRMED", label: "Confirm order" },
  PAID: { next: "PICKED_UP", label: "Mark picked up" },
  PICKED_UP: { next: "RETURNED", label: "Mark returned" },
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
