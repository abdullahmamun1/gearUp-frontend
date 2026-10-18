"use client"

import { useFormat } from "@/i18n/useFormat"

/** A number in the page's digits (১২৩ in Bangla). */
export function LocalNumber({ value }: { value: number }) {
  return <>{useFormat().number(value)}</>
}
