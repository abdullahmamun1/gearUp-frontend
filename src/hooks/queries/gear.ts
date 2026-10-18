"use client"

import { keepPreviousData, useQuery } from "@tanstack/react-query"

import { queryFetch } from "@/hooks/queries/fetcher"
import { toGearQuery, type GearFilters } from "@/utils/filters/gear"
import { toQueryString } from "@/utils/searchParams"
import type { GearAvailability, GearItem, Paginated } from "@/types"

export const gearAvailabilityKeys = {
  all: ["gear-availability"] as const,
  gear: (gearId: string) => [...gearAvailabilityKeys.all, gearId] as const,
}

export function useGearAvailability(gearId: string, from: string, to: string) {
  return useQuery({
    queryKey: [...gearAvailabilityKeys.gear(gearId), from, to],
    queryFn: () =>
      queryFetch<GearAvailability>(
        `/api/gear/${gearId}/availability?from=${from}&to=${to}`
      ),
    staleTime: 30 * 1000,
    refetchOnWindowFocus: true,
  })
}

export const gearListKeys = {
  all: ["gear-list"] as const,
  list: (filters: GearFilters) => [...gearListKeys.all, filters] as const,
}

/** Browse results; `initialData` is the prerendered first page, if it applies. */
export function useGearList(
  filters: GearFilters,
  initialData?: Paginated<GearItem>
) {
  return useQuery({
    queryKey: gearListKeys.list(filters),
    queryFn: () =>
      queryFetch<Paginated<GearItem>>(
        // `view` isn't a backend filter, but the route handler needs it to
        // fetch a whole map's worth of results instead of one page.
        `/api/gear?${toQueryString({ ...toGearQuery(filters), view: filters.view })}`
      ),
    initialData,
    placeholderData: keepPreviousData,
    staleTime: 60 * 1000,
  })
}
