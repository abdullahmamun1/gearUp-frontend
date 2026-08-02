import { getAdminRentals } from "@/app/(dashboard)/_actions/getAdminTables"
import { EmptyState } from "@/components/shared/EmptyState"
import type { AdminRentalsFilters } from "@/lib/adminQuery"

import { AdminRentalsList } from "./AdminRentalsList"

export async function AdminRentalsTable({
  filters,
}: {
  filters: AdminRentalsFilters
}) {
  const res = await getAdminRentals(filters)

  if (!res.success || !res.data) {
    return (
      <EmptyState>
        {res.message || "Couldn't load rentals. Please try again."}
      </EmptyState>
    )
  }

  return <AdminRentalsList filters={filters} initialData={res.data} />
}
