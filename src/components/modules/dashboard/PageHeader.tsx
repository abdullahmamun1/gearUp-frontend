import { Link } from "@/i18n/navigation"
import type { LucideIcon } from "lucide-react"
import { ArrowUpRight } from "lucide-react"

import { cn } from "@/lib/utils"

import { FormattedNumber } from "./Formatted"

export function PageHeader({
  title,
  description,
  action,
}: {
  title: string
  description?: string
  action?: React.ReactNode
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-h2">{title}</h1>
        {description && (
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {action}
    </div>
  )
}

const TONES = {
  primary: "bg-primary/10 text-primary",
  lagoon: "bg-lagoon/10 text-lagoon",
  ember: "bg-ember/12 text-ember-strong",
  success: "bg-success/12 text-success",
  warning: "bg-warning/15 text-warning",
  muted: "bg-muted text-muted-foreground",
} as const

export type StatTone = keyof typeof TONES

/**
 * A headline number (plain numbers get the locale's digits). With `href`,
 * the whole card links to the list behind it.
 */
export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  tone = "primary",
  href,
}: {
  label: string
  value: React.ReactNode
  hint?: string
  icon?: LucideIcon
  tone?: StatTone
  href?: string
}) {
  const body = (
    <>
      <div className="flex items-start justify-between gap-3">
        <p className="min-w-0 text-sm font-medium text-muted-foreground">
          {label}
        </p>
        {Icon && (
          <span
            className={cn(
              "grid size-9 shrink-0 place-items-center rounded-xl",
              TONES[tone]
            )}
          >
            <Icon className="size-[18px]" aria-hidden />
          </span>
        )}
      </div>
      <p className="mt-2 font-heading text-2xl font-bold tracking-tight [overflow-wrap:anywhere] sm:text-3xl">
        {typeof value === "number" ? <FormattedNumber value={value} /> : value}
      </p>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
      {href && (
        <ArrowUpRight
          className="absolute right-4 bottom-4 size-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100"
          aria-hidden
        />
      )}
    </>
  )

  return href ? (
    <Link
      href={href}
      className="group relative block h-full card-elevated p-4 sm:p-5"
    >
      {body}
    </Link>
  ) : (
    <div className="relative h-full rounded-2xl border bg-card p-4 shadow-xs sm:p-5">
      {body}
    </div>
  )
}
