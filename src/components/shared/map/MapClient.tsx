"use client"

import "leaflet/dist/leaflet.css"

import { Link } from "@/i18n/navigation"
import { useEffect } from "react"
import L from "leaflet"
import {
  Circle,
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap,
  useMapEvents,
} from "react-leaflet"

import { useTranslations } from "@/i18n/translations"

import { useFormat } from "@/i18n/useFormat"
import type { GearItem, LatLng } from "@/types"

/**
 * Everything that touches Leaflet. It needs `window`, so this module is only
 * ever loaded through the dynamic() wrappers in ./maps.tsx.
 */

/** Bangladesh, for maps with nothing to centre on yet. */
export const BANGLADESH: LatLng = { latitude: 23.7, longitude: 90.35 }

const TILES = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
const ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'

const toLeaflet = (point: LatLng): [number, number] => [
  point.latitude,
  point.longitude,
]

/** Brand-coloured pin as HTML, so no marker image files are needed. */
const pinIcon = L.divIcon({
  className: "",
  html: `<span style="display:grid;place-items:center;width:34px;height:34px;border-radius:9999px 9999px 9999px 0;transform:rotate(-45deg);background:var(--primary);box-shadow:0 6px 16px rgb(0 0 0 / .25);border:3px solid white"><span style="width:10px;height:10px;border-radius:9999px;background:white;transform:rotate(45deg)"></span></span>`,
  iconSize: [34, 34],
  iconAnchor: [17, 34],
})

const pillIcon = (label: string, active = false) =>
  L.divIcon({
    className: "",
    html: `<span style="display:inline-flex;align-items:center;gap:4px;white-space:nowrap;padding:5px 10px;border-radius:9999px;font:600 12px/1 var(--font-sans,system-ui);background:${active ? "var(--primary)" : "var(--card)"};color:${active ? "var(--primary-foreground)" : "var(--foreground)"};border:1px solid var(--border);box-shadow:0 4px 12px rgb(0 0 0 / .18);transform:translate(-50%,-50%)">${label}</span>`,
    iconSize: [0, 0],
  })

function Base({
  center,
  zoom,
  className,
  interactive = true,
  children,
}: {
  center: LatLng
  zoom: number
  className?: string
  interactive?: boolean
  children?: React.ReactNode
}) {
  return (
    <MapContainer
      center={toLeaflet(center)}
      zoom={zoom}
      scrollWheelZoom={false}
      dragging={interactive}
      zoomControl={interactive}
      doubleClickZoom={interactive}
      attributionControl
      className={className}
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer url={TILES} attribution={ATTRIBUTION} />
      {children}
    </MapContainer>
  )
}

/** A soft circle over the neighbourhood: where, roughly, without the door. */
export function AreaMapClient({ center }: { center: LatLng }) {
  return (
    <Base center={center} zoom={13}>
      <Circle
        center={toLeaflet(center)}
        radius={900}
        // Colours come from CSS (.map-area): SVG attributes can't use vars.
        // className must be a creation option; pathOptions only restyles.
        className="map-area"
        pathOptions={{ weight: 2 }}
      />
    </Base>
  )
}

/** The pickup point: an exact pin once paid, otherwise the area circle. */
export function PickupMapClient({
  point,
  exact,
}: {
  point: LatLng
  exact: boolean
}) {
  return exact ? (
    <Base center={point} zoom={15}>
      <Marker position={toLeaflet(point)} icon={pinIcon} />
    </Base>
  ) : (
    <AreaMapClient center={point} />
  )
}

type Spot = { key: string; point: LatLng; items: GearItem[] }

/** Items share their provider's location: one marker per spot. */
function groupBySpot(gear: GearItem[]) {
  const spots = new Map<string, Spot>()
  for (const item of gear) {
    const point = item.provider?.location
    if (!point) continue
    const key = `${point.latitude},${point.longitude}`
    const spot = spots.get(key) ?? { key, point, items: [] }
    spot.items.push(item)
    spots.set(key, spot)
  }
  return [...spots.values()]
}

