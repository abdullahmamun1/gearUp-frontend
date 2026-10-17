import type { NextRequest } from "next/server"

import { getProviderOrders } from "@/api/rentals"
import { jsonResponse } from "@/lib/apiRoute"
import { parseRentalTableFilters } from "@/utils/filters/dashboard"

export async function GET(request: NextRequest) {
  const raw = Object.fromEntries(request.nextUrl.searchParams)
  const res = await getProviderOrders(parseRentalTableFilters(raw))

  return jsonResponse(res)
}
