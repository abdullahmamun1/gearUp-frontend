"use server"

import { apiFetch } from "@/lib/api"
import type { GearItem, GearQuery, Paginated } from "@/types"

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
  return apiFetch<Paginated<GearItem>>(
    `/api/gear${search ? `?${search}` : ""}`,
    {
      auth: false,
      tags: ["gear"],
      revalidate: 60 * 5,
    }
  )
}

export async function getGearById(id: string) {
  return apiFetch<GearItem>(`/api/gear/${id}`, {
    auth: false,
    tags: ["gear", `gear:${id}`],
    revalidate: 60 * 5,
  })
}

export async function getFeaturedGear(limit = 8) {
  return getGearList({
    limit: String(limit),
    isAvailable: "true",
    sortBy: "createdAt",
    sortOrder: "desc",
  })
}
