"use client"

import { useTranslations } from "@/i18n/translations"

import { DataTable } from "@/components/shared/DataTable"
import { EmptyState } from "@/components/shared/EmptyState"
import { Pagination } from "@/components/shared/Pagination"
import { RoleBadge } from "@/components/shared/UserBadges"
import { TableCell, TableRow } from "@/components/ui/table"
import { ADMIN_USERS_PATH, type AdminUsersFilters } from "@/utils/filters/admin"
import { useFormat } from "@/i18n/useFormat"
import { useAdminUsers } from "@/hooks/queries/adminUsers"
import { buildHref } from "@/utils/searchParams"
import type { Paginated, User } from "@/types"

import { UserStatusToggle } from "./UserStatusToggle"

export function AdminUsersList({
  filters,
  initialData,
}: {
  filters: AdminUsersFilters
  initialData: Paginated<User>
}) {
  const { data, error, isFetching } = useAdminUsers(filters, initialData)
  const t = useTranslations("admin.users")
  const format = useFormat()
  const headings = [
    t("headingUser"),
    t("headingPhone"),
    t("headingRole"),
    t("headingStatus"),
    t("headingJoined"),
  ]

  if (error) {
    return <EmptyState>{error.message || t("loadError")}</EmptyState>
  }

  const users = data?.data ?? []
  const meta = data?.meta

  if (users.length === 0) {
    return <EmptyState>{t("noMatch")}</EmptyState>
  }

  return (
    <>
      <DataTable
        headings={headings}
        count={{
          total: meta?.total ?? users.length,
          one: t("countOne"),
          many: t("countMany"),
        }}
        isFetching={isFetching}
      >
        {users.map((user) => (
          <TableRow key={user.id} className="hover:bg-transparent">
            <TableCell>
              <span className="font-medium">{user.name}</span>
              <p className="text-xs text-muted-foreground">{user.email}</p>
            </TableCell>
            <TableCell className="text-muted-foreground tabular-nums">
              {user.phone || "—"}
            </TableCell>
            <TableCell>
              <RoleBadge role={user.role} />
            </TableCell>
            <TableCell>
              <UserStatusToggle user={user} filters={filters} />
            </TableCell>
            <TableCell className="whitespace-nowrap text-muted-foreground">
              {format.date(user.createdAt)}
            </TableCell>
          </TableRow>
        ))}
      </DataTable>

      <Pagination
        page={filters.page}
        totalPages={meta?.totalPages ?? 1}
        hrefFor={(page) => buildHref(ADMIN_USERS_PATH, { ...filters, page })}
        label={t("pagination")}
      />
    </>
  )
}
