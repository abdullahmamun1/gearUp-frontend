"use client"

import Link from "next/link"

import { DataTable } from "@/components/shared/DataTable"
import { EmptyState } from "@/components/shared/EmptyState"
import { OrderItemsSummary } from "@/components/shared/OrderItemsSummary"
import { Pagination } from "@/components/shared/Pagination"
import { PaymentStatusBadge } from "@/components/shared/PaymentStatusBadge"
import { TableCell, TableRow } from "@/components/ui/table"
import {
  CUSTOMER_PAYMENTS_PATH,
  type PaymentTableFilters,
} from "@/lib/dashboardQuery"
import { formatDate, formatPrice } from "@/lib/format"
import { useMyPayments } from "@/lib/queries/customer"
import { buildHref } from "@/lib/searchParams"
import type { Paginated, Payment } from "@/types"

const HEADINGS = [
  "Payment",
  "Order",
  "Gear",
  "Status",
  "Paid on",
  { label: "Amount", align: "right" },
] as const

export function MyPaymentsList({
  filters,
  initialData,
}: {
  filters: PaymentTableFilters
  initialData: Paginated<Payment>
}) {
  const { data, error, isFetching } = useMyPayments(filters, initialData)

  if (error) {
    return (
      <EmptyState>
        {error.message || "Couldn't load your payments. Please try again."}
      </EmptyState>
    )
  }

  const payments = data?.data ?? []
  const meta = data?.meta

  if (payments.length === 0) {
    return (
      <EmptyState>
        {filters.status
          ? "No payments match that status."
          : "No payments yet. They appear here once you pay for a confirmed booking."}
      </EmptyState>
    )
  }

  return (
    <>
      <DataTable
        headings={HEADINGS}
        count={{
          total: meta?.total ?? payments.length,
          one: "payment",
          many: "payments",
        }}
        isFetching={isFetching}
      >
        {payments.map((payment) => (
          <TableRow
            key={payment.id}
            className="relative cursor-pointer focus-within:bg-muted/50"
          >
            <TableCell>
              <Link
                href={`/customer-dashboard/payments/${payment.id}`}
                className="font-medium after:absolute after:inset-0"
              >
                {payment.id.slice(0, 8)}
              </Link>
              <p className="text-xs text-muted-foreground">
                {formatDate(payment.createdAt)}
              </p>
            </TableCell>
            <TableCell className="tabular-nums">
              {payment.rentalOrder?.id.slice(0, 8) ??
                payment.rentalOrderId?.slice(0, 8) ??
                "—"}
            </TableCell>
            <TableCell>
              <OrderItemsSummary items={payment.rentalOrder?.items ?? []} />
            </TableCell>
            <TableCell>
              <PaymentStatusBadge status={payment.status} />
            </TableCell>
            <TableCell className="whitespace-nowrap">
              {payment.paidAt ? formatDate(payment.paidAt) : "—"}
            </TableCell>
            <TableCell className="text-right tabular-nums">
              {formatPrice(payment.amount)}
            </TableCell>
          </TableRow>
        ))}
      </DataTable>

      <Pagination
        page={filters.page}
        totalPages={meta?.totalPages ?? 1}
        hrefFor={(page) =>
          buildHref(CUSTOMER_PAYMENTS_PATH, { ...filters, page })
        }
        label="Payments pagination"
      />
    </>
  )
}
