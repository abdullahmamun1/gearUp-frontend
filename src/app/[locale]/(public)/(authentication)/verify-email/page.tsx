import type { AppLocale, LocaleParams } from "@/i18n/routing"
import { initLocale } from "@/i18n/server"
import type { Metadata } from "next"
import { getTranslations } from "@/i18n/getTranslations"
import { Suspense } from "react"

import {
  VerifyEmailView,
  VerifyingCard,
} from "@/components/modules/auth/VerifyEmailView"

export async function generateMetadata({
  params,
}: LocaleParams): Promise<Metadata> {
  const t = await getTranslations({
    locale: (await params).locale as AppLocale,
    namespace: "auth.verify.meta",
  })
  return {
    title: t("title"),
    robots: { index: false },
  }
}

/** Static: the token is verified in the browser. */
export default async function VerifyEmailPage({ params }: LocaleParams) {
  await initLocale(params)
  return (
    <Suspense fallback={<VerifyingCard />}>
      <VerifyEmailView />
    </Suspense>
  )
}
