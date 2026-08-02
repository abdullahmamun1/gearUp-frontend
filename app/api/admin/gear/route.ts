import type { NextRequest } from "next/server"

import { getAdminGear } from "@/app/(dashboard)/_actions/getAdminTables"
import { parseAdminGearFilters } from "@/lib/adminQuery"
import { jsonResponse } from "@/lib/apiRoute"

export async function GET(request: NextRequest) {
  const raw = Object.fromEntries(request.nextUrl.searchParams)
  const res = await getAdminGear(parseAdminGearFilters(raw))

  return jsonResponse(res)
}
