import { getUnreadMessages } from "@/api/messages"
import { jsonResponse } from "@/lib/apiRoute"

/** Unread counts for the navbar and sidebar badges (polled). */
export async function GET() {
  return jsonResponse(await getUnreadMessages())
}
