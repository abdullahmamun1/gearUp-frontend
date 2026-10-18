import {
  first,
  matching,
  oneOf,
  parsePage,
  toQueryString,
  UUID,
  type QueryParams,
  type RawSearchParams,
} from "@/utils/searchParams"
import { RENTAL_STATUSES } from "@/utils/rental"
import type { ContactStatus, RentalStatus, Role, UserStatus } from "@/types"

export type { RawSearchParams }
export { RENTAL_STATUSES }

export const ADMIN_PAGE_SIZE = 10

export const ADMIN_USERS_PATH = "/dashboard/admin/users"
export const ADMIN_GEAR_PATH = "/dashboard/admin/gear"
export const ADMIN_RENTALS_PATH = "/dashboard/admin/rentals"
export const ADMIN_CATEGORIES_PATH = "/dashboard/admin/categories"
export const ADMIN_ANALYTICS_PATH = "/dashboard/admin/analytics"
export const ADMIN_REVIEWS_PATH = "/dashboard/admin/reviews"
export const ADMIN_CLAIMS_PATH = "/dashboard/admin/claims"
export const ADMIN_INBOX_PATH = "/dashboard/admin/inbox"
export const ADMIN_SUBSCRIBERS_PATH = "/dashboard/admin/subscribers"

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

export const REVIEW_VISIBILITIES = ["visible", "hidden"] as const
export const REVIEW_RATINGS = ["1", "2", "3", "4", "5"] as const
export type AdminReviewsFilters = {
  visibility?: (typeof REVIEW_VISIBILITIES)[number]
  rating?: (typeof REVIEW_RATINGS)[number]
  searchTerm?: string
  page: number
}

export const CLAIM_STATUSES = ["open", "resolved"] as const
export type AdminClaimsFilters = {
  status?: (typeof CLAIM_STATUSES)[number]
  page: number
}

export const CONTACT_STATUSES: ContactStatus[] = ["NEW", "REPLIED", "ARCHIVED"]
export type AdminInboxFilters = {
  status?: ContactStatus
  searchTerm?: string
  page: number
}

export const SUBSCRIBER_STATUSES = [
  "confirmed",
  "pending",
  "unsubscribed",
] as const
export type AdminSubscribersFilters = {
  status?: (typeof SUBSCRIBER_STATUSES)[number]
  searchTerm?: string
  page: number
}

/** Inclusive calendar days, "YYYY-MM-DD"; empty means the last ~6 months. */
export type AnalyticsRange = { from?: string; to?: string }

const DATE_KEY = /^\d{4}-\d{2}-\d{2}$/

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

export function parseAdminReviewsFilters(
  raw: RawSearchParams
): AdminReviewsFilters {
  return {
    visibility: oneOf(first(raw.visibility), REVIEW_VISIBILITIES),
    rating: oneOf(first(raw.rating), REVIEW_RATINGS),
    searchTerm: first(raw.searchTerm)?.slice(0, 100),
    page: parsePage(raw),
  }
}

export function parseAdminClaimsFilters(
  raw: RawSearchParams
): AdminClaimsFilters {
  return {
    status: oneOf(first(raw.status), CLAIM_STATUSES),
    page: parsePage(raw),
  }
}

export function parseAdminInboxFilters(
  raw: RawSearchParams
): AdminInboxFilters {
  return {
    status: oneOf(first(raw.status), CONTACT_STATUSES),
    searchTerm: first(raw.searchTerm)?.slice(0, 100),
    page: parsePage(raw),
  }
}

export function parseAdminSubscribersFilters(
  raw: RawSearchParams
): AdminSubscribersFilters {
  return {
    status: oneOf(first(raw.status), SUBSCRIBER_STATUSES),
    searchTerm: first(raw.searchTerm)?.slice(0, 100),
    page: parsePage(raw),
  }
}

export function parseAnalyticsRange(raw: RawSearchParams): AnalyticsRange {
  const from = matching(first(raw.from), DATE_KEY)
  const to = matching(first(raw.to), DATE_KEY)
  // A reversed range is dropped rather than sent for a 400.
  if (from && to && from > to) return {}
  return { from, to }
}

const DAY_MS = 24 * 60 * 60 * 1000
const DHAKA_OFFSET_MS = 6 * 60 * 60 * 1000

/** Today's calendar day in Dhaka, "YYYY-MM-DD". */
export function dhakaToday(now = Date.now()) {
  return new Date(now + DHAKA_OFFSET_MS).toISOString().slice(0, 10)
}

/** `label` is a key under `admin.analytics.presets`, with `count` for it. */
export type AnalyticsPreset = {
  label: "days" | "months" | "thisYear"
  count?: number
  range: AnalyticsRange
}

/** Quick ranges, relative to `today` ("YYYY-MM-DD"). */
export function analyticsPresets(today: string): AnalyticsPreset[] {
  const day = new Date(`${today}T00:00:00Z`)
  const back = (days: number) =>
    new Date(day.getTime() - days * DAY_MS).toISOString().slice(0, 10)
  const monthsBack = (months: number) =>
    new Date(Date.UTC(day.getUTCFullYear(), day.getUTCMonth() - months, 1))
      .toISOString()
      .slice(0, 10)
  return [
    { label: "days", count: 30, range: { from: back(29), to: today } },
    { label: "months", count: 3, range: { from: monthsBack(2), to: today } },
    { label: "months", count: 6, range: {} },
    {
      label: "thisYear",
      range: { from: `${today.slice(0, 4)}-01-01`, to: today },
    },
    { label: "months", count: 12, range: { from: monthsBack(11), to: today } },
  ]
}

export function toAdminQuery(filters: QueryParams) {
  return toQueryString({ ...filters, limit: ADMIN_PAGE_SIZE })
}
