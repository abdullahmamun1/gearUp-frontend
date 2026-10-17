"use server"

import { apiFetch } from "@/lib/api"
import type { RentalOrder, RentalStatus } from "@/types"

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
