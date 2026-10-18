import type { LocaleParams } from "@/i18n/routing"
import { initLocale } from "@/i18n/server"
import type { Metadata } from "next"

/** Sign-in and account pages: useful to people, not to search results. */
export const metadata: Metadata = {
  robots: { index: false, follow: true },
}

export default async function AuthenticationLayout({
  children,
  params,
}: LocaleParams & {
  children: React.ReactNode
}) {
  await initLocale(params)
  return children
}
