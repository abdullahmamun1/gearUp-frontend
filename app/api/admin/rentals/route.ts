import type { NextRequest } from "next/server"

import { getAdminRentals } from "@/app/(dashboard)/_actions/getAdminTables"
import { parseAdminRentalsFilters } from "@/lib/adminQuery"
import { jsonResponse } from "@/lib/apiRoute"

export async function GET(request: NextRequest) {
  const raw = Object.fromEntries(request.nextUrl.searchParams)
  const res = await getAdminRentals(parseAdminRentalsFilters(raw))

  return jsonResponse(res)
}
