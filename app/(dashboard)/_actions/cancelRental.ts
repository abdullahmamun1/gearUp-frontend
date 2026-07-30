"use server"

import { updateTag } from "next/cache"

import { apiFetch } from "@/lib/api"
import type { RentalOrder } from "@/types"

export async function cancelRental(orderId: string) {
  const res = await apiFetch<RentalOrder>(`/api/rentals/${orderId}/cancel`, {
    method: "PATCH",
  })

  if (res.success) {
    updateTag("gear")
  }

  return res
}
