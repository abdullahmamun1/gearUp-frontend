import { getCategories } from "@/app/(public)/_actions/getCategories"
import { jsonResponse } from "@/lib/apiRoute"

export async function GET() {
  const res = await getCategories()

  return jsonResponse(res)
}
