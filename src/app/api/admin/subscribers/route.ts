import type { NextRequest } from "next/server"

import { getSubscribers } from "@/api/admin"
import { parseAdminSubscribersFilters } from "@/utils/filters/admin"
import { jsonResponse } from "@/lib/apiRoute"

export async function GET(request: NextRequest) {
  const raw = Object.fromEntries(request.nextUrl.searchParams)
  const res = await getSubscribers(parseAdminSubscribersFilters(raw))

  return jsonResponse(res)
}
