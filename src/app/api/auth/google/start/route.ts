import { NextResponse, type NextRequest } from "next/server"

import {
  buildAuthorizeUrl,
  callbackUrl,
  createPkcePair,
  createState,
  GOOGLE_OAUTH_COOKIE,
  GOOGLE_OAUTH_COOKIE_OPTIONS,
} from "@/lib/googleOAuth"
import { safeRedirect } from "@/lib/utils"

export async function GET(request: NextRequest) {
  const clientId = process.env.GOOGLE_CLIENT_ID

  if (!clientId) {
    return NextResponse.redirect(new URL("/login?error=google", request.url))
  }

  const params = request.nextUrl.searchParams

  const role = params.get("role") === "PROVIDER" ? "PROVIDER" : "CUSTOMER"

  const redirectTo = safeRedirect(params.get("redirectTo") ?? undefined, "")

  const state = createState()
  const { verifier, challenge } = createPkcePair()

  const response = NextResponse.redirect(
    buildAuthorizeUrl({
      clientId,
      redirectUri: callbackUrl(request),
      state,
      challenge,
    })
  )

  response.cookies.set(
    GOOGLE_OAUTH_COOKIE,
    JSON.stringify({ state, verifier, redirectTo, role }),
    GOOGLE_OAUTH_COOKIE_OPTIONS
  )

  return response
}
