"use client"

import { keepPreviousData, useQuery } from "@tanstack/react-query"

import {
  toProviderGearQuery,
  type ProviderGearFilters,
} from "@/utils/filters/providerGear"
import { queryFetch } from "@/hooks/queries/fetcher"
import { toQueryString } from "@/utils/searchParams"
import type { GearItem, Paginated } from "@/types"

export const providerGearKeys = {
  all: ["provider-gear"] as const,
  list: (filters: ProviderGearFilters) =>
    [...providerGearKeys.all, filters] as const,
}

export function useProviderGear(
  filters: ProviderGearFilters,
  initialData?: Paginated<GearItem>
) {
  const params = toQueryString(toProviderGearQuery(filters))

  return useQuery({
    queryKey: providerGearKeys.list(filters),
    queryFn: () =>
      queryFetch<Paginated<GearItem>>(`/api/provider/gear?${params}`),
    initialData,
    placeholderData: keepPreviousData,
  })
}
