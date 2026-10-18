import type { LocaleParams } from "@/i18n/routing"
import { initLocale } from "@/i18n/server"
import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { StyleGuide } from "@/components/modules/styleguide/StyleGuide"

export const metadata: Metadata = {
  title: "Style guide · GearUp",
  robots: { index: false, follow: false },
}

/** Every token and primitive in one place. Development only. */
export default async function StyleGuidePage({ params }: LocaleParams) {
  await initLocale(params)
  if (process.env.NODE_ENV === "production") notFound()
  return <StyleGuide />
}
