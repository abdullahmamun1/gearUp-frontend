import { ArrowRight, Sparkles, Tent } from "lucide-react"

import { PaymentStatusBadge } from "@/components/shared/PaymentStatusBadge"
import { RentalStatusBadge } from "@/components/shared/RentalStatusBadge"
import { ThemeToggle } from "@/components/shared/ThemeToggle"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  CampingScene,
  ClimbingScene,
  CyclingScene,
  DatesStepScene,
  HikingScene,
  PickupStepScene,
  SearchStepScene,
  TeamSportsScene,
  WaterScene,
} from "@/components/shared/illustrations/scenes"
import { cn } from "@/lib/utils"
import type { PaymentStatus, RentalStatus } from "@/types"

const BRAND = [
  {
    name: "Pine",
    token: "primary",
    text: "primary-foreground",
    role: "Main actions, links, focus",
  },
  {
    name: "Ember",
    token: "ember",
    text: "ember-foreground",
    role: "Main CTAs, AI accents",
  },
  {
    name: "Lagoon",
    token: "lagoon",
    text: "lagoon-foreground",
    role: "Info, maps, water",
  },
]

const NEUTRALS = [
  "background",
  "card",
  "muted",
  "secondary",
  "accent",
  "border",
]

const STATUS = ["success", "warning", "info", "destructive", "ember-strong"]

const CHARTS = ["chart-1", "chart-2", "chart-3", "chart-4", "chart-5"]

const TYPE = [
  { className: "text-display", label: "Display", sample: "Rent the trip" },
  { className: "text-h1", label: "H1", sample: "Gear for every adventure" },
  { className: "text-h2", label: "H2", sample: "Browse by category" },
  { className: "text-h3", label: "H3", sample: "2-Person Dome Tent" },
  {
    className: "text-base",
    label: "Body",
    sample: "Tents, kayaks and bikes by the day from local providers.",
  },
  {
    className: "text-sm text-muted-foreground",
    label: "Small",
    sample: "Free cancellation until you pay.",
  },
  {
    className: "text-eyebrow text-primary",
    label: "Eyebrow",
    sample: "Start here",
  },
  {
    className: "font-mono text-sm tabular-nums",
    label: "Mono",
    sample: "৳1,200 · ORD-5be3a11e",
  },
]

const SCENES = [
  ["CampingScene", CampingScene],
  ["WaterScene", WaterScene],
  ["CyclingScene", CyclingScene],
  ["HikingScene", HikingScene],
  ["ClimbingScene", ClimbingScene],
  ["TeamSportsScene", TeamSportsScene],
  ["SearchStepScene", SearchStepScene],
  ["DatesStepScene", DatesStepScene],
  ["PickupStepScene", PickupStepScene],
] as const

const BUTTONS = [
  "default",
  "cta",
  "tertiary",
  "outline",
  "secondary",
  "ghost",
  "glass",
  "destructive",
  "link",
] as const
const BADGES = [
  "default",
  "secondary",
  "outline",
  "success",
  "warning",
  "info",
  "ember",
  "destructive",
] as const
const RENTAL: RentalStatus[] = [
  "PLACED",
  "CONFIRMED",
  "PAID",
  "PICKED_UP",
  "RETURNED",
  "CANCELLED",
]
const PAYMENT: PaymentStatus[] = ["PENDING", "COMPLETED", "FAILED"]

