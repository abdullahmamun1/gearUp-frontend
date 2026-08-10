"use client"

import { DataTable } from "@/components/shared/DataTable"
import { EmptyState } from "@/components/shared/EmptyState"
import { Pagination } from "@/components/shared/Pagination"
import { RentalStatusBadge } from "@/components/shared/RentalStatusBadge"
import { TableCell, TableRow } from "@/components/ui/table"
import {
  PROVIDER_ORDERS_PATH,
  type RentalTableFilters,
} from "@/lib/dashboardQuery"
import { formatDate, formatPrice } from "@/lib/format"
import { useProviderOrders } from "@/lib/queries/providerOrders"
import { PROVIDER_NEXT_STATUS } from "@/lib/rental"
import { buildHref } from "@/lib/searchParams"
import type { Paginated, RentalOrder } from "@/types"

import { OrderStatusButton } from "./OrderStatusButton"

const HEADINGS = [
  "Order",
  "Customer",
  "Gear",
  "Dates",
  "Status",
  { label: "Total", align: "right" },
  { label: "Action", align: "right" },
] as const

export function ProviderOrdersList({
  filters,
  initialData,
}: {
  filters: RentalTableFilters
  initialData: Paginated<RentalOrder>
}) {
  const { data, error, isFetching } = useProviderOrders(filters, initialData)

  if (error) {
    return (
      <EmptyState>{error.message || "Couldn't load your orders."}</EmptyState>
    )
  }

  const orders = data?.data ?? []
  const meta = data?.meta

  if (orders.length === 0) {
    return (
      <EmptyState>
        {filters.status
          ? "No orders match that status."
          : "No one has booked your gear yet."}
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
          const items = order.items ?? []
          const first = items[0]?.gearItem?.name ?? "—"
          const extra = items.length - 1
          const action = PROVIDER_NEXT_STATUS[order.status]

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
                {first}
                {extra > 0 && (
                  <span className="text-muted-foreground"> +{extra} more</span>
                )}
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
              <TableCell className="text-right">
                {action ? (
                  <OrderStatusButton
                    orderId={order.id}
                    next={action.next}
                    label={action.label}
                  />
                ) : (
                  <span className="text-xs text-muted-foreground">
                    {order.status === "CONFIRMED" ? "Awaiting payment" : "—"}
                  </span>
                )}
              </TableCell>
            </TableRow>
          )
        })}
      </DataTable>

      <Pagination
        page={filters.page}
        totalPages={meta?.totalPages ?? 1}
        hrefFor={(page) =>
          buildHref(PROVIDER_ORDERS_PATH, { ...filters, page })
        }
        label="Orders pagination"
      />
    </>
  )
}
