import {
  first,
  matching,
  oneOf,
  parsePage,
  toQueryString,
  UUID,
  type QueryParams,
  type RawSearchParams,
} from "@/lib/searchParams"
import { RENTAL_STATUSES } from "@/lib/rental"
import type { RentalStatus, Role, UserStatus } from "@/types"

export type { RawSearchParams }
export { RENTAL_STATUSES }

export const ADMIN_PAGE_SIZE = 10

export const ADMIN_USERS_PATH = "/admin-dashboard/users"
export const ADMIN_GEAR_PATH = "/admin-dashboard/gear"
export const ADMIN_RENTALS_PATH = "/admin-dashboard/rentals"
export const ADMIN_CATEGORIES_PATH = "/admin-dashboard/categories"

export const USER_ROLES: Role[] = ["CUSTOMER", "PROVIDER", "ADMIN"]
export const USER_STATUSES: UserStatus[] = ["ACTIVE", "SUSPENDED"]
 
export const AVAILABILITY_VALUES = ["true", "false"] as const
export type AvailabilityValue = (typeof AVAILABILITY_VALUES)[number]

export type AdminUsersFilters = {
  role?: Role
  status?: UserStatus
  page: number
}
export type AdminGearFilters = {
  searchTerm?: string
  category?: string
  isAvailable?: AvailabilityValue
  page: number
}
export type AdminRentalsFilters = { status?: RentalStatus; page: number }
export type AdminCategoriesFilters = { searchTerm?: string; page: number }

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
  return {
    searchTerm: first(raw.searchTerm)?.slice(0, 100),
    category: matching(first(raw.category), UUID),
    isAvailable: oneOf(first(raw.isAvailable), AVAILABILITY_VALUES),
    page: parsePage(raw),
  }
}

export function parseAdminRentalsFilters(
  raw: RawSearchParams
): AdminRentalsFilters {
  return {
    status: oneOf(first(raw.status), RENTAL_STATUSES),
    page: parsePage(raw),
  }
}

export function parseAdminCategoriesFilters(
  raw: RawSearchParams
): AdminCategoriesFilters {
  return {
    searchTerm: first(raw.searchTerm)?.slice(0, 100),
    page: parsePage(raw),
  }
}

export function toAdminQuery(filters: QueryParams) {
  return toQueryString({ ...filters, limit: ADMIN_PAGE_SIZE })
}
