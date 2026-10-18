import type { LocaleParams } from "@/i18n/routing"
import { initLocale } from "@/i18n/server"
import { PageTransition } from "@/components/shared/motion/PageTransition"
import { Footer } from "@/components/layout/Footer"
import { Navbar } from "@/components/layout/Navbar"
import { GearFinder } from "@/components/modules/ai/GearFinder"
import { NextIntlClientProvider } from "next-intl"
import { getMessages } from "next-intl/server"
import { CLIENT_MESSAGES, pickMessages } from "@/i18n/pickMessages"

export default async function PublicLayout({
  children,
  params,
}: LocaleParams & {
  children: React.ReactNode
}) {
  await initLocale(params)
  const messages = pickMessages(await getMessages(), CLIENT_MESSAGES.public)
  return (
    <NextIntlClientProvider messages={messages}>
      <div className="flex min-h-svh flex-col">
        <Navbar />
        <main className="flex-1">
          <PageTransition>{children}</PageTransition>
        </main>
        <Footer />
        <GearFinder />
      </div>
    </NextIntlClientProvider>
  )
}
