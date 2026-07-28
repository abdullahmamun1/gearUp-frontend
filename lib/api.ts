import { cookies } from "next/headers"

import { ACCESS_TOKEN_COOKIE } from "@/lib/cookies"
import type { ApiResponse } from "@/types"

const BASE_URL = process.env.BACKEND_API_URL

export type ApiFetchOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE"
  body?: unknown
  auth?: boolean
  tags?: string[]
  revalidate?: number | false
}

export async function apiFetch<T>(
  path: string,
  options: ApiFetchOptions = {}
): Promise<ApiResponse<T>> {
  const { method = "GET", body, auth = true, tags, revalidate } = options

  const headers: Record<string, string> = {}
  if (body !== undefined) {
    headers["Content-Type"] = "application/json"
  }

  if (auth) {
    const cookieStore = await cookies()
    const accessToken = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value
    if (accessToken) {
      headers.Cookie = `${ACCESS_TOKEN_COOKIE}=${accessToken}`
    }
  }

  const isCached = tags !== undefined || revalidate !== undefined

  let res: Response
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      ...(isCached ? { next: { tags, revalidate } } : { cache: "no-store" }),
    })
  } catch {
    return {
      success: false,
      statusCode: 503,
      message: "Could not reach the server. Please check your connection.",
      data: null as T,
    }
  }

  return normalize<T>(res)
}

async function normalize<T>(res: Response): Promise<ApiResponse<T>> {
  let payload: unknown
  try {
    payload = await res.json()
  } catch {
    return {
      success: false,
      statusCode: res.status,
      message: res.statusText || "Unexpected response from the server.",
      data: null as T,
    }
  }

  const body = payload as Partial<ApiResponse<T>>

  if (typeof body.success !== "boolean") {
    return {
      success: res.ok,
      statusCode: res.status,
      message: body.message ?? (res.ok ? "OK" : "Request failed."),
      data: (body.data ?? null) as T,
    }
  }

  return {
    success: body.success,
    statusCode: body.statusCode ?? res.status,
    message: body.message ?? "",
    data: body.data as T,
    meta: body.meta,
  }
}
