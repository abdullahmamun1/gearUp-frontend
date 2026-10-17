import type { Metadata } from "next"
import { Suspense } from "react"
import Link from "next/link"
import { BadgeCheck, Sparkles, Wallet } from "lucide-react"

import { AuthShell } from "@/components/modules/auth/AuthShell"
import { CyclingScene } from "@/components/shared/illustrations/scenes"
import {
  RegisterForm,
  RegisterFormFromUrl,
} from "@/components/modules/auth/RegisterForm"

export const metadata: Metadata = {
  title: "Sign up · GearUp",
  description:
    "Create a GearUp account to rent gear by the day, or list your own kit and earn from it.",
}

const PERKS = [
  {
    icon: Sparkles,
    title: "Rent instead of buy",
    body: "Tents, kayaks and bikes by the day — no storage, no upkeep, no commitment.",
  },
  {
    icon: Wallet,
    title: "Earn from idle kit",
    body: "List gear you're not using and set your own price per day as a provider.",
  },
  {
    icon: BadgeCheck,
    title: "Booked and paid securely",
    body: "Availability is checked against your dates and payments are handled online.",
  },
]

/** Static: ?role is read in the browser (RegisterFormFromUrl). */
export default function RegisterPage() {
  return (
    <AuthShell
      eyebrow="Free to join"
      headline="Gear up for the next trip"
      description="One account to book kit from local providers — or to start renting out your own."
      perks={PERKS}
      scene={<CyclingScene />}
      title="Create your account"
      subtitle={
        <>
          Already have one?{" "}
          <Link
            href="/login"
            className="font-medium text-primary hover:underline"
          >
            Log in
          </Link>
        </>
      }
      footnote={
        <>
          By creating an account you agree to our{" "}
          <Link
            href="/privacy#terms"
            className="underline-offset-2 hover:underline"
          >
            Terms and Privacy Policy
          </Link>
          .
        </>
      }
    >
      <Suspense fallback={<RegisterForm />}>
        <RegisterFormFromUrl />
      </Suspense>
    </AuthShell>
  )
}
