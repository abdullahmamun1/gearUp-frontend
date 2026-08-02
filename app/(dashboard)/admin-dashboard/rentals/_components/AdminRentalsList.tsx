"use client"

import { DataTable } from "@/components/shared/DataTable"
import { EmptyState } from "@/components/shared/EmptyState"
import { OrderItemsSummary } from "@/components/shared/OrderItemsSummary"
import { Pagination } from "@/components/shared/Pagination"
import { PaymentStatusBadge } from "@/components/shared/PaymentStatusBadge"
import { RentalStatusBadge } from "@/components/shared/RentalStatusBadge"
import { TableCell, TableRow } from "@/components/ui/table"
import { ADMIN_RENTALS_PATH, type AdminRentalsFilters } from "@/lib/adminQuery"
import { formatDate, formatPrice } from "@/lib/format"
import { useAdminRentals } from "@/lib/queries/adminTables"
import { buildHref } from "@/lib/searchParams"
import type { Paginated, RentalOrder } from "@/types"

const HEADINGS = [
  "Order",
  "Customer",
  "Gear",
  "Dates",
  "Status",
  "Payment",
  { label: "Total", align: "right" },
] as const

export function AdminRentalsList({
  filters,
  initialData,
}: {
  filters: AdminRentalsFilters
  initialData: Paginated<RentalOrder>
}) {
  const { data, error, isFetching } = useAdminRentals(filters, initialData)

  if (error) {
    return <EmptyState>{error.message || "Couldn't load rentals."}</EmptyState>
  }

  const orders = data?.data ?? []
  const meta = data?.meta

  if (orders.length === 0) {
    return (
      <EmptyState>
        {filters.status
          ? "No orders have that status."
          : "No one has booked anything yet."}
      </EmptyState>
    )
  }

  return (
    <>
      <DataTable
        headings={HEADINGS}
        count={{
          total: meta?.total ?? orders.length,
          one: "order",
          many: "orders",
        }}
        isFetching={isFetching}
      >
        {orders.map((order) => {
          const payment = order.payments?.at(-1)

          return (
            <TableRow key={order.id} className="hover:bg-transparent">
              <TableCell>
                <span className="font-medium">{order.id.slice(0, 8)}</span>
                <p className="text-xs text-muted-foreground">
                  {formatDate(order.createdAt)}
                </p>
              </TableCell>
              <TableCell>
                {order.customer?.name ?? "—"}
                <p className="text-xs text-muted-foreground">
                  {order.customer?.email}
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
              <TableCell>
                {payment ? (
                  <PaymentStatusBadge status={payment.status} />
                ) : (
                  <span className="text-xs text-muted-foreground">
                    Not started
                  </span>
                )}
              </TableCell>
              <TableCell className="text-right tabular-nums">
                {formatPrice(order.totalAmount)}
              </TableCell>
            </TableRow>
          )
        })}
      </DataTable>

      <Pagination
        page={filters.page}
        totalPages={meta?.totalPages ?? 1}
        hrefFor={(page) => buildHref(ADMIN_RENTALS_PATH, { ...filters, page })}
        label="Rentals pagination"
      />
    </>
  )
}
