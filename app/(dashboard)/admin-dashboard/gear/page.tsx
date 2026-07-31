import type { Metadata } from "next"
import { Suspense } from "react"

import { PageHeader } from "@/app/(dashboard)/_components/PageHeader"
import { TableSkeleton } from "@/app/(dashboard)/_components/Skeletons"
import {
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

  return (
    <>
      <PageHeader
        title="Gear"
        description="Every listing, across all providers."
      />

      <Suspense
        key={filters.page}
        fallback={<TableSkeleton columns={6} rows={ADMIN_PAGE_SIZE} />}
      >
        <AdminGearTable filters={filters} />
      </Suspense>
    </>
  )
}
