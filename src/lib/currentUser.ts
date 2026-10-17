import type { ApiResponse, User } from "@/types"

export async function getCurrentUser(
  accessToken: string
): Promise<ApiResponse<User | null>> {
  try {
    const res = await fetch(`${process.env.BACKEND_API_URL}/api/auth/me`, {
      headers: { Cookie: `accessToken=${accessToken}` },
      cache: "no-store",
    })

    const body = (await res.json()) as Partial<ApiResponse<User>>

    if (!res.ok || !body.data) {
      return {
        success: false,
        statusCode: body.statusCode ?? res.status,
        message: body.message ?? "Could not load your account.",
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
