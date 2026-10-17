import type { Metadata } from "next"
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

export const metadata: Metadata = { title: "Rentals · GearUp" }

const titleCase = (value: string) =>
  value.charAt(0) + value.slice(1).toLowerCase().replace("_", " ")

export default async function AdminRentalsPage({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>
}) {
  const filters = parseAdminRentalsFilters(await searchParams)

  return (
    <>
      <PageHeader
        title="Rentals"
        description="Every rental order on the platform."
      />

      <TableFilters
        basePath={ADMIN_RENTALS_PATH}
        specs={[
          {
            name: "status",
            label: "Statuses",
            value: filters.status,
            options: RENTAL_STATUSES.map((status) => ({
              value: status,
              label: titleCase(status),
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
