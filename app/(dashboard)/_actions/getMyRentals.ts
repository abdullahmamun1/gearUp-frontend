"use server"

import { apiFetch } from "@/lib/api"
import type { Paginated, RentalOrder } from "@/types"

export async function getMyRentals(limit = 100) {
  return apiFetch<Paginated<RentalOrder>>(`/api/rentals?limit=${limit}`)
}
