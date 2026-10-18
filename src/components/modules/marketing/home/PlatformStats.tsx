import { Boxes, CalendarCheck, Star, Store } from "lucide-react"
import type { LucideIcon } from "lucide-react"

import { getPlatformStats } from "@/api/stats"
import { getTranslations } from "@/i18n/getTranslations"

import { Section } from "./Section"
import { StatCounter } from "./StatCounter"

export async function PlatformStats() {
  const stats = await getPlatformStats()

  if (!stats) return null
  const t = await getTranslations("home.stats")
  const plural = (count: number) => (count === 1 ? "one" : "other")

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
      label: t(`gearLabel.${plural(stats.gear)}`),
      hint: t("gearHint", { count: stats.categories }),
    },
    {
      icon: CalendarCheck,
      value: stats.available,
      label: t("availableLabel"),
      hint: t("availableHint"),
    },
    {
      icon: Store,
      value: stats.providers,
      label: t(`providersLabel.${plural(stats.providers)}`),
      hint: t("providersHint"),
      approx: stats.sampled,
    },
    {
      icon: Star,
      value: stats.reviews,
      label: t(`reviewsLabel.${plural(stats.reviews)}`),
      hint: t("reviewsHint"),
      approx: stats.sampled,
    },
  ]

  return (
    <Section
      tone="muted"
      eyebrow={t("eyebrow")}
      title={t("title")}
      description={t("description")}
    >
      <dl className="reveal-stagger grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {tiles.map((tile) => (
          <div
            key={tile.label}
            className="rounded-2xl border bg-card p-5 shadow-xs"
          >
            <span
              className="grid size-10 place-items-center rounded-full bg-primary/10 text-primary"
              aria-hidden
            >
              <tile.icon className="size-5" />
            </span>

            <dd className="mt-4 font-heading text-3xl font-bold tabular-nums">
              <StatCounter value={tile.value} />
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
