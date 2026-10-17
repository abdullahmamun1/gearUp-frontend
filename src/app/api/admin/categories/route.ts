import { getCategories } from "@/api/categories"
import { jsonResponse } from "@/lib/apiRoute"

export async function GET() {
  const res = await getCategories()

  return jsonResponse(res)
}
