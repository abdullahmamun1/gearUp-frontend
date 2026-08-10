"use server"

import { apiFetch } from "@/lib/api"
import type { Review, ReviewList } from "@/types"

import { getGearList } from "./getGear"

const REVIEW_PAGE_SIZE = 5

const TESTIMONIAL_SOURCES = 6
const TESTIMONIAL_LIMIT = 9

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

export type Testimonial = Review & { gearName: string }

export async function getTestimonials(): Promise<Testimonial[]> {
  const gearRes = await getGearList({ limit: "100" })

  const reviewed = (gearRes.data?.data ?? [])
    .filter((gear) => (gear.rating?.count ?? 0) > 0)
    .sort((a, b) => (b.rating?.count ?? 0) - (a.rating?.count ?? 0))
    .slice(0, TESTIMONIAL_SOURCES)

  if (reviewed.length === 0) return []

  const pages = await Promise.all(
    reviewed.map(async (gear) => {
      const res = await getGearReviews(gear.id)
      return (res.data?.data ?? []).map((review) => ({
        ...review,
        gearName: gear.name,
      }))
    })
  )

  return pages
    .flat()
    .filter((review) => review.comment?.trim())
    .sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? ""))
    .slice(0, TESTIMONIAL_LIMIT)
}
