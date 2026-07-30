"use server"

import { apiFetch } from "@/lib/api"
import type { CheckoutSession } from "@/types"

/**
 * Only valid once the provider has moved the order to CONFIRMED — the API
 * rejects any other status. If a PENDING payment already exists it returns
 * that session's URL rather than opening a second one.
 */
export async function createPayment(orderId: string) {
  return apiFetch<CheckoutSession>("/api/payments/create", {
    method: "POST",
    body: { orderId },
  })
}
