import { getFavorites } from "@/api/favorites"
import { jsonResponse } from "@/lib/apiRoute"

/** Saved gear for the heart buttons and the Saved page (TanStack). */
export async function GET() {
  return jsonResponse(await getFavorites())
}
