import type { Metadata } from "next"
import { Suspense } from "react"

import { PageHeader } from "@/app/(dashboard)/_components/PageHeader"
import { TableSkeleton } from "@/app/(dashboard)/_components/Skeletons"

import { CategoriesTable } from "./_components/CategoriesTable"
import { CategoryFormDialog } from "./_components/CategoryFormDialog"

export const metadata: Metadata = { title: "Categories · GearUp" }

export default function AdminCategoriesPage() {
  return (
    <>
      <PageHeader
        title="Categories"
        description="The categories providers can list gear under."
        action={<CategoryFormDialog />}
      />

      <Suspense fallback={<TableSkeleton columns={3} rows={6} />}>
        <CategoriesTable />
      </Suspense>
    </>
  )
}
