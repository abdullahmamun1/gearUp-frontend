"use server"

import { apiFetch } from "@/lib/apiClient"
import type { AdminAnalytics } from "@/types"
import type { AnalyticsRange } from "@/utils/filters/admin"
import { toQueryString } from "@/utils/searchParams"

/** `GET /api/admin/analytics` — revenue, orders and leaders for a range. */
export async function getAnalytics(range: AnalyticsRange) {
  return apiFetch<AdminAnalytics>(
    `/api/admin/analytics?${toQueryString({ ...range })}`
  )
}
