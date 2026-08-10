"use client"

import { keepPreviousData, useQuery } from "@tanstack/react-query"

import {
  toDashboardQuery,
  type PaymentTableFilters,
  type RentalTableFilters,
} from "@/lib/dashboardQuery"
import { queryFetch } from "@/lib/queries/fetcher"
import type { Paginated, Payment, RentalOrder } from "@/types"

export const myRentalsKeys = {
  all: ["my-rentals"] as const,
  list: (filters: RentalTableFilters) =>
    [...myRentalsKeys.all, filters] as const,
}

const myPaymentsKeys = {
  all: ["my-payments"] as const,
  list: (filters: PaymentTableFilters) =>
    [...myPaymentsKeys.all, filters] as const,
}

export function useMyRentals(
  filters: RentalTableFilters,
  initialData?: Paginated<RentalOrder>
) {
  return useQuery({
    queryKey: myRentalsKeys.list(filters),
    queryFn: () =>
      queryFetch<Paginated<RentalOrder>>(
        `/api/customer/rentals?${toDashboardQuery(filters)}`
      ),
    initialData,
    placeholderData: keepPreviousData,
  })
}

export function useMyPayments(
  filters: PaymentTableFilters,
  initialData?: Paginated<Payment>
) {
  return useQuery({
    queryKey: myPaymentsKeys.list(filters),
    queryFn: () =>
      queryFetch<Paginated<Payment>>(
        `/api/customer/payments?${toDashboardQuery(filters)}`
      ),
    refetchInterval: (query) =>
      query.state.data?.data.some((payment) => payment.status === "PENDING")
        ? 5000
        : false,
    initialData,
    placeholderData: keepPreviousData,
  })
}
