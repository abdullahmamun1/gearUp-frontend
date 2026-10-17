import type { NextRequest } from "next/server"

import { getGearAvailability } from "@/app/(public)/_actions/getGearAvailability"
import { jsonResponse } from "@/lib/apiRoute"

const DATE_KEY = /^\d{4}-\d{2}-\d{2}$/

export async function GET(
  request: NextRequest,
  ctx: RouteContext<"/api/gear/[id]/availability">
) {
  const { id } = await ctx.params
  const from = request.nextUrl.searchParams.get("from") ?? ""
  const to = request.nextUrl.searchParams.get("to") ?? ""

  if (!DATE_KEY.test(from) || !DATE_KEY.test(to)) {
    return Response.json(
      {
        success: false,
        statusCode: 400,
        message: "from and to must be dates (YYYY-MM-DD)",
        data: null,
      },
      { status: 400 }
    )
  }

  return jsonResponse(await getGearAvailability(id, from, to))
}
