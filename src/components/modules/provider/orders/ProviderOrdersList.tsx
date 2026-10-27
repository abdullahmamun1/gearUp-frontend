"use client"

import { useTranslations } from "@/i18n/translations"

import { Link } from "@/i18n/navigation"
import { useFormat } from "@/i18n/useFormat"

import { DataTable } from "@/components/shared/DataTable"
import { EmptyState } from "@/components/shared/EmptyState"
import { Pagination } from "@/components/shared/Pagination"
import { RentalStatusBadge } from "@/components/shared/RentalStatusBadge"
import { TableCell, TableRow } from "@/components/ui/table"
import {
  PROVIDER_ORDERS_PATH,
  type RentalTableFilters,
} from "@/utils/filters/dashboard"
import { useUnreadMessages } from "@/hooks/queries/messages"
import { useProviderOrders } from "@/hooks/queries/providerOrders"
import { buildHref } from "@/utils/searchParams"
import type { Paginated, RentalOrder } from "@/types"

import { DeclineOrderButton } from "./DeclineOrderButton"
import { OrderStatusButton } from "./OrderStatusButton"
import { ReturnOrderButton } from "./ReturnOrderButton"

export function ProviderOrdersList({
  filters,
  initialData,
}: {
  filters: RentalTableFilters
  initialData: Paginated<RentalOrder>
}) {
  const { data, error, isFetching } = useProviderOrders(filters, initialData)
  const unread = useUnreadMessages()
  const t = useTranslations("provider.orders")
  const format = useFormat()

  const headings = [
    t("headings.order"),
    t("headings.customer"),
    t("headings.gearDates"),
    t("headings.status"),
    { label: t("headings.total"), align: "right" },
    { label: t("headings.action"), align: "right" },
  ] as const

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
        {orders.map((order) => {
          const items = order.items ?? []
          const first = items[0]?.gearItem?.name ?? "—"
          const extra = items.length - 1

          return (
            <TableRow key={order.id} className="hover:bg-transparent">
              <TableCell>
                <Link
                  href={`${PROVIDER_ORDERS_PATH}/${order.id}`}
                  className="inline-flex items-center gap-1.5 font-medium text-primary hover:underline"
                >
                  {order.id.slice(0, 8)}
                  {unread.byOrder[order.id] ? (
                    <span
                      className="grid h-4.5 min-w-4.5 place-items-center rounded-full bg-ember px-1 text-[10px] font-bold text-ember-foreground"
                      aria-label={t("unread", {
                        count: format.number(unread.byOrder[order.id]),
                      })}
                    >
                      {format.number(unread.byOrder[order.id])}
                    </span>
                  ) : null}
                </Link>
                <p className="text-xs whitespace-nowrap text-muted-foreground">
                  {format.date(order.createdAt)}
                </p>
              </TableCell>
              <TableCell>
                {order.customer?.name ?? "—"}
                <p
                  className="max-w-44 truncate text-xs text-muted-foreground"
                  title={order.customer?.email}
                >
                  {order.customer?.email}
                </p>
              </TableCell>
              <TableCell className="min-w-40 whitespace-normal">
                {first}
                {extra > 0 && (
                  <span className="text-muted-foreground">
                    {" "}
                    {t("more", { count: format.number(extra) })}
                  </span>
                )}
                <p className="text-xs text-muted-foreground">
                  <span className="whitespace-nowrap">
                    {format.date(order.startDate)} →
                  </span>{" "}
                  <span className="whitespace-nowrap">
                    {format.date(order.endDate)}
                  </span>
                </p>
              </TableCell>
              <TableCell>
                <RentalStatusBadge status={order.status} />
              </TableCell>
              <TableCell className="text-right tabular-nums">
                {format.price(order.totalAmount)}
              </TableCell>
              <TableCell className="text-right">
                <OrderActions order={order} />
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
        label={t("pagination")}
      />
    </>
  )
}

/** The next step a provider can take on an order (table and detail page). */
export function OrderActions({ order }: { order: RentalOrder }) {
  const t = useTranslations("provider.orders")
  const tc = useTranslations("common.providerNextAction")
  const format = useFormat()

  switch (order.status) {
    case "PLACED":
      return (
        <div className="grid justify-items-end gap-1">
          <div className="flex justify-end gap-1">
            <DeclineOrderButton orderId={order.id} />
            <OrderStatusButton
              orderId={order.id}
              next="CONFIRMED"
              label={tc("PLACED")}
            />
          </div>
          {order.respondBy && (
            <span className="text-xs text-muted-foreground">
              {t("respondBy", { date: format.dateTime(order.respondBy) })}
            </span>
          )}
        </div>
      )
    case "CONFIRMED":
      return (
        <span className="text-xs text-muted-foreground">
          {t("awaitingPayment")}
          {order.paymentDueAt && (
            <span className="block">
              {t("due", { date: format.dateTime(order.paymentDueAt) })}
            </span>
          )}
        </span>
      )
    case "PAID":
      return (
        <OrderStatusButton
          orderId={order.id}
          next="PICKED_UP"
          label={tc("PAID")}
        />
      )
    case "PICKED_UP":
      return (
        <ReturnOrderButton
          orderId={order.id}
          deposit={
            order.depositStatus === "HELD" ? Number(order.depositAmount) : 0
          }
        />
      )
    default:
      return <span className="text-xs text-muted-foreground">—</span>
  }
}
