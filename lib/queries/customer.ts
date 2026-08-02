"use client"

import { useQuery } from "@tanstack/react-query"

import { queryFetch } from "@/lib/queries/fetcher"
import type { Paginated, Payment, RentalOrder } from "@/types"

export const myRentalsKeys = { all: ["my-rentals"] as const }
const myPaymentsKeys = { all: ["my-payments"] as const }

export function useMyRentals(initialData?: Paginated<RentalOrder>) {
  return useQuery({
    queryKey: myRentalsKeys.all,
    queryFn: () => queryFetch<Paginated<RentalOrder>>("/api/customer/rentals"),
    initialData,
  })
}

export function useMyPayments(initialData?: Paginated<Payment>) {
  return useQuery({
    queryKey: myPaymentsKeys.all,
    queryFn: () => queryFetch<Paginated<Payment>>("/api/customer/payments"),
    refetchInterval: (query) =>
      query.state.data?.data.some((payment) => payment.status === "PENDING")
        ? 5000
        : false,
    initialData,
  })
}
