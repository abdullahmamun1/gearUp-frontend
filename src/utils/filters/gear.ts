import {
  buildHref,
  first,
  matching,
  POSITIVE_INT,
  UUID,
  type RawSearchParams,
} from "@/utils/searchParams"
import { RENTAL_POLICY } from "@/utils/rental"
import type { GearQuery } from "@/types"

export type { RawSearchParams }

export const GEAR_PAGE_SIZE = 12

export const SORT_OPTIONS = [
  { value: "createdAt:desc", label: "Newest first" },
  { value: "pricePerDay:asc", label: "Price: low to high" },
  { value: "pricePerDay:desc", label: "Price: high to low" },
  { value: "name:asc", label: "Name: A to Z" },
] as const

export type SortValue = (typeof SORT_OPTIONS)[number]["value"]

export const DEFAULT_SORT: SortValue = SORT_OPTIONS[0].value

export type GearFilters = {
  searchTerm?: string
  category?: string
  brand?: string
  minPrice?: string
  maxPrice?: string
  /** "YYYY-MM-DD", both or neither — gear free on every day of [from, to). */
  from?: string
  to?: string
  availableOnly: boolean
  sort: SortValue
  page: number
}

const DECIMAL = /^\d+(\.\d+)?$/
const DATE_KEY = /^\d{4}-\d{2}-\d{2}$/

export function parseGearFilters(raw: RawSearchParams): GearFilters {
  const sort = first(raw.sort)
  const page = matching(first(raw.page), POSITIVE_INT)
  const from = matching(first(raw.from), DATE_KEY)
  const to = matching(first(raw.to), DATE_KEY)
  const spanDays =
    from && to ? (Date.parse(to) - Date.parse(from)) / 86_400_000 : 0
  const datesValid = spanDays >= 1 && spanDays <= RENTAL_POLICY.maxRentalDays

  return {
    searchTerm: first(raw.searchTerm)?.slice(0, 100),
    category: matching(first(raw.category), UUID),
    brand: first(raw.brand)?.slice(0, 80),
    minPrice: matching(first(raw.minPrice), DECIMAL),
    maxPrice: matching(first(raw.maxPrice), DECIMAL),
    from: datesValid ? from : undefined,
    to: datesValid ? to : undefined,
    availableOnly: first(raw.isAvailable) === "true",
    sort: SORT_OPTIONS.some((option) => option.value === sort)
      ? (sort as SortValue)
      : DEFAULT_SORT,
    page: page ? Number(page) : 1,
  }
}

export function toGearQuery(filters: GearFilters): GearQuery {
  const [sortBy, sortOrder] = filters.sort.split(":")

  return {
    searchTerm: filters.searchTerm,
    category: filters.category,
    brand: filters.brand,
    minPrice: filters.minPrice,
    maxPrice: filters.maxPrice,
    from: filters.from,
    to: filters.to,
    isAvailable: filters.availableOnly ? "true" : undefined,
    sortBy,
    sortOrder: sortOrder as "asc" | "desc",
    page: String(filters.page),
    limit: String(GEAR_PAGE_SIZE),
  }
}

export function buildGearHref(filters: GearFilters) {
  return buildHref("/gear", {
    searchTerm: filters.searchTerm,
    category: filters.category,
    brand: filters.brand,
    minPrice: filters.minPrice,
    maxPrice: filters.maxPrice,
    from: filters.from,
    to: filters.to,
    isAvailable: filters.availableOnly ? "true" : undefined,
    sort: filters.sort === DEFAULT_SORT ? undefined : filters.sort,
    page: filters.page,
  })
}

export function hasActiveFilters(filters: GearFilters) {
  return Boolean(
    filters.searchTerm ||
    filters.category ||
    filters.brand ||
    filters.minPrice ||
    filters.maxPrice ||
    filters.from ||
    filters.availableOnly ||
    filters.sort !== DEFAULT_SORT
  )
}

/**
 * The unfiltered first page: what /gear prerenders. Lives here, not in the
 * client component, because a server page can't read plain values exported
 * from a "use client" module.
 */
export const DEFAULT_GEAR_FILTERS: GearFilters = parseGearFilters({})
