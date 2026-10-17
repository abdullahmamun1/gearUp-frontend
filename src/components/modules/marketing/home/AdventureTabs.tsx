import { getCategories } from "@/api/categories"
import { getGearList } from "@/api/gear"

import { AdventureTabsClient, type Adventure } from "./AdventureTabsClient"
import { Section } from "./Section"

const PITCH: Record<string, string> = {
  camping:
    "Sleep under the stars at Sajek or Ratargul — tents, bags and stoves, cleaned after every trip.",
  "water sports":
    "Kayaks, boards and snorkel kits for Cox's Bazar, Saint Martin's and the haors.",
  cycling:
    "Mountain, road and city bikes, with helmets and racks to get them there.",
  "hiking & trekking":
    "Packs, poles and boots for the Bandarban trails and beyond.",
  climbing: "Harnesses, ropes and crash pads, inspected after every use.",
  "team sports":
    "Match kits for football, cricket and badminton — the whole squad sorted.",
}

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

  const adventures: Adventure[] = top
    .map((category, index) => ({
      id: category.id,
      name: category.name,
      pitch:
        PITCH[category.name.trim().toLowerCase()] ??
        category.description ??
        `Everything for ${category.name.toLowerCase()}, by the day.`,
      gear: lists[index]?.data?.data ?? [],
    }))
    .filter((adventure) => adventure.gear.length > 0)
  if (adventures.length < 2) return null

  return (
    <Section
      eyebrow="Pick your adventure"
      title="Kit for every kind of weekend"
      description="Switch between trips to see what's ready to book."
    >
      <AdventureTabsClient adventures={adventures} />
    </Section>
  )
}
