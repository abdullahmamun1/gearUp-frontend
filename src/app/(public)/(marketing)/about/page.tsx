import type { Metadata } from "next"
import Link from "next/link"
import {
  ArrowRight,
  BadgeCheck,
  Boxes,
  CreditCard,
  Lock,
  Star,
  Store,
  Tags,
} from "lucide-react"

import { getPlatformStats } from "@/api/stats"
import { FinalCta } from "@/components/modules/marketing/home/FinalCta"
import { Section } from "@/components/modules/marketing/home/Section"
import {
  CampingScene,
  CyclingScene,
  PickupStepScene,
  SearchStepScene,
  ShieldScene,
  WaterScene,
} from "@/components/shared/illustrations/scenes"
import { AnimatedCounter } from "@/components/shared/motion/AnimatedCounter"
import { SpotlightCard } from "@/components/shared/motion/SpotlightCard"
import { PageHero } from "@/components/shared/PageHero"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export const metadata: Metadata = {
  title: "About · GearUp",
  description:
    "GearUp is a rental marketplace for sports and outdoor gear — rent by the day from local providers, or earn from kit you already own.",
}

const ROLES = [
  {
    scene: SearchStepScene,
    tone: "bg-lagoon/10",
    title: "For renters",
    body: "Find gear that's free on your dates, book it by the day, and pay securely online. Every booking tracks its own status, from placed through to returned.",
    link: { href: "/gear", label: "Browse gear" },
  },
  {
    scene: PickupStepScene,
    tone: "bg-ember/10",
    title: "For providers",
    body: "List the kit you already own, set a daily price and stock count, and confirm bookings as they arrive. Toggle a listing unavailable the moment it needs a repair.",
    link: { href: "/register?role=PROVIDER", label: "Start listing" },
  },
  {
    scene: ShieldScene,
    tone: "bg-primary/10",
    title: "For our admins",
    body: "Moderate every listing and rental, manage categories, and suspend accounts that break the rules — with the change taking effect on that user's very next request.",
    link: { href: "/contact", label: "Report a problem" },
  },
]

const PROMISES = [
  {
    icon: CreditCard,
    title: "Payment only opens once a provider agrees",
    body: "A booking starts as placed, not paid. Nobody is charged for kit that hasn't been accepted, and a booking can be cancelled freely up until that point.",
  },
  {
    icon: Lock,
    title: "Card details never touch our servers",
    body: "Checkout is handled entirely by Stripe. We store a payment status and an amount — never a card number.",
  },
  {
    icon: Star,
    title: "Reviews come from real rentals",
    body: "A review can only be left against a completed order, and only once. Ratings on a listing reflect people who actually rented it.",
  },
  {
    icon: Boxes,
    title: "Stock is respected, not assumed",
    body: "Availability is checked against every overlapping booking, so a provider's units can never be double-booked for the same days.",
  },
]

