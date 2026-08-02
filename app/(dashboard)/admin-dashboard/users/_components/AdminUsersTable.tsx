import { getAdminUsers } from "@/app/(dashboard)/_actions/getAdminTables"
import { EmptyState } from "@/components/shared/EmptyState"
import type { AdminUsersFilters } from "@/lib/adminQuery"

import { AdminUsersList } from "./AdminUsersList"

export async function AdminUsersTable({
  filters,
}: {
  filters: AdminUsersFilters
}) {
  const res = await getAdminUsers(filters)

  if (!res.success || !res.data) {
    return (
      <EmptyState>
        {res.message || "Couldn't load users. Please try again."}
      </EmptyState>
    )
  }

  return <AdminUsersList filters={filters} initialData={res.data} />
}
