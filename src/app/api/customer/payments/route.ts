import type { NextRequest } from "next/server"

import { getMyPayments } from "@/api/payments"
import { jsonResponse } from "@/lib/apiRoute"
import { parsePaymentTableFilters } from "@/utils/filters/dashboard"

export async function GET(request: NextRequest) {
  const raw = Object.fromEntries(request.nextUrl.searchParams)
  const res = await getMyPayments(parsePaymentTableFilters(raw))

  return jsonResponse(res)
}
