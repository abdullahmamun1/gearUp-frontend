import jwt from "jsonwebtoken"

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
