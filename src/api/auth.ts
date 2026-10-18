"use server"

import { getLocale } from "next-intl/server"
import { getTranslations } from "@/i18n/getTranslations"
import { refresh, revalidateTag } from "next/cache"
import { cookies } from "next/headers"

import { apiFetch } from "@/lib/apiClient"
import {
  clearAuthCookies,
  ACCESS_TOKEN_COOKIE,
  setAuthCookies,
  setLocaleCookie,
  REFRESH_TOKEN_COOKIE,
} from "@/lib/cookies"
import { verifyAccessToken } from "@/lib/jwt"
import { DASHBOARD_HOME } from "@/routes"
import { safeRedirect } from "@/lib/utils"
import { redirect } from "@/i18n/navigation"
import { DIGITS_COOKIE, type Digits } from "@/i18n/format"
import { splitLocale } from "@/i18n/routing"
import type {
  ApiResponse,
  AuthTokens,
  Locale,
  GoogleLoginPayload,
  LoginPayload,
  RegisterPayload,
  User,
} from "@/types"
import { profileSchema, type ProfileInput } from "@/validation/profile"
import { getNewAccessToken } from "@/lib/refreshToken"

export async function registerUser(
  payload: RegisterPayload
): Promise<ApiResponse<User>> {
  const res = await apiFetch<User>("/api/auth/register", {
    method: "POST",
    body: payload,
    auth: false,
  })

  if (!res.success) {
    return { ...res, message: await registerErrorMessage(res.message) }
  }

  return res
}

/**
 * Which language to land in after signing in. Accounts default to English,
 * so a Bangla page wins (and is saved to the account); from an English page
 * the account's saved choice wins.
 */
async function loginLocale(tokens: AuthTokens): Promise<Locale> {
  return syncLoginLocale(tokens, (await getLocale()) as Locale)
}

/** For the Google callback route, which has no page locale of its own. */
export async function syncLoginLocale(
  tokens: AuthTokens,
  pageLocale: Locale
): Promise<Locale> {
  const locale = pageLocale === "bn" ? "bn" : (tokens.locale ?? "en")
  if (tokens.locale && tokens.locale !== locale) {
    await apiFetch<User>("/api/auth/me", {
      method: "PATCH",
      body: { locale },
      auth: false,
      headers: { Authorization: `Bearer ${tokens.accessToken}` },
    })
  }
  return locale
}

export async function loginUser(
  payload: LoginPayload,
  redirectTo?: string
): Promise<ApiResponse<AuthTokens | null>> {
  const res = await apiFetch<AuthTokens>("/api/auth/login", {
    method: "POST",
    body: payload,
    auth: false,
  })

  if (!res.success || !res.data?.accessToken) {
    return { ...res, data: null, message: await loginErrorMessage(res) }
  }

  await setAuthCookies(res.data)

  const user = verifyAccessToken(res.data.accessToken)
  if (!user) {
    // The proxy will reject this token on every request too, so the visitor
    // lands signed out. Almost always a secret that differs from the backend.
    console.error(
      "Login: the API's access token failed verification. Check that JWT_ACCESS_SECRET (and JWT_REFRESH_SECRET) match the backend exactly."
    )
  }
  const home = user ? DASHBOARD_HOME[user.role] : "/"
  const locale = await loginLocale(res.data)
  await setLocaleCookie(locale)

  // redirectTo may carry a locale prefix; the router adds the right one.
  return redirect({
    href: splitLocale(safeRedirect(redirectTo, home)).path,
    locale,
  })
}

export async function loginWithGoogle(
  payload: GoogleLoginPayload
): Promise<ApiResponse<AuthTokens>> {
  return apiFetch<AuthTokens>("/api/auth/google", {
    method: "POST",
    body: payload,
    auth: false,
  })
}

/**
 * Remembers a language choice: the cookie (for the proxy's redirects) and,
 * when signed in, `User.locale`, which also picks the language of emails.
 */
