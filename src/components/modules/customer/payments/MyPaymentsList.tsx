"use client"

import { useTranslations } from "@/i18n/translations"

import { Link } from "@/i18n/navigation"
import { useFormat } from "@/i18n/useFormat"

import { DataTable } from "@/components/shared/DataTable"
import { EmptyState } from "@/components/shared/EmptyState"
import { OrderItemsSummary } from "@/components/shared/OrderItemsSummary"
import { Pagination } from "@/components/shared/Pagination"
import { PaymentStatusBadge } from "@/components/shared/PaymentStatusBadge"
import { TableCell, TableRow } from "@/components/ui/table"
import {
  CUSTOMER_PAYMENTS_PATH,
  type PaymentTableFilters,
} from "@/utils/filters/dashboard"
import { useMyPayments } from "@/hooks/queries/customer"
import { buildHref } from "@/utils/searchParams"
import type { Paginated, Payment } from "@/types"

export function MyPaymentsList({
  filters,
  initialData,
}: {
  filters: PaymentTableFilters
  initialData: Paginated<Payment>
}) {
  const t = useTranslations("dashboard.customer.payments")
  const format = useFormat()
  const { data, error, isFetching } = useMyPayments(filters, initialData)
  const headings = [
    t("headingPayment"),
    t("headingOrder"),
    t("headingGear"),
    t("headingStatus"),
    t("headingPaidOn"),
    { label: t("headingAmount"), align: "right" },
  ] as const

  if (error) {
    return <EmptyState>{error.message || t("loadFailed")}</EmptyState>
  }

  const payments = data?.data ?? []
  const meta = data?.meta

  if (payments.length === 0) {
    return <EmptyState>{filters.status ? t("noMatch") : t("none")}</EmptyState>
  }

  return (
    <>
      <DataTable
        headings={headings}
        count={{
          total: meta?.total ?? payments.length,
          one: t("countOne"),
          many: t("countMany"),
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
                href={`/dashboard/customer/payments/${payment.id}`}
                transitionTypes={["nav-forward"]}
                className="font-medium after:absolute after:inset-0"
              >
                {payment.id.slice(0, 8)}
              </Link>
              <p className="text-xs text-muted-foreground">
                {format.date(payment.createdAt)}
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
              {payment.paidAt ? format.date(payment.paidAt) : "—"}
            </TableCell>
            <TableCell className="text-right tabular-nums">
              {format.price(payment.amount)}
              {Number(payment.refundedAmount ?? 0) > 0 && (
                <p className="text-xs text-muted-foreground">
                  {t("refunded", {
                    amount: format.price(payment.refundedAmount!),
                  })}
                </p>
              )}
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
        label={t("pagination")}
      />
    </>
  )
}
