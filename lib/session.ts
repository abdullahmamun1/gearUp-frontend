import { cache } from "react"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

import { ACCESS_TOKEN_COOKIE } from "@/lib/cookies"
import { verifyAccessToken } from "@/lib/jwt"
import { DASHBOARD_HOME } from "@/lib/routes"
import type { JwtUser, Role } from "@/types"

export const getSession = cache(async (): Promise<JwtUser | null> => {
  const cookieStore = await cookies()
  const token = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value
  if (!token) return null
  return verifyAccessToken(token)
})

export async function requireSession(...roles: Role[]): Promise<JwtUser> {
  const session = await getSession()
  if (!session) redirect("/login")
  if (roles.length > 0 && !roles.includes(session.role)) {
    redirect(DASHBOARD_HOME[session.role])
  }
  return session
}
