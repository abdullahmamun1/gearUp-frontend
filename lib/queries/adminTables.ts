"use client"

import { keepPreviousData, useQuery } from "@tanstack/react-query"

import {
  toAdminQuery,
  type AdminGearFilters,
  type AdminRentalsFilters,
} from "@/lib/adminQuery"
import { queryFetch } from "@/lib/queries/fetcher"
import type { Category, GearItem, Paginated, RentalOrder } from "@/types"

const adminGearKeys = {
  all: ["admin-gear"] as const,
  list: (filters: AdminGearFilters) => [...adminGearKeys.all, filters] as const,
}

const adminRentalsKeys = {
  all: ["admin-rentals"] as const,
  list: (filters: AdminRentalsFilters) =>
    [...adminRentalsKeys.all, filters] as const,
}

export const categoriesKeys = { all: ["categories"] as const }

export function useAdminGear(
  filters: AdminGearFilters,
  initialData?: Paginated<GearItem>
) {
  return useQuery({
    queryKey: adminGearKeys.list(filters),
    queryFn: () =>
      queryFetch<Paginated<GearItem>>(
        `/api/admin/gear?${toAdminQuery({ ...filters })}`
      ),
    initialData,
    placeholderData: keepPreviousData,
  })
}

export function useAdminRentals(
  filters: AdminRentalsFilters,
  initialData?: Paginated<RentalOrder>
) {
  return useQuery({
    queryKey: adminRentalsKeys.list(filters),
    queryFn: () =>
      queryFetch<Paginated<RentalOrder>>(
        `/api/admin/rentals?${toAdminQuery({ ...filters })}`
      ),
    initialData,
    placeholderData: keepPreviousData,
  })
}

export function useCategories(initialData?: Category[]) {
  return useQuery({
    queryKey: categoriesKeys.all,
    queryFn: () => queryFetch<Category[]>("/api/admin/categories"),
    initialData,
  })
}
