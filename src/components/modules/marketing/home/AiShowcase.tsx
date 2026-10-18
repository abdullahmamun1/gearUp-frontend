import { CalendarCheck, Search, ShieldCheck } from "lucide-react"
import { getTranslations } from "@/i18n/getTranslations"

import { getCategories } from "@/api/categories"
import { getGearList } from "@/api/gear"

import { AiShowcaseDemo, OpenTripPlannerButton } from "./AiShowcaseDemo"

const POINTS = [
  { icon: Search, id: "describe" },
  { icon: CalendarCheck, id: "real" },
  { icon: ShieldCheck, id: "honest" },
] as const

/** "Plan your trip with AI": the pitch beside a scripted demo chat. */
export async function AiShowcase() {
  const categoriesRes = await getCategories()
  const camping = categoriesRes.data?.find((category) =>
    category.name.toLowerCase().includes("camp")
  )
  const gearRes = await getGearList({
    limit: "3",
    isAvailable: "true",
    ...(camping && { category: camping.id }),
  })
  const gear = gearRes.data?.data ?? []
  if (gear.length === 0) return null
  const t = await getTranslations("ai.showcase")

  return (
    <section className="relative isolate overflow-hidden border-y bg-muted/30">
      <div aria-hidden className="absolute inset-0 -z-10 bg-dots opacity-40" />
      <div className="reveal mx-auto grid max-w-6xl items-center gap-12 px-4 py-16 sm:py-20 lg:grid-cols-2">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold text-primary">
            {t("badge")}
          </p>
          <h2 className="mt-4 text-h1">
            {t.rich("title", {
              accent: (chunks) => (
                <span className="text-gradient">{chunks}</span>
              ),
            })}
          </h2>
          <p className="mt-3 max-w-md text-pretty text-muted-foreground sm:text-lg">
            {t("intro")}
          </p>
          <ul className="mt-8 grid gap-4">
            {POINTS.map((point) => (
              <li key={point.id} className="flex gap-3">
                <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                  <point.icon className="size-[18px]" aria-hidden />
                </span>
                <span>
                  <span className="block font-medium">
                    {t(`${point.id}.title`)}
                  </span>
                  <span className="block text-sm text-muted-foreground">
                    {t(`${point.id}.body`)}
                  </span>
                </span>
              </li>
            ))}
          </ul>
          <div className="mt-8">
            <OpenTripPlannerButton />
          </div>
        </div>

        <AiShowcaseDemo gear={gear} />
      </div>
    </section>
  )
}
