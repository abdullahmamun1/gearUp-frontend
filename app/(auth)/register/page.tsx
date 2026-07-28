import type { Metadata } from "next"
import Link from "next/link"
import {
  BadgeCheck,
  Lock,
  Mail,
  Phone,
  Sparkles,
  User,
  Wallet,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

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

const ROLES = [
  {
    value: "CUSTOMER",
    title: "I want to rent",
    body: "Browse and book gear for your trips.",
    defaultChecked: true,
  },
  {
    value: "PROVIDER",
    title: "I want to list",
    body: "Rent out gear you already own.",
    defaultChecked: false,
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
            Gear up for the{" "}
            <span className="text-primary">next trip</span>
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

          <form className="mt-8 grid gap-5">
            <fieldset className="grid gap-2">
              <legend className="mb-2 text-sm font-medium">
                How will you use GearUp?
              </legend>
              <div className="grid gap-3 sm:grid-cols-2">
                {ROLES.map((role) => (
                  <label
                    key={role.value}
                    className="cursor-pointer rounded-lg border p-3 transition-colors hover:bg-accent/50 has-checked:border-primary has-checked:bg-primary/5 has-focus-visible:ring-2 has-focus-visible:ring-ring/30"
                  >
                    <input
                      type="radio"
                      name="role"
                      value={role.value}
                      defaultChecked={role.defaultChecked}
                      className="sr-only"
                    />
                    <span className="block text-sm font-medium">
                      {role.title}
                    </span>
                    <span className="mt-1 block text-xs text-muted-foreground">
                      {role.body}
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>

            <div className="grid gap-2">
              <Label htmlFor="name" className="text-sm">
                Full name
              </Label>
              <div className="relative">
                <User
                  className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
                  aria-hidden
                />
                <Input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  placeholder="Abdullah Mamun"
                  className="h-10 pl-9 text-sm md:text-sm"
                />
              </div>
            </div>

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
              <Label htmlFor="phone" className="text-sm">
                Phone
                <span className="font-normal text-muted-foreground">
                  (optional)
                </span>
              </Label>
              <div className="relative">
                <Phone
                  className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
                  aria-hidden
                />
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  autoComplete="tel"
                  placeholder="+880 1XXX XXXXXX"
                  className="h-10 pl-9 text-sm md:text-sm"
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="password" className="text-sm">
                Password
              </Label>
              <div className="relative">
                <Lock
                  className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
                  aria-hidden
                />
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  placeholder="••••••••"
                  className="h-10 pl-9 text-sm md:text-sm"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                At least 8 characters.
              </p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="confirmPassword" className="text-sm">
                Confirm password
              </Label>
              <div className="relative">
                <Lock
                  className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
                  aria-hidden
                />
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  placeholder="••••••••"
                  className="h-10 pl-9 text-sm md:text-sm"
                />
              </div>
            </div>

            <Button type="submit" size="lg" className="h-10 text-sm">
              Create account
            </Button>
          </form>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            By creating an account you agree to our Terms and Privacy Policy.
          </p>
        </div>
      </div>
    </section>
  )
}
