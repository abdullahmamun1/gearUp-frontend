"use server"

import { refresh, revalidateTag } from "next/cache"

import { apiFetch } from "@/lib/api"
import type { ReviewPayload } from "@/lib/schemas/review"
import type { Review } from "@/types"

export async function createReview(payload: ReviewPayload) {
  const res = await apiFetch<Review>("/api/reviews", {
    method: "POST",
    body: payload,
  })

  if (res.success) {
    revalidateTag(`reviews:${payload.gearItemId}`, { expire: 0 })
    revalidateTag("gear", { expire: 0 })
    refresh()
  }

  return res
}
