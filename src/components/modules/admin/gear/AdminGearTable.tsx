import { getTranslations } from "@/i18n/getTranslations"

import { getAdminGear } from "@/api/admin"
import { EmptyState } from "@/components/shared/EmptyState"
import type { AdminGearFilters } from "@/utils/filters/admin"

import { AdminGearList } from "./AdminGearList"

export async function AdminGearTable({
  filters,
}: {
  filters: AdminGearFilters
}) {
  const res = await getAdminGear(filters)

  if (!res.success || !res.data) {
    const t = await getTranslations("admin.gear")
    return <EmptyState>{res.message || t("loadErrorRetry")}</EmptyState>
  }

  return <AdminGearList filters={filters} initialData={res.data} />
}
