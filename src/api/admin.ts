"use server"

import { refresh, revalidateTag } from "next/cache"
import { getTranslations } from "@/i18n/getTranslations"

import { apiFetch } from "@/lib/apiClient"
import type {
  AdminAttention,
  ClaimList,
  GearItem,
  InboxList,
  Paginated,
  RentalOrder,
  Review,
  SubscriberList,
  User,
  UserStatus,
} from "@/types"
import { getCategories } from "@/api/categories"
import {
  RENTAL_STATUSES,
  toAdminQuery,
  type AdminGearFilters,
  type AdminRentalsFilters,
  type AdminReviewsFilters,
  type AdminSubscribersFilters,
  type AdminUsersFilters,
} from "@/utils/filters/admin"

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
  const t = await getTranslations("common.rentalStatusShort")
  const results = await Promise.all(
    RENTAL_STATUSES.map((status) =>
      apiFetch<Paginated<RentalOrder>>(
        `/api/admin/rentals?status=${status}&limit=1`
      )
    )
  )

  return {
    data: results.map((res, i) => ({
      label: t(RENTAL_STATUSES[i]),
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

/** `GET /api/admin/reviews` — every review, hidden ones included. */
export async function getAdminReviews(filters: AdminReviewsFilters) {
  return apiFetch<Paginated<Review>>(
    `/api/admin/reviews?${toAdminQuery({ ...filters })}`
  )
}

/** Hide or restore a review. Public ratings and the gear page follow. */
export async function moderateReview(review: Review, isHidden: boolean) {
  const res = await apiFetch<Review>(`/api/admin/reviews/${review.id}`, {
    method: "PATCH",
    body: { isHidden },
  })

  if (res.success) {
    revalidateTag("gear", { expire: 0 })
    if (review.gearItemId) {
      revalidateTag(`gear:${review.gearItemId}`, { expire: 0 })
    }
  }

  return res
}

/** Featured gear leads the home page and the navbar's mega menu. */
export async function setGearFeatured(gearId: string, isFeatured: boolean) {
  const res = await apiFetch<Pick<GearItem, "id" | "name" | "isFeatured">>(
    `/api/admin/gear/${gearId}`,
    { method: "PATCH", body: { isFeatured } }
  )

  if (res.success) revalidateTag("gear", { expire: 0 })

  return res
}

/** `GET /api/admin/subscribers` — newsletter sign-ups with status counts. */
export async function getSubscribers(filters: AdminSubscribersFilters) {
  return apiFetch<SubscriberList>(
    `/api/admin/subscribers?${toAdminQuery({ ...filters })}`
  )
}

/** Counts for the sidebar badges: open damage claims and unread mail. */
export async function getAdminAttention(): Promise<AdminAttention> {
  const [claims, inbox] = await Promise.all([
    apiFetch<ClaimList>("/api/admin/claims?limit=1"),
    apiFetch<InboxList>("/api/admin/inbox?limit=1"),
  ])
  return {
    openClaims: claims.data?.openCount ?? 0,
    unreadMessages: inbox.data?.unread ?? 0,
  }
}
