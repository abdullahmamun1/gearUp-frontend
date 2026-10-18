import type { Metadata } from "next"
import { Suspense } from "react"
import { getTranslations } from "@/i18n/getTranslations"
import { initLocale } from "@/i18n/server"

import { getProviderOrders } from "@/api/rentals"
import { PageHeader } from "@/components/modules/dashboard/PageHeader"
import { TableFilters } from "@/components/modules/dashboard/TableFilters"
import { TableSkeleton } from "@/components/modules/dashboard/Skeletons"
import { EmptyState } from "@/components/shared/EmptyState"
import type { LocaleParams } from "@/i18n/routing"
import {
  DASHBOARD_PAGE_SIZE,
  parseRentalTableFilters,
  PROVIDER_ORDERS_PATH,
  type RawSearchParams,
  type RentalTableFilters,
} from "@/utils/filters/dashboard"
import { RENTAL_STATUSES } from "@/utils/rental"

import { ProviderOrdersList } from "@/components/modules/provider/orders/ProviderOrdersList"

export async function generateMetadata({
  params,
}: LocaleParams): Promise<Metadata> {
  const locale = await initLocale(params)
  const t = await getTranslations({ locale, namespace: "provider.meta" })
  return { title: t("orders") }
}

export default async function ProviderOrdersPage({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>
}) {
  const filters = parseRentalTableFilters(await searchParams)
  const t = await getTranslations("provider.orders")
  const tc = await getTranslations("common.rentalStatusShort")

  return (
    <>
      <PageHeader title={t("title")} description={t("description")} />

      <TableFilters
        basePath={PROVIDER_ORDERS_PATH}
        specs={[
          {
            name: "status",
            label: t("statuses"),
            value: filters.status,
            options: RENTAL_STATUSES.map((status) => ({
              value: status,
              label: tc(status),
            })),
          },
        ]}
      />

      <Suspense
        key={JSON.stringify(filters)}
        fallback={<TableSkeleton columns={7} rows={DASHBOARD_PAGE_SIZE} />}
      >
        <ProviderOrders filters={filters} />
      </Suspense>
    </>
  )
}

async function ProviderOrders({ filters }: { filters: RentalTableFilters }) {
  const res = await getProviderOrders(filters)
  const t = await getTranslations("provider.orders")

  if (!res.success || !res.data) {
    return <EmptyState>{res.message || t("loadFailedRetry")}</EmptyState>
  }

  return <ProviderOrdersList filters={filters} initialData={res.data} />
}