export default async function AboutPage() {
  const stats = await getPlatformStats()

  const numbers = [
    {
      icon: Boxes,
      value: stats?.gear ?? 0,
      label: "items listed",
      tone: "text-primary bg-primary/10",
    },
    {
      icon: Tags,
      value: stats?.categories ?? 0,
      label: "categories",
      tone: "text-lagoon bg-lagoon/10",
    },
    {
      icon: Store,
      value: stats?.providers ?? 0,
      label: "local providers",
      tone: "text-ember-strong bg-ember/10",
    },
    {
      icon: BadgeCheck,
      value: stats?.reviews ?? 0,
      label: "verified reviews",
      tone: "text-success bg-success/10",
    },
  ]

  return (
    <>
      <PageHero
        eyebrow="Our story"
        title={
          <>
            Good gear sits unused far more often than it{" "}
            <span className="text-gradient">gets used</span>
          </>
        }
        description="A tent gets three weekends a year. A kayak, maybe two. GearUp exists to close that gap — so the people who own equipment can earn from it between trips, and the people who need it for one weekend don't have to buy it outright."
        visual={<Collage />}
      >
        <div className="flex flex-wrap gap-3">
          <Link
            href="/gear"
            className={cn(
              buttonVariants({ variant: "cta", size: "lg" }),
              "group h-11 gap-1.5 px-6 text-sm"
            )}
          >
            Browse the catalogue
            <ArrowRight
              className="size-4 transition-transform group-hover:translate-x-0.5"
              aria-hidden
            />
          </Link>
          <Link
            href="/register?role=PROVIDER"
            className={cn(
              buttonVariants({ variant: "glass", size: "lg" }),
              "h-11 px-6 text-sm"
            )}
          >
            List your gear
          </Link>
        </div>
      </PageHero>

      {stats && (
        <section className="mx-auto -mt-px max-w-6xl px-4 pt-12">
          <ul className="reveal-stagger grid grid-cols-2 gap-4 lg:grid-cols-4">
            {numbers.map((stat) => (
              <li key={stat.label} className="card-elevated p-5">
                <span
                  className={cn(
                    "grid size-10 place-items-center rounded-xl",
                    stat.tone
                  )}
                >
                  <stat.icon className="size-5" aria-hidden />
                </span>
                <p className="mt-4 font-heading text-3xl font-bold tracking-tight">
                  <AnimatedCounter value={stat.value} />
                </p>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  {stat.label}
                </p>
              </li>
            ))}
          </ul>
        </section>
      )}

      <Section
        eyebrow="Who it's for"
        title="One marketplace, three points of view"
        description="Renting only works if it's straightforward on both sides of the transaction — and if somebody is keeping an eye on the whole thing."
      >
        <ul className="reveal-stagger grid gap-5 md:grid-cols-3">
          {ROLES.map((role) => (
            <li key={role.title}>
              <SpotlightCard className="flex h-full flex-col overflow-hidden card-elevated">
                <div className={cn("px-8 pt-6", role.tone)}>
                  <role.scene className="mx-auto max-w-56" />
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <h3 className="text-h3">{role.title}</h3>
                  <p className="mt-2 flex-1 text-sm text-muted-foreground">
                    {role.body}
                  </p>
                  <Link
                    href={role.link.href}
                    className="group mt-5 inline-flex items-center gap-1 text-sm font-semibold text-primary"
                  >
                    {role.link.label}
                    <ArrowRight
                      className="size-3.5 transition-transform group-hover:translate-x-0.5"
                      aria-hidden
                    />
                  </Link>
                </div>
              </SpotlightCard>
            </li>
          ))}
        </ul>
      </Section>

      <Section
        tone="muted"
        eyebrow="Trust"
        title="How we handle the awkward parts"
        description="The rules that make renting from a stranger feel safe."
      >
        <ul className="reveal-stagger grid gap-4 sm:grid-cols-2">
          {PROMISES.map((promise, index) => (
            <li key={promise.title} className="flex gap-4 card-elevated p-6">
              <span className="relative grid size-11 shrink-0 place-items-center rounded-xl bg-(image:--gradient-brand) text-primary-foreground shadow-glow-primary">
                <promise.icon className="size-5" aria-hidden />
                <span className="absolute -top-2 -right-2 grid size-5 place-items-center rounded-full border bg-card font-mono text-[10px] font-semibold text-foreground">
                  {index + 1}
                </span>
              </span>
              <div>
                <h3 className="font-heading font-semibold">{promise.title}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground">
                  {promise.body}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </Section>

      <div className="pt-16 sm:pt-20">
        <FinalCta
          title="Got a question first?"
          description="We'd rather answer it before you book than after."
          primary={{ href: "/contact", label: "Get in touch" }}
          secondary={{ href: "/#faq", label: "Read the FAQ" }}
        />
      </div>
    </>
  )
}

/** Three scenes stacked like postcards. */
function Collage() {
  return (
    <div className="relative aspect-5/4">
      <div className="absolute inset-x-[8%] top-[6%] rotate-[-3deg] rounded-3xl border bg-card p-5 shadow-xl">
        <CampingScene />
      </div>
      <div className="absolute bottom-[2%] left-0 w-[46%] rotate-[-8deg] rounded-2xl border bg-card p-3 shadow-lg motion-safe:animate-[float_6s_ease-in-out_infinite]">
        <WaterScene />
      </div>
      <div className="absolute right-0 bottom-[8%] w-[42%] rotate-[7deg] rounded-2xl border bg-card p-3 shadow-lg motion-safe:animate-[float_7s_ease-in-out_1s_infinite]">
        <CyclingScene />
      </div>
    </div>
  )
}
