import type { NextRequest } from "next/server"

import { getAdminRentals } from "@/api/admin"
import { parseAdminRentalsFilters } from "@/utils/filters/admin"
import { jsonResponse } from "@/lib/apiRoute"

export async function GET(request: NextRequest) {
  const raw = Object.fromEntries(request.nextUrl.searchParams)
  const res = await getAdminRentals(parseAdminRentalsFilters(raw))

  return jsonResponse(res)
}
