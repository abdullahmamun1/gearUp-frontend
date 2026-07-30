"use server"

import { apiFetch } from "@/lib/api"
import type { RentalOrder, RentalStatus } from "@/types"

/**
 * The API enforces the transition table (PLACED→CONFIRMED, PAID→PICKED_UP,
 * PICKED_UP→RETURNED) and rejects anything else with a 400.
 */
export async function updateOrderStatus(orderId: string, status: RentalStatus) {
  return apiFetch<RentalOrder>(`/api/provider/orders/${orderId}`, {
    method: "PATCH",
    body: { status },
  })
}
