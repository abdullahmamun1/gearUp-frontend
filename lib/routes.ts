import type { Role } from "@/types"

export const GOOGLE_START_PATH = "/api/auth/google/start"
export const GOOGLE_CALLBACK_PATH = "/api/auth/google/callback"

export const DASHBOARD_HOME: Record<Role, string> = {
  CUSTOMER: "/customer-dashboard",
  PROVIDER: "/provider-dashboard",
  ADMIN: "/admin-dashboard",
}

export const PROFILE_HOME: Record<Role, string> = {
  CUSTOMER: `${DASHBOARD_HOME.CUSTOMER}/profile`,
  PROVIDER: `${DASHBOARD_HOME.PROVIDER}/profile`,
  ADMIN: `${DASHBOARD_HOME.ADMIN}/profile`,
}

export function roleForPath(pathname: string): Role | null {
  for (const [role, home] of Object.entries(DASHBOARD_HOME) as [
    Role,
    string,
  ][]) {
    if (pathname === home || pathname.startsWith(`${home}/`)) return role
  }
  return null
}
