"use client"

import { useTranslations } from "@/i18n/translations"

import { Link } from "@/i18n/navigation"

import { GearCard } from "@/components/shared/GearCard"
import { CompassScene } from "@/components/shared/illustrations/scenes"
import { GearMap, MapFrame } from "@/components/shared/map/maps"
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
import type { GearItem, LatLng, Paginated } from "@/types"

function parseLatLng(value?: string): LatLng | null {
  if (!value) return null
  const [latitude, longitude] = value.split(",").map(Number)
  return Number.isFinite(latitude) && Number.isFinite(longitude)
    ? { latitude: latitude!, longitude: longitude! }
    : null
}

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
  const t = useTranslations("gear.results")

  if (error) {
    return <Message title={t("errorTitle")}>{error || t("errorBody")}</Message>
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
          hasActiveFilters(filters) ? t("noMatchesTitle") : t("emptyTitle")
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
              {t("clearAll")}
            </Link>
          )
        }
      >
        {hasActiveFilters(filters) ? t("noMatchesBody") : t("emptyBody")}
      </Message>
    )
  }

  return (
    <div
      className={cn("transition-opacity", isFetching && "opacity-60")}
      aria-busy={isFetching}
    >
      <p className="mt-6 text-sm text-muted-foreground" aria-live="polite">
        {t.rich("count", {
          count: total,
          strong: (chunks) => (
            <span className="font-semibold text-foreground">{chunks}</span>
          ),
        })}
      </p>

      {filters.view === "map" ? (
        <>
          <MapFrame className="mt-4 h-[min(70vh,36rem)]">
            <GearMap gear={items} you={parseLatLng(filters.near)} />
          </MapFrame>
          {items.some((gear) => !gear.provider?.location) && (
            <p className="mt-2 text-xs text-muted-foreground">
              {t("mapMissing")}
            </p>
          )}
        </>
      ) : (
        <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((gear, index) => (
            // The first row is above the fold, and the first photo is the LCP.
            <GearCard key={gear.id} gear={gear} eager={index < 4} />
          ))}
        </div>
      )}

      {filters.view !== "map" && (
        <Pagination
          page={filters.page}
          totalPages={meta?.totalPages ?? 1}
          hrefFor={(page) => buildGearHref({ ...filters, page })}
          label={t("pagination")}
        />
      )}
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
