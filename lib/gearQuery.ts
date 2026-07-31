import {
  first,
  matching,
  POSITIVE_INT,
  UUID,
  type RawSearchParams,
} from "@/lib/searchParams"
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
  availableOnly: boolean
  sort: SortValue
  page: number
}

const DECIMAL = /^\d+(\.\d+)?$/

export function parseGearFilters(raw: RawSearchParams): GearFilters {
  const sort = first(raw.sort)
  const page = matching(first(raw.page), POSITIVE_INT)

  return {
    searchTerm: first(raw.searchTerm)?.slice(0, 100),
    category: matching(first(raw.category), UUID),
    brand: first(raw.brand)?.slice(0, 80),
    minPrice: matching(first(raw.minPrice), DECIMAL),
    maxPrice: matching(first(raw.maxPrice), DECIMAL),
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
    isAvailable: filters.availableOnly ? "true" : undefined,
    sortBy,
    sortOrder: sortOrder as "asc" | "desc",
    page: String(filters.page),
    limit: String(GEAR_PAGE_SIZE),
  }
}

export function buildGearHref(filters: GearFilters) {
  const params = new URLSearchParams()

  if (filters.searchTerm) params.set("searchTerm", filters.searchTerm)
  if (filters.category) params.set("category", filters.category)
  if (filters.brand) params.set("brand", filters.brand)
  if (filters.minPrice) params.set("minPrice", filters.minPrice)
  if (filters.maxPrice) params.set("maxPrice", filters.maxPrice)
  if (filters.availableOnly) params.set("isAvailable", "true")
  if (filters.sort !== DEFAULT_SORT) params.set("sort", filters.sort)
  if (filters.page > 1) params.set("page", String(filters.page))

  const query = params.toString()
  return query ? `/gear?${query}` : "/gear"
}

export function hasActiveFilters(filters: GearFilters) {
  return Boolean(
    filters.searchTerm ||
    filters.category ||
    filters.brand ||
    filters.minPrice ||
    filters.maxPrice ||
    filters.availableOnly ||
    filters.sort !== DEFAULT_SORT
  )
}
