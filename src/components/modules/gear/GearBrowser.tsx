"use client"

import { useSearchParams } from "next/navigation"
import { useMemo } from "react"

import { useGearList } from "@/hooks/queries/gear"
import {
  buildGearHref,
  DEFAULT_GEAR_FILTERS,
  parseGearFilters,
} from "@/utils/filters/gear"
import type { Category, GearItem, Paginated } from "@/types"

import { AiSearchSuggestions } from "./AiSearchSuggestions"
import { CategoryChips } from "./CategoryChips"
import { GearFilterBar } from "./GearFilterBar"
import { GearResults } from "./GearResults"
import { LocationBar } from "./LocationBar"

type Shared = {
  categories: Category[]
  brands: string[]
  /** Prerendered first page, used when the URL has no filters. */
  firstPage?: Paginated<GearItem>
}

/**
 * Filters live in the URL (shareable, back-button friendly); results load in
 * the browser so the page itself can be static.
 */
export function GearBrowser({ categories, brands, firstPage }: Shared) {
  const searchParams = useSearchParams()
  const filters = useMemo(
    () => parseGearFilters(Object.fromEntries(searchParams)),
    [searchParams]
  )
  const isDefault =
    buildGearHref(filters) === buildGearHref(DEFAULT_GEAR_FILTERS)
  const query = useGearList(filters, isDefault ? firstPage : undefined)

  return (
    <>
      <CategoryChips categories={categories} filters={filters} />
      <GearFilterBar filters={filters} brands={brands} />
      <AiSearchSuggestions filters={filters} />
      <LocationBar filters={filters} />
      <GearResults
        filters={filters}
        data={query.data}
        error={query.error?.message}
        isFetching={query.isFetching && !query.isPending}
      />
    </>
  )
}

/** What the server prerenders and what shows before the URL is read. */
export function GearBrowserFallback({ categories, brands, firstPage }: Shared) {
  return (
    <>
      <CategoryChips categories={categories} filters={DEFAULT_GEAR_FILTERS} />
      <GearFilterBar filters={DEFAULT_GEAR_FILTERS} brands={brands} />
      <LocationBar filters={DEFAULT_GEAR_FILTERS} />
      <GearResults filters={DEFAULT_GEAR_FILTERS} data={firstPage} />
    </>
  )
}
