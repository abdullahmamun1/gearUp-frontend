"use client"

import { ExternalLink, MapPin } from "lucide-react"
import { useTranslations } from "@/i18n/translations"

import { MapFrame, PickupMap } from "@/components/shared/map/maps"
import type { PickupPoint } from "@/types"

/** Where to collect the gear: the exact pin once paid, otherwise the area. */
export function PickupPanel({ pickup }: { pickup: PickupPoint }) {
  const t = useTranslations("dashboard.pickup")
  const place = [pickup.area, pickup.city].filter(Boolean).join(", ")
  if (!pickup.location && !place) return null

  return (
    <section className="mt-6 overflow-hidden rounded-2xl border bg-card shadow-xs">
      <div className="flex flex-wrap items-center gap-2.5 px-5 py-4">
        <MapPin className="size-5 text-primary" aria-hidden />
        <h2 className="font-heading text-lg font-semibold">{t("title")}</h2>
        {place && (
          <span className="text-sm text-muted-foreground">· {place}</span>
        )}
        {pickup.exact && pickup.location && (
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${pickup.location.latitude},${pickup.location.longitude}`}
            target="_blank"
            rel="noreferrer"
            className="ml-auto inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
          >
            {t("openMaps")}
            <ExternalLink className="size-3.5" aria-hidden />
          </a>
        )}
      </div>
      {pickup.location && (
        <MapFrame className="h-60 rounded-none border-x-0 border-b-0">
          <PickupMap point={pickup.location} exact={pickup.exact} />
        </MapFrame>
      )}
      <p className="border-t px-5 py-2.5 text-xs text-muted-foreground">
        {pickup.exact ? t("exact") : t("approximate")}
      </p>
    </section>
  )
}
