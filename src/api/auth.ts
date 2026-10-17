"use server"

import { redirect } from "next/navigation"
import { refresh } from "next/cache"
import { cookies } from "next/headers"

import { apiFetch } from "@/lib/apiClient"
import {
  clearAuthCookies,
  setAuthCookies,
  REFRESH_TOKEN_COOKIE,
} from "@/lib/cookies"
import { verifyAccessToken } from "@/lib/jwt"
import { DASHBOARD_HOME } from "@/routes"
import { safeRedirect } from "@/lib/utils"
import type {
  ApiResponse,
  AuthTokens,
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
    return { ...res, message: registerErrorMessage(res.message) }
  }

  return res
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
    return { ...res, data: null, message: loginErrorMessage(res) }
  }

  await setAuthCookies(res.data)

  const user = verifyAccessToken(res.data.accessToken)
  const home = user ? DASHBOARD_HOME[user.role] : "/"

  redirect(safeRedirect(redirectTo, home))
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

export async function logout() {
  await clearAuthCookies()
  redirect("/login")
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

function loginErrorMessage(res: ApiResponse<AuthTokens>) {
  if (res.statusCode === 400) return "Email or password is incorrect."
  if (res.statusCode >= 500) return "Something went wrong. Please try again."
  return res.message || "Could not log you in."
}

function registerErrorMessage(message: string) {
  if (message === "Duplicate Key Error") {
    return "An account with this email already exists."
  }
  return message || "Could not create your account."
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

async function renewAccessToken() {
  const cookieStore = await cookies()
  const refreshToken = cookieStore.get(REFRESH_TOKEN_COOKIE)?.value
  if (!refreshToken) return

  const res = await getNewAccessToken(refreshToken)
  if (res.success && res.data) await setAuthCookies(res.data)
}
