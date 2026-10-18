import type { NextRequest } from "next/server"

import { getInbox } from "@/api/inbox"
import { parseAdminInboxFilters } from "@/utils/filters/admin"
import { jsonResponse } from "@/lib/apiRoute"

export async function GET(request: NextRequest) {
  const raw = Object.fromEntries(request.nextUrl.searchParams)
  const res = await getInbox(parseAdminInboxFilters(raw))

  return jsonResponse(res)
}
