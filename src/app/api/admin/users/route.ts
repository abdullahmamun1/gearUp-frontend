import type { NextRequest } from "next/server"

import { getAdminUsers } from "@/api/admin"
import { parseAdminUsersFilters } from "@/utils/filters/admin"
import { jsonResponse } from "@/lib/apiRoute"

export async function GET(request: NextRequest) {
  const raw = Object.fromEntries(request.nextUrl.searchParams)
  const res = await getAdminUsers(parseAdminUsersFilters(raw))

  return jsonResponse(res)
}
