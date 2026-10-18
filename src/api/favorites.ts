"use server"

import { apiFetch } from "@/lib/apiClient"
import type { Favorites } from "@/types"

/** The signed-in customer's saved gear. Per user, so never cached. */
export async function getFavorites() {
  return apiFetch<Favorites>("/api/favorites")
}

export async function saveGear(gearId: string) {
  return apiFetch<{ gearItemId: string; saved: boolean }>(
    `/api/favorites/${gearId}`,
    { method: "POST" }
  )
}

export async function unsaveGear(gearId: string) {
  return apiFetch<{ gearItemId: string; saved: boolean }>(
    `/api/favorites/${gearId}`,
    { method: "DELETE" }
  )
}
