import type { GearItem } from "@/types"

export type GearAvailability = "unavailable" | "out-of-stock" | "available"

type Rentable = Pick<GearItem, "isAvailable" | "stock">

export function gearAvailability(gear: Rentable): GearAvailability {
  if (!gear.isAvailable) return "unavailable"
  if (gear.stock < 1) return "out-of-stock"
  return "available"
}

/**
 * Message keys in the `gear` namespace:
 * `useTranslations("gear")(AVAILABILITY_LABEL[status])`.
 */
export const AVAILABILITY_LABEL = {
  unavailable: "availability.unavailable",
  "out-of-stock": "availability.out-of-stock",
  available: "availability.available",
} as const satisfies Record<
  GearAvailability,
  `availability.${GearAvailability}`
>

/** A star average with one decimal ("4.5" / "৪.৫"). */
export function formatRating(locale: string, value: number) {
  return new Intl.NumberFormat(locale === "bn" ? "bn-BD" : "en-GB", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(value)
}

export function isRentable(gear: Rentable) {
  return gearAvailability(gear) === "available"
}
