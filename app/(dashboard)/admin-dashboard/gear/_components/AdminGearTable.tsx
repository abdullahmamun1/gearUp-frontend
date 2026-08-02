import { getAdminGear } from "@/app/(dashboard)/_actions/getAdminTables"
import { EmptyState } from "@/components/shared/EmptyState"
import type { AdminGearFilters } from "@/lib/adminQuery"

import { AdminGearList } from "./AdminGearList"

export async function AdminGearTable({
  filters,
}: {
  filters: AdminGearFilters
}) {
  const res = await getAdminGear(filters)

  if (!res.success || !res.data) {
    return (
      <EmptyState>
        {res.message || "Couldn't load listings. Please try again."}
      </EmptyState>
    )
  }

  return <AdminGearList filters={filters} initialData={res.data} />
}
