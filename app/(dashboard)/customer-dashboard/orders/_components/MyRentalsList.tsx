"use client"

import Link from "next/link"

import { DataTable } from "@/components/shared/DataTable"
import { EmptyState } from "@/components/shared/EmptyState"
import { OrderItemsSummary } from "@/components/shared/OrderItemsSummary"
import { Pagination } from "@/components/shared/Pagination"
import { RentalStatusBadge } from "@/components/shared/RentalStatusBadge"
import { TableCell, TableRow } from "@/components/ui/table"
import {
  CUSTOMER_ORDERS_PATH,
  type RentalTableFilters,
} from "@/lib/dashboardQuery"
import { formatDate, formatPrice } from "@/lib/format"
import { useMyRentals } from "@/lib/queries/customer"
import { buildHref } from "@/lib/searchParams"
import type { Paginated, RentalOrder } from "@/types"

const HEADINGS = [
  "Order",
  "Gear",
  "Dates",
  "Status",
  { label: "Total", align: "right" },
] as const

export function MyRentalsList({
  filters,
  initialData,
}: {
  filters: RentalTableFilters
  initialData: Paginated<RentalOrder>
}) {
  const { data, error, isFetching } = useMyRentals(filters, initialData)

  if (error) {
    return (
      <EmptyState>
        {error.message || "Couldn't load your rentals. Please try again."}
      </EmptyState>
    )
  }

  const orders = data?.data ?? []
  const meta = data?.meta

  if (orders.length === 0) {
    return (
      <EmptyState>
        {filters.status
          ? "No rentals match that status."
          : "You haven't rented anything yet."}
      </EmptyState>
    )
  }

  return (
    <>
      <DataTable
        headings={HEADINGS}
        count={{
          total: meta?.total ?? orders.length,
          one: "rental",
          many: "rentals",
        }}
        isFetching={isFetching}
      >
        {orders.map((order) => (
          <TableRow
            key={order.id}
            className="relative cursor-pointer focus-within:bg-muted/50"
          >
            <TableCell>
              <Link
                href={`/customer-dashboard/orders/${order.id}`}
                className="font-medium after:absolute after:inset-0"
              >
                {order.id.slice(0, 8)}
              </Link>
              <p className="text-xs text-muted-foreground">
                {formatDate(order.createdAt)}
              </p>
            </TableCell>
            <TableCell>
              <OrderItemsSummary items={order.items ?? []} />
            </TableCell>
            <TableCell className="whitespace-nowrap">
              {formatDate(order.startDate)} → {formatDate(order.endDate)}
            </TableCell>
            <TableCell>
              <RentalStatusBadge status={order.status} />
            </TableCell>
            <TableCell className="text-right tabular-nums">
              {formatPrice(order.totalAmount)}
            </TableCell>
          </TableRow>
        ))}
      </DataTable>

      <Pagination
        page={filters.page}
        totalPages={meta?.totalPages ?? 1}
        hrefFor={(page) =>
          buildHref(CUSTOMER_ORDERS_PATH, { ...filters, page })
        }
        label="Rentals pagination"
      />
    </>
  )
}
