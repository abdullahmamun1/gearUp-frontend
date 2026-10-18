"use server"

import { updateTag } from "next/cache"

import { apiFetch } from "@/lib/apiClient"
import type {
  CustomerStats,
  Paginated,
  ProviderStats,
  RentalOrder,
  RentalStatus,
} from "@/types"
import {
  toDashboardQuery,
  type RentalTableFilters,
} from "@/utils/filters/dashboard"
import { RENTAL_STATUSES } from "@/utils/rental"

export type CreateRentalInput = {
  gearItemId: string
  quantity: number
  startDate: string
  endDate: string
}

export async function createRental({
  gearItemId,
  quantity,
  startDate,
  endDate,
}: CreateRentalInput) {
  const res = await apiFetch<RentalOrder>("/api/rentals", {
    method: "POST",
    body: { items: [{ gearItemId, quantity }], startDate, endDate },
  })

  if (res.success) {
    updateTag("gear")
    updateTag(`gear:${gearItemId}`)
  }

  return res
}

export async function cancelRental(orderId: string) {
  const res = await apiFetch<RentalOrder>(`/api/rentals/${orderId}/cancel`, {
    method: "PATCH",
  })

  if (res.success) {
    updateTag("gear")
  }

  return res
}

export async function getMyRentals(filters: RentalTableFilters = { page: 1 }) {
  return apiFetch<Paginated<RentalOrder>>(
    `/api/rentals?${toDashboardQuery(filters)}`
  )
}

/** Spending per month and orders by status, for the customer overview. */
export async function getMyRentalStats() {
  return apiFetch<CustomerStats>("/api/rentals/stats")
}

/** Earnings per month, orders by status and top gear (provider overview). */
export async function getProviderStats() {
  return apiFetch<ProviderStats>("/api/provider/stats")
}

export async function getMyRentalCounts() {
  const results = await Promise.all(
    RENTAL_STATUSES.map((status) =>
      apiFetch<Paginated<RentalOrder>>(`/api/rentals?status=${status}&limit=1`)
    )
  )

  const byStatus = {} as Record<RentalStatus, number>
  RENTAL_STATUSES.forEach((status, i) => {
    byStatus[status] = results[i].data?.meta?.total ?? 0
  })

  return {
    byStatus,
    total: Object.values(byStatus).reduce((sum, n) => sum + n, 0),
    failed: results.some((res) => !res.success),
    message: results.find((res) => !res.success)?.message,
  }
}

export async function getRentalById(orderId: string) {
  return apiFetch<RentalOrder>(`/api/rentals/${orderId}`)
}

export async function getProviderOrders(
  filters: RentalTableFilters = { page: 1 }
) {
  return apiFetch<Paginated<RentalOrder>>(
    `/api/provider/orders?${toDashboardQuery(filters)}`
  )
}

export async function getProviderOrderCounts() {
  const results = await Promise.all(
    RENTAL_STATUSES.map((status) =>
      apiFetch<Paginated<RentalOrder>>(
        `/api/provider/orders?status=${status}&limit=1`
      )
    )
  )

  const byStatus = {} as Record<RentalStatus, number>
  RENTAL_STATUSES.forEach((status, i) => {
    byStatus[status] = results[i].data?.meta?.total ?? 0
  })

  return {
    byStatus,
    total: Object.values(byStatus).reduce((sum, n) => sum + n, 0),
    failed: results.some((res) => !res.success),
    message: results.find((res) => !res.success)?.message,
  }
}

export type OrderStatusUpdate = {
  status: RentalStatus
  /** Why the order was declined, or what was damaged. */
  note?: string
  /** Returns of orders holding a deposit. */
  condition?: "OK" | "DAMAGED"
  damageAmount?: number
}

export async function updateOrderStatus(
  orderId: string,
  update: OrderStatusUpdate
) {
  return apiFetch<RentalOrder>(`/api/provider/orders/${orderId}`, {
    method: "PATCH",
    body: update,
  })
}
