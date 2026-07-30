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
import { DASHBOARD_HOME, roleForPath } from "@/lib/routes"
import { getNewAccessToken } from "@/service/refreshToken"
import type { Role } from "@/types"

const AUTH_ROUTES = ["/login", "/register"]

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

      cookieStore.set(ACCESS_TOKEN_COOKIE, newAccessToken, {
        ...AUTH_COOKIE_OPTIONS,
        maxAge: ACCESS_TOKEN_MAX_AGE,
      })

      accessToken = newAccessToken
      decodedAccessToken = jwtUtils.verifyToken(
        accessToken,
        process.env.JWT_ACCESS_SECRET as string
      )

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

  const isAuthenticated = Boolean(decodedAccessToken?.success)

  // Logged in and heading for login/register — send them to their dashboard.
  if (isAuthenticated && AUTH_ROUTES.includes(pathname)) {
    const home = userRole ? DASHBOARD_HOME[userRole] : "/"
    return NextResponse.redirect(new URL(home ?? "/", request.url))
  }

  // The dashboards are the only protected areas; everything else is public.
  const requiredRole = roleForPath(pathname)

  if (!isAuthenticated && requiredRole) {
    const loginUrl = new URL("/login", request.url)
    loginUrl.searchParams.set("redirectTo", pathname)
    return NextResponse.redirect(loginUrl)
  }

  if (requiredRole && userRole !== requiredRole) {
    return NextResponse.redirect(new URL("/not-found", request.url))
  }

  return refreshed
    ? NextResponse.next({ request: { headers: request.headers } })
    : NextResponse.next()
}

export const config = {
  matcher: ["/((?!api|_next/static|favicon.ico|_next/image|.*\\.png$).*)"],
}
