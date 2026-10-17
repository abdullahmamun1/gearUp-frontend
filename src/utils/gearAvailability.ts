import type { GearItem } from "@/types"

export type GearAvailability = "unavailable" | "out-of-stock" | "available"

type Rentable = Pick<GearItem, "isAvailable" | "stock">

export function gearAvailability(gear: Rentable): GearAvailability {
  if (!gear.isAvailable) return "unavailable"
  if (gear.stock < 1) return "out-of-stock"
  return "available"
}

export const AVAILABILITY_LABEL: Record<GearAvailability, string> = {
  unavailable: "Unavailable",
  "out-of-stock": "Out of stock",
  available: "Available",
}

export function isRentable(gear: Rentable) {
  return gearAvailability(gear) === "available"
}
