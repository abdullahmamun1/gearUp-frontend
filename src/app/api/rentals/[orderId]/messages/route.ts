import type { NextRequest } from "next/server"

import { getOrderMessages } from "@/api/messages"
import { jsonResponse } from "@/lib/apiRoute"

/** An order's chat thread; the open thread polls this every few seconds. */
export async function GET(
  _request: NextRequest,
  ctx: RouteContext<"/api/rentals/[orderId]/messages">
) {
  const { orderId } = await ctx.params
  return jsonResponse(await getOrderMessages(orderId))
}
