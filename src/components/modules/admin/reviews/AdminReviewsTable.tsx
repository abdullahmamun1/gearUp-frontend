import { getTranslations } from "@/i18n/getTranslations"

import { getAdminReviews } from "@/api/admin"
import { EmptyState } from "@/components/shared/EmptyState"
import type { AdminReviewsFilters } from "@/utils/filters/admin"

import { AdminReviewsList } from "./AdminReviewsList"

export async function AdminReviewsTable({
  filters,
}: {
  filters: AdminReviewsFilters
}) {
  const res = await getAdminReviews(filters)

  if (!res.success || !res.data) {
    const t = await getTranslations("admin.reviews")
    return <EmptyState>{res.message || t("loadErrorRetry")}</EmptyState>
  }

  return <AdminReviewsList filters={filters} initialData={res.data} />
}
