import type { NextRequest } from "next/server"

import { getMyRentals } from "@/app/(dashboard)/_actions/getMyRentals"
import { jsonResponse } from "@/lib/apiRoute"
import { parseRentalTableFilters } from "@/lib/dashboardQuery"

export async function GET(request: NextRequest) {
  const raw = Object.fromEntries(request.nextUrl.searchParams)
  const res = await getMyRentals(parseRentalTableFilters(raw))

  return jsonResponse(res)
}
