import { RENTAL_STATUSES } from "@/utils/rental"
import {
  first,
  oneOf,
  parsePage,
  toQueryString,
  type RawSearchParams,
} from "@/utils/searchParams"
import type { PaymentStatus, RentalStatus } from "@/types"

export type { RawSearchParams }

export const DASHBOARD_PAGE_SIZE = 10

export const CUSTOMER_ORDERS_PATH = "/dashboard/customer/orders"
export const CUSTOMER_PAYMENTS_PATH = "/dashboard/customer/payments"
export const PROVIDER_ORDERS_PATH = "/dashboard/provider/orders"

export const PAYMENT_STATUSES: PaymentStatus[] = [
  "PENDING",
  "COMPLETED",
  "FAILED",
]

export type RentalTableFilters = { status?: RentalStatus; page: number }
export type PaymentTableFilters = { status?: PaymentStatus; page: number }

export function parseRentalTableFilters(
  raw: RawSearchParams
): RentalTableFilters {
  return {
    status: oneOf(first(raw.status), RENTAL_STATUSES),
    page: parsePage(raw),
  }
}

export function parsePaymentTableFilters(
  raw: RawSearchParams
): PaymentTableFilters {
  return {
    status: oneOf(first(raw.status), PAYMENT_STATUSES),
    page: parsePage(raw),
  }
}

export function toDashboardQuery(filters: { status?: string; page: number }) {
  return toQueryString({
    status: filters.status,
    page: filters.page,
    limit: DASHBOARD_PAGE_SIZE,
  })
}
