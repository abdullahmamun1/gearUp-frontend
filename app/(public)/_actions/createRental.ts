"use server"

import { updateTag } from "next/cache"

import { apiFetch } from "@/lib/api"
import type { RentalOrder } from "@/types"

export type CreateRentalInput = {
  gearItemId: string
  quantity: number
  startDate: string
  endDate: string
}

export async function createRental({
  gearItemId,
  quantity,
  startDate,
  endDate,
}: CreateRentalInput) {
  const res = await apiFetch<RentalOrder>("/api/rentals", {
    method: "POST",
    body: { items: [{ gearItemId, quantity }], startDate, endDate },
  })

  if (res.success) {
    updateTag("gear")
    updateTag(`gear:${gearItemId}`)
  }

  return res
}
