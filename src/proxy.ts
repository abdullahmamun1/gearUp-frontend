import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { cookies } from "next/headers"
import type { JwtPayload } from "jsonwebtoken"
import createMiddleware from "next-intl/middleware"

import {
  ACCESS_TOKEN_COOKIE,
  ACCESS_TOKEN_MAX_AGE,
  AUTH_COOKIE_OPTIONS,
  REFRESH_TOKEN_COOKIE,
} from "@/lib/cookies"
import { jwtUtils } from "@/lib/jwt"
import { DASHBOARD_HOME, roleForPath } from "@/routes"
import { getCurrentUser } from "@/lib/currentUser"
import { getNewAccessToken } from "@/lib/refreshToken"
import type { Role } from "@/types"
import {
  LOCALE_COOKIE,
  localizedPath,
  routing,
  splitLocale,
} from "@/i18n/routing"

const AUTH_ROUTES = ["/login", "/register"]

/** Adds or strips the /bn prefix and remembers the language in a cookie. */
const handleI18n = createMiddleware(routing)

export async function proxy(request: NextRequest) {
  // Auth rules work on the path without its locale ("/bn/login" → "/login").
  const { locale: prefixLocale, path: pathname } = splitLocale(
    request.nextUrl.pathname
  )
  const hasPrefix = request.nextUrl.pathname !== pathname
  const cookieLocale = request.cookies.get(LOCALE_COOKIE)?.value
  // Our redirects keep the visitor's language.
  const locale = hasPrefix
    ? prefixLocale
    : cookieLocale === "bn"
      ? "bn"
      : routing.defaultLocale
  const urlFor = (path: string) =>
    new URL(localizedPath(locale, path), request.url)
  const cookieStore = await cookies()

  let accessToken = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value
  const refreshToken = request.cookies.get(REFRESH_TOKEN_COOKIE)?.value

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
  }

  function signOut(reason?: string) {
    cookieStore.delete(ACCESS_TOKEN_COOKIE)
    cookieStore.delete(REFRESH_TOKEN_COOKIE)
    const loginUrl = urlFor("/login")
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
    return NextResponse.redirect(urlFor(home ?? "/"))
  }

  // The dashboards are the only protected areas; everything else is public.
  const requiredRole = roleForPath(pathname)

  if (!isAuthenticated && requiredRole) {
    const loginUrl = urlFor("/login")
    // Without the locale: the login page's router adds the current one.
    loginUrl.searchParams.set("redirectTo", pathname + request.nextUrl.search)
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
      return NextResponse.redirect(urlFor("/not-found"))
    }
  }

  // A refreshed token was written into request.cookies above; next-intl
  // copies request.headers into its rewrite, so pages see the new token.
  return handleI18n(request)
}

export const config = {
  // Everything except API routes, Next internals and files (anything with a
  // dot: sw.js, offline.html, sitemap.xml, icons…).
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
}
