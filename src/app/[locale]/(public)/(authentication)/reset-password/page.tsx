import type { AppLocale, LocaleParams } from "@/i18n/routing"
import { initLocale } from "@/i18n/server"
import type { Metadata } from "next"
import { getTranslations } from "@/i18n/getTranslations"
import { Suspense } from "react"

import { ResetPasswordView } from "@/components/modules/auth/ResetPasswordView"
import { CenteredCard } from "@/components/shared/CenteredCard"

export async function generateMetadata({
  params,
}: LocaleParams): Promise<Metadata> {
  const t = await getTranslations({
    locale: (await params).locale as AppLocale,
    namespace: "auth.reset.meta",
  })
  return {
    title: t("title"),
    robots: { index: false },
  }
}

/** Static: the token is read in the browser. */
export default async function ResetPasswordPage({ params }: LocaleParams) {
  await initLocale(params)
  const t = await getTranslations("auth.reset")
  return (
    <Suspense fallback={<CenteredCard title={t("title")} />}>
      <ResetPasswordView />
    </Suspense>
  )
}
