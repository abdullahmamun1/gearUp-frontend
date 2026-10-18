"use client"

import { useTranslations } from "@/i18n/translations"

import { Link } from "@/i18n/navigation"
import { useFormat } from "@/i18n/useFormat"

import { DataTable } from "@/components/shared/DataTable"
import { EmptyState } from "@/components/shared/EmptyState"
import { OrderItemsSummary } from "@/components/shared/OrderItemsSummary"
import { Pagination } from "@/components/shared/Pagination"
import { RentalStatusBadge } from "@/components/shared/RentalStatusBadge"
import { TableCell, TableRow } from "@/components/ui/table"
import {
  CUSTOMER_ORDERS_PATH,
  type RentalTableFilters,
} from "@/utils/filters/dashboard"
import { useUnreadMessages } from "@/hooks/queries/messages"
import { useMyRentals } from "@/hooks/queries/customer"
import { buildHref } from "@/utils/searchParams"
import type { Paginated, RentalOrder } from "@/types"

export function MyRentalsList({
  filters,
  initialData,
}: {
  filters: RentalTableFilters
  initialData: Paginated<RentalOrder>
}) {
  const t = useTranslations("dashboard.customer.orders")
  const format = useFormat()
  const { data, error, isFetching } = useMyRentals(filters, initialData)
  const headings = [
    t("headingOrder"),
    t("headingGear"),
    t("headingDates"),
    t("headingStatus"),
    { label: t("headingTotal"), align: "right" },
  ] as const
  const unread = useUnreadMessages()

  if (error) {
    return <EmptyState>{error.message || t("loadFailed")}</EmptyState>
  }

  const orders = data?.data ?? []
  const meta = data?.meta

  if (orders.length === 0) {
    return <EmptyState>{filters.status ? t("noMatch") : t("none")}</EmptyState>
  }

  return (
    <>
      <DataTable
        headings={headings}
        count={{
          total: meta?.total ?? orders.length,
          one: t("countOne"),
          many: t("countMany"),
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
                href={`/dashboard/customer/orders/${order.id}`}
                transitionTypes={["nav-forward"]}
                className="font-medium after:absolute after:inset-0"
              >
                {order.id.slice(0, 8)}
              </Link>
              {unread.byOrder[order.id] ? (
                <span
                  className="ml-1.5 inline-grid h-4.5 min-w-4.5 place-items-center rounded-full bg-ember px-1 align-middle text-[10px] font-bold text-ember-foreground"
                  aria-label={t("unread", {
                    count: format.number(unread.byOrder[order.id]!),
                  })}
                >
                  {format.number(unread.byOrder[order.id]!)}
                </span>
              ) : null}
              <p className="text-xs text-muted-foreground">
                {format.date(order.createdAt)}
              </p>
            </TableCell>
            <TableCell>
              <OrderItemsSummary items={order.items ?? []} />
            </TableCell>
            <TableCell className="whitespace-nowrap">
              {format.date(order.startDate)} → {format.date(order.endDate)}
            </TableCell>
            <TableCell>
              <RentalStatusBadge status={order.status} />
            </TableCell>
            <TableCell className="text-right tabular-nums">
              {format.price(order.totalAmount)}
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
        label={t("pagination")}
      />
    </>
  )
}
