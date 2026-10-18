import type { NextRequest } from "next/server"

import { getAdminReviews } from "@/api/admin"
import { parseAdminReviewsFilters } from "@/utils/filters/admin"
import { jsonResponse } from "@/lib/apiRoute"

export async function GET(request: NextRequest) {
  const raw = Object.fromEntries(request.nextUrl.searchParams)
  const res = await getAdminReviews(parseAdminReviewsFilters(raw))

  return jsonResponse(res)
}
