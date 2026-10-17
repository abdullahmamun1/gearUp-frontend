import { getCategories } from "@/api/categories"
import { EmptyState } from "@/components/shared/EmptyState"
import type { AdminCategoriesFilters } from "@/utils/filters/admin"

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
