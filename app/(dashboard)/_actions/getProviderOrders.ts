"use server"

import { apiFetch } from "@/lib/api"
import type { Paginated, RentalOrder } from "@/types"

export async function getProviderOrders(limit = 100) {
  return apiFetch<Paginated<RentalOrder>>(
    `/api/provider/orders?limit=${limit}`
  )
}
