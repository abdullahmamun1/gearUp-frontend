import Image from "next/image"
import { Link } from "@/i18n/navigation"
import { ViewTransition } from "react"
import { ArrowUpRight, Backpack, MapPin, Star, Store } from "lucide-react"
import { useLocale } from "next-intl"
import { useTranslations } from "@/i18n/translations"

import { FavoriteButton } from "@/components/shared/FavoriteButton"
import { cityKey } from "@/constants/cities"
import { createFormat } from "@/i18n/format"
import { formatRating, isRentable } from "@/utils/gearAvailability"
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
  eager = false,
}: {
  gear: GearItem
  /**
   * Morph this card's photo into the gear page. Turn it off when the same item
   * can appear twice on one page: view-transition names must be unique.
   */
  morph?: boolean
  /** Load the photo right away: set it on cards in the first visible row. */
  eager?: boolean
}) {
  // Rendered by both server and client components, so no useFormat().
  const locale = useLocale()
  const format = createFormat(locale)
  const t = useTranslations("gear")
  const tCommon = useTranslations("common")
  const providerCity = cityKey(gear.provider?.city)
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
              loading={eager ? "eager" : "lazy"}
              fetchPriority={eager ? "high" : "auto"}
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

          <div className="absolute inset-x-3 top-3 flex items-start gap-1.5">
            {gear.category && <Chip>{gear.category.name}</Chip>}
            {rated && (
              <Chip>
                <Star
                  className="size-3 fill-current text-amber-400"
                  aria-hidden
                />
                {formatRating(locale, rating.average!)}
                <span className="opacity-70">
                  ({format.number(rating.count)})
                </span>
              </Chip>
            )}
          </div>

          <FavoriteButton
            gearId={gear.id}
            gearName={gear.name}
            className="absolute top-2.5 right-2.5"
          />

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
            {unavailable
              ? t("availability.unavailable")
              : t("availability.available")}
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
            // Above the card's stretched link, so it goes to the profile.
            <Link
              href={`/providers/${gear.provider.id}`}
              className="relative z-10 inline-flex min-w-0 items-center gap-1 transition-colors hover:text-primary"
            >
              <Store className="size-3 shrink-0" aria-hidden />
              <span className="truncate">{gear.provider.name}</span>
            </Link>
          )}
        </p>
        {(gear.distanceKm !== undefined || gear.provider?.city) && (
          <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="size-3 shrink-0" aria-hidden />
            {gear.distanceKm !== undefined
              ? t("card.kmAway", { km: gear.distanceKm })
              : [
                  gear.provider?.area,
                  providerCity
                    ? tCommon(`city.${providerCity}`)
                    : gear.provider?.city,
                ]
                  .filter(Boolean)
                  .join(", ")}
          </p>
        )}

        {gear.description && (
          <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
            {gear.description}
          </p>
        )}

        <div aria-hidden className="min-h-4 flex-1" />
        <div className="grid gap-3 border-t border-dashed pt-3.5">
          <p className="truncate">
            <span className="font-heading text-xl font-bold tracking-tight">
              {format.price(gear.pricePerDay)}
            </span>
            <span className="text-xs text-muted-foreground">
              {" "}
              {tCommon("units.perDay")}
            </span>
          </p>
          {/* Looks like a button; the whole card is the (single) link. */}
          <span
            aria-hidden
            className="flex h-9 w-full items-center justify-center gap-1.5 rounded-full border bg-background px-3.5 text-sm font-medium text-foreground transition-colors duration-300 group-hover:border-primary group-hover:bg-primary group-hover:text-primary-foreground"
          >
            {t("card.viewDetails")}
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
