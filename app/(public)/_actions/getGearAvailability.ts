"use server"

import { apiFetch } from "@/lib/api"
import type { GearAvailability } from "@/types"

/** Never Data-Cached: free units change with every booking. */
export async function getGearAvailability(
  gearId: string,
  from: string,
  to: string
) {
  const search = new URLSearchParams({ from, to })
  return apiFetch<GearAvailability>(
    `/api/gear/${gearId}/availability?${search}`,
    { auth: false }
  )
}
