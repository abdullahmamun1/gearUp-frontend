import { cookies } from "next/headers"
import type { NextRequest } from "next/server"

import { ACCESS_TOKEN_COOKIE } from "@/lib/cookies"
import { parseAnalyticsRange } from "@/utils/filters/admin"
import { toQueryString } from "@/utils/searchParams"

const TYPES = new Set(["users", "rentals", "payments", "subscribers"])

/**
 * Streams a CSV export from the backend to the browser as a download. The
 * backend's admin guard decides who may have it.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ type: string }> }
) {
  const { type } = await params
  if (!TYPES.has(type)) {
    return Response.json(
      {
        success: false,
        statusCode: 404,
        message: "Unknown export",
        data: null,
      },
      { status: 404 }
    )
  }

  const range = parseAnalyticsRange(
    Object.fromEntries(request.nextUrl.searchParams)
  )
  const token = (await cookies()).get(ACCESS_TOKEN_COOKIE)?.value

  let res: Response
  try {
    res = await fetch(
      `${process.env.BACKEND_API_URL}/api/admin/export/${type}?${toQueryString({ ...range })}`,
      {
        headers: token ? { Cookie: `${ACCESS_TOKEN_COOKIE}=${token}` } : {},
        cache: "no-store",
      }
    )
  } catch {
    return Response.json(
      {
        success: false,
        statusCode: 503,
        message: "Could not reach the server.",
        data: null,
      },
      { status: 503 }
    )
  }

  if (!res.ok || !res.body) {
    // An error envelope (403, 400…): pass it through as JSON.
    return new Response(res.body, {
      status: res.status,
      headers: { "Content-Type": "application/json" },
    })
  }

  return new Response(res.body, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition":
        res.headers.get("content-disposition") ??
        `attachment; filename="gearup-${type}.csv"`,
      "Cache-Control": "no-store",
    },
  })
}
