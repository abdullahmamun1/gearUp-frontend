import type { Metadata } from "next"
import { Suspense } from "react"

import { NewsletterResult } from "@/components/modules/marketing/NewsletterResult"
import { CenteredCard } from "@/components/shared/CenteredCard"

export const metadata: Metadata = {
  title: "Unsubscribe · GearUp",
  robots: { index: false },
}

export default function UnsubscribePage() {
  return (
    <Suspense fallback={<CenteredCard title="One moment…" />}>
      <NewsletterResult mode="unsubscribe" />
    </Suspense>
  )
}
