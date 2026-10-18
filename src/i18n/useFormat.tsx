"use client"

import { createContext, useContext } from "react"
import { useLocale } from "next-intl"

import { createFormat, type Digits } from "./format"

const DigitsContext = createContext<Digits>("native")

/** Dashboards pass the user's digits preference; public pages don't. */
export function DigitsProvider({
  digits,
  children,
}: {
  digits: Digits
  children: React.ReactNode
}) {
  return <DigitsContext value={digits}>{children}</DigitsContext>
}

/** `const format = useFormat(); format.price(gear.pricePerDay)` */
export function useFormat() {
  return createFormat(useLocale(), useContext(DigitsContext))
}
