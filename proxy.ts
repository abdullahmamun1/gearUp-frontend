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
import { getCurrentUser } from "@/service/currentUser"
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

  function applyAccessToken(token: string) {
    cookieStore.set(ACCESS_TOKEN_COOKIE, token, {
      ...AUTH_COOKIE_OPTIONS,
      maxAge: ACCESS_TOKEN_MAX_AGE,
    })
    request.cookies.set(ACCESS_TOKEN_COOKIE, token)
    accessToken = token
    decodedAccessToken = jwtUtils.verifyToken(
      token,
      process.env.JWT_ACCESS_SECRET as string
    )
    refreshed = true
  }

  function signOut(reason?: string) {
    cookieStore.delete(ACCESS_TOKEN_COOKIE)
    cookieStore.delete(REFRESH_TOKEN_COOKIE)
    const loginUrl = new URL("/login", request.url)
    if (reason) loginUrl.searchParams.set("reason", reason)
    return NextResponse.redirect(loginUrl)
  }

  if (!decodedAccessToken?.success && decodedRefreshToken?.success) {
    const result = await getNewAccessToken(refreshToken as string)
    if (result.success && result.data) {
      applyAccessToken(result.data.accessToken)
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

  if (requiredRole) {
    const current = await getCurrentUser(accessToken as string)

    if (current.statusCode === 403) return signOut("suspended")
    if (current.statusCode === 401) return signOut()

    if (current.data && current.data.role !== userRole) {
      if (decodedRefreshToken?.success) {
        const result = await getNewAccessToken(refreshToken as string)
        if (result.success && result.data) {
          applyAccessToken(result.data.accessToken)
        }
      }
      userRole = current.data.role
    }

    if (userRole !== requiredRole) {
      return NextResponse.redirect(new URL("/not-found", request.url))
    }
  }

  return refreshed
    ? NextResponse.next({ request: { headers: request.headers } })
    : NextResponse.next()
}

export const config = {
  matcher: ["/((?!api|_next/static|favicon.ico|_next/image|.*\\.png$).*)"],
}
