"use server"

import { apiFetch } from "@/lib/api"
import type { Payment } from "@/types"

export async function getPaymentById(paymentId: string) {
  return apiFetch<Payment>(`/api/payments/${paymentId}`)
}
