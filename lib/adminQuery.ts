import {
  first,
  matching,
  POSITIVE_INT,
  type RawSearchParams,
} from "@/lib/searchParams"
import type { RentalStatus, Role, UserStatus } from "@/types"

export type { RawSearchParams }

export const ADMIN_PAGE_SIZE = 10

export const ADMIN_USERS_PATH = "/admin-dashboard/users"
export const ADMIN_GEAR_PATH = "/admin-dashboard/gear"
export const ADMIN_RENTALS_PATH = "/admin-dashboard/rentals"

export const USER_ROLES: Role[] = ["CUSTOMER", "PROVIDER", "ADMIN"]
export const USER_STATUSES: UserStatus[] = ["ACTIVE", "SUSPENDED"]
export const RENTAL_STATUSES: RentalStatus[] = [
  "PLACED",
  "CONFIRMED",
  "PAID",
  "PICKED_UP",
  "RETURNED",
  "CANCELLED",
]

export type AdminUsersFilters = {
  role?: Role
  status?: UserStatus
  page: number
}
export type AdminGearFilters = { page: number }
export type AdminRentalsFilters = { status?: RentalStatus; page: number }

function parsePage(raw: RawSearchParams) {
  const page = matching(first(raw.page), POSITIVE_INT)
  return page ? Number(page) : 1
}

function oneOf<T extends string>(
  value: string | undefined,
  allowed: readonly T[]
) {
  return allowed.includes(value as T) ? (value as T) : undefined
}

export function parseAdminUsersFilters(
  raw: RawSearchParams
): AdminUsersFilters {
  return {
    role: oneOf(first(raw.role), USER_ROLES),
    status: oneOf(first(raw.status), USER_STATUSES),
    page: parsePage(raw),
  }
}

export function parseAdminGearFilters(raw: RawSearchParams): AdminGearFilters {
  return { page: parsePage(raw) }
}

export function parseAdminRentalsFilters(
  raw: RawSearchParams
): AdminRentalsFilters {
  return {
    status: oneOf(first(raw.status), RENTAL_STATUSES),
    page: parsePage(raw),
  }
}

export function buildAdminHref(
  basePath: string,
  params: Record<string, string | number | undefined>
) {
  const search = new URLSearchParams()

  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === "") continue
    if (key === "page" && Number(value) <= 1) continue
    search.set(key, String(value))
  }

  const query = search.toString()
  return query ? `${basePath}?${query}` : basePath
}

export function toAdminQuery(
  filters: Record<string, string | number | undefined>
) {
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(filters)) {
    if (value !== undefined && value !== "") params.set(key, String(value))
  }
  params.set("limit", String(ADMIN_PAGE_SIZE))
  return params.toString()
}
