import { getSession } from "@/lib/session"

/**
 * Who is signed in, for client components on static pages. Verifies the
 * access-token cookie locally; never calls the backend, never cached.
 */
export async function GET() {
  const user = await getSession()
  return Response.json(
    { success: true, statusCode: 200, message: "", data: user },
    { headers: { "Cache-Control": "private, no-store" } }
  )
}
