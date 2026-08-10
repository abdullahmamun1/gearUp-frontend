"use server"

import { getCategories } from "@/app/(public)/_actions/getCategories"
import { apiFetch } from "@/lib/api"
import { RENTAL_STATUSES } from "@/lib/adminQuery"
import { RENTAL_STATUS_SHORT_LABEL } from "@/lib/rental"
import type { Paginated, RentalOrder } from "@/types"

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