export function StyleGuide() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-eyebrow text-primary">Design system</p>
          <h1 className="mt-2 text-h1">
            GearUp <span className="text-gradient">style guide</span>
          </h1>
          <p className="mt-2 max-w-xl text-muted-foreground">
            Land · Fire · Water. Toggle the theme to check both modes — every
            pair here passes{" "}
            <code className="font-mono text-xs">npm run check:contrast</code>.
          </p>
        </div>
        <ThemeToggle />
      </header>

      <Section title="Brand colours">
        <div className="grid gap-4 sm:grid-cols-3">
          {BRAND.map((color) => (
            <div key={color.token} className="overflow-hidden card-elevated">
              <div
                className="flex h-28 items-end p-4"
                style={{
                  background: `var(--${color.token})`,
                  color: `var(--${color.text})`,
                }}
              >
                <span className="text-h3">{color.name}</span>
              </div>
              <div className="p-4 text-sm">
                <p className="font-mono text-xs">--{color.token}</p>
                <p className="mt-1 text-muted-foreground">{color.role}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="flex h-20 items-center rounded-xl bg-(image:--gradient-brand) px-5 font-heading text-lg font-bold text-primary-foreground">
            --gradient-brand
          </div>
          <div className="flex h-20 items-center rounded-xl bg-(image:--gradient-sunset) px-5 font-heading text-lg font-bold text-ember-foreground">
            --gradient-sunset
          </div>
        </div>
      </Section>

      <Section title="Neutrals, status and charts">
        <Swatches names={NEUTRALS} />
        <Swatches names={STATUS} className="mt-4" />
        <Swatches names={CHARTS} className="mt-4" />
      </Section>

      <Section title="Typography">
        <p className="mb-4 text-sm text-muted-foreground">
          Bricolage Grotesque for headings, Plus Jakarta Sans for body, Geist
          Mono for numbers. Headings scale fluidly with the viewport.
        </p>
        <div className="divide-y rounded-xl border bg-card shadow-xs">
          {TYPE.map((row) => (
            <div
              key={row.label}
              className="grid gap-2 p-4 sm:grid-cols-[8rem_1fr] sm:items-baseline"
            >
              <span className="font-mono text-xs text-muted-foreground">
                {row.label}
              </span>
              <p className={row.className}>{row.sample}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Buttons">
        <div className="flex flex-wrap gap-3">
          {BUTTONS.map((variant) => (
            <Button
              key={variant}
              variant={variant}
              size="lg"
              className="h-10 px-4 text-sm"
            >
              {variant}
            </Button>
          ))}
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <Button variant="cta" size="lg" className="h-11 gap-1.5 px-6 text-sm">
            Rent now <ArrowRight className="size-4" aria-hidden />
          </Button>
          <Button
            variant="tertiary"
            size="lg"
            className="h-11 gap-1.5 px-6 text-sm"
          >
            <Sparkles className="size-4" aria-hidden /> Plan with AI
          </Button>
          <Button size="lg" className="h-11 px-6 text-sm" disabled>
            Disabled
          </Button>
          <Button variant="outline" size="icon-lg" aria-label="Tent">
            <Tent />
          </Button>
        </div>
      </Section>

      <Section title="Badges">
        <div className="flex flex-wrap gap-2">
          {BADGES.map((variant) => (
            <Badge key={variant} variant={variant}>
              {variant}
            </Badge>
          ))}
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {RENTAL.map((status) => (
            <RentalStatusBadge key={status} status={status} />
          ))}
          {PAYMENT.map((status) => (
            <PaymentStatusBadge key={status} status={status} />
          ))}
        </div>
      </Section>

      <Section title="Inputs">
        <div className="grid max-w-md gap-3">
          <Input
            placeholder="Search tents, kayaks, bikes…"
            className="h-10 text-sm"
          />
          <Input
            aria-invalid
            placeholder="Invalid field"
            className="h-10 text-sm"
          />
        </div>
      </Section>

      <Section title="Surfaces and shadows">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Surface
            className="rounded-xl border bg-card shadow-xs"
            label="card · shadow-xs"
          />
          <Surface className="card-elevated" label="card-elevated (hover)" />
          <Surface
            className="gradient-border rounded-xl bg-card"
            label="gradient-border"
          />
          <div className="relative overflow-hidden rounded-xl">
            <div aria-hidden className="absolute inset-0 bg-mesh" />
            <Surface
              className="relative m-4 rounded-xl border glass"
              label="glass over mesh"
            />
          </div>
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-5">
          {[
            "shadow-xs",
            "shadow-sm",
            "shadow-md",
            "shadow-lg",
            "shadow-xl",
          ].map((shadow) => (
            <Surface
              key={shadow}
              className={cn("rounded-xl bg-card", shadow)}
              label={shadow}
            />
          ))}
        </div>
      </Section>

      <Section title="Illustrations">
        <div className="grid gap-4 sm:grid-cols-3">
          {SCENES.map(([name, Scene]) => (
            <div
              key={name}
              className="overflow-hidden rounded-xl border bg-card shadow-xs"
            >
              <Scene className="bg-muted/40 p-3" />
              <p className="border-t px-3 py-2 font-mono text-xs">{name}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Backgrounds">
        <div className="grid gap-4 sm:grid-cols-4">
          {["bg-grid", "bg-dots", "bg-noise", "bg-mesh"].map((bg) => (
            <div key={bg} className="overflow-hidden rounded-xl border">
              <div className={cn("h-32", bg)} />
              <p className="border-t bg-card px-3 py-2 font-mono text-xs">
                {bg}
              </p>
            </div>
          ))}
        </div>
      </Section>
    </div>
  )
}

function Section({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <section className="mt-14">
      <h2 className="mb-5 text-h3">{title}</h2>
      {children}
    </section>
  )
}

function Swatches({
  names,
  className,
}: {
  names: string[]
  className?: string
}) {
  return (
    <div className={cn("grid grid-cols-2 gap-3 sm:grid-cols-6", className)}>
      {names.map((name) => (
        <div
          key={name}
          className="overflow-hidden rounded-xl border bg-card shadow-xs"
        >
          <div className="h-14" style={{ background: `var(--${name})` }} />
          <p className="px-3 py-2 font-mono text-xs">--{name}</p>
        </div>
      ))}
    </div>
  )
}

function Surface({ className, label }: { className: string; label: string }) {
  return (
    <div
      className={cn(
        "grid h-28 place-items-center p-4 text-center text-sm",
        className
      )}
    >
      <span className="font-mono text-xs text-muted-foreground">{label}</span>
    </div>
  )
}
