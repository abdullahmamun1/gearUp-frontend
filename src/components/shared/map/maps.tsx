"use client"

import dynamic from "next/dynamic"
import { MapPin } from "lucide-react"

import { cn } from "@/lib/utils"

/**
 * Leaflet needs `window` and adds ~45 KB, so maps load in the browser, on
 * demand. Each wrapper reserves its box while the map loads (no layout
 * shift) and shows a quiet placeholder.
 */
function MapLoading() {
  return (
    <div className="grid size-full place-items-center bg-muted/60 text-muted-foreground">
      <MapPin className="size-6 animate-pulse" aria-hidden />
    </div>
  )
}

export const AreaMap = dynamic(
  () => import("./MapClient").then((mod) => mod.AreaMapClient),
  { ssr: false, loading: MapLoading }
)

export const PickupMap = dynamic(
  () => import("./MapClient").then((mod) => mod.PickupMapClient),
  { ssr: false, loading: MapLoading }
)

export const GearMap = dynamic(
  () => import("./MapClient").then((mod) => mod.GearMapClient),
  { ssr: false, loading: MapLoading }
)

export const LocationPicker = dynamic(
  () => import("./MapClient").then((mod) => mod.LocationPickerClient),
  { ssr: false, loading: MapLoading }
)

/** The rounded, bordered box every map sits in. */
export function MapFrame({
  className,
  children,
}: {
  className?: string
  children: React.ReactNode
}) {
  return (
    <div
      className={cn(
        "relative isolate overflow-hidden rounded-2xl border bg-muted",
        className
      )}
    >
      {children}
    </div>
  )
}
