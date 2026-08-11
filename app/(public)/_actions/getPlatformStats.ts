"use server"

import { getCategories } from "./getCategories"
import { getGearList } from "./getGear"

const CATALOGUE_SAMPLE_CAP = 250

export type PlatformStats = {
  gear: number
  available: number
  categories: number
  providers: number
  reviews: number
  sampled: boolean
}

export async function getPlatformStats(): Promise<PlatformStats | null> {
  const [totalRes, availableRes, categoriesRes] = await Promise.all([
    getGearList({ limit: "1" }),
    getGearList({ limit: "1", isAvailable: "true" }),
    getCategories(),
  ])

  const gear = totalRes.data?.meta?.total ?? 0

  if (!totalRes.success || gear === 0) return null

  const catalogueRes = await getGearList({
    limit: String(Math.min(gear, CATALOGUE_SAMPLE_CAP)),
  })
  const items = catalogueRes.data?.data ?? []

  const providers = new Set(
    items.map((item) => item.provider?.id).filter(Boolean)
  )

  return {
    gear,
    available: availableRes.data?.meta?.total ?? 0,
    categories: categoriesRes.data?.length ?? 0,
    providers: providers.size,
    reviews: items.reduce((sum, item) => sum + (item.rating?.count ?? 0), 0),
    sampled: gear > CATALOGUE_SAMPLE_CAP,
  }
}
