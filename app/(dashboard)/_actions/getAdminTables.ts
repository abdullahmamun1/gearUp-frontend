"use server"

import { apiFetch } from "@/lib/api"
import {
  toAdminQuery,
  type AdminGearFilters,
  type AdminRentalsFilters,
  type AdminUsersFilters,
} from "@/lib/adminQuery"
import type { GearItem, Paginated, RentalOrder, User } from "@/types"

/** `GET /api/admin/users` — every account, filterable by role and status. */
export async function getAdminUsers(filters: AdminUsersFilters) {
  return apiFetch<Paginated<User>>(
    `/api/admin/users?${toAdminQuery({ ...filters })}`
  )
}

/** `GET /api/admin/gear` — every listing, with its category and provider. */
export async function getAdminGear(filters: AdminGearFilters) {
  return apiFetch<Paginated<GearItem>>(
    `/api/admin/gear?${toAdminQuery({ ...filters })}`
  )
}

/** `GET /api/admin/rentals` — every order, with customer, items and payments. */
export async function getAdminRentals(filters: AdminRentalsFilters) {
  return apiFetch<Paginated<RentalOrder>>(
    `/api/admin/rentals?${toAdminQuery({ ...filters })}`
  )
}
