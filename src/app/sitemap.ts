import type { MetadataRoute } from "next"

import { getCategories } from "@/api/categories"
import { getGearList } from "@/api/gear"
import { LOCALES, localizedPath } from "@/i18n/routing"
import { absoluteUrl } from "@/lib/site"
import type { GearItem } from "@/types"

/** Regenerated with the gear pages (the same 5-minute cache and tag). */
export const revalidate = 300

const PAGE_SIZE = 100
const MAX_PAGES = 20

async function allGear() {
  const gear: GearItem[] = []
  for (let page = 1; page <= MAX_PAGES; page++) {
    const res = await getGearList({
      limit: String(PAGE_SIZE),
      page: String(page),
    })
    const rows = res.data?.data ?? []
    gear.push(...rows)
    if (rows.length < PAGE_SIZE) break
  }
  return gear
}

type Entry = Omit<MetadataRoute.Sitemap[number], "url" | "alternates"> & {
  /** The English path; the Bangla URL is derived. */
  path: string
}

/** One sitemap row per language, each listing both as alternates. */
function localized(entries: Entry[]): MetadataRoute.Sitemap {
  return entries.flatMap(({ path, ...rest }) => {
    const languages = Object.fromEntries(
      LOCALES.map((locale) => [
        locale,
        absoluteUrl(localizedPath(locale, path)),
      ])
    )
    return LOCALES.map((locale) => ({
      ...rest,
      url: absoluteUrl(localizedPath(locale, path)),
      alternates: { languages },
    }))
  })
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [gear, categoriesRes] = await Promise.all([allGear(), getCategories()])

  const pages: Entry[] = [
    { path: "/", changeFrequency: "daily", priority: 1 },
    { path: "/gear", changeFrequency: "hourly", priority: 0.9 },
    { path: "/about", changeFrequency: "monthly", priority: 0.5 },
    { path: "/help", changeFrequency: "monthly", priority: 0.5 },
    { path: "/contact", changeFrequency: "yearly", priority: 0.4 },
    { path: "/privacy", changeFrequency: "yearly", priority: 0.2 },
  ]

  const categories: Entry[] = (categoriesRes.data ?? []).map((category) => ({
    path: `/gear?category=${category.id}`,
    changeFrequency: "daily",
    priority: 0.7,
  }))

  const items: Entry[] = gear.map((item) => ({
    path: `/gear/${item.id}`,
    lastModified: item.updatedAt,
    changeFrequency: "weekly",
    priority: 0.8,
    ...(item.imageUrl && { images: [item.imageUrl] }),
  }))

  // Providers with at least one listing; profiles of others aren't useful.
  const providerIds = [
    ...new Set(gear.map((item) => item.provider?.id).filter(Boolean)),
  ] as string[]
  const providers: Entry[] = providerIds.map((id) => ({
    path: `/providers/${id}`,
    changeFrequency: "weekly",
    priority: 0.6,
  }))

  return localized([...pages, ...categories, ...items, ...providers])
}
