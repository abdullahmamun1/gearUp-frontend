"use server"

import { apiFetch } from "@/lib/api"
import type { GearItem, Paginated, RentalOrder, User } from "@/types"

/**
 * There is no /api/admin/stats endpoint, so the totals come from each list's
 * `meta.total` with `limit=1` — one row fetched per count instead of a page.
 */
export async function getAdminCounts() {
  const [users, gear, rentals] = await Promise.all([
    apiFetch<Paginated<User>>("/api/admin/users?limit=1"),
    apiFetch<Paginated<GearItem>>("/api/admin/gear?limit=1"),
    apiFetch<Paginated<RentalOrder>>("/api/admin/rentals?limit=1"),
  ])

  return {
    users: users.data?.meta?.total ?? null,
    gear: gear.data?.meta?.total ?? null,
    rentals: rentals.data?.meta?.total ?? null,
    failed: [users, gear, rentals].some((res) => !res.success),
  }
}
