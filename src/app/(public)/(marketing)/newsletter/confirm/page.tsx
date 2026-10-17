import type { Metadata } from "next"
import { Suspense } from "react"

import { NewsletterResult } from "@/components/modules/marketing/NewsletterResult"
import { CenteredCard } from "@/components/shared/CenteredCard"

export const metadata: Metadata = {
  title: "Newsletter · GearUp",
  robots: { index: false },
}

export default function ConfirmNewsletterPage() {
  return (
    <Suspense fallback={<CenteredCard title="One moment…" />}>
      <NewsletterResult mode="confirm" />
    </Suspense>
  )
}
