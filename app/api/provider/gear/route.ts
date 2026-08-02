import type { NextRequest } from "next/server"

import { getProviderGear } from "@/app/(dashboard)/_actions/getProviderGear"
import { jsonResponse } from "@/lib/apiRoute"
import {
  parseProviderGearFilters,
  toProviderGearQuery,
} from "@/lib/providerGearQuery"

export async function GET(request: NextRequest) {
  const raw = Object.fromEntries(request.nextUrl.searchParams)
  const filters = parseProviderGearFilters(raw)
  const res = await getProviderGear(toProviderGearQuery(filters))

  return jsonResponse(res)
}
