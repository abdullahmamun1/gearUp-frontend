"use client"

import { useFormat } from "@/i18n/useFormat"

/**
 * Locale-aware values for components that render on both sides (and so
 * can't await the dashboard formatter): Bengali digits in Bangla, honouring
 * the dashboard digits preference.
 */
export function FormattedNumber({ value }: { value: number }) {
  const format = useFormat()
  // English keeps the plain number, exactly as before.
  return <>{format.locale === "en" ? value : format.number(value)}</>
}
