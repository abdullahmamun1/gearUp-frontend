import { getProviderGear } from "@/app/(dashboard)/_actions/getProviderGear"
import { EmptyState } from "@/components/shared/EmptyState"
import {
  toProviderGearQuery,
  type ProviderGearFilters,
} from "@/lib/providerGearQuery"
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

  if (!res.success || !res.data) {
    return (
      <EmptyState>
        {res.message || "Couldn't load your listings. Please try again."}
      </EmptyState>
    )
  }

  return (
    <ProviderGearList
      filters={filters}
      categories={categories}
      initialData={res.data}
    />
  )
}
