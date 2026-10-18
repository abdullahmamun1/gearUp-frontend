import { useMemo } from "react"
import {
  useLocale,
  useTranslations as useNextIntlTranslations,
} from "next-intl"

import { withLocalizedNumbers } from "./localizeValues"

/**
 * next-intl's useTranslations, plus Bengali digits for numbers in plain
 * placeholders on Bangla pages. Import this one in components.
 */
export const useTranslations = ((namespace?: never) => {
  const t = useNextIntlTranslations(namespace)
  const locale = useLocale()
  return useMemo(() => withLocalizedNumbers(t, locale), [t, locale])
}) as typeof useNextIntlTranslations
