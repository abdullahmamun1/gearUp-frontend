import { getCategories } from "@/app/(public)/_actions/getCategories"
import { EmptyState } from "@/components/shared/EmptyState"
import type { AdminCategoriesFilters } from "@/lib/adminQuery"

import { CategoriesList } from "./CategoriesList"

export async function CategoriesTable({
  filters,
}: {
  filters: AdminCategoriesFilters
}) {
  const res = await getCategories()

  if (!res.success || !res.data) {
    return (
      <EmptyState>
        {res.message || "Couldn't load categories. Please try again."}
      </EmptyState>
    )
  }

  return <CategoriesList filters={filters} initialData={res.data} />
}
