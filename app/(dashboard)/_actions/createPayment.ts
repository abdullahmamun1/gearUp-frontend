"use server"

import { apiFetch } from "@/lib/api"
import type { CheckoutSession } from "@/types"

export async function createPayment(orderId: string) {
  return apiFetch<CheckoutSession>("/api/payments/create", {
    method: "POST",
    body: { orderId },
  })
}
