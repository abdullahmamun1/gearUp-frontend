import type { Metadata } from "next"
import { getTranslations } from "@/i18n/getTranslations"

import type { AppLocale, LocaleParams } from "@/i18n/routing"
import { Suspense } from "react"

import { ExportMenu } from "@/components/modules/admin/analytics/ExportMenu"
import { SubscribersTable } from "@/components/modules/admin/subscribers/SubscribersTable"
import { PageHeader } from "@/components/modules/dashboard/PageHeader"
import { TableSkeleton } from "@/components/modules/dashboard/Skeletons"
import { TableFilters } from "@/components/modules/dashboard/TableFilters"
import {
  ADMIN_PAGE_SIZE,
  ADMIN_SUBSCRIBERS_PATH,
  parseAdminSubscribersFilters,
  type RawSearchParams,
} from "@/utils/filters/admin"

export async function generateMetadata({
  params,
}: LocaleParams): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({
    locale: locale as AppLocale,
    namespace: "admin.meta",
  })
  return { title: t("subscribers") }
}

export default async function AdminSubscribersPage({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>
}) {
  const filters = parseAdminSubscribersFilters(await searchParams)
  const t = await getTranslations("admin.subscribers")
  const tc = await getTranslations("common.actions")

  return (
    <>
      <PageHeader
        title={t("title")}
        description={t("description")}
        action={<ExportMenu only="subscribers" />}
      />

      <TableFilters
        basePath={ADMIN_SUBSCRIBERS_PATH}
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
              { value: "confirmed", label: t("confirmed") },
              { value: "pending", label: t("pending") },
              { value: "unsubscribed", label: t("unsubscribed") },
            ],
          },
        ]}
      />

      <Suspense
        key={JSON.stringify(filters)}
        fallback={<TableSkeleton columns={4} rows={ADMIN_PAGE_SIZE} />}
      >
        <SubscribersTable filters={filters} />
      </Suspense>
    </>
  )
}
