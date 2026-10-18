import { getTranslations } from "@/i18n/getTranslations"

import { getAdminRentals } from "@/api/admin"
import { EmptyState } from "@/components/shared/EmptyState"
import type { AdminRentalsFilters } from "@/utils/filters/admin"

import { AdminRentalsList } from "./AdminRentalsList"

export async function AdminRentalsTable({
  filters,
}: {
  filters: AdminRentalsFilters
}) {
  const res = await getAdminRentals(filters)

  if (!res.success || !res.data) {
    const t = await getTranslations("admin.rentals")
    return <EmptyState>{res.message || t("loadErrorRetry")}</EmptyState>
  }

  return <AdminRentalsList filters={filters} initialData={res.data} />
}
