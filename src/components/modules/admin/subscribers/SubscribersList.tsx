"use client"

import { MailCheck, MailQuestion, MailX } from "lucide-react"
import { useTranslations } from "@/i18n/translations"

import { StatCard } from "@/components/modules/dashboard/PageHeader"
import { DataTable } from "@/components/shared/DataTable"
import { EmptyState } from "@/components/shared/EmptyState"
import { Pagination } from "@/components/shared/Pagination"
import { Badge } from "@/components/ui/badge"
import { TableCell, TableRow } from "@/components/ui/table"
import { useSubscribers } from "@/hooks/queries/adminModeration"
import { useFormat } from "@/i18n/useFormat"
import type { Subscriber, SubscriberList } from "@/types"
import {
  ADMIN_SUBSCRIBERS_PATH,
  type AdminSubscribersFilters,
} from "@/utils/filters/admin"
import { buildHref } from "@/utils/searchParams"

export function SubscribersList({
  filters,
  initialData,
}: {
  filters: AdminSubscribersFilters
  initialData: SubscriberList
}) {
  const { data, error, isFetching } = useSubscribers(filters, initialData)
  const t = useTranslations("admin.subscribers")
  const format = useFormat()
  const headings = [
    t("headingEmail"),
    t("headingStatus"),
    t("headingSignedUp"),
    t("headingConfirmed"),
  ]

  if (error) {
    return <EmptyState>{error.message || t("loadError")}</EmptyState>
  }

  const subscribers = data?.data ?? []
  const counts = data?.counts

  return (
    <>
      {counts && (
        <div className="mb-6 grid gap-3 sm:gap-4 lg:grid-cols-3">
          <StatCard
            label={t("confirmed")}
            value={format.number(counts.confirmed)}
            hint={t("confirmedHint")}
            icon={MailCheck}
            tone="success"
            href={buildHref(ADMIN_SUBSCRIBERS_PATH, { status: "confirmed" })}
          />
          <StatCard
            label={t("awaiting")}
            value={format.number(counts.pending)}
            hint={t("awaitingHint")}
            icon={MailQuestion}
            tone="warning"
            href={buildHref(ADMIN_SUBSCRIBERS_PATH, { status: "pending" })}
          />
          <StatCard
            label={t("unsubscribed")}
            value={format.number(counts.unsubscribed)}
            icon={MailX}
            tone="muted"
            href={buildHref(ADMIN_SUBSCRIBERS_PATH, { status: "unsubscribed" })}
          />
        </div>
      )}

      {subscribers.length === 0 ? (
        <EmptyState>
          {filters.status || filters.searchTerm ? t("noMatch") : t("empty")}
        </EmptyState>
      ) : (
        <>
          <DataTable
            headings={headings}
            count={{
              total: data?.meta.total ?? subscribers.length,
              one: t("countOne"),
              many: t("countMany"),
            }}
            isFetching={isFetching}
          >
            {subscribers.map((subscriber) => (
              <TableRow key={subscriber.id} className="hover:bg-transparent">
                <TableCell className="font-medium">
                  {subscriber.email}
                </TableCell>
                <TableCell>
                  <SubscriberBadge subscriber={subscriber} />
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {format.date(subscriber.createdAt)}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {subscriber.confirmedAt
                    ? format.date(subscriber.confirmedAt)
                    : "—"}
                </TableCell>
              </TableRow>
            ))}
          </DataTable>

          <Pagination
            page={filters.page}
            totalPages={data?.meta.totalPages ?? 1}
            hrefFor={(page) =>
              buildHref(ADMIN_SUBSCRIBERS_PATH, { ...filters, page })
            }
            label={t("pagination")}
          />
        </>
      )}
    </>
  )
}

function SubscriberBadge({ subscriber }: { subscriber: Subscriber }) {
  const t = useTranslations("admin.subscribers")
  if (subscriber.unsubscribedAt)
    return <Badge variant="secondary">{t("unsubscribed")}</Badge>
  if (subscriber.confirmedAt)
    return <Badge variant="success">{t("confirmed")}</Badge>
  return <Badge variant="warning">{t("pending")}</Badge>
}
