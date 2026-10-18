import { NextResponse, type NextRequest } from "next/server"

import {
  ACCESS_TOKEN_COOKIE,
  ACCESS_TOKEN_MAX_AGE,
  AUTH_COOKIE_OPTIONS,
  REFRESH_TOKEN_COOKIE,
  REFRESH_TOKEN_MAX_AGE,
} from "@/lib/cookies"
import {
  callbackUrl,
  GOOGLE_OAUTH_COOKIE,
  readHandshake,
  statesMatch,
} from "@/lib/googleOAuth"
import { verifyAccessToken } from "@/lib/jwt"
import { DASHBOARD_HOME } from "@/routes"
import { safeRedirect } from "@/lib/utils"
import { loginWithGoogle, syncLoginLocale } from "@/api/auth"
import {
  LOCALE_COOKIE,
  localizedPath,
  routing,
  splitLocale,
} from "@/i18n/routing"

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams
  // The language the visitor was browsing in (set by the proxy).
  const pageLocale =
    request.cookies.get(LOCALE_COOKIE)?.value === "bn"
      ? "bn"
      : routing.defaultLocale

  function bail(query: string) {
    const response = NextResponse.redirect(
      new URL(`${localizedPath(pageLocale, "/login")}?${query}`, request.url)
    )
    response.cookies.delete({
      name: GOOGLE_OAUTH_COOKIE,
      path: "/api/auth/google",
    })
    return response
  }

  if (params.get("error")) {
    return bail(
      params.get("error") === "access_denied"
        ? "error=google_denied"
        : "error=google"
    )
  }

  const code = params.get("code")
  const state = params.get("state")
  const handshake = readHandshake(request)

  if (!code || !state || !handshake || !statesMatch(state, handshake.state)) {
    return bail("error=google")
  }

  const res = await loginWithGoogle({
    code,
    codeVerifier: handshake.verifier,
    redirectUri: callbackUrl(request),
    role: handshake.role,
    locale: pageLocale,
  })

  if (!res.success || !res.data?.accessToken) {
    return bail(res.statusCode === 403 ? "reason=suspended" : "error=google")
  }

  const user = verifyAccessToken(res.data.accessToken)
  const home = user ? DASHBOARD_HOME[user.role] : "/"

  // Same rule as password login: a Bangla page wins, else the saved choice.
  const locale = await syncLoginLocale(res.data, pageLocale)
  const target = splitLocale(safeRedirect(handshake.redirectTo, home)).path
  const response = NextResponse.redirect(
    new URL(localizedPath(locale, target), request.url)
  )
  response.cookies.set(LOCALE_COOKIE, locale, {
    path: "/",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365,
  })

  response.cookies.set(ACCESS_TOKEN_COOKIE, res.data.accessToken, {
    ...AUTH_COOKIE_OPTIONS,
    maxAge: ACCESS_TOKEN_MAX_AGE,
  })
  response.cookies.set(REFRESH_TOKEN_COOKIE, res.data.refreshToken, {
    ...AUTH_COOKIE_OPTIONS,
    maxAge: REFRESH_TOKEN_MAX_AGE,
  })
  response.cookies.delete({
    name: GOOGLE_OAUTH_COOKIE,
    path: "/api/auth/google",
  })

  return response
}
