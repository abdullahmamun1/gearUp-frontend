import type { Metadata } from "next"
import { getTranslations } from "@/i18n/getTranslations"

import type { AppLocale, LocaleParams } from "@/i18n/routing"
import { Suspense } from "react"

import { InboxTable } from "@/components/modules/admin/inbox/InboxTable"
import { PageHeader } from "@/components/modules/dashboard/PageHeader"
import { PanelSkeleton } from "@/components/modules/dashboard/Skeletons"
import { TableFilters } from "@/components/modules/dashboard/TableFilters"
import {
  ADMIN_INBOX_PATH,
  parseAdminInboxFilters,
  type RawSearchParams,
} from "@/utils/filters/admin"
import { first, matching, UUID } from "@/utils/searchParams"

export async function generateMetadata({
  params,
}: LocaleParams): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({
    locale: locale as AppLocale,
    namespace: "admin.meta",
  })
  return { title: t("inbox") }
}

export default async function AdminInboxPage({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>
}) {
  const raw = await searchParams
  const filters = parseAdminInboxFilters(raw)
  const selectedId = matching(first(raw.id), UUID)
  const t = await getTranslations("admin.inbox")
  const tc = await getTranslations("common.actions")

  return (
    <>
      <PageHeader title={t("title")} description={t("description")} />

      <TableFilters
        basePath={ADMIN_INBOX_PATH}
        search={{
          name: "searchTerm",
          label: tc("search"),
          placeholder: t("searchPlaceholder"),
          value: filters.searchTerm,
        }}
        specs={[
          {
            name: "status",
            label: t("status"),
            value: filters.status,
            options: [
              { value: "NEW", label: t("statusNew") },
              { value: "REPLIED", label: t("statusReplied") },
              { value: "ARCHIVED", label: t("statusArchived") },
            ],
          },
        ]}
      />

      <Suspense
        key={JSON.stringify(filters)}
        fallback={<PanelSkeleton rows={5} />}
      >
        <InboxTable filters={filters} selectedId={selectedId} />
      </Suspense>
    </>
  )
}
