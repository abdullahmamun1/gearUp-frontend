import type { Metadata } from "next"
import { Suspense } from "react"

import { ResetPasswordView } from "@/components/modules/auth/ResetPasswordView"
import { CenteredCard } from "@/components/shared/CenteredCard"

export const metadata: Metadata = {
  title: "Reset password · GearUp",
  robots: { index: false },
}

/** Static: the token is read in the browser. */
export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<CenteredCard title="Choose a new password" />}>
      <ResetPasswordView />
    </Suspense>
  )
}
