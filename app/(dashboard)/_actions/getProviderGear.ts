"use server"

import { apiFetch } from "@/lib/api"
import type { GearItem, Paginated } from "@/types"

export type ProviderGearQuery = {
  searchTerm?: string
  category?: string
  isAvailable?: string
  sortBy?: string
  sortOrder?: "asc" | "desc"
  page?: string
  limit?: string
}

/** `GET /api/provider/gear` — the caller's own listings, scoped by token. */
export async function getProviderGear(query: ProviderGearQuery = {}) {
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== "") params.set(key, value)
  }
  const search = params.toString()

  return apiFetch<Paginated<GearItem>>(
    `/api/provider/gear${search ? `?${search}` : ""}`
  )
}