function FitBounds({ spots, you }: { spots: Spot[]; you?: LatLng | null }) {
  const map = useMap()
  // Refit only when the set of points changes, not on every re-render,
  // so panning isn't undone while results refresh.
  const signature = [
    ...spots.map((spot) => spot.key),
    you ? `${you.latitude},${you.longitude}` : "",
  ].join("|")
  useEffect(() => {
    const points: [number, number][] = signature
      .split("|")
      .filter(Boolean)
      .map((key) => key.split(",").map(Number) as [number, number])
    if (points.length === 0) return
    if (points.length === 1) map.setView(points[0]!, 13)
    else map.fitBounds(L.latLngBounds(points), { padding: [40, 40] })
  }, [map, signature])
  return null
}

/** The /gear map view: a price pill per pickup spot, items in the popup. */
export function GearMapClient({
  gear,
  you,
}: {
  gear: GearItem[]
  you?: LatLng | null
}) {
  const t = useTranslations("gear.map")
  const format = useFormat()
  const spots = groupBySpot(gear)

  return (
    <Base center={you ?? BANGLADESH} zoom={7}>
      <FitBounds spots={spots} you={you} />
      {you && (
        <Circle
          center={toLeaflet(you)}
          radius={300}
          className="map-you"
          pathOptions={{ weight: 2 }}
        />
      )}
      {spots.map((spot) => {
        const cheapest = Math.min(
          ...spot.items.map((item) => Number(item.pricePerDay))
        )
        const label =
          spot.items.length === 1
            ? format.price(cheapest)
            : t("spotLabel", {
                count: spot.items.length,
                price: format.price(cheapest),
              })
        return (
          <Marker
            key={spot.key}
            position={toLeaflet(spot.point)}
            icon={pillIcon(label)}
          >
            <Popup minWidth={240} maxWidth={280}>
              <p style={{ margin: "0 0 6px", fontWeight: 600 }}>
                {spot.items[0]?.provider?.name}
                {spot.items[0]?.provider?.area &&
                  ` · ${spot.items[0].provider.area}`}
              </p>
              <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
                {spot.items.slice(0, 8).map((item) => (
                  <li key={item.id} style={{ padding: "3px 0" }}>
                    <Link href={`/gear/${item.id}`}>{item.name}</Link>
                    <span style={{ float: "right", fontWeight: 600 }}>
                      {format.price(item.pricePerDay)}
                    </span>
                  </li>
                ))}
              </ul>
              {spot.items.length > 8 && (
                <p style={{ margin: "6px 0 0", opacity: 0.7 }}>
                  {t("more", { count: spot.items.length - 8 })}
                </p>
              )}
            </Popup>
          </Marker>
        )
      })}
    </Base>
  )
}

function ClickToPlace({ onPick }: { onPick: (point: LatLng) => void }) {
  useMapEvents({
    click: (event) =>
      onPick({
        latitude: Math.round(event.latlng.lat * 1e6) / 1e6,
        longitude: Math.round(event.latlng.lng * 1e6) / 1e6,
      }),
  })
  return null
}

function Recenter({ point }: { point: LatLng | null }) {
  const map = useMap()
  useEffect(() => {
    if (point) map.setView(toLeaflet(point), Math.max(map.getZoom(), 14))
  }, [map, point])
  return null
}

/** Profile form: click the map to set the pickup point. */
export function LocationPickerClient({
  value,
  onChange,
}: {
  value: LatLng | null
  onChange: (point: LatLng) => void
}) {
  return (
    <Base center={value ?? BANGLADESH} zoom={value ? 14 : 7}>
      <ClickToPlace onPick={onChange} />
      <Recenter point={value} />
      {value && <Marker position={toLeaflet(value)} icon={pinIcon} />}
    </Base>
  )
}
