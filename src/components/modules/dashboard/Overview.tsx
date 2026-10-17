import Image from "next/image"
import Link from "next/link"
import { ArrowRight, Backpack, ChevronRight } from "lucide-react"

import { RentalStatusBadge } from "@/components/shared/RentalStatusBadge"
import { cn } from "@/lib/utils"
import { statusLabel } from "@/utils/filters/dashboard"
import { formatDate, formatPrice } from "@/utils/format"
import type { RentalOrder, RentalStatus } from "@/types"

/** The gradient greeting at the top of each overview. */
export function WelcomeBanner({
  eyebrow,
  title,
  description,
  actions,
  scene,
}: {
  eyebrow: string
  title: string
  description: string
  actions?: React.ReactNode
  scene?: React.ReactNode
}) {
  return (
    <section className="relative isolate mb-6 overflow-hidden rounded-2xl bg-(image:--gradient-brand) p-6 text-primary-foreground shadow-lg sm:p-8">
      <div aria-hidden className="absolute inset-0 -z-10 bg-noise opacity-50" />
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-grid opacity-25 mix-blend-overlay"
      />
      <div
        aria-hidden
        className="absolute -top-20 -right-10 -z-10 size-64 rounded-full bg-white/10 blur-2xl"
      />

      <div className="flex items-center justify-between gap-8">
        <div className="max-w-xl">
          <p className="text-eyebrow opacity-80">{eyebrow}</p>
          <h1 className="mt-2 text-h2">{title}</h1>
          <p className="mt-2 text-sm text-pretty opacity-90 sm:text-base">
            {description}
          </p>
          {actions && (
            <div className="mt-5 flex flex-wrap gap-2.5">{actions}</div>
          )}
        </div>
        {scene && (
          <div
            aria-hidden
            className="hidden w-64 shrink-0 rounded-2xl bg-card/95 p-3 text-card-foreground shadow-xl lg:block"
          >
            {scene}
          </div>
        )}
      </div>
    </section>
  )
}

/** A titled card on an overview, with an optional "View all" link. */
export function DashboardPanel({
  title,
  description,
  href,
  hrefLabel = "View all",
  children,
  className,
}: {
  title: string
  description?: string
  href?: string
  hrefLabel?: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <section
      className={cn(
        // min-w-0: inside a grid, long rows truncate instead of widening
        // the page on phones.
        "flex min-w-0 flex-col rounded-2xl border bg-card shadow-xs",
        className
      )}
    >
      <div className="flex items-start justify-between gap-4 border-b px-5 py-4">
        <div>
          <h2 className="font-heading text-lg font-semibold">{title}</h2>
          {description && (
            <p className="mt-0.5 text-[13px] text-muted-foreground">
              {description}
            </p>
          )}
        </div>
        {href && (
          <Link
            href={href}
            className="group inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-primary"
          >
            {hrefLabel}
            <ArrowRight
              className="size-3.5 transition-transform group-hover:translate-x-0.5"
              aria-hidden
            />
          </Link>
        )}
      </div>
      <div className="flex-1">{children}</div>
    </section>
  )
}

/** One order in an overview list: photo, gear, dates, status and amount. */
export function OrderRow({
  order,
  href,
  note,
  person,
}: {
  order: RentalOrder
  href: string
  /** A line of context, e.g. "Pay by 20 Oct". */
  note?: string
  /** Who's on the other side of the order. */
  person?: string
}) {
  const items = order.items ?? []
  const first = items[0]?.gearItem
  const more = items.length - 1

  return (
    <li>
      <Link
        href={href}
        className="group flex items-center gap-3 px-5 py-3.5 transition-colors hover:bg-muted/50"
      >
        <span className="relative size-11 shrink-0 overflow-hidden rounded-lg bg-muted">
          {first?.imageUrl ? (
            <Image
              src={first.imageUrl}
              alt=""
              fill
              sizes="44px"
              className="object-cover"
            />
          ) : (
            <Backpack
              className="absolute inset-0 m-auto size-5 text-muted-foreground"
              aria-hidden
            />
          )}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[15px] font-medium">
            {first?.name ?? `Order ${order.id.slice(0, 8)}`}
            {more > 0 && (
              <span className="text-muted-foreground"> +{more} more</span>
            )}
          </span>
          <span className="mt-0.5 block truncate text-[13px] text-muted-foreground">
            {formatDate(order.startDate)} → {formatDate(order.endDate)}
            {person && ` · ${person}`}
          </span>
          {note && (
            <span className="mt-1 block truncate text-[13px] font-medium text-ember-strong">
              {note}
            </span>
          )}
        </span>
        <span className="hidden shrink-0 flex-col items-end gap-1 sm:flex">
          <RentalStatusBadge status={order.status} />
          <span className="text-sm font-semibold tabular-nums">
            {formatPrice(order.totalAmount)}
          </span>
        </span>
        <ChevronRight
          className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5"
          aria-hidden
        />
      </Link>
    </li>
  )
}

export function OrderList({ children }: { children: React.ReactNode }) {
  return <ul className="divide-y">{children}</ul>
}

/** Shown inside a panel when its list is empty. */
export function PanelEmpty({
  children,
  action,
}: {
  children: React.ReactNode
  action?: React.ReactNode
}) {
  return (
    <div className="flex h-full min-h-40 flex-col items-center justify-center gap-3 px-5 py-8 text-center text-sm text-muted-foreground">
      {children}
      {action}
    </div>
  )
}

const PIPELINE: { status: RentalStatus; bar: string }[] = [
  { status: "PLACED", bar: "bg-warning" },
  { status: "CONFIRMED", bar: "bg-ember" },
  { status: "PAID", bar: "bg-success" },
  { status: "PICKED_UP", bar: "bg-lagoon" },
  { status: "RETURNED", bar: "bg-primary" },
  { status: "CANCELLED", bar: "bg-muted-foreground/40" },
]

/** Orders by status as one stacked bar, with a legend that links to each list. */
export function StatusPipeline({
  counts,
  hrefFor,
}: {
  counts: Record<RentalStatus, number>
  hrefFor: (status: RentalStatus) => string
}) {
  const total = PIPELINE.reduce((sum, { status }) => sum + counts[status], 0)

  return (
    <div className="p-5">
      <div
        className="flex h-3 overflow-hidden rounded-full bg-muted"
        role="img"
        aria-label={PIPELINE.map(
          ({ status }) => `${statusLabel(status)}: ${counts[status]}`
        ).join(", ")}
      >
        {total > 0 &&
          PIPELINE.map(({ status, bar }) =>
            counts[status] > 0 ? (
              <span
                key={status}
                className={cn("h-full", bar)}
                style={{ width: `${(counts[status] / total) * 100}%` }}
              />
            ) : null
          )}
      </div>
      <ul className="mt-4 grid grid-cols-2 gap-1 sm:grid-cols-3">
        {PIPELINE.map(({ status, bar }) => (
          <li key={status}>
            <Link
              href={hrefFor(status)}
              className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm transition-colors hover:bg-muted"
            >
              <span className={cn("size-2.5 rounded-full", bar)} aria-hidden />
              <span className="flex-1 text-muted-foreground">
                {statusLabel(status)}
              </span>
              <span className="font-semibold tabular-nums">
                {counts[status]}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
