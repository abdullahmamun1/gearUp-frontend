"use server"

import { cookies } from "next/headers"
import type { ApiResponse } from "@/types"

export async function getNewAccessToken(): Promise<
  ApiResponse<{ accessToken: string }>
> {
  const cookieStore = await cookies()
  const refreshToken = cookieStore.get("refreshToken")?.value

  if (!refreshToken) {
    return {
      success: false,
      statusCode: 401,
      message: "Refresh token not found.",
      data: { accessToken: "" },
    }
  }

  try {
    const res = await fetch(
      `${process.env.BACKEND_API_URL}/api/auth/refresh-token`,
      {
        method: "POST",
        headers: { Cookie: `refreshToken=${refreshToken}` },
        cache: "no-store",
      }
    )
    return (await res.json()) as ApiResponse<{ accessToken: string }>
  } catch {
    return {
      success: false,
      statusCode: 503,
      message: "Could not reach the server.",
      data: { accessToken: "" },
    }
  }
}
