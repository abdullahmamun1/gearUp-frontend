import type { NextRequest } from "next/server"

import { getProviderGear } from "@/api/gear"
import { jsonResponse } from "@/lib/apiRoute"
import {
  parseProviderGearFilters,
  toProviderGearQuery,
} from "@/utils/filters/providerGear"

export async function GET(request: NextRequest) {
  const raw = Object.fromEntries(request.nextUrl.searchParams)
  const filters = parseProviderGearFilters(raw)
  const res = await getProviderGear(toProviderGearQuery(filters))

  return jsonResponse(res)
}
