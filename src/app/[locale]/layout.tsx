import type { Metadata, Viewport } from "next"
import { Analytics } from "@vercel/analytics/next"
import { SpeedInsights } from "@vercel/speed-insights/next"
import {
  Bricolage_Grotesque,
  Geist_Mono,
  Hind_Siliguri,
  Plus_Jakarta_Sans,
} from "next/font/google"
import { notFound } from "next/navigation"
import { hasLocale, NextIntlClientProvider } from "next-intl"
import { getMessages, setRequestLocale } from "next-intl/server"
import { getTranslations } from "@/i18n/getTranslations"

import "../globals.css"
import { CLIENT_MESSAGES, pickMessages } from "@/i18n/pickMessages"
import { routing, type LocaleParams } from "@/i18n/routing"
import { QueryProvider } from "@/providers/QueryProvider"
import { ThemeProvider } from "@/providers/ThemeProvider"
import { Toaster } from "@/components/ui/sonner"
import { ServiceWorker } from "@/components/shared/ServiceWorker"
import { BRAND_HEX, SITE_NAME, SITE_URL } from "@/lib/site"
import { cn } from "@/lib/utils"

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export async function generateMetadata({
  params,
}: LocaleParams): Promise<Metadata> {
  const requested = (await params).locale
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale
  const t = await getTranslations({ locale, namespace: "metadata.site" })
  return {
    metadataBase: new URL(SITE_URL),
    title: t("title"),
    description: t("description"),
    applicationName: SITE_NAME,
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      locale: locale === "bn" ? "bn_BD" : "en_BD",
    },
    twitter: { card: "summary_large_image" },
    appleWebApp: { capable: true, title: SITE_NAME, statusBarStyle: "default" },
    formatDetection: { telephone: false },
    icons: { apple: "/icons/apple-touch-icon.png" },
  }
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: BRAND_HEX.paper },
    { media: "(prefers-color-scheme: dark)", color: BRAND_HEX.night },
  ],
}

/** Display and headings. The optical-size axis tightens it at large sizes. */
const fontHeading = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-heading",
  axes: ["opsz"],
  display: "swap",
})

/** Body and UI. */
const fontSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
})

/** Prices, stats and codes, with tabular figures. */
const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
})

/**
 * Bangla text. Only applied (and so only downloaded) on /bn pages; the
 * Latin fonts stay for brand words, prices and numbers.
 */
const fontBangla = Hind_Siliguri({
  subsets: ["bengali"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-bangla",
  display: "swap",
  preload: false,
})

export default async function LocaleLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode
  params: Promise<{ locale: string }>
}>) {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) notFound()
  // Static rendering: tell next-intl the locale instead of reading headers.
  setRequestLocale(locale)

  return (
    <html
      lang={locale}
      suppressHydrationWarning
      className={cn(
        "antialiased",
        fontMono.variable,
        "font-sans",
        fontSans.variable,
        fontHeading.variable,
        locale === "bn" && fontBangla.variable
      )}
    >
      <body>
        {/* Client components get only the messages they use (see the
            route-group layouts); the rest stay on the server. */}
        <NextIntlClientProvider
          messages={pickMessages(await getMessages(), CLIENT_MESSAGES.root)}
        >
          <ThemeProvider>
            <QueryProvider>
              {children}
              <Toaster position="top-right" richColors />
            </QueryProvider>
          </ThemeProvider>
        </NextIntlClientProvider>
        <ServiceWorker />
        {/* Their scripts are served by Vercel; elsewhere they'd 404. */}
        {process.env.VERCEL && (
          <>
            <Analytics />
            <SpeedInsights />
          </>
        )}
      </body>
    </html>
  )
}
