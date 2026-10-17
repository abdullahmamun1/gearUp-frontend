"use server"

import { refresh } from "next/cache"

import { apiFetch } from "@/lib/apiClient"
import type {
  GearItem,
  Paginated,
  RentalOrder,
  User,
  UserStatus,
} from "@/types"
import { getCategories } from "@/api/categories"
import {
  RENTAL_STATUSES,
  toAdminQuery,
  type AdminGearFilters,
  type AdminRentalsFilters,
  type AdminUsersFilters,
} from "@/utils/filters/admin"
import { RENTAL_STATUS_SHORT_LABEL } from "@/utils/rental"

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

export type ChartDatum = { label: string; value: number }
export type ChartSeries = { data: ChartDatum[]; failed: boolean }

export async function getRentalsByStatus(): Promise<ChartSeries> {
  const results = await Promise.all(
    RENTAL_STATUSES.map((status) =>
      apiFetch<Paginated<RentalOrder>>(
        `/api/admin/rentals?status=${status}&limit=1`
      )
    )
  )

  return {
    data: results.map((res, i) => ({
      label: RENTAL_STATUS_SHORT_LABEL[RENTAL_STATUSES[i]],
      value: res.data?.meta?.total ?? 0,
    })),
    failed: results.some((res) => !res.success),
  }
}

export async function getGearByCategory(): Promise<ChartSeries> {
  const res = await getCategories()

  const data = (res.data ?? [])
    .map((category) => ({
      label: category.name,
      value: category._count?.gearItems ?? 0,
    }))
    .sort((a, b) => b.value - a.value)

  return { data, failed: !res.success }
}

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

export async function updateUserStatus(userId: string, status: UserStatus) {
  const res = await apiFetch<User>(`/api/admin/users/${userId}`, {
    method: "PATCH",
    body: { status },
  })

  if (res.success) refresh()

  return res
}
