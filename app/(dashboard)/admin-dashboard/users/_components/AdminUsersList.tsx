"use client"

import { DataTable } from "@/components/shared/DataTable"
import { EmptyState } from "@/components/shared/EmptyState"
import { Pagination } from "@/components/shared/Pagination"
import { RoleBadge } from "@/components/shared/UserBadges"
import { TableCell, TableRow } from "@/components/ui/table"
import { ADMIN_USERS_PATH, type AdminUsersFilters } from "@/lib/adminQuery"
import { formatDate } from "@/lib/format"
import { useAdminUsers } from "@/lib/queries/adminUsers"
import { buildHref } from "@/lib/searchParams"
import type { Paginated, User } from "@/types"

import { UserStatusToggle } from "./UserStatusToggle"

const HEADINGS = ["User", "Phone", "Role", "Status", "Joined"] as const

export function AdminUsersList({
  filters,
  initialData,
}: {
  filters: AdminUsersFilters
  initialData: Paginated<User>
}) {
  const { data, error, isFetching } = useAdminUsers(filters, initialData)

  if (error) {
    return <EmptyState>{error.message || "Couldn't load users."}</EmptyState>
  }

  const users = data?.data ?? []
  const meta = data?.meta

  if (users.length === 0) {
    return <EmptyState>No users match those filters.</EmptyState>
  }

  return (
    <>
      <DataTable
        headings={HEADINGS}
        count={{
          total: meta?.total ?? users.length,
          one: "account",
          many: "accounts",
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
              {formatDate(user.createdAt)}
            </TableCell>
          </TableRow>
        ))}
      </DataTable>

      <Pagination
        page={filters.page}
        totalPages={meta?.totalPages ?? 1}
        hrefFor={(page) => buildHref(ADMIN_USERS_PATH, { ...filters, page })}
        label="Users pagination"
      />
    </>
  )
}
