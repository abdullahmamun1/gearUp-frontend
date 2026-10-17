import type { Metadata } from "next"
import Link from "next/link"
import { Suspense } from "react"
import { CalendarRange, PackageCheck, ShieldCheck } from "lucide-react"

import { AuthShell } from "@/components/modules/auth/AuthShell"
import { LoginForm } from "@/components/modules/auth/LoginForm"
import { CampingScene } from "@/components/shared/illustrations/scenes"
import { LoginPanel } from "@/components/modules/auth/LoginPanel"

export const metadata: Metadata = {
  title: "Log in · GearUp",
  description:
    "Log in to book gear, manage your rentals and list your own kit.",
}

const PERKS = [
  {
    icon: CalendarRange,
    title: "Your bookings in one place",
    body: "See upcoming pickups, past rentals and receipts without digging through email.",
  },
  {
    icon: PackageCheck,
    title: "Faster checkout",
    body: "Saved details mean you can lock in gear for your dates in a couple of taps.",
  },
  {
    icon: ShieldCheck,
    title: "Verified providers",
    body: "Every listing comes from a provider we've checked, with secure payments throughout.",
  },
]

/** Static: query-string messages and redirects are read in LoginPanel. */
export default function LoginPage() {
  return (
    <AuthShell
      eyebrow="Welcome back"
      headline="Pick up where you left off"
      description="Log in to manage your rentals, message providers and get back on the trail sooner."
      perks={PERKS}
      scene={<CampingScene />}
      title="Log in"
      subtitle={
        <>
          New to GearUp?{" "}
          <Link
            href="/register"
            className="font-medium text-primary hover:underline"
          >
            Create an account
          </Link>
        </>
      }
      footnote={
        <>
          By logging in you agree to our{" "}
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
      <Suspense fallback={<LoginForm />}>
        <LoginPanel />
      </Suspense>
    </AuthShell>
  )
}
