import type { NextRequest } from "next/server"

import { getClaims } from "@/api/claims"
import { parseAdminClaimsFilters } from "@/utils/filters/admin"
import { jsonResponse } from "@/lib/apiRoute"

export async function GET(request: NextRequest) {
  const raw = Object.fromEntries(request.nextUrl.searchParams)
  const res = await getClaims(parseAdminClaimsFilters(raw))

  return jsonResponse(res)
}
