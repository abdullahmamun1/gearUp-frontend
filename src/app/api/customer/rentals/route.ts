import type { NextRequest } from "next/server"

import { getMyRentals } from "@/api/rentals"
import { jsonResponse } from "@/lib/apiRoute"
import { parseRentalTableFilters } from "@/utils/filters/dashboard"

export async function GET(request: NextRequest) {
  const raw = Object.fromEntries(request.nextUrl.searchParams)
  const res = await getMyRentals(parseRentalTableFilters(raw))

  return jsonResponse(res)
}
