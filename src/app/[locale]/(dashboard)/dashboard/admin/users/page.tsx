import type { Metadata } from "next"
import { getTranslations } from "@/i18n/getTranslations"

import type { AppLocale, LocaleParams } from "@/i18n/routing"
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

export async function generateMetadata({
  params,
}: LocaleParams): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({
    locale: locale as AppLocale,
    namespace: "admin.meta",
  })
  return { title: t("users") }
}

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>
}) {
  const filters = parseAdminUsersFilters(await searchParams)
  const t = await getTranslations("admin.users")
  const tc = await getTranslations("common")

  return (
    <>
      <PageHeader title={t("title")} description={t("description")} />

      <TableFilters
        basePath={ADMIN_USERS_PATH}
        specs={[
          {
            name: "role",
            label: t("roles"),
            value: filters.role,
            options: USER_ROLES.map((role) => ({
              value: role,
              label: tc(`role.${role}`),
            })),
          },
          {
            name: "status",
            label: t("statuses"),
            value: filters.status,
            options: USER_STATUSES.map((status) => ({
              value: status,
              label: tc(`userStatus.${status}`),
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
