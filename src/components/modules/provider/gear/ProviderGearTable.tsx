import { getTranslations } from "@/i18n/getTranslations"

import { getProviderGear } from "@/api/gear"
import { EmptyState } from "@/components/shared/EmptyState"
import {
  toProviderGearQuery,
  type ProviderGearFilters,
} from "@/utils/filters/providerGear"
import type { Category } from "@/types"

import { ProviderGearList } from "./ProviderGearList"

export async function ProviderGearTable({
  filters,
  categories,
}: {
  filters: ProviderGearFilters
  categories: Category[]
}) {
  const res = await getProviderGear(toProviderGearQuery(filters))
  const t = await getTranslations("provider.list")

  if (!res.success || !res.data) {
    return <EmptyState>{res.message || t("loadFailedRetry")}</EmptyState>
  }

  return (
    <ProviderGearList
      filters={filters}
      categories={categories}
      initialData={res.data}
    />
  )
}
