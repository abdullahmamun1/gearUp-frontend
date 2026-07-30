import type { Role } from "@/types"

export const DASHBOARD_HOME: Record<Role, string> = {
  CUSTOMER: "/dashboard",
  PROVIDER: "/provider-dashboard",
  ADMIN: "/admin-dashboard",
}

export const AUTH_ROUTES = ["/login", "/register"]

export function dashboardOwner(pathname: string): Role | null {
  const entries = Object.entries(DASHBOARD_HOME) as [Role, string][]

  for (const [role, home] of entries) {
    if (pathname === home || pathname.startsWith(`${home}/`)) return role
  }

  return null
}
