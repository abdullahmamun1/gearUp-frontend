"use server"

import { apiFetch } from "@/lib/api"
import {
  toDashboardQuery,
  type PaymentTableFilters,
} from "@/lib/dashboardQuery"
import type { Paginated, Payment } from "@/types"

export async function getMyPayments(
  filters: PaymentTableFilters = { page: 1 }
) {
  return apiFetch<Paginated<Payment>>(
    `/api/payments?${toDashboardQuery(filters)}`
  )
}
