import type { NextRequest } from "next/server"

import { getGearReviews } from "@/api/reviews"
import { jsonResponse } from "@/lib/apiRoute"
import { POSITIVE_INT } from "@/utils/searchParams"

/** Later review pages for "Show more" on the (prerendered) gear page. */
export async function GET(
  request: NextRequest,
  ctx: RouteContext<"/api/gear/[id]/reviews">
) {
  const { id } = await ctx.params
  const raw = request.nextUrl.searchParams.get("page") ?? "1"
  const page = POSITIVE_INT.test(raw) ? Number(raw) : 1
  return jsonResponse(await getGearReviews(id, page))
}
