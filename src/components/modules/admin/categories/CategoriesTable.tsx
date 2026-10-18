import { getTranslations } from "@/i18n/getTranslations"

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
    const t = await getTranslations("admin.categories")
    return <EmptyState>{res.message || t("loadErrorRetry")}</EmptyState>
  }

  return <CategoriesList filters={filters} initialData={res.data} />
}
