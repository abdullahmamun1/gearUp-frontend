import { getCategories } from "@/api/categories"
import { getGearList } from "@/api/gear"
import { getLocale } from "next-intl/server"
import { getTranslations } from "@/i18n/getTranslations"

import { AdventureTabsClient, type Adventure } from "./AdventureTabsClient"
import { Section } from "./Section"

/** Category name (as stored) → message key under home.adventures.pitch. */
const PITCH = {
  camping: "camping",
  "water sports": "waterSports",
  cycling: "cycling",
  "hiking & trekking": "hiking",
  climbing: "climbing",
  "team sports": "teamSports",
} as const

type PitchKey = (typeof PITCH)[keyof typeof PITCH]

/** The four biggest categories, three bookable items each (all cached reads). */
export async function AdventureTabs() {
  const res = await getCategories()
  const top = [...(res.data ?? [])]
    .sort((a, b) => (b._count?.gearItems ?? 0) - (a._count?.gearItems ?? 0))
    .slice(0, 4)
  if (top.length < 2) return null

  const lists = await Promise.all(
    top.map((category) =>
      getGearList({ category: category.id, isAvailable: "true", limit: "3" })
    )
  )

  const [t, locale] = await Promise.all([
    getTranslations("home.adventures"),
    getLocale(),
  ])
  // English lowercases the category name mid-sentence; Bangla keeps it.
  const inSentence = (name: string) =>
    locale === "en" ? name.toLowerCase() : name

  const adventures: Adventure[] = top
    .map((category, index) => {
      const pitchKey = (PITCH as Record<string, PitchKey | undefined>)[
        category.name.trim().toLowerCase()
      ]
      return {
        id: category.id,
        name: category.name,
        pitch: pitchKey
          ? t(`pitch.${pitchKey}`)
          : (category.description ??
            t("fallbackPitch", { name: inSentence(category.name) })),
        seeAll: t("seeAll", { name: inSentence(category.name) }),
        gear: lists[index]?.data?.data ?? [],
      }
    })
    .filter((adventure) => adventure.gear.length > 0)
  if (adventures.length < 2) return null

  return (
    <Section
      eyebrow={t("eyebrow")}
      title={t("title")}
      description={t("description")}
    >
      <AdventureTabsClient adventures={adventures} label={t("tabsLabel")} />
    </Section>
  )
}
