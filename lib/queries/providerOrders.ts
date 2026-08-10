"use client"

import { keepPreviousData, useQuery } from "@tanstack/react-query"

import { toDashboardQuery, type RentalTableFilters } from "@/lib/dashboardQuery"
import { queryFetch } from "@/lib/queries/fetcher"
import type { Paginated, RentalOrder } from "@/types"

export const providerOrdersKeys = {
  all: ["provider-orders"] as const,
  list: (filters: RentalTableFilters) =>
    [...providerOrdersKeys.all, filters] as const,
}

export function useProviderOrders(
  filters: RentalTableFilters,
  initialData?: Paginated<RentalOrder>
) {
  return useQuery({
    queryKey: providerOrdersKeys.list(filters),
    queryFn: () =>
      queryFetch<Paginated<RentalOrder>>(
        `/api/provider/orders?${toDashboardQuery(filters)}`
      ),
    initialData,
    placeholderData: keepPreviousData,
  })
}
