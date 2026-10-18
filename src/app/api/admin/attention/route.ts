import { getAdminAttention } from "@/api/admin"
import { jsonResponse } from "@/lib/apiRoute"

export async function GET() {
  const data = await getAdminAttention()

  return jsonResponse({ success: true, statusCode: 200, message: "OK", data })
}
