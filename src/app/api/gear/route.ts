import type { NextRequest } from "next/server"

import { getGearList } from "@/api/gear"
import { jsonResponse } from "@/lib/apiRoute"
import { parseGearFilters, toGearQuery } from "@/utils/filters/gear"

/** Browse results for the (static) /gear page; same whitelist as the URL. */
export async function GET(request: NextRequest) {
  const raw = Object.fromEntries(request.nextUrl.searchParams)
  return jsonResponse(await getGearList(toGearQuery(parseGearFilters(raw))))
}
