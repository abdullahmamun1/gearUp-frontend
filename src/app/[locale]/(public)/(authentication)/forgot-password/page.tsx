import type { AppLocale, LocaleParams } from "@/i18n/routing"
import { initLocale } from "@/i18n/server"
import type { Metadata } from "next"
import { getTranslations } from "@/i18n/getTranslations"
import { CenteredCard } from "@/components/shared/CenteredCard"
import { KeyScene } from "@/components/shared/illustrations/scenes"

import { ForgotPasswordForm } from "@/components/modules/auth/ForgotPasswordForm"

export async function generateMetadata({
  params,
}: LocaleParams): Promise<Metadata> {
  const t = await getTranslations({
    locale: (await params).locale as AppLocale,
    namespace: "auth.forgot.meta",
  })
  return {
    title: t("title"),
    robots: { index: false },
  }
}

export default async function ForgotPasswordPage({ params }: LocaleParams) {
  await initLocale(params)
  const t = await getTranslations("auth.forgot")
  return (
    <CenteredCard
      illustration={<KeyScene />}
      title={t("title")}
      description={t("description")}
    >
      <ForgotPasswordForm />
    </CenteredCard>
  )
}
