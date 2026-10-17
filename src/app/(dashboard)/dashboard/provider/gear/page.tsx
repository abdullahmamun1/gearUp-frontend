import type { Metadata } from "next"
import { Suspense } from "react"

import { getCategories } from "@/api/categories"
import { PageHeader } from "@/components/modules/dashboard/PageHeader"
import { TableSkeleton } from "@/components/modules/dashboard/Skeletons"
import {
  parseProviderGearFilters,
  PROVIDER_GEAR_PAGE_SIZE,
  type RawSearchParams,
} from "@/utils/filters/providerGear"

import { GearFormDialog } from "@/components/modules/provider/gear/GearFormDialog"
import { ProviderGearFilterBar } from "@/components/modules/provider/gear/ProviderGearFilterBar"
import { ProviderGearTable } from "@/components/modules/provider/gear/ProviderGearTable"

export const metadata: Metadata = { title: "My gear · GearUp" }

export default async function ProviderGearPage({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>
}) {
  const filters = parseProviderGearFilters(await searchParams)
  const categoriesRes = await getCategories()
  const categories = categoriesRes.data ?? []

  return (
    <>
      <PageHeader
        title="My gear"
        description="The listings you rent out."
        action={<GearFormDialog categories={categories} />}
      />

      <ProviderGearFilterBar filters={filters} categories={categories} />

      <Suspense
        key={JSON.stringify(filters)}
        fallback={<TableSkeleton columns={7} rows={PROVIDER_GEAR_PAGE_SIZE} />}
      >
        <ProviderGearTable filters={filters} categories={categories} />
      </Suspense>
    </>
  )
}
