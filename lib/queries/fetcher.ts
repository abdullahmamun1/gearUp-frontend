import type { ApiResponse } from "@/types"

export async function queryFetch<T>(url: string): Promise<T> {
  const res = await fetch(url)
  const body = (await res.json()) as ApiResponse<T>

  if (!body.success) throw new Error(body.message)
  return body.data
}
