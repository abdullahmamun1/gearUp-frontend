"use client"

import { keepPreviousData, useQuery } from "@tanstack/react-query"

import {
  providerGearApiHref,
  type ProviderGearFilters,
} from "@/utils/filters/providerGear"
import { queryFetch } from "@/hooks/queries/fetcher"
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
  return useQuery({
    queryKey: providerGearKeys.list(filters),
    queryFn: () =>
      queryFetch<Paginated<GearItem>>(providerGearApiHref(filters)),
    initialData,
    placeholderData: keepPreviousData,
  })
}
