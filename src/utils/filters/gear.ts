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

/** `labelKey` is a message key in the `gear` namespace. */
export const SORT_OPTIONS = [
  { value: "createdAt:desc", labelKey: "sort.newest" },
  { value: "pricePerDay:asc", labelKey: "sort.priceAsc" },
  { value: "pricePerDay:desc", labelKey: "sort.priceDesc" },
  { value: "name:asc", labelKey: "sort.nameAsc" },
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
  /** Providers in this city (one of BD_CITIES). */
  city?: string
  /** "lat,lng" (5 decimals): gear within `radius` km, nearest first. */
  near?: string
  radius?: string
  /** List (default) or the map of pickup spots. */
  view?: "map"
}

/** Search radius options for "near me", in km. */
export const RADIUS_OPTIONS = ["5", "10", "25", "50"] as const
export const DEFAULT_RADIUS = "25"
/** The map shows every match on one screen, not a page of them. */
export const MAP_PAGE_SIZE = 100

const DECIMAL = /^\d+(\.\d+)?$/
const LAT_LNG = /^-?\d{1,2}\.\d{1,6},-?\d{1,3}\.\d{1,6}$/
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
    city: first(raw.city)?.slice(0, 60) || undefined,
    near: matching(first(raw.near), LAT_LNG),
    radius: RADIUS_OPTIONS.find((option) => option === first(raw.radius)),
    view: first(raw.view) === "map" ? "map" : undefined,
  }
}

const BENGALI_DIGITS = "০১২৩৪৫৬৭৮৯"

/**
 * A typed price as the URL wants it: Bengali digits become Latin, and
 * thousands separators, spaces and "৳"/"BDT" are dropped ("৳১,০০০" → "1000").
 * Anything that still isn't a number gives undefined.
 */
export function normalizePrice(value: string): string | undefined {
  const latin = value.replace(/[০-৯]/g, (digit) =>
    String(BENGALI_DIGITS.indexOf(digit))
  )
  const cleaned = latin.replace(/[^\d.]/g, "")
  return DECIMAL.test(cleaned) ? cleaned : undefined
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
    city: filters.city,
    near: filters.near,
    radius: filters.near ? (filters.radius ?? DEFAULT_RADIUS) : undefined,
    page: filters.view === "map" ? "1" : String(filters.page),
    limit: String(filters.view === "map" ? MAP_PAGE_SIZE : GEAR_PAGE_SIZE),
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
    city: filters.city,
    near: filters.near,
    radius: filters.near ? filters.radius : undefined,
    view: filters.view,
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
    filters.city ||
    filters.near ||
    filters.sort !== DEFAULT_SORT
  )
}

/**
 * The unfiltered first page: what /gear prerenders. Lives here, not in the
 * client component, because a server page can't read plain values exported
 * from a "use client" module.
 */
export const DEFAULT_GEAR_FILTERS: GearFilters = parseGearFilters({})
