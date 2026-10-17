import type { ApiResponse } from "@/types"

export async function getNewAccessToken(
  refreshToken: string
): Promise<ApiResponse<{ accessToken: string } | null>> {
  if (!refreshToken) {
    return {
      success: false,
      statusCode: 401,
      message: "Refresh token not found.",
      data: null,
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

    const body = (await res.json()) as Partial<
      ApiResponse<{ accessToken: string }>
    >

    if (!res.ok || !body.data?.accessToken) {
      return {
        success: false,
        statusCode: body.statusCode ?? res.status,
        message: body.message ?? "Session expired. Please log in again.",
        data: null,
      }
    }

    return {
      success: true,
      statusCode: body.statusCode ?? res.status,
      message: body.message ?? "",
      data: body.data,
    }
  } catch {
    return {
      success: false,
      statusCode: 503,
      message: "Could not reach the server.",
      data: null,
    }
  }
}
