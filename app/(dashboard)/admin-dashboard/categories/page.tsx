import type { Metadata } from "next"
import { Suspense } from "react"

import { PageHeader } from "@/app/(dashboard)/_components/PageHeader"
import { TableFilters } from "@/app/(dashboard)/_components/TableFilters"
import { TableSkeleton } from "@/app/(dashboard)/_components/Skeletons"
import {
  ADMIN_CATEGORIES_PATH,
  parseAdminCategoriesFilters,
  type RawSearchParams,
} from "@/lib/adminQuery"

import { CategoriesTable } from "./_components/CategoriesTable"
import { CategoryFormDialog } from "./_components/CategoryFormDialog"

export const metadata: Metadata = { title: "Categories · GearUp" }

export default async function AdminCategoriesPage({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>
}) {
  const filters = parseAdminCategoriesFilters(await searchParams)

  return (
    <>
      <PageHeader
        title="Categories"
        description="The categories providers can list gear under."
        action={<CategoryFormDialog />}
      />

      <TableFilters
        basePath={ADMIN_CATEGORIES_PATH}
        search={{
          name: "searchTerm",
          label: "Search",
          placeholder: "Search categories…",
          value: filters.searchTerm,
        }}
      />

      <Suspense fallback={<TableSkeleton columns={4} rows={6} />}>
        <CategoriesTable filters={filters} />
      </Suspense>
    </>
  )
}
