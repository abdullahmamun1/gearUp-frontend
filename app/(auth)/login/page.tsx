import type { Metadata } from "next"
import Link from "next/link"
import {
  CalendarRange,
  Lock,
  Mail,
  PackageCheck,
  ShieldCheck,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

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

export default function LoginPage() {
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

          <form className="mt-8 grid gap-5">
            <div className="grid gap-2">
              <Label htmlFor="email" className="text-sm">
                Email
              </Label>
              <div className="relative">
                <Mail
                  className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
                  aria-hidden
                />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  className="h-10 pl-9 text-sm md:text-sm"
                />
              </div>
            </div>

            <div className="grid gap-2">
              <div className="flex items-center justify-between gap-2">
                <Label htmlFor="password" className="text-sm">
                  Password
                </Label>
                <Link
                  href="/forgot-password"
                  className="text-xs text-muted-foreground hover:text-foreground hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock
                  className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
                  aria-hidden
                />
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="h-10 pl-9 text-sm md:text-sm"
                />
              </div>
            </div>

            <Button type="submit" size="lg" className="h-10 text-sm">
              Log in
            </Button>
          </form>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            By logging in you agree to our Terms and Privacy Policy.
          </p>
        </div>
      </div>
    </section>
  )
}
