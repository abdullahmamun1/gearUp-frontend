import type { AppLocale, LocaleParams } from "@/i18n/routing"
import { initLocale } from "@/i18n/server"
import type { Metadata } from "next"
import { getTranslations } from "@/i18n/getTranslations"
import { Suspense } from "react"

import { NewsletterResult } from "@/components/modules/marketing/NewsletterResult"
import { CenteredCard } from "@/components/shared/CenteredCard"

export async function generateMetadata({
  params,
}: LocaleParams): Promise<Metadata> {
  const t = await getTranslations({
    locale: (await params).locale as AppLocale,
    namespace: "pages.newsletter.meta",
  })
  return { title: t("confirmTitle"), robots: { index: false } }
}

export default async function ConfirmNewsletterPage({ params }: LocaleParams) {
  await initLocale(params)
  const t = await getTranslations("pages.newsletter")
  return (
    <Suspense fallback={<CenteredCard title={t("oneMoment")} />}>
      <NewsletterResult mode="confirm" />
    </Suspense>
  )
}
