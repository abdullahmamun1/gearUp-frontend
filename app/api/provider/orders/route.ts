import type { NextRequest } from "next/server"

import { getProviderOrders } from "@/app/(dashboard)/_actions/getProviderOrders"
import { jsonResponse } from "@/lib/apiRoute"
import { parseRentalTableFilters } from "@/lib/dashboardQuery"

export async function GET(request: NextRequest) {
  const raw = Object.fromEntries(request.nextUrl.searchParams)
  const res = await getProviderOrders(parseRentalTableFilters(raw))

  return jsonResponse(res)
}
