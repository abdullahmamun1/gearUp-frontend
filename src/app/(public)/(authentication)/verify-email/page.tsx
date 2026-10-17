import type { Metadata } from "next"
import { Suspense } from "react"

import {
  VerifyEmailView,
  VerifyingCard,
} from "@/components/modules/auth/VerifyEmailView"

export const metadata: Metadata = {
  title: "Verify email · GearUp",
  robots: { index: false },
}

/** Static: the token is verified in the browser. */
export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<VerifyingCard />}>
      <VerifyEmailView />
    </Suspense>
  )
}
