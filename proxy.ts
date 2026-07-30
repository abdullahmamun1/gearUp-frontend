import { NextResponse, type NextRequest } from "next/server"

import {
  ACCESS_TOKEN_COOKIE,
  ACCESS_TOKEN_MAX_AGE,
  AUTH_COOKIE_OPTIONS,
  REFRESH_TOKEN_COOKIE,
} from "@/lib/cookies"
import { verifyAccessToken } from "@/lib/jwt"
import { AUTH_ROUTES, DASHBOARD_HOME, dashboardOwner } from "@/lib/routes"
import { getNewAccessToken } from "@/service/refreshToken"
import type { JwtUser } from "@/types"

type Resolved = {
  user: JwtUser | null
  freshToken?: string
  rejected?: boolean
}

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl
  const owner = dashboardOwner(pathname)
  const isAuthRoute = AUTH_ROUTES.includes(pathname)

  if (!owner && !isAuthRoute) return NextResponse.next()

  const { user, freshToken, rejected } = await resolveUser(request)

  if (isAuthRoute) {
    return user
      ? persist(redirectTo(DASHBOARD_HOME[user.role], request), freshToken)
      : proceed(request, freshToken)
  }

  if (!user) {
    const login = new URL("/login", request.url)
    login.searchParams.set("redirect", `${pathname}${search}`)
    const response = NextResponse.redirect(login)
    return rejected ? clear(response) : response
  }

  if (user.role !== owner) {
    return persist(redirectTo(DASHBOARD_HOME[user.role], request), freshToken)
  }

  return proceed(request, freshToken)
}

function proceed(request: NextRequest, freshToken?: string) {
  if (!freshToken) return NextResponse.next()

  request.cookies.set(ACCESS_TOKEN_COOKIE, freshToken)

  return persist(
    NextResponse.next({ request: { headers: request.headers } }),
    freshToken
  )
}

async function resolveUser(request: NextRequest): Promise<Resolved> {
  const accessToken = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value
  const user = accessToken ? verifyAccessToken(accessToken) : null
  if (user) return { user }

  const refreshToken = request.cookies.get(REFRESH_TOKEN_COOKIE)?.value
  if (!refreshToken) return { user: null, rejected: true }

  const res = await getNewAccessToken(refreshToken)
  if (!res.success || !res.data) {
    return { user: null, rejected: res.statusCode < 500 }
  }

  const refreshed = verifyAccessToken(res.data.accessToken)
  if (!refreshed) return { user: null }

  return { user: refreshed, freshToken: res.data.accessToken }
}

function redirectTo(path: string, request: NextRequest) {
  return NextResponse.redirect(new URL(path, request.url))
}

function persist(response: NextResponse, freshToken?: string) {
  if (freshToken) {
    response.cookies.set(ACCESS_TOKEN_COOKIE, freshToken, {
      ...AUTH_COOKIE_OPTIONS,
      maxAge: ACCESS_TOKEN_MAX_AGE,
    })
  }
  return response
}

function clear(response: NextResponse) {
  response.cookies.delete(ACCESS_TOKEN_COOKIE)
  response.cookies.delete(REFRESH_TOKEN_COOKIE)
  return response
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
