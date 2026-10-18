"use client"

import { useTranslations } from "@/i18n/translations"

import { DataTable } from "@/components/shared/DataTable"
import { EmptyState } from "@/components/shared/EmptyState"
import { OrderItemsSummary } from "@/components/shared/OrderItemsSummary"
import { Pagination } from "@/components/shared/Pagination"
import { PaymentStatusBadge } from "@/components/shared/PaymentStatusBadge"
import { RentalStatusBadge } from "@/components/shared/RentalStatusBadge"
import { TableCell, TableRow } from "@/components/ui/table"
import {
  ADMIN_RENTALS_PATH,
  type AdminRentalsFilters,
} from "@/utils/filters/admin"
import { useFormat } from "@/i18n/useFormat"
import { useAdminRentals } from "@/hooks/queries/adminTables"
import { buildHref } from "@/utils/searchParams"
import type { Paginated, RentalOrder } from "@/types"

export function AdminRentalsList({
  filters,
  initialData,
}: {
  filters: AdminRentalsFilters
  initialData: Paginated<RentalOrder>
}) {
  const { data, error, isFetching } = useAdminRentals(filters, initialData)
  const t = useTranslations("admin.rentals")
  const format = useFormat()
  const headings = [
    t("headingOrder"),
    t("headingCustomer"),
    t("headingGear"),
    t("headingDates"),
    t("headingStatus"),
    t("headingPayment"),
    { label: t("headingTotal"), align: "right" },
  ] as const

  if (error) {
    return <EmptyState>{error.message || t("loadError")}</EmptyState>
  }

  const orders = data?.data ?? []
  const meta = data?.meta

  if (orders.length === 0) {
    return (
      <EmptyState>{filters.status ? t("noStatus") : t("noneYet")}</EmptyState>
    )
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
        {orders.map((order) => {
          const payment = order.payments?.at(-1)

          return (
            <TableRow key={order.id} className="hover:bg-transparent">
              <TableCell>
                <span className="font-medium">{order.id.slice(0, 8)}</span>
                <p className="text-xs text-muted-foreground">
                  {format.date(order.createdAt)}
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
                {format.date(order.startDate)} → {format.date(order.endDate)}
              </TableCell>
              <TableCell>
                <RentalStatusBadge status={order.status} />
              </TableCell>
              <TableCell>
                {payment ? (
                  <PaymentStatusBadge status={payment.status} />
                ) : (
                  <span className="text-xs text-muted-foreground">
                    {t("notStarted")}
                  </span>
                )}
              </TableCell>
              <TableCell className="text-right tabular-nums">
                {format.price(order.totalAmount)}
              </TableCell>
            </TableRow>
          )
        })}
      </DataTable>

      <Pagination
        page={filters.page}
        totalPages={meta?.totalPages ?? 1}
        hrefFor={(page) => buildHref(ADMIN_RENTALS_PATH, { ...filters, page })}
        label={t("pagination")}
      />
    </>
  )
}
