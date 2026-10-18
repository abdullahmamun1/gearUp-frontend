import type { Metadata } from "next"
import { Suspense } from "react"
import { getTranslations } from "@/i18n/getTranslations"
import { initLocale } from "@/i18n/server"

import { getCategories } from "@/api/categories"
import { PageHeader } from "@/components/modules/dashboard/PageHeader"
import { TableSkeleton } from "@/components/modules/dashboard/Skeletons"
import type { LocaleParams } from "@/i18n/routing"
import {
  parseProviderGearFilters,
  PROVIDER_GEAR_PAGE_SIZE,
  type RawSearchParams,
} from "@/utils/filters/providerGear"

import { GearFormDialog } from "@/components/modules/provider/gear/GearFormDialog"
import { ProviderGearFilterBar } from "@/components/modules/provider/gear/ProviderGearFilterBar"
import { ProviderGearTable } from "@/components/modules/provider/gear/ProviderGearTable"

export async function generateMetadata({
  params,
}: LocaleParams): Promise<Metadata> {
  const locale = await initLocale(params)
  const t = await getTranslations({ locale, namespace: "provider.meta" })
  return { title: t("gear") }
}

export default async function ProviderGearPage({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>
}) {
  const filters = parseProviderGearFilters(await searchParams)
  const categoriesRes = await getCategories()
  const categories = categoriesRes.data ?? []
  const t = await getTranslations("provider.gearPage")

  return (
    <>
      <PageHeader
        title={t("title")}
        description={t("description")}
        action={<GearFormDialog categories={categories} />}
      />

      <ProviderGearFilterBar filters={filters} categories={categories} />

      <Suspense
        key={JSON.stringify(filters)}
        fallback={<TableSkeleton columns={7} rows={PROVIDER_GEAR_PAGE_SIZE} />}
      >
        <ProviderGearTable filters={filters} categories={categories} />
      </Suspense>
    </>
  )
}
