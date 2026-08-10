"use server"

import { apiFetch } from "@/lib/api"
import { toDashboardQuery, type RentalTableFilters } from "@/lib/dashboardQuery"
import { RENTAL_STATUSES } from "@/lib/rental"
import type { Paginated, RentalOrder, RentalStatus } from "@/types"

export async function getMyRentals(filters: RentalTableFilters = { page: 1 }) {
  return apiFetch<Paginated<RentalOrder>>(
    `/api/rentals?${toDashboardQuery(filters)}`
  )
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
