import type { Metadata } from "next"
import { getTranslations } from "@/i18n/getTranslations"

import type { AppLocale, LocaleParams } from "@/i18n/routing"
import { Suspense } from "react"

import { TableFilters } from "@/components/modules/dashboard/TableFilters"
import { PageHeader } from "@/components/modules/dashboard/PageHeader"
import { TableSkeleton } from "@/components/modules/dashboard/Skeletons"
import { getCategories } from "@/api/categories"
import {
  ADMIN_GEAR_PATH,
  ADMIN_PAGE_SIZE,
  parseAdminGearFilters,
  type RawSearchParams,
} from "@/utils/filters/admin"

import { AdminGearTable } from "@/components/modules/admin/gear/AdminGearTable"

export async function generateMetadata({
  params,
}: LocaleParams): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({
    locale: locale as AppLocale,
    namespace: "admin.meta",
  })
  return { title: t("gear") }
}

export default async function AdminGearPage({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>
}) {
  const filters = parseAdminGearFilters(await searchParams)
  const categoriesRes = await getCategories()
  const t = await getTranslations("admin.gear")
  const tc = await getTranslations("common.actions")

  return (
    <>
      <PageHeader title={t("title")} description={t("description")} />

      <TableFilters
        basePath={ADMIN_GEAR_PATH}
        search={{
          name: "searchTerm",
          label: tc("search"),
          placeholder: t("searchPlaceholder"),
          value: filters.searchTerm,
        }}
        specs={[
          {
            name: "category",
            label: t("categories"),
            value: filters.category,
            options: (categoriesRes.data ?? []).map((category) => ({
              value: category.id,
              label: category.name,
            })),
          },
          {
            name: "isAvailable",
            label: t("availability"),
            value: filters.isAvailable,
            options: [
              { value: "true", label: t("available") },
              { value: "false", label: t("unavailable") },
            ],
          },
        ]}
      />

      <Suspense
        key={JSON.stringify(filters)}
        fallback={<TableSkeleton columns={7} rows={ADMIN_PAGE_SIZE} />}
      >
        <AdminGearTable filters={filters} />
      </Suspense>
    </>
  )
}
