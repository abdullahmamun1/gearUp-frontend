import type { Metadata } from "next"
import { Suspense } from "react"

import {
  PaymentRedirect,
  PaymentRedirectCard,
} from "@/components/modules/customer/PaymentRedirect"

export const metadata: Metadata = {
  title: "Payment · GearUp",
  robots: { index: false },
}

export default function PaymentCancelledPage() {
  return (
    <Suspense fallback={<PaymentRedirectCard />}>
      <PaymentRedirect flag="cancelled" />
    </Suspense>
  )
}
