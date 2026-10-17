import type { Metadata } from "next"
import Link from "next/link"
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
  statusLabel,
  type PaymentTableFilters,
  type RawSearchParams,
} from "@/utils/filters/dashboard"
import { cn } from "@/lib/utils"

import { MyPaymentsList } from "@/components/modules/customer/payments/MyPaymentsList"

export const metadata: Metadata = { title: "Payments · GearUp" }

export default async function CustomerPaymentsPage({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>
}) {
  const filters = parsePaymentTableFilters(await searchParams)

  return (
    <>
      <PageHeader
        title="Payments"
        description="Receipts for the rentals you've paid for."
        action={
          <Link
            href="/dashboard/customer/orders"
            className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
          >
            My rentals
          </Link>
        }
      />

      <TableFilters
        basePath={CUSTOMER_PAYMENTS_PATH}
        specs={[
          {
            name: "status",
            label: "Statuses",
            value: filters.status,
            options: PAYMENT_STATUSES.map((status) => ({
              value: status,
              label: statusLabel(status),
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
  const res = await getMyPayments(filters)

  if (!res.success || !res.data) {
    return (
      <EmptyState>
        {res.message || "Couldn't load your payments. Please try again."}
      </EmptyState>
    )
  }

  return <MyPaymentsList filters={filters} initialData={res.data} />
}
