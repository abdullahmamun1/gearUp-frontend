import { getAdminUsers } from "@/app/(dashboard)/_actions/getAdminTables"
import { Pagination } from "@/components/shared/Pagination"
import { RoleBadge, UserStatusBadge } from "@/components/shared/UserBadges"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  ADMIN_USERS_PATH,
  buildAdminHref,
  type AdminUsersFilters,
} from "@/lib/adminQuery"
import { formatDate } from "@/lib/format"

import { AdminMessage } from "../../_components/AdminMessage"

export async function AdminUsersTable({
  filters,
}: {
  filters: AdminUsersFilters
}) {
  const res = await getAdminUsers(filters)

  if (!res.success) {
    return (
      <AdminMessage>
        {res.message || "Couldn't load users. Please try again."}
      </AdminMessage>
    )
  }

  const users = res.data?.data ?? []
  const meta = res.data?.meta
  const total = meta?.total ?? users.length

  if (users.length === 0) {
    return <AdminMessage>No users match those filters.</AdminMessage>
  }

  return (
    <>
      <p className="mb-3 text-sm text-muted-foreground">
        {total} {total === 1 ? "account" : "accounts"}
      </p>

      <div className="overflow-x-auto rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Joined</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
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
                  <UserStatusBadge status={user.status} />
                </TableCell>
                <TableCell className="whitespace-nowrap text-muted-foreground">
                  {formatDate(user.createdAt)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Pagination
        page={filters.page}
        totalPages={meta?.totalPages ?? 1}
        hrefFor={(page) =>
          buildAdminHref(ADMIN_USERS_PATH, { ...filters, page })
        }
        label="Users pagination"
      />
    </>
  )
}
