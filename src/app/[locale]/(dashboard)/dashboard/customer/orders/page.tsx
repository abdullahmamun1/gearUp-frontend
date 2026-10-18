import type { Metadata } from "next"
import { getTranslations } from "@/i18n/getTranslations"

import type { AppLocale, LocaleParams } from "@/i18n/routing"
import { Link } from "@/i18n/navigation"
import { Suspense } from "react"

import { getMyRentals } from "@/api/rentals"
import { PageHeader } from "@/components/modules/dashboard/PageHeader"
import { TableFilters } from "@/components/modules/dashboard/TableFilters"
import { TableSkeleton } from "@/components/modules/dashboard/Skeletons"
import { EmptyState } from "@/components/shared/EmptyState"
import { buttonVariants } from "@/components/ui/button"
import {
  CUSTOMER_ORDERS_PATH,
  DASHBOARD_PAGE_SIZE,
  parseRentalTableFilters,
  type RawSearchParams,
  type RentalTableFilters,
} from "@/utils/filters/dashboard"
import { RENTAL_STATUSES } from "@/utils/rental"
import { cn } from "@/lib/utils"

import { MyRentalsList } from "@/components/modules/customer/orders/MyRentalsList"

export async function generateMetadata({
  params,
}: LocaleParams): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({
    locale: locale as AppLocale,
    namespace: "dashboard.meta",
  })
  return { title: t("orders") }
}

export default async function CustomerOrdersPage({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>
}) {
  const filters = parseRentalTableFilters(await searchParams)
  const [t, ts] = await Promise.all([
    getTranslations("dashboard.customer.orders"),
    getTranslations("common.rentalStatusShort"),
  ])

  return (
    <>
      <PageHeader
        title={t("title")}
        description={t("description")}
        action={
          <Link href="/gear" className={cn(buttonVariants({ size: "lg" }))}>
            {t("browseGear")}
          </Link>
        }
      />

      <TableFilters
        basePath={CUSTOMER_ORDERS_PATH}
        specs={[
          {
            name: "status",
            label: t("statuses"),
            value: filters.status,
            options: RENTAL_STATUSES.map((status) => ({
              value: status,
              label: ts(status),
            })),
          },
        ]}
      />

      <Suspense
        key={JSON.stringify(filters)}
        fallback={<TableSkeleton columns={5} rows={DASHBOARD_PAGE_SIZE} />}
      >
        <MyRentals filters={filters} />
      </Suspense>
    </>
  )
}

async function MyRentals({ filters }: { filters: RentalTableFilters }) {
  const [res, t] = await Promise.all([
    getMyRentals(filters),
    getTranslations("dashboard.customer.orders"),
  ])

  if (!res.success || !res.data) {
    return <EmptyState>{res.message || t("loadFailed")}</EmptyState>
  }

  return <MyRentalsList filters={filters} initialData={res.data} />
}
