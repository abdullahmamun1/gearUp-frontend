import { cache } from "react"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import jwt from "jsonwebtoken"

import { ACCESS_TOKEN_COOKIE } from "@/lib/cookies"
import type { JwtUser, Role } from "@/types"

const ROLES: Role[] = ["CUSTOMER", "PROVIDER", "ADMIN"]

export function verifyAccessToken(token: string): JwtUser | null {
  const secret = process.env.JWT_ACCESS_SECRET
  if (!secret) return null

  try {
    const payload = jwt.verify(token, secret)
    if (typeof payload === "string") return null

    const { id, name, email, role, iat, exp } = payload
    if (
      typeof id !== "string" ||
      typeof name !== "string" ||
      typeof email !== "string" ||
      !ROLES.includes(role as Role)
    ) {
      return null
    }

    return { id, name, email, role: role as Role, iat: iat ?? 0, exp: exp ?? 0 }
  } catch {
    return null
  }
}

export const getSession = cache(async (): Promise<JwtUser | null> => {
  const cookieStore = await cookies()
  const token = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value
  if (!token) return null
  return verifyAccessToken(token)
})

export async function requireSession(...roles: Role[]): Promise<JwtUser> {
  const session = await getSession()
  if (!session) redirect("/login")
  if (roles.length > 0 && !roles.includes(session.role)) redirect("/")
  return session
}
