"use server"

import { refresh } from "next/cache"
import { cookies } from "next/headers"

import { apiFetch } from "@/lib/api"
import { REFRESH_TOKEN_COOKIE, setAuthCookies } from "@/lib/cookies"
import { profileSchema, type ProfileInput } from "@/lib/schemas/profile"
import { getNewAccessToken } from "@/service/refreshToken"
import type { ApiResponse, User } from "@/types"

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
