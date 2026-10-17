import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { StyleGuide } from "@/components/modules/styleguide/StyleGuide"

export const metadata: Metadata = {
  title: "Style guide · GearUp",
  robots: { index: false, follow: false },
}

/** Every token and primitive in one place. Development only. */
export default function StyleGuidePage() {
  if (process.env.NODE_ENV === "production") notFound()
  return <StyleGuide />
}
