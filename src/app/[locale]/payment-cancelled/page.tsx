import type { AppLocale, LocaleParams } from "@/i18n/routing"
import { initLocale } from "@/i18n/server"
import type { Metadata } from "next"
import { getTranslations } from "@/i18n/getTranslations"
import { Suspense } from "react"
import { NextIntlClientProvider } from "next-intl"
import { getMessages } from "next-intl/server"
import { pickMessages } from "@/i18n/pickMessages"

import {
  PaymentRedirect,
  PaymentRedirectCard,
} from "@/components/modules/customer/PaymentRedirect"

export async function generateMetadata({
  params,
}: LocaleParams): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({
    locale: locale as AppLocale,
    namespace: "dashboard.meta",
  })
  return { title: t("payment"), robots: { index: false } }
}

export default async function PaymentCancelledPage({ params }: LocaleParams) {
  await initLocale(params)
  return (
    <NextIntlClientProvider
      messages={pickMessages(await getMessages(), [
        "common",
        "nav",
        "dashboard",
      ])}
    >
      <Suspense fallback={<PaymentRedirectCard />}>
        <PaymentRedirect flag="cancelled" />
      </Suspense>
    </NextIntlClientProvider>
  )
}
