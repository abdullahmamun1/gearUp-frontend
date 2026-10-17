import Image from "next/image"
import Link from "next/link"
import { ViewTransition } from "react"
import { ArrowUpRight, Backpack, Star, Store } from "lucide-react"

import { formatPrice } from "@/utils/format"
import { isRentable } from "@/utils/gearAvailability"
import { cn } from "@/lib/utils"
import { gearImageTransition } from "@/utils/viewTransitions"
import type { GearItem } from "@/types"

/**
 * A gear listing. The whole card is one link (the title's ::after stretches
 * over it), so it is a single tab stop with a meaningful name, and every
 * part of the card is clickable.
 */
export function GearCard({
  gear,
  morph = true,
}: {
  gear: GearItem
  /**
   * Morph this card's photo into the gear page. Turn it off when the same item
   * can appear twice on one page: view-transition names must be unique.
   */
  morph?: boolean
}) {
  const unavailable = !isRentable(gear)
  const rating = gear.rating
  const rated = rating && rating.count > 0 && rating.average !== null

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl border bg-card shadow-xs transition-[box-shadow,translate,border-color] duration-300 focus-within:ring-2 focus-within:ring-ring hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg">
      {/* Same name as the gallery on /gear/[id]: the photo morphs into it. */}
      <ViewTransition
        name={morph ? gearImageTransition(gear.id) : undefined}
        share={morph ? "morph" : "none"}
      >
        <div className="relative aspect-4/3 overflow-hidden bg-muted">
          {gear.imageUrl ? (
            <Image
              src={gear.imageUrl}
              alt=""
              fill
              sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
              className={cn(
                "object-cover transition-transform duration-500 ease-out group-hover:scale-105",
                unavailable && "grayscale"
              )}
            />
          ) : (
            <GearImageFallback />
          )}
          {/* Keeps the chips readable on any photo. */}
          <div
            aria-hidden
            className="absolute inset-0 bg-linear-to-b from-black/25 via-transparent to-black/30"
          />

          <div className="absolute inset-x-3 top-3 flex items-start justify-between gap-2">
            {gear.category && <Chip>{gear.category.name}</Chip>}
            {rated && (
              <Chip className="ml-auto">
                <Star
                  className="size-3 fill-current text-amber-400"
                  aria-hidden
                />
                {rating.average!.toFixed(1)}
                <span className="opacity-70">({rating.count})</span>
              </Chip>
            )}
          </div>

          <span
            className={cn(
              "absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold shadow-sm",
              "bg-background/90 backdrop-blur-sm",
              unavailable ? "text-muted-foreground" : "text-success"
            )}
          >
            <span
              className={cn(
                "size-1.5 rounded-full",
                unavailable ? "bg-muted-foreground" : "bg-success"
              )}
              aria-hidden
            />
            {unavailable ? "Unavailable" : "Available"}
          </span>
        </div>
      </ViewTransition>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="line-clamp-1 font-heading text-[17px] font-semibold tracking-tight">
          <Link
            href={`/gear/${gear.id}`}
            transitionTypes={["nav-forward"]}
            className="outline-none after:absolute after:inset-0 after:content-['']"
          >
            {gear.name}
          </Link>
        </h3>

        <p className="mt-1 flex min-w-0 items-center gap-1.5 text-xs text-muted-foreground">
          {gear.brand && <span className="truncate">{gear.brand}</span>}
          {gear.brand && gear.provider && <span aria-hidden>·</span>}
          {gear.provider && (
            <span className="inline-flex min-w-0 items-center gap-1">
              <Store className="size-3 shrink-0" aria-hidden />
              <span className="truncate">{gear.provider.name}</span>
            </span>
          )}
        </p>

        {gear.description && (
          <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
            {gear.description}
          </p>
        )}

        <div aria-hidden className="min-h-4 flex-1" />
        <div className="flex items-center justify-between gap-3 border-t border-dashed pt-3.5">
          <p className="whitespace-nowrap">
            <span className="font-heading text-xl font-bold tracking-tight">
              {formatPrice(gear.pricePerDay)}
            </span>
            <span className="text-xs text-muted-foreground"> / day</span>
          </p>
          <span
            aria-hidden
            className="grid size-9 shrink-0 place-items-center rounded-full border bg-background text-foreground transition-colors duration-300 group-hover:border-primary group-hover:bg-primary group-hover:text-primary-foreground"
          >
            <ArrowUpRight className="size-4 transition-transform duration-300 group-hover:rotate-45" />
          </span>
        </div>
      </div>
    </article>
  )
}

function Chip({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border border-white/20 bg-black/35 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur-md",
        className
      )}
    >
      {children}
    </span>
  )
}

function GearImageFallback() {
  return (
    <div className="absolute inset-0 grid place-items-center bg-linear-to-br from-primary/12 via-transparent to-primary/4">
      <Backpack
        className="size-10 text-primary/30"
        strokeWidth={1.25}
        aria-hidden
      />
    </div>
  )
}
