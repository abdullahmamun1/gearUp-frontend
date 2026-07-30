"use server"

import { apiFetch } from "@/lib/api"
import type { RentalOrder } from "@/types"

export async function getRentalById(orderId: string) {
  return apiFetch<RentalOrder>(`/api/rentals/${orderId}`)
}
