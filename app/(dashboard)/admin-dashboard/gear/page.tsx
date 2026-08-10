import type { Metadata } from "next"
import { Suspense } from "react"

import { TableFilters } from "@/app/(dashboard)/_components/TableFilters"
import { PageHeader } from "@/app/(dashboard)/_components/PageHeader"
import { TableSkeleton } from "@/app/(dashboard)/_components/Skeletons"
import { getCategories } from "@/app/(public)/_actions/getCategories"
import {
  ADMIN_GEAR_PATH,
  ADMIN_PAGE_SIZE,
  parseAdminGearFilters,
  type RawSearchParams,
} from "@/lib/adminQuery"

import { AdminGearTable } from "./_components/AdminGearTable"

export const metadata: Metadata = { title: "Gear · GearUp" }

export default async function AdminGearPage({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>
}) {
  const filters = parseAdminGearFilters(await searchParams)
  const categoriesRes = await getCategories()

  return (
    <>
      <PageHeader
        title="Gear"
        description="Every listing, across all providers."
      />

      <TableFilters
        basePath={ADMIN_GEAR_PATH}
        search={{
          name: "searchTerm",
          label: "Search",
          placeholder: "Search by name or brand…",
          value: filters.searchTerm,
        }}
        specs={[
          {
            name: "category",
            label: "Categories",
            value: filters.category,
            options: (categoriesRes.data ?? []).map((category) => ({
              value: category.id,
              label: category.name,
            })),
          },
          {
            name: "isAvailable",
            label: "Availability",
            value: filters.isAvailable,
            options: [
              { value: "true", label: "Available" },
              { value: "false", label: "Unavailable" },
            ],
          },
        ]}
      />

      <Suspense
        key={JSON.stringify(filters)}
        fallback={<TableSkeleton columns={6} rows={ADMIN_PAGE_SIZE} />}
      >
        <AdminGearTable filters={filters} />
      </Suspense>
    </>
  )
}
