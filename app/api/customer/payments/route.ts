import { getMyPayments } from "@/app/(dashboard)/_actions/getMyPayments"
import { jsonResponse } from "@/lib/apiRoute"

export async function GET() {
  const res = await getMyPayments()

  return jsonResponse(res)
}
