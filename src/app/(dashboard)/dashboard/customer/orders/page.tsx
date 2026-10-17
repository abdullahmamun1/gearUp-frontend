import type { Metadata } from "next"
import Link from "next/link"
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
  statusLabel,
  type RawSearchParams,
  type RentalTableFilters,
} from "@/utils/filters/dashboard"
import { RENTAL_STATUSES } from "@/utils/rental"
import { cn } from "@/lib/utils"

import { MyRentalsList } from "@/components/modules/customer/orders/MyRentalsList"

export const metadata: Metadata = { title: "My rentals · GearUp" }

export default async function CustomerOrdersPage({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>
}) {
  const filters = parseRentalTableFilters(await searchParams)

  return (
    <>
      <PageHeader
        title="My rentals"
        description="Every booking you've made, with its current status."
        action={
          <Link href="/gear" className={cn(buttonVariants({ size: "lg" }))}>
            Browse gear
          </Link>
        }
      />

      <TableFilters
        basePath={CUSTOMER_ORDERS_PATH}
        specs={[
          {
            name: "status",
            label: "Statuses",
            value: filters.status,
            options: RENTAL_STATUSES.map((status) => ({
              value: status,
              label: statusLabel(status),
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
  const res = await getMyRentals(filters)

  if (!res.success || !res.data) {
    return (
      <EmptyState>
        {res.message || "Couldn't load your rentals. Please try again."}
      </EmptyState>
    )
  }

  return <MyRentalsList filters={filters} initialData={res.data} />
}
