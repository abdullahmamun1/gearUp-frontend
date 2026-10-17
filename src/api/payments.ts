"use server"

import { apiFetch } from "@/lib/apiClient"
import type { CheckoutSession, Paginated, Payment } from "@/types"
import {
  toDashboardQuery,
  type PaymentTableFilters,
} from "@/utils/filters/dashboard"

export async function createPayment(orderId: string) {
  return apiFetch<CheckoutSession>("/api/payments/create", {
    method: "POST",
    body: { orderId },
  })
}

export async function getMyPayments(
  filters: PaymentTableFilters = { page: 1 }
) {
  return apiFetch<Paginated<Payment>>(
    `/api/payments?${toDashboardQuery(filters)}`
  )
}

export async function getPaymentById(paymentId: string) {
  return apiFetch<Payment>(`/api/payments/${paymentId}`)
}
