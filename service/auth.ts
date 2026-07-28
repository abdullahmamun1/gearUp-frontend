"use server"

import { redirect } from "next/navigation"

import { apiFetch } from "@/lib/api"
import { clearAuthCookies, setAuthCookies } from "@/lib/cookies"
import type {
  ApiResponse,
  AuthTokens,
  LoginPayload,
  RegisterPayload,
  User,
} from "@/types"

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
  payload: LoginPayload
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
  return res
}

export async function logout() {
  await clearAuthCookies()
  redirect("/login")
}

export async function getMe(): Promise<ApiResponse<User | null>> {
  return apiFetch<User | null>("/api/auth/me")
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
