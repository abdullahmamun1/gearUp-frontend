import { getTranslations } from "@/i18n/getTranslations"

import { getClaims } from "@/api/claims"
import { EmptyState } from "@/components/shared/EmptyState"
import type { AdminClaimsFilters } from "@/utils/filters/admin"

import { ClaimsList } from "./ClaimsList"

export async function ClaimsTable({
  filters,
}: {
  filters: AdminClaimsFilters
}) {
  const res = await getClaims(filters)

  if (!res.success || !res.data) {
    const t = await getTranslations("admin.claims")
    return <EmptyState>{res.message || t("loadErrorRetry")}</EmptyState>
  }

  return <ClaimsList filters={filters} initialData={res.data} />
}
