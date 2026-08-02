import type { ApiResponse } from "@/types"

export function jsonResponse<T>(res: ApiResponse<T>) {
  return Response.json(res, { status: res.success ? 200 : res.statusCode })
}
