import type { Metadata } from "next"
import { Suspense } from "react"

import { getProviderOrders } from "@/app/(dashboard)/_actions/getProviderOrders"
import { PageHeader } from "@/app/(dashboard)/_components/PageHeader"
import { TableFilters } from "@/app/(dashboard)/_components/TableFilters"
import { TableSkeleton } from "@/app/(dashboard)/_components/Skeletons"
import { EmptyState } from "@/components/shared/EmptyState"
import {
  DASHBOARD_PAGE_SIZE,
  parseRentalTableFilters,
  PROVIDER_ORDERS_PATH,
  statusLabel,
  type RawSearchParams,
  type RentalTableFilters,
} from "@/lib/dashboardQuery"
import { RENTAL_STATUSES } from "@/lib/rental"

import { ProviderOrdersList } from "./_components/ProviderOrdersList"

export const metadata: Metadata = { title: "Orders · GearUp" }

export default async function ProviderOrdersPage({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>
}) {
  const filters = parseRentalTableFilters(await searchParams)

  return (
    <>
      <PageHeader
        title="Orders"
        description="Bookings against your gear. Confirm one to let the customer pay."
      />

      <TableFilters
        basePath={PROVIDER_ORDERS_PATH}
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
        fallback={<TableSkeleton columns={7} rows={DASHBOARD_PAGE_SIZE} />}
      >
        <ProviderOrders filters={filters} />
      </Suspense>
    </>
  )
}

async function ProviderOrders({ filters }: { filters: RentalTableFilters }) {
  const res = await getProviderOrders(filters)

  if (!res.success || !res.data) {
    return (
      <EmptyState>
        {res.message || "Couldn't load your orders. Please try again."}
      </EmptyState>
    )
  }

  return <ProviderOrdersList filters={filters} initialData={res.data} />
}
