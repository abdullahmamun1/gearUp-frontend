"use server"

import { apiFetch } from "@/lib/api"
import type { Paginated, Payment } from "@/types"

export async function getMyPayments(limit = 100) {
  return apiFetch<Paginated<Payment>>(`/api/payments?limit=${limit}`)
}
