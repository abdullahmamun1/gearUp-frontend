import { getCategories } from "@/app/(public)/_actions/getCategories"
import { EmptyState } from "@/components/shared/EmptyState"

import { CategoriesList } from "./CategoriesList"

export async function CategoriesTable() {
  const res = await getCategories()

  if (!res.success || !res.data) {
    return (
      <EmptyState>
        {res.message || "Couldn't load categories. Please try again."}
      </EmptyState>
    )
  }

  return <CategoriesList initialData={res.data} />
}
