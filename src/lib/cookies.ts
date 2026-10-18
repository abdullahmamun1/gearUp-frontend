import { cookies } from "next/headers"

import { LOCALE_COOKIE } from "@/i18n/routing"

export const ACCESS_TOKEN_COOKIE = "accessToken"
export const REFRESH_TOKEN_COOKIE = "refreshToken"

export const ACCESS_TOKEN_MAX_AGE = 60 * 60 * 24
export const REFRESH_TOKEN_MAX_AGE = 60 * 60 * 24 * 7

export const AUTH_COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
  path: "/",
} as const

export async function setAuthCookies(tokens: {
  accessToken: string
  refreshToken?: string
}) {
  const cookieStore = await cookies()

  cookieStore.set(ACCESS_TOKEN_COOKIE, tokens.accessToken, {
    ...AUTH_COOKIE_OPTIONS,
    maxAge: ACCESS_TOKEN_MAX_AGE,
  })

  if (tokens.refreshToken) {
    cookieStore.set(REFRESH_TOKEN_COOKIE, tokens.refreshToken, {
      ...AUTH_COOKIE_OPTIONS,
      maxAge: REFRESH_TOKEN_MAX_AGE,
    })
  }
}

/** Remembers the language for the proxy's redirects (same as next-intl's). */
export async function setLocaleCookie(locale: "en" | "bn") {
  const cookieStore = await cookies()
  cookieStore.set(LOCALE_COOKIE, locale, {
    path: "/",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365,
  })
}

export async function clearAuthCookies() {
  const cookieStore = await cookies()
  cookieStore.delete(ACCESS_TOKEN_COOKIE)
  cookieStore.delete(REFRESH_TOKEN_COOKIE)
}
