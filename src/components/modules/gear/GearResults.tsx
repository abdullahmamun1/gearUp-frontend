"use client"

import Link from "next/link"

import { GearCard } from "@/components/shared/GearCard"
import { CompassScene } from "@/components/shared/illustrations/scenes"
import { buttonVariants } from "@/components/ui/button"
import { GearGridSkeleton } from "@/components/shared/GearCardSkeleton"
import { Pagination } from "@/components/shared/Pagination"
import {
  buildGearHref,
  GEAR_PAGE_SIZE,
  hasActiveFilters,
  type GearFilters,
} from "@/utils/filters/gear"
import { cn } from "@/lib/utils"
import type { GearItem, Paginated } from "@/types"

/** Presentational: renders whatever results it is given. */
export function GearResults({
  filters,
  data,
  error,
  isFetching = false,
}: {
  filters: GearFilters
  data?: Paginated<GearItem>
  error?: string | null
  isFetching?: boolean
}) {
  if (error) {
    return (
      <Message title="Couldn't load gear">
        {error || "Please try again in a moment."}
      </Message>
    )
  }

  if (!data) {
    return (
      <div className="mt-10">
        <GearGridSkeleton count={GEAR_PAGE_SIZE} />
      </div>
    )
  }

  const items = data.data
  const meta = data.meta
  const total = meta?.total ?? items.length

  if (items.length === 0) {
    return (
      <Message
        title={
          hasActiveFilters(filters)
            ? "Nothing matches yet"
            : "No gear listed yet"
        }
        action={
          hasActiveFilters(filters) && (
            <Link
              href="/gear"
              className={cn(
                buttonVariants({ variant: "outline", size: "lg" }),
                "mt-5 h-10 px-5 text-sm"
              )}
            >
              Clear all filters
            </Link>
          )
        }
      >
        {hasActiveFilters(filters)
          ? "Try other dates, widen your price range or clear a filter."
          : "Check back soon — providers are adding kit all the time."}
      </Message>
    )
  }

  return (
    <div
      className={cn("transition-opacity", isFetching && "opacity-60")}
      aria-busy={isFetching}
    >
      <p className="mt-6 text-sm text-muted-foreground" aria-live="polite">
        <span className="font-semibold text-foreground">{total}</span>{" "}
        {total === 1 ? "item" : "items"} available
      </p>

      <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((gear) => (
          <GearCard key={gear.id} gear={gear} />
        ))}
      </div>

      <Pagination
        page={filters.page}
        totalPages={meta?.totalPages ?? 1}
        hrefFor={(page) => buildGearHref({ ...filters, page })}
        label="Gear pagination"
      />
    </div>
  )
}

function Message({
  title,
  action,
  children,
}: {
  title: string
  action?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <div className="mt-8 flex flex-col items-center rounded-2xl border border-dashed bg-card/50 px-6 py-12 text-center">
      <CompassScene className="max-w-52" />
      <h2 className="mt-4 text-h3">{title}</h2>
      <p className="mt-1.5 max-w-sm text-sm text-muted-foreground">
        {children}
      </p>
      {action}
    </div>
  )
}
