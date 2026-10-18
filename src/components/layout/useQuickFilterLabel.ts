"use client"

import { useTranslations } from "@/i18n/translations"

import type { QuickFilter } from "@/constants/navigation"
import { useFormat } from "@/i18n/useFormat"

/** Label for a quick filter ("Available today", "Under ৳500 / day"). */
export function useQuickFilterLabel() {
  const t = useTranslations("nav.quickFilters")
  const format = useFormat()

  return (filter: QuickFilter) =>
    "price" in filter
      ? t(filter.key, { price: format.price(filter.price) })
      : t(filter.key)
}
