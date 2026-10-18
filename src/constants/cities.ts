import type { LatLng } from "@/types"

/** Message ids under `common.city` (Bangla names for display only). */
export type CityKey =
  | "bandarban"
  | "barishal"
  | "bogura"
  | "chattogram"
  | "coxsBazar"
  | "cumilla"
  | "dhaka"
  | "gazipur"
  | "jashore"
  | "khulna"
  | "mymensingh"
  | "narayanganj"
  | "rajshahi"
  | "rangamati"
  | "rangpur"
  | "sreemangal"
  | "sylhet"

/**
 * Cities providers can list under, with a centre for maps and "near" search.
 * Alphabetical; `name` is what's stored on the profile (always English, so
 * never translate it). Show `t(`city.${key}`)` from `common` as the label.
 */
export const BD_CITIES: ({ name: string; key: CityKey } & LatLng)[] = [
  {
    name: "Bandarban",
    key: "bandarban",
    latitude: 22.1953,
    longitude: 92.2184,
  },
  { name: "Barishal", key: "barishal", latitude: 22.701, longitude: 90.3535 },
  { name: "Bogura", key: "bogura", latitude: 24.8465, longitude: 89.3773 },
  {
    name: "Chattogram",
    key: "chattogram",
    latitude: 22.3569,
    longitude: 91.7832,
  },
  {
    name: "Cox's Bazar",
    key: "coxsBazar",
    latitude: 21.4272,
    longitude: 92.0058,
  },
  { name: "Cumilla", key: "cumilla", latitude: 23.4607, longitude: 91.1809 },
  { name: "Dhaka", key: "dhaka", latitude: 23.8103, longitude: 90.4125 },
  { name: "Gazipur", key: "gazipur", latitude: 23.9999, longitude: 90.4203 },
  { name: "Jashore", key: "jashore", latitude: 23.1664, longitude: 89.2081 },
  { name: "Khulna", key: "khulna", latitude: 22.8456, longitude: 89.5403 },
  {
    name: "Mymensingh",
    key: "mymensingh",
    latitude: 24.7471,
    longitude: 90.4203,
  },
  {
    name: "Narayanganj",
    key: "narayanganj",
    latitude: 23.6238,
    longitude: 90.5,
  },
  { name: "Rajshahi", key: "rajshahi", latitude: 24.3745, longitude: 88.6042 },
  {
    name: "Rangamati",
    key: "rangamati",
    latitude: 22.6324,
    longitude: 92.1925,
  },
  { name: "Rangpur", key: "rangpur", latitude: 25.7439, longitude: 89.2752 },
  {
    name: "Sreemangal",
    key: "sreemangal",
    latitude: 24.3065,
    longitude: 91.7296,
  },
  { name: "Sylhet", key: "sylhet", latitude: 24.8949, longitude: 91.8687 },
]

export function cityCenter(name?: string | null) {
  return BD_CITIES.find((city) => city.name === name) ?? null
}

/** The `common.city` message id for a stored city name, or null if unknown. */
export function cityKey(name?: string | null): CityKey | null {
  return cityCenter(name)?.key ?? null
}
