"use server"

import { apiFetch } from "@/lib/api"
import type { ReviewList } from "@/types"

const REVIEW_PAGE_SIZE = 5

export async function getGearReviews(gearId: string, page = 1) {
  const search = new URLSearchParams({
    page: String(page),
    limit: String(REVIEW_PAGE_SIZE),
  })

  return apiFetch<ReviewList>(`/api/gear/${gearId}/reviews?${search}`, {
    auth: false,
    tags: ["reviews", `reviews:${gearId}`],
    revalidate: 60 * 5,
  })
}
