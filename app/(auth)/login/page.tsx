import type { Metadata } from "next"
import Link from "next/link"
import { CalendarRange, PackageCheck, ShieldCheck } from "lucide-react"

import { LoginForm } from "../_components/LoginForm"

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

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirectTo?: string; reason?: string }>
}) {
  const { redirectTo, reason } = await searchParams
  return (
    <section className="relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-linear-to-br from-primary/10 via-background to-background"
      />

      <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 py-16 sm:py-20 lg:grid-cols-2 lg:gap-16">
        {/* Marketing panel */}
        <div className="hidden lg:block">
          <p className="mb-4 inline-flex items-center gap-2 rounded-full border bg-card px-3 py-1 text-xs text-muted-foreground">
            <span className="size-1.5 rounded-full bg-primary" aria-hidden />
            Welcome back
          </p>

          <h1 className="font-heading text-4xl font-bold tracking-tight text-balance">
            Pick up where you <span className="text-primary">left off</span>
          </h1>

          <p className="mt-4 max-w-md text-pretty text-muted-foreground">
            Log in to manage your rentals, message providers and get back on the
            trail sooner.
          </p>

          <ul className="mt-10 grid gap-6">
            {PERKS.map((perk) => (
              <li key={perk.title} className="flex gap-4">
                <div className="grid size-10 shrink-0 place-items-center rounded-full bg-primary/10">
                  <perk.icon className="size-4 text-primary" aria-hidden />
                </div>
                <div>
                  <h2 className="font-heading text-sm font-semibold">
                    {perk.title}
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {perk.body}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Form panel */}
        <div className="mx-auto w-full max-w-md rounded-xl border bg-card p-6 shadow-sm sm:p-8">
          <div className="text-center lg:text-left">
            <h2 className="font-heading text-2xl font-bold tracking-tight">
              Log in
            </h2>
            <p className="mt-1.5 text-sm text-muted-foreground">
              New to GearUp?{" "}
              <Link href="/register" className="text-primary hover:underline">
                Create an account
              </Link>
            </p>
          </div>
          {reason === "suspended" ? (
            <p
              role="alert"
              className="mt-6 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive"
            >
              Your account has been suspended, so you&apos;ve been signed out.
              Please contact support if you think this is a mistake.
            </p>
          ) : null}

          <LoginForm redirectTo={redirectTo} />

          <p className="mt-6 text-center text-xs text-muted-foreground">
            By logging in you agree to our Terms and Privacy Policy.
          </p>
        </div>
      </div>
    </section>
  )
}
