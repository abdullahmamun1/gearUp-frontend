import {
  getLocale,
  getTranslations as getNextIntlTranslations,
} from "next-intl/server"

import { withLocalizedNumbers } from "./localizeValues"

/**
 * next-intl's getTranslations, plus Bengali digits for numbers in plain
 * placeholders on Bangla pages. Import this one in server code.
 */
export const getTranslations = (async (options?: never) => {
  const t = await getNextIntlTranslations(options)
  const locale =
    typeof options === "object" && options && "locale" in options
      ? String((options as { locale: string }).locale)
      : await getLocale()
  return withLocalizedNumbers(t, locale)
}) as typeof getNextIntlTranslations
