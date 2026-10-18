"use server"

import { refresh, revalidateTag } from "next/cache"

import { apiFetch } from "@/lib/apiClient"
import type { GearItem, GearQuery, Paginated, GearAvailability } from "@/types"
import type { GearPayload, GearPatch } from "@/validation/gear"

function toSearchParams(query: GearQuery) {
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== "") {
      params.set(key, value)
    }
  }
  return params.toString()
}

export async function getGearList(query: GearQuery = {}) {
  const search = toSearchParams(query)
  const path = `/api/gear${search ? `?${search}` : ""}`

  // Date-filtered results depend on live bookings, so skip the Data Cache.
  if (query.from || query.to) {
    return apiFetch<Paginated<GearItem>>(path, { auth: false })
  }

  return apiFetch<Paginated<GearItem>>(path, {
    auth: false,
    tags: ["gear"],
    revalidate: 60 * 5,
  })
}

export async function getGearById(id: string) {
  return apiFetch<GearItem>(`/api/gear/${id}`, {
    auth: false,
    tags: ["gear", `gear:${id}`],
    revalidate: 60 * 5,
  })
}

/** Admin-featured gear first, then the newest. */
export async function getFeaturedGear(limit = 8) {
  return getGearList({
    limit: String(limit),
    isAvailable: "true",
    sortBy: "featured",
  })
}

export async function getBrands() {
  return apiFetch<string[]>("/api/brands", {
    auth: false,
    tags: ["brands", "gear"],
    revalidate: 60 * 60,
  })
}

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

export async function createGear(payload: GearPayload) {
  const res = await apiFetch<GearItem>("/api/provider/gear", {
    method: "POST",
    body: payload,
  })

  if (res.success) {
    revalidateTag("gear", { expire: 0 })
    refresh()
  }

  return res
}

export async function updateGear(gearId: string, payload: GearPatch) {
  const res = await apiFetch<GearItem>(`/api/provider/gear/${gearId}`, {
    method: "PUT",
    body: payload,
  })

  if (res.success) {
    revalidateTag("gear", { expire: 0 })
    refresh()
  }

  return res
}

export async function deleteGear(gearId: string) {
  const res = await apiFetch<null>(`/api/provider/gear/${gearId}`, {
    method: "DELETE",
  })
  if (res.success) {
    revalidateTag("gear", { expire: 0 })
    refresh()
  }
  return res
}
