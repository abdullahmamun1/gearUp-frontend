import type { Metadata } from "next"
import { Suspense } from "react"

import { PageHeader } from "@/components/modules/dashboard/PageHeader"
import { TableSkeleton } from "@/components/modules/dashboard/Skeletons"
import {
  ADMIN_PAGE_SIZE,
  ADMIN_USERS_PATH,
  parseAdminUsersFilters,
  USER_ROLES,
  USER_STATUSES,
  type RawSearchParams,
} from "@/utils/filters/admin"

import { TableFilters } from "@/components/modules/dashboard/TableFilters"
import { AdminUsersTable } from "@/components/modules/admin/users/AdminUsersTable"

export const metadata: Metadata = { title: "Users · GearUp" }

const titleCase = (value: string) =>
  value.charAt(0) + value.slice(1).toLowerCase().replace("_", " ")

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>
}) {
  const filters = parseAdminUsersFilters(await searchParams)

  return (
    <>
      <PageHeader title="Users" description="Everyone on the platform." />

      <TableFilters
        basePath={ADMIN_USERS_PATH}
        specs={[
          {
            name: "role",
            label: "Roles",
            value: filters.role,
            options: USER_ROLES.map((role) => ({
              value: role,
              label: titleCase(role),
            })),
          },
          {
            name: "status",
            label: "Statuses",
            value: filters.status,
            options: USER_STATUSES.map((status) => ({
              value: status,
              label: titleCase(status),
            })),
          },
        ]}
      />

      <Suspense
        key={JSON.stringify(filters)}
        fallback={<TableSkeleton columns={5} rows={ADMIN_PAGE_SIZE} />}
      >
        <AdminUsersTable filters={filters} />
      </Suspense>
    </>
  )
}
