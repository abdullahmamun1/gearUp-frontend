import type { Metadata } from "next"
import { getTranslations } from "@/i18n/getTranslations"

import type { AppLocale, LocaleParams } from "@/i18n/routing"
import { Link } from "@/i18n/navigation"
import { Suspense } from "react"

import { getMyPayments } from "@/api/payments"
import { PageHeader } from "@/components/modules/dashboard/PageHeader"
import { TableFilters } from "@/components/modules/dashboard/TableFilters"
import { TableSkeleton } from "@/components/modules/dashboard/Skeletons"
import { EmptyState } from "@/components/shared/EmptyState"
import { buttonVariants } from "@/components/ui/button"
import {
  CUSTOMER_PAYMENTS_PATH,
  DASHBOARD_PAGE_SIZE,
  parsePaymentTableFilters,
  PAYMENT_STATUSES,
  type PaymentTableFilters,
  type RawSearchParams,
} from "@/utils/filters/dashboard"
import { cn } from "@/lib/utils"

import { MyPaymentsList } from "@/components/modules/customer/payments/MyPaymentsList"

export async function generateMetadata({
  params,
}: LocaleParams): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({
    locale: locale as AppLocale,
    namespace: "dashboard.meta",
  })
  return { title: t("payments") }
}

export default async function CustomerPaymentsPage({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>
}) {
  const filters = parsePaymentTableFilters(await searchParams)
  const t = await getTranslations("dashboard.customer.payments")

  return (
    <>
      <PageHeader
        title={t("title")}
        description={t("description")}
        action={
          <Link
            href="/dashboard/customer/orders"
            className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
          >
            {t("myRentals")}
          </Link>
        }
      />

      <TableFilters
        basePath={CUSTOMER_PAYMENTS_PATH}
        specs={[
          {
            name: "status",
            label: t("statuses"),
            value: filters.status,
            options: PAYMENT_STATUSES.map((status) => ({
              value: status,
              label: t(`status.${status}`),
            })),
          },
        ]}
      />

      <Suspense
        key={JSON.stringify(filters)}
        fallback={<TableSkeleton columns={6} rows={DASHBOARD_PAGE_SIZE} />}
      >
        <MyPayments filters={filters} />
      </Suspense>
    </>
  )
}

async function MyPayments({ filters }: { filters: PaymentTableFilters }) {
  const [res, t] = await Promise.all([
    getMyPayments(filters),
    getTranslations("dashboard.customer.payments"),
  ])

  if (!res.success || !res.data) {
    return <EmptyState>{res.message || t("loadFailed")}</EmptyState>
  }

  return <MyPaymentsList filters={filters} initialData={res.data} />
}
