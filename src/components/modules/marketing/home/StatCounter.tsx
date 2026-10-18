"use client"

import { useCallback } from "react"

import { AnimatedCounter } from "@/components/shared/motion/AnimatedCounter"
import { useFormat } from "@/i18n/useFormat"

/** AnimatedCounter in the current locale's digits (১২৩ in Bangla). */
export function StatCounter({ value }: { value: number }) {
  const format = useFormat()
  const formatNumber = useCallback(
    (n: number) => format.number(Math.round(n)),
    [format]
  )
  return <AnimatedCounter value={value} format={formatNumber} />
}
