import { defineRouting } from "next-intl/routing"

export const LOCALES = ["en", "bn"] as const
export type AppLocale = (typeof LOCALES)[number]

/**
 * English keeps the bare URLs (/gear); Bangla lives under /bn (/bn/gear).
 * Every public page is prerendered once per locale.
 *
 * The NEXT_LOCALE cookie remembers the last choice: an unprefixed URL
 * redirects to /bn for someone who picked Bangla. Signed-in users' choice is
 * also saved as `User.locale` and restored into the cookie on login.
 */
export const routing = defineRouting({
  locales: LOCALES,
  defaultLocale: "en",
  localePrefix: "as-needed",
  localeCookie: { name: "NEXT_LOCALE", maxAge: 60 * 60 * 24 * 365 },
})

export const LOCALE_COOKIE = "NEXT_LOCALE"

/** "/gear" in a locale: "/gear" for English, "/bn/gear" for Bangla. */
export function localizedPath(locale: string, path: string) {
  if (locale === routing.defaultLocale) return path
  return path === "/" ? `/${locale}` : `/${locale}${path}`
}

/** Splits "/bn/gear" into { locale: "bn", path: "/gear" }. */
export function splitLocale(pathname: string): {
  locale: AppLocale
  path: string
} {
  const [, first, ...rest] = pathname.split("/")
  const match = LOCALES.find(
    (locale) => locale !== routing.defaultLocale && locale === first
  )
  if (!match) return { locale: routing.defaultLocale, path: pathname }
  return { locale: match, path: `/${rest.join("/")}` }
}

/** Props of every page and layout under app/[locale]. */
export type LocaleParams = { params: Promise<{ locale: string }> }
