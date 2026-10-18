"use server"

import { refresh } from "next/cache"

import { apiFetch } from "@/lib/apiClient"
import type { ClaimList, RentalOrder } from "@/types"
import { toAdminQuery, type AdminClaimsFilters } from "@/utils/filters/admin"

/** `GET /api/admin/claims` — open damage claims, or settled ones. */
export async function getClaims(filters: AdminClaimsFilters) {
  return apiFetch<ClaimList>(
    `/api/admin/claims?${toAdminQuery({ ...filters })}`
  )
}

/** Keep part of the deposit (0 to all of it); the rest is refunded. */
export async function resolveClaim(
  orderId: string,
  payload: { keepAmount: number; note?: string }
) {
  const res = await apiFetch<RentalOrder>(`/api/admin/claims/${orderId}`, {
    method: "PATCH",
    body: payload,
  })

  if (res.success) refresh()

  return res
}
