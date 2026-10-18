import { cache } from "react"
import { cookies } from "next/headers"
import { getLocale } from "next-intl/server"

import { ACCESS_TOKEN_COOKIE } from "@/lib/cookies"
import { verifyAccessToken } from "@/lib/jwt"
import { DASHBOARD_HOME } from "@/routes"
import { redirect } from "@/i18n/navigation"
import type { JwtUser, Role } from "@/types"

export const getSession = cache(async (): Promise<JwtUser | null> => {
  const cookieStore = await cookies()
  const token = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value
  if (!token) return null
  return verifyAccessToken(token)
})

export async function requireSession(...roles: Role[]): Promise<JwtUser> {
  const session = await getSession()
  const locale = await getLocale()
  if (!session) return redirect({ href: "/login", locale })
  if (roles.length > 0 && !roles.includes(session.role)) {
    redirect({ href: DASHBOARD_HOME[session.role], locale })
  }
  return session
}
