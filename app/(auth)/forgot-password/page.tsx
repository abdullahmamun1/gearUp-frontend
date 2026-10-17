import type { Metadata } from "next"
import { KeyRound } from "lucide-react"

import { CenteredCard } from "@/components/shared/CenteredCard"

import { ForgotPasswordForm } from "../_components/ForgotPasswordForm"

export const metadata: Metadata = {
  title: "Forgot password · GearUp",
  robots: { index: false },
}

export default function ForgotPasswordPage() {
  return (
    <CenteredCard
      icon={KeyRound}
      title="Forgot your password?"
      description="Enter the email you signed up with and we'll send you a link to choose a new one."
    >
      <ForgotPasswordForm />
    </CenteredCard>
  )
}
