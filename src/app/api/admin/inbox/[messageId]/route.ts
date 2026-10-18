import { getInboxMessage } from "@/api/inbox"
import { jsonResponse } from "@/lib/apiRoute"

/** Opening a message marks it read. */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ messageId: string }> }
) {
  const { messageId } = await params
  return jsonResponse(await getInboxMessage(messageId))
}
