import type { Metadata } from "next"
import { Suspense } from "react"

import { getCategories } from "@/app/(public)/_actions/getCategories"
import { PageHeader } from "@/app/(dashboard)/_components/PageHeader"
import { TableSkeleton } from "@/app/(dashboard)/_components/Skeletons"
import {
  parseProviderGearFilters,
  PROVIDER_GEAR_PAGE_SIZE,
  type RawSearchParams,
} from "@/lib/providerGearQuery"

import { GearFormDialog } from "./_components/GearFormDialog"
import { ProviderGearFilterBar } from "./_components/ProviderGearFilterBar"
import { ProviderGearTable } from "./_components/ProviderGearTable"

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
        fallback={<TableSkeleton columns={6} rows={PROVIDER_GEAR_PAGE_SIZE} />}
      >
        <ProviderGearTable filters={filters} />
      </Suspense>
    </>
  )
}
