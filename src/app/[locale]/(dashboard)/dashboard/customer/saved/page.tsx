import type { Metadata } from "next"
import { getTranslations } from "@/i18n/getTranslations"

import type { AppLocale, LocaleParams } from "@/i18n/routing"

import { SavedGearList } from "@/components/modules/customer/SavedGearList"
import { PageHeader } from "@/components/modules/dashboard/PageHeader"

export async function generateMetadata({
  params,
}: LocaleParams): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({
    locale: locale as AppLocale,
    namespace: "dashboard.meta",
  })
  return { title: t("saved") }
}

export default async function SavedGearPage() {
  const t = await getTranslations("dashboard.customer.saved")
  return (
    <>
      <PageHeader title={t("title")} description={t("description")} />
      <SavedGearList />
    </>
  )
}
