import { getTranslations } from "@/i18n/getTranslations"

import { getAdminUsers } from "@/api/admin"
import { EmptyState } from "@/components/shared/EmptyState"
import type { AdminUsersFilters } from "@/utils/filters/admin"

import { AdminUsersList } from "./AdminUsersList"

export async function AdminUsersTable({
  filters,
}: {
  filters: AdminUsersFilters
}) {
  const res = await getAdminUsers(filters)

  if (!res.success || !res.data) {
    const t = await getTranslations("admin.users")
    return <EmptyState>{res.message || t("loadErrorRetry")}</EmptyState>
  }

  return <AdminUsersList filters={filters} initialData={res.data} />
}
