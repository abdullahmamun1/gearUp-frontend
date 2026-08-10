import type { Metadata } from "next"
import Link from "next/link"
import { Suspense } from "react"

import { getMyPayments } from "@/app/(dashboard)/_actions/getMyPayments"
import { PageHeader } from "@/app/(dashboard)/_components/PageHeader"
import { TableFilters } from "@/app/(dashboard)/_components/TableFilters"
import { TableSkeleton } from "@/app/(dashboard)/_components/Skeletons"
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
} from "@/lib/dashboardQuery"
import { cn } from "@/lib/utils"

import { MyPaymentsList } from "./_components/MyPaymentsList"

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
            href="/customer-dashboard/orders"
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