export async function saveLocale(locale: Locale) {
  await setLocaleCookie(locale)
  const cookieStore = await cookies()
  if (!cookieStore.get(ACCESS_TOKEN_COOKIE)?.value) return
  await apiFetch<User>("/api/auth/me", { method: "PATCH", body: { locale } })
}

/** Dashboards only: Bengali (১২৩) or Latin (123) digits in Bangla. */
export async function saveDigits(digits: Digits) {
  const cookieStore = await cookies()
  cookieStore.set(DIGITS_COOKIE, digits, {
    path: "/",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365,
  })
  refresh()
}

export async function logout() {
  await clearAuthCookies()
  redirect({ href: "/login", locale: await getLocale() })
}

export async function getMe(): Promise<ApiResponse<User | null>> {
  return apiFetch<User | null>("/api/auth/me")
}

export async function verifyEmail(token: string) {
  return apiFetch<null>("/api/auth/verify-email", {
    method: "POST",
    body: { token },
    auth: false,
  })
}

export async function resendVerification() {
  return apiFetch<null>("/api/auth/resend-verification", { method: "POST" })
}

export async function forgotPassword(email: string) {
  return apiFetch<null>("/api/auth/forgot-password", {
    method: "POST",
    body: { email },
    auth: false,
  })
}

export async function resetPassword(token: string, password: string) {
  return apiFetch<null>("/api/auth/reset-password", {
    method: "POST",
    body: { token, password },
    auth: false,
  })
}

export async function updateEmailPreferences(marketingEmails: boolean) {
  return apiFetch<User>("/api/auth/me", {
    method: "PATCH",
    body: { marketingEmails },
  })
}

async function loginErrorMessage(res: ApiResponse<AuthTokens>) {
  const t = await getTranslations("auth.errors")
  if (res.statusCode === 400) return t("loginIncorrect")
  if (res.statusCode >= 500) return t("generic")
  return res.message || t("loginFailed")
}

async function registerErrorMessage(message: string) {
  const t = await getTranslations("auth.errors")
  if (message === "Duplicate Key Error") return t("emailTaken")
  return message || t("registerFailed")
}

export async function updateProfile(
  payload: ProfileInput
): Promise<ApiResponse<User | null>> {
  const parsed = profileSchema.safeParse(payload)

  if (!parsed.success) {
    return {
      success: false,
      statusCode: 400,
      message: parsed.error.issues[0]?.message ?? "Check the form and retry.",
      data: null,
    }
  }

  const res = await apiFetch<User>("/api/auth/me", {
    method: "PATCH",
    body: { name: parsed.data.name, phone: parsed.data.phone ?? "" },
  })

  if (res.success) {
    await renewAccessToken()
    refresh()
  }

  return res
}

export type PublicProfileInput = {
  avatarUrl?: string
  bio?: string
  city?: string
  area?: string
  /** Both or neither; null clears the pin. */
  latitude?: number | null
  longitude?: number | null
}

/**
 * Avatar, bio and (for providers) city, area and pickup pin. These show on
 * public pages, so the cached gear and provider pages are refreshed too.
 */
export async function updatePublicProfile(
  payload: PublicProfileInput
): Promise<ApiResponse<User | null>> {
  const res = await apiFetch<User>("/api/auth/me", {
    method: "PATCH",
    body: payload,
  })
  if (res.success && res.data) {
    revalidateTag("gear", { expire: 0 })
    revalidateTag(`provider:${res.data.id}`, { expire: 0 })
    refresh()
  }
  return res
}

async function renewAccessToken() {
  const cookieStore = await cookies()
  const refreshToken = cookieStore.get(REFRESH_TOKEN_COOKIE)?.value
  if (!refreshToken) return

  const res = await getNewAccessToken(refreshToken)
  if (res.success && res.data) await setAuthCookies(res.data)
}
