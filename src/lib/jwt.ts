import jwt, { type JwtPayload } from "jsonwebtoken"

import type { JwtUser, Role } from "@/types"

const ROLES: Role[] = ["CUSTOMER", "PROVIDER", "ADMIN"]

export type VerifyResult =
  { success: true; data: JwtPayload } | { success: false; data: null }

export const jwtUtils = {
  verifyToken(token: string, secret: string): VerifyResult {
    try {
      const payload = jwt.verify(token, secret)
      if (typeof payload === "string") return { success: false, data: null }
      return { success: true, data: payload }
    } catch {
      return { success: false, data: null }
    }
  },
}

export function verifyAccessToken(token: string): JwtUser | null {
  const secret = process.env.JWT_ACCESS_SECRET
  if (!secret) return null

  const result = jwtUtils.verifyToken(token, secret)
  if (!result.success) return null

  const { id, name, email, role, iat, exp } = result.data
  if (
    typeof id !== "string" ||
    typeof name !== "string" ||
    typeof email !== "string" ||
    !ROLES.includes(role as Role)
  ) {
    return null
  }

  return { id, name, email, role: role as Role, iat: iat ?? 0, exp: exp ?? 0 }
}
