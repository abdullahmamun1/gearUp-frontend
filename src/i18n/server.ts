import { hasLocale } from "next-intl"
import { setRequestLocale } from "next-intl/server"

import { routing, type AppLocale, type LocaleParams } from "./routing"

/**
 * First line of every page and layout under app/[locale]: tells next-intl
 * the locale so the page can render statically (no request headers), and
 * returns it.
 */
export async function initLocale(
  params: LocaleParams["params"]
): Promise<AppLocale> {
  const { locale } = await params
  const valid = hasLocale(routing.locales, locale)
    ? locale
    : routing.defaultLocale
  setRequestLocale(valid)
  return valid
}
