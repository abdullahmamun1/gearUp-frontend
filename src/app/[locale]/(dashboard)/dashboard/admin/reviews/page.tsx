import type { Metadata } from "next"
import { getTranslations } from "@/i18n/getTranslations"

import type { AppLocale, LocaleParams } from "@/i18n/routing"
import { Suspense } from "react"

import { AdminReviewsTable } from "@/components/modules/admin/reviews/AdminReviewsTable"
import { PageHeader } from "@/components/modules/dashboard/PageHeader"
import { TableSkeleton } from "@/components/modules/dashboard/Skeletons"
import { TableFilters } from "@/components/modules/dashboard/TableFilters"
import {
  ADMIN_PAGE_SIZE,
  ADMIN_REVIEWS_PATH,
  parseAdminReviewsFilters,
  REVIEW_RATINGS,
  type RawSearchParams,
} from "@/utils/filters/admin"

export async function generateMetadata({
  params,
}: LocaleParams): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({
    locale: locale as AppLocale,
    namespace: "admin.meta",
  })
  return { title: t("reviews") }
}

export default async function AdminReviewsPage({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>
}) {
  const filters = parseAdminReviewsFilters(await searchParams)
  const t = await getTranslations("admin.reviews")
  const tc = await getTranslations("common.actions")

  return (
    <>
      <PageHeader title={t("title")} description={t("description")} />

      <TableFilters
        basePath={ADMIN_REVIEWS_PATH}
        search={{
          name: "searchTerm",
          label: tc("search"),
          placeholder: t("searchPlaceholder"),
          value: filters.searchTerm,
        }}
        specs={[
          {
            name: "visibility",
            label: t("visibility"),
            value: filters.visibility,
            options: [
              { value: "visible", label: t("visible") },
              { value: "hidden", label: t("hidden") },
            ],
          },
          {
            name: "rating",
            label: t("rating"),
            value: filters.rating,
            options: [...REVIEW_RATINGS].reverse().map((rating) => ({
              value: rating,
              label: t("stars", { count: Number(rating) }),
            })),
          },
        ]}
      />

      <Suspense
        key={JSON.stringify(filters)}
        fallback={<TableSkeleton columns={5} rows={ADMIN_PAGE_SIZE} />}
      >
        <AdminReviewsTable filters={filters} />
      </Suspense>
    </>
  )
}
