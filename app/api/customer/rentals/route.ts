import { getMyRentals } from "@/app/(dashboard)/_actions/getMyRentals"
import { jsonResponse } from "@/lib/apiRoute"

export async function GET() {
  const res = await getMyRentals()

  return jsonResponse(res)
}
