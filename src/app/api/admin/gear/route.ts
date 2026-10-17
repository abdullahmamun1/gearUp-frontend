import type { NextRequest } from "next/server"

import { getAdminGear } from "@/api/admin"
import { parseAdminGearFilters } from "@/utils/filters/admin"
import { jsonResponse } from "@/lib/apiRoute"

export async function GET(request: NextRequest) {
  const raw = Object.fromEntries(request.nextUrl.searchParams)
  const res = await getAdminGear(parseAdminGearFilters(raw))

  return jsonResponse(res)
}
