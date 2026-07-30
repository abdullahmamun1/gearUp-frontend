import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { cookies } from "next/headers"
import type { JwtPayload } from "jsonwebtoken"

import {
  ACCESS_TOKEN_COOKIE,
  ACCESS_TOKEN_MAX_AGE,
  AUTH_COOKIE_OPTIONS,
  REFRESH_TOKEN_COOKIE,
} from "@/lib/cookies"
import { jwtUtils } from "@/lib/jwt"
import { DASHBOARD_HOME } from "@/lib/routes"
import { getNewAccessToken } from "@/service/refreshToken"
import type { Role } from "@/types"

const AUTH_ROUTES = ["/login", "/register"]
const PUBLIC_ROUTES = ["/", "/gear"]

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  const cookieStore = await cookies()

  let accessToken = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value
  const refreshToken = request.cookies.get(REFRESH_TOKEN_COOKIE)?.value
  let refreshed = false

  let decodedAccessToken = accessToken
    ? jwtUtils.verifyToken(accessToken, process.env.JWT_ACCESS_SECRET as string)
    : null

  const decodedRefreshToken = refreshToken
    ? jwtUtils.verifyToken(
        refreshToken,
        process.env.JWT_REFRESH_SECRET as string
      )
    : null

  if (!decodedAccessToken?.success && decodedRefreshToken?.success) {
    // Access token is expired but the refresh token is valid — mint a new one.
    const result = await getNewAccessToken(refreshToken as string)

    if (result.success && result.data) {
      const newAccessToken = result.data.accessToken

      // Shared with the login path so the refreshed cookie keeps `secure` in
      // production — spelling the options out here silently drops it.
      cookieStore.set(ACCESS_TOKEN_COOKIE, newAccessToken, {
        ...AUTH_COOKIE_OPTIONS,
        maxAge: ACCESS_TOKEN_MAX_AGE,
      })

      accessToken = newAccessToken
      decodedAccessToken = jwtUtils.verifyToken(
        accessToken,
        process.env.JWT_ACCESS_SECRET as string
      )

      // cookieStore.set only reaches the *browser*. Without this the current
      // render still reads the expired token and renders logged-out.
      request.cookies.set(ACCESS_TOKEN_COOKIE, newAccessToken)
      refreshed = true
    }
  }

  let userRole: Role | null = null

  if (accessToken && !decodedAccessToken?.success) {
    cookieStore.delete(ACCESS_TOKEN_COOKIE)
  }

  if (decodedAccessToken?.success && decodedAccessToken.data) {
    userRole = (decodedAccessToken.data as JwtPayload).role as Role
  }

  // Gate on whether the token *verifies*, not on whether the cookie exists. An
  // expired cookie is still a non-empty string, and gating on that locks the
  // user out of /login — the one page they need to recover.
  const isAuthenticated = Boolean(decodedAccessToken?.success)

  // Logged in and heading for login/register — send them to their dashboard.
  if (isAuthenticated && AUTH_ROUTES.includes(pathname)) {
    const home = userRole ? DASHBOARD_HOME[userRole] : "/"
    return NextResponse.redirect(new URL(home ?? "/", request.url))
  }

  const isPublicRoute = PUBLIC_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(route + "/")
  )

  const isAuthRoute = AUTH_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(route + "/")
  )

  // Authenticated pages protection
  if (!isAuthenticated && !isPublicRoute && !isAuthRoute) {
    const loginUrl = new URL("/login", request.url)
    loginUrl.searchParams.set("redirectTo", pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Authorization: role based access control
  if (
    pathname.startsWith("/customer-dashboard") &&
    userRole !== "CUSTOMER"
  ) {
    return NextResponse.redirect(new URL("/not-found", request.url))
  } else if (
    pathname.startsWith("/provider-dashboard") &&
    userRole !== "PROVIDER"
  ) {
    return NextResponse.redirect(new URL("/not-found", request.url))
  } else if (
    pathname.startsWith("/admin-dashboard") &&
    userRole !== "ADMIN"
  ) {
    return NextResponse.redirect(new URL("/not-found", request.url))
  }

  return refreshed
    ? NextResponse.next({ request: { headers: request.headers } })
    : NextResponse.next()
}

export const config = {
  matcher: [
    "/((?!api|_next/static|favicon.ico|_next/image|.*\\.png$).*)",
  ],
}
