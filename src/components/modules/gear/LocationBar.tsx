"use client"

import { useRouter } from "@/i18n/navigation"
import { useState, useTransition } from "react"
import { Crosshair, LayoutGrid, Loader2, Map, X } from "lucide-react"
import { useTranslations } from "@/i18n/translations"
import { toast } from "sonner"

import { SelectField } from "@/components/shared/SelectField"
import { BD_CITIES } from "@/constants/cities"
import { cn } from "@/lib/utils"
import {
  buildGearHref,
  DEFAULT_RADIUS,
  RADIUS_OPTIONS,
  type GearFilters,
} from "@/utils/filters/gear"

const ALL_CITIES = "__all__"

/**
 * Where to look: list or map, a city, or "near me" with a radius. Everything
 * is in the URL like the other filters.
 */
export function LocationBar({ filters }: { filters: GearFilters }) {
  const t = useTranslations("gear.location")
  const tCommon = useTranslations("common")
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [locating, setLocating] = useState(false)

  function go(overrides: Partial<GearFilters>) {
    startTransition(() =>
      router.push(buildGearHref({ ...filters, ...overrides, page: 1 }), {
        scroll: false,
      })
    )
  }

  function nearMe() {
    if (!navigator.geolocation) {
      toast.error(t("unsupported"))
      return
    }
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocating(false)
        const near = `${position.coords.latitude.toFixed(5)},${position.coords.longitude.toFixed(5)}`
        go({ near, radius: filters.radius ?? DEFAULT_RADIUS, city: undefined })
      },
      () => {
        setLocating(false)
        toast.error(t("failed"))
      },
      { timeout: 10_000, maximumAge: 5 * 60 * 1000 }
    )
  }

  const views = [
    { id: undefined, key: "list", label: t("list"), icon: LayoutGrid },
    { id: "map" as const, key: "map", label: t("map"), icon: Map },
  ]

  return (
    <div className="mt-4 flex flex-wrap items-center gap-2">
      <div
        role="group"
        aria-label={t("viewLabel")}
        className="inline-flex rounded-full border bg-card p-1 shadow-xs"
      >
        {views.map((view) => (
          <button
            key={view.key}
            type="button"
            aria-pressed={filters.view === view.id}
            onClick={() => go({ view: view.id })}
            className={cn(
              "inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-full px-3.5 text-sm font-medium transition-colors",
              filters.view === view.id
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <view.icon className="size-4" aria-hidden />
            {view.label}
          </button>
        ))}
      </div>

      {filters.near ? (
        <div className="inline-flex items-center gap-1 rounded-full border border-lagoon/40 bg-lagoon/10 py-1 pr-1 pl-3 text-sm">
          <Crosshair className="size-4 text-lagoon" aria-hidden />
          <span>{t("within")}</span>
          <SelectField
            aria-label={t("radiusLabel")}
            options={RADIUS_OPTIONS.map((km) => ({
              value: km,
              label: t("km", { km: Number(km) }),
            }))}
            value={filters.radius ?? DEFAULT_RADIUS}
            onValueChange={(radius) => go({ radius })}
            className="h-7 border-none bg-transparent px-2 font-medium shadow-none"
          />
          <span>{t("ofYou")}</span>
          <button
            type="button"
            onClick={() => go({ near: undefined, radius: undefined })}
            aria-label={t("stopNearMe")}
            className="grid size-7 cursor-pointer place-items-center rounded-full hover:bg-lagoon/20"
          >
            <X className="size-3.5" aria-hidden />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={nearMe}
          disabled={locating}
          className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-full border bg-card px-4 text-sm font-medium shadow-xs transition-colors hover:border-primary/40 hover:bg-accent disabled:opacity-60"
        >
          {locating ? (
            <Loader2 className="size-4 animate-spin" aria-hidden />
          ) : (
            <Crosshair className="size-4 text-lagoon" aria-hidden />
          )}
          {t("useMyLocation")}
        </button>
      )}

      <SelectField
        aria-label={t("city")}
        options={[
          { value: ALL_CITIES, label: t("allCities") },
          ...BD_CITIES.map((city) => ({
            value: city.name,
            label: tCommon(`city.${city.key}`),
          })),
        ]}
        value={filters.city ?? ALL_CITIES}
        onValueChange={(value) =>
          go({
            city: value === ALL_CITIES ? undefined : value,
            near: undefined,
            radius: undefined,
          })
        }
        className="h-10 w-44 rounded-full"
      />

      {isPending && (
        <Loader2
          className="size-4 animate-spin text-muted-foreground"
          aria-label={t("updating")}
        />
      )}
    </div>
  )
}
