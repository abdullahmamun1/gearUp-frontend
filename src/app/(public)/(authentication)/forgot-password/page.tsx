import type { Metadata } from "next"
import { CenteredCard } from "@/components/shared/CenteredCard"
import { KeyScene } from "@/components/shared/illustrations/scenes"

import { ForgotPasswordForm } from "@/components/modules/auth/ForgotPasswordForm"

export const metadata: Metadata = {
  title: "Forgot password · GearUp",
  robots: { index: false },
}

export default function ForgotPasswordPage() {
  return (
    <CenteredCard
      illustration={<KeyScene />}
      title="Forgot your password?"
      description="Enter the email you signed up with and we'll send you a link to choose a new one."
    >
      <ForgotPasswordForm />
    </CenteredCard>
  )
}
