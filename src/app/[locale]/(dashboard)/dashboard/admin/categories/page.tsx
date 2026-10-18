import type { Metadata } from "next"
import { getTranslations } from "@/i18n/getTranslations"

import type { AppLocale, LocaleParams } from "@/i18n/routing"
import { Suspense } from "react"

import { PageHeader } from "@/components/modules/dashboard/PageHeader"
import { TableFilters } from "@/components/modules/dashboard/TableFilters"
import { TableSkeleton } from "@/components/modules/dashboard/Skeletons"
import {
  ADMIN_CATEGORIES_PATH,
  parseAdminCategoriesFilters,
  type RawSearchParams,
} from "@/utils/filters/admin"

import { CategoriesTable } from "@/components/modules/admin/categories/CategoriesTable"
import { CategoryFormDialog } from "@/components/modules/admin/categories/CategoryFormDialog"

export async function generateMetadata({
  params,
}: LocaleParams): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({
    locale: locale as AppLocale,
    namespace: "admin.meta",
  })
  return { title: t("categories") }
}

export default async function AdminCategoriesPage({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>
}) {
  const filters = parseAdminCategoriesFilters(await searchParams)
  const t = await getTranslations("admin.categories")
  const tc = await getTranslations("common.actions")

  return (
    <>
      <PageHeader
        title={t("title")}
        description={t("description")}
        action={<CategoryFormDialog />}
      />

      <TableFilters
        basePath={ADMIN_CATEGORIES_PATH}
        search={{
          name: "searchTerm",
          label: tc("search"),
          placeholder: t("searchPlaceholder"),
          value: filters.searchTerm,
        }}
      />

      <Suspense fallback={<TableSkeleton columns={4} rows={6} />}>
        <CategoriesTable filters={filters} />
      </Suspense>
    </>
  )
}
