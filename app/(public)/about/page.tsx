import type { Metadata } from "next"
import Link from "next/link"
import {
  Boxes,
  CreditCard,
  PackageCheck,
  ShieldCheck,
  Tags,
  Users,
} from "lucide-react"

import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

import { getCategories } from "../_actions/getCategories"
import { getGearList } from "../_actions/getGear"

export const metadata: Metadata = {
  title: "About · GearUp",
  description:
    "GearUp is a rental marketplace for sports and outdoor gear — rent by the day from local providers, or earn from kit you already own.",
}

const ROLES = [
  {
    icon: PackageCheck,
    title: "For renters",
    body: "Find gear that's free on your dates, book it by the day, and pay securely online. Every booking tracks its own status, from placed through to returned.",
  },
  {
    icon: Boxes,
    title: "For providers",
    body: "List the kit you already own, set a daily price and stock count, and confirm bookings as they arrive. Toggle a listing unavailable the moment it needs a repair.",
  },
  {
    icon: ShieldCheck,
    title: "For our admins",
    body: "Moderate every listing and rental, manage categories, and suspend accounts that break the rules — with the change taking effect on that user's very next request.",
  },
]

export default async function AboutPage() {
  const [gearRes, categoriesRes] = await Promise.all([
    getGearList({ limit: "1" }),
    getCategories(),
  ])

  const stats = [
    {
      icon: Boxes,
      value: gearRes.data?.meta?.total ?? 0,
      label: "items listed",
    },
    { icon: Tags, value: categoriesRes.data?.length ?? 0, label: "categories" },
    { icon: CreditCard, value: "Stripe", label: "secure payments" },
    { icon: Users, value: 3, label: "roles, one codebase" },
  ]

  return (
    <>
      <section className="border-b">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:py-20">
          <h1 className="max-w-2xl font-heading text-3xl font-bold tracking-tight text-balance sm:text-4xl">
            Good gear sits unused far more often than it gets used
          </h1>
          <p className="mt-5 max-w-2xl text-pretty text-muted-foreground sm:text-lg">
            A tent gets three weekends a year. A kayak, maybe two. GearUp exists
            to close that gap — so the people who own equipment can earn from it
            between trips, and the people who need it for one weekend don&apos;t
            have to buy it outright.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/gear"
              className={cn(
                buttonVariants({ size: "lg" }),
                "h-11 px-5 text-sm"
              )}
            >
              Browse the catalogue
            </Link>
            <Link
              href="/register"
              className={cn(
                buttonVariants({ variant: "outline", size: "lg" }),
                "h-11 px-5 text-sm"
              )}
            >
              List your gear
            </Link>
          </div>
        </div>
      </section>

      <section className="border-b bg-muted/30">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label}>
              <stat.icon className="size-5 text-primary" aria-hidden />
              <p className="mt-3 font-heading text-2xl font-bold">
                {stat.value}
              </p>
              <p className="mt-0.5 text-sm text-muted-foreground">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14">
        <h2 className="font-heading text-2xl font-bold sm:text-3xl">
          One marketplace, three points of view
        </h2>
        <p className="mt-2 max-w-2xl text-pretty text-muted-foreground">
          Renting only works if it&apos;s straightforward on both sides of the
          transaction — and if somebody is keeping an eye on the whole thing.
        </p>

        <ul className="mt-10 grid gap-8 sm:grid-cols-3">
          {ROLES.map((role) => (
            <li key={role.title}>
              <div className="grid size-12 place-items-center rounded-full bg-primary/10">
                <role.icon className="size-5 text-primary" aria-hidden />
              </div>
              <h3 className="mt-4 font-heading font-semibold">{role.title}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">
                {role.body}
              </p>
            </li>
          ))}
        </ul>
      </section>

      <section className="border-t bg-muted/30">
        <div className="mx-auto max-w-6xl px-4 py-14">
          <h2 className="font-heading text-2xl font-bold sm:text-3xl">
            How we handle the awkward parts
          </h2>

          <dl className="mt-8 grid gap-8 sm:grid-cols-2">
            <div>
              <dt className="font-heading font-semibold">
                Payment only opens once a provider agrees
              </dt>
              <dd className="mt-1.5 text-sm text-muted-foreground">
                A booking starts as placed, not paid. Nobody is charged for kit
                that hasn&apos;t been accepted, and a booking can be cancelled
                freely up until that point.
              </dd>
            </div>
            <div>
              <dt className="font-heading font-semibold">
                Card details never touch our servers
              </dt>
              <dd className="mt-1.5 text-sm text-muted-foreground">
                Checkout is handled entirely by Stripe. We store a payment
                status and an amount — never a card number.
              </dd>
            </div>
            <div>
              <dt className="font-heading font-semibold">
                Reviews come from real rentals
              </dt>
              <dd className="mt-1.5 text-sm text-muted-foreground">
                A review can only be left against a completed order, and only
                once. Ratings on a listing reflect people who actually rented
                it.
              </dd>
            </div>
            <div>
              <dt className="font-heading font-semibold">
                Stock is respected, not assumed
              </dt>
              <dd className="mt-1.5 text-sm text-muted-foreground">
                Quantity is capped at what a provider actually has, and a
                listing marked unavailable disappears from booking immediately.
              </dd>
            </div>
          </dl>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14">
        <div className="rounded-2xl border bg-primary/5 px-6 py-12 text-center">
          <h2 className="font-heading text-2xl font-bold">
            Got a question first?
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
            We&apos;d rather answer it before you book than after.
          </p>
          <Link
            href="/contact"
            className={cn(
              buttonVariants({ size: "lg" }),
              "mt-6 h-11 px-5 text-sm"
            )}
          >
            Get in touch
          </Link>
        </div>
      </section>
    </>
  )
}
