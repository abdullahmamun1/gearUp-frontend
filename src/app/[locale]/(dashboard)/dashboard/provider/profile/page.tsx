import type { Metadata } from "next"
import { getTranslations } from "@/i18n/getTranslations"
import { initLocale } from "@/i18n/server"

import { ProfilePanel } from "@/components/modules/dashboard/ProfilePanel"
import type { LocaleParams } from "@/i18n/routing"

export async function generateMetadata({
  params,
}: LocaleParams): Promise<Metadata> {
  const locale = await initLocale(params)
  const t = await getTranslations({ locale, namespace: "provider.meta" })
  return { title: t("profile") }
}

export default function ProfilePage() {
  return <ProfilePanel />
}
