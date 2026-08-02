import {
  buildHref,
  first,
  matching,
  POSITIVE_INT,
  UUID,
  type RawSearchParams,
} from "@/lib/searchParams"

export type { RawSearchParams }

export const PROVIDER_GEAR_PAGE_SIZE = 10

export const PROVIDER_GEAR_SORT_OPTIONS = [
  { value: "createdAt:desc", label: "Newest first" },
  { value: "createdAt:asc", label: "Oldest first" },
  { value: "name:asc", label: "Name: A to Z" },
  { value: "pricePerDay:desc", label: "Price: high to low" },
  { value: "pricePerDay:asc", label: "Price: low to high" },
  { value: "stock:asc", label: "Stock: low to high" },
] as const

export type ProviderGearSort =
  (typeof PROVIDER_GEAR_SORT_OPTIONS)[number]["value"]

const DEFAULT_PROVIDER_GEAR_SORT: ProviderGearSort =
  PROVIDER_GEAR_SORT_OPTIONS[0].value

export const AVAILABILITY_OPTIONS = [
  { value: "all", label: "All listings" },
  { value: "true", label: "Available" },
  { value: "false", label: "Unavailable" },
] as const

export type Availability = (typeof AVAILABILITY_OPTIONS)[number]["value"]

export type ProviderGearFilters = {
  searchTerm?: string
  category?: string
  availability: Availability
  sort: ProviderGearSort
  page: number
}

export const PROVIDER_GEAR_PATH = "/provider-dashboard/gear"

export function parseProviderGearFilters(
  raw: RawSearchParams
): ProviderGearFilters {
  const sort = first(raw.sort)
  const availability = first(raw.isAvailable)
  const page = matching(first(raw.page), POSITIVE_INT)

  return {
    searchTerm: first(raw.searchTerm)?.slice(0, 100),
    category: matching(first(raw.category), UUID),
    availability: AVAILABILITY_OPTIONS.some(
      (option) => option.value === availability
    )
      ? (availability as Availability)
      : "all",
    sort: PROVIDER_GEAR_SORT_OPTIONS.some((option) => option.value === sort)
      ? (sort as ProviderGearSort)
      : DEFAULT_PROVIDER_GEAR_SORT,
    page: page ? Number(page) : 1,
  }
}

export function toProviderGearQuery(filters: ProviderGearFilters) {
  const [sortBy, sortOrder] = filters.sort.split(":")

  return {
    searchTerm: filters.searchTerm,
    category: filters.category,
    isAvailable:
      filters.availability === "all" ? undefined : filters.availability,
    sortBy,
    sortOrder: sortOrder as "asc" | "desc",
    page: String(filters.page),
    limit: String(PROVIDER_GEAR_PAGE_SIZE),
  }
}

export function buildProviderGearHref(filters: ProviderGearFilters) {
  return buildHref(PROVIDER_GEAR_PATH, {
    searchTerm: filters.searchTerm,
    category: filters.category,
    isAvailable:
      filters.availability === "all" ? undefined : filters.availability,
    sort:
      filters.sort === DEFAULT_PROVIDER_GEAR_SORT ? undefined : filters.sort,
    page: filters.page,
  })
}

export function hasActiveProviderGearFilters(filters: ProviderGearFilters) {
  return Boolean(
    filters.searchTerm ||
    filters.category ||
    filters.availability !== "all" ||
    filters.sort !== DEFAULT_PROVIDER_GEAR_SORT
  )
}
