import type { Metadata } from "next"
import { getTranslations } from "@/i18n/getTranslations"

import type { AppLocale, LocaleParams } from "@/i18n/routing"
import { Suspense } from "react"

import { PageHeader } from "@/components/modules/dashboard/PageHeader"
import { TableSkeleton } from "@/components/modules/dashboard/Skeletons"
import {
  ADMIN_PAGE_SIZE,
  ADMIN_RENTALS_PATH,
  parseAdminRentalsFilters,
  RENTAL_STATUSES,
  type RawSearchParams,
} from "@/utils/filters/admin"

import { TableFilters } from "@/components/modules/dashboard/TableFilters"
import { AdminRentalsTable } from "@/components/modules/admin/rentals/AdminRentalsTable"

export async function generateMetadata({
  params,
}: LocaleParams): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({
    locale: locale as AppLocale,
    namespace: "admin.meta",
  })
  return { title: t("rentals") }
}

export default async function AdminRentalsPage({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>
}) {
  const filters = parseAdminRentalsFilters(await searchParams)
  const t = await getTranslations("admin.rentals")
  const tc = await getTranslations("common")

  return (
    <>
      <PageHeader title={t("title")} description={t("description")} />

      <TableFilters
        basePath={ADMIN_RENTALS_PATH}
        specs={[
          {
            name: "status",
            label: t("statuses"),
            value: filters.status,
            options: RENTAL_STATUSES.map((status) => ({
              value: status,
              label: tc(`rentalStatusShort.${status}`),
            })),
          },
        ]}
      />

      <Suspense
        key={JSON.stringify(filters)}
        fallback={<TableSkeleton columns={7} rows={ADMIN_PAGE_SIZE} />}
      >
        <AdminRentalsTable filters={filters} />
      </Suspense>
    </>
  )
}
