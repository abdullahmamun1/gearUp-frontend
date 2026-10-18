import type { Metadata } from "next"
import { getTranslations } from "@/i18n/getTranslations"

import type { AppLocale, LocaleParams } from "@/i18n/routing"

import { ProfilePanel } from "@/components/modules/dashboard/ProfilePanel"

export async function generateMetadata({
  params,
}: LocaleParams): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({
    locale: locale as AppLocale,
    namespace: "dashboard.meta",
  })
  return { title: t("profile") }
}

export default function ProfilePage() {
  return <ProfilePanel />
}
