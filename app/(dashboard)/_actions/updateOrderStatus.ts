"use server"

import { apiFetch } from "@/lib/api"
import type { RentalOrder, RentalStatus } from "@/types"

export async function updateOrderStatus(orderId: string, status: RentalStatus) {
  return apiFetch<RentalOrder>(`/api/provider/orders/${orderId}`, {
    method: "PATCH",
    body: { status },
  })
}
