import type { Metadata } from "next"
import Link from "next/link"
import { BadgeCheck, Sparkles, Wallet } from "lucide-react"

import { RegisterForm } from "../_components/RegisterForm"

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

export default function RegisterPage() {
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
            Free to join
          </p>

          <h1 className="font-heading text-4xl font-bold tracking-tight text-balance">
            Gear up for the <span className="text-primary">next trip</span>
          </h1>

          <p className="mt-4 max-w-md text-pretty text-muted-foreground">
            One account to book kit from local providers — or to start renting
            out your own.
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
              Create your account
            </h2>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Already have one?{" "}
              <Link href="/login" className="text-primary hover:underline">
                Log in
              </Link>
            </p>
          </div>

          <RegisterForm />

          <p className="mt-6 text-center text-xs text-muted-foreground">
            By creating an account you agree to our Terms and Privacy Policy.
          </p>
        </div>
      </div>
    </section>
  )
}
