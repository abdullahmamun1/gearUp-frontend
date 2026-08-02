"use client"

import Link from "next/link"

import { DataTable } from "@/components/shared/DataTable"
import { EmptyState } from "@/components/shared/EmptyState"
import { OrderItemsSummary } from "@/components/shared/OrderItemsSummary"
import { RentalStatusBadge } from "@/components/shared/RentalStatusBadge"
import { TableCell, TableRow } from "@/components/ui/table"
import { formatDate, formatPrice } from "@/lib/format"
import { useMyRentals } from "@/lib/queries/customer"
import type { Paginated, RentalOrder } from "@/types"

const HEADINGS = [
  "Order",
  "Gear",
  "Dates",
  "Status",
  { label: "Total", align: "right" },
] as const

export function MyRentalsList({
  initialData,
}: {
  initialData: Paginated<RentalOrder>
}) {
  const { data, error, isFetching } = useMyRentals(initialData)

  if (error) {
    return (
      <EmptyState>
        {error.message || "Couldn't load your rentals. Please try again."}
      </EmptyState>
    )
  }

  const orders = data?.data ?? []

  if (orders.length === 0) {
    return <EmptyState>You haven&apos;t rented anything yet.</EmptyState>
  }

  return (
    <DataTable headings={HEADINGS} isFetching={isFetching}>
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
  )
}
