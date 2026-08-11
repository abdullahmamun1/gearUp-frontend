import { Boxes, CalendarCheck, Star, Store } from "lucide-react"
import type { LucideIcon } from "lucide-react"

import { getPlatformStats } from "@/app/(public)/_actions/getPlatformStats"

import { Section } from "./Section"

export async function PlatformStats() {
  const stats = await getPlatformStats()

  if (!stats) return null

  const tiles: {
    icon: LucideIcon
    value: number
    label: string
    hint: string
    approx?: boolean
  }[] = [
    {
      icon: Boxes,
      value: stats.gear,
      label: stats.gear === 1 ? "item listed" : "items listed",
      hint: `across ${stats.categories} ${stats.categories === 1 ? "category" : "categories"}`,
    },
    {
      icon: CalendarCheck,
      value: stats.available,
      label: "ready to rent today",
      hint: "in stock and taking bookings",
    },
    {
      icon: Store,
      value: stats.providers,
      label: stats.providers === 1 ? "provider" : "providers",
      hint: "renting out kit they own",
      approx: stats.sampled,
    },
    {
      icon: Star,
      value: stats.reviews,
      label: stats.reviews === 1 ? "review" : "reviews",
      hint: "each from a completed rental",
      approx: stats.sampled,
    },
  ]

  return (
    <Section
      tone="muted"
      eyebrow="By the numbers"
      title="What's on GearUp right now"
      description="Counted live from the catalogue — not a marketing figure."
    >
      <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {tiles.map((tile) => (
          <div key={tile.label} className="rounded-xl border bg-card p-5">
            <span
              className="grid size-10 place-items-center rounded-full bg-primary/10 text-primary"
              aria-hidden
            >
              <tile.icon className="size-5" />
            </span>

            <dd className="mt-4 font-heading text-3xl font-bold tabular-nums">
              {tile.value.toLocaleString("en-US")}
              {tile.approx && "+"}
            </dd>
            <dt className="mt-0.5 text-sm font-medium">{tile.label}</dt>
            <p className="mt-1.5 text-xs text-muted-foreground">{tile.hint}</p>
          </div>
        ))}
      </dl>
    </Section>
  )
}
