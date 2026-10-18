import { Link } from "@/i18n/navigation"
import { ArrowUpRight } from "lucide-react"
import { getTranslations } from "@/i18n/getTranslations"

import { getCategories } from "@/api/categories"
import { CategoryScene } from "@/components/shared/illustrations/scenes"
import { TiltCard } from "@/components/shared/motion/TiltCard"
import { cn } from "@/lib/utils"

import { Section } from "./Section"

/** Colour per kind of adventure: water is Lagoon, land is Pine, action is Ember. */
const TONE: Record<string, string> = {
  "water sports": "from-lagoon/18 to-lagoon/4 hover:border-lagoon/40",
  camping: "from-primary/16 to-primary/3 hover:border-primary/40",
  "hiking & trekking": "from-primary/16 to-primary/3 hover:border-primary/40",
}
const DEFAULT_TONE = "from-ember/16 to-ember/3 hover:border-ember/40"

/**
 * Bento grid: the two categories with the most listings get large tiles with
 * the full scene; the rest are compact. Tiles tilt toward the pointer.
 */
export async function CategoryGrid() {
  const res = await getCategories()
  if (!res.success || !res.data?.length) return null
  const [t, tCommon] = await Promise.all([
    getTranslations("home.categories"),
    getTranslations("common.units"),
  ])

  const categories = [...res.data].sort(
    (a, b) => (b._count?.gearItems ?? 0) - (a._count?.gearItems ?? 0)
  )

  return (
    <Section
      eyebrow={t("eyebrow")}
      title={t("title")}
      description={t("description", { count: categories.length })}
    >
      <div className="reveal-stagger grid auto-rows-[minmax(10rem,auto)] gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {categories.map((category, index) => {
          const big = index < 2
          const count = category._count?.gearItems ?? 0
          const tone = TONE[category.name.trim().toLowerCase()] ?? DEFAULT_TONE

          return (
            <TiltCard
              key={category.id}
              maxTilt={big ? 5 : 8}
              className={cn(
                "rounded-2xl",
                big && "sm:col-span-2 lg:row-span-2"
              )}
            >
              <Link
                href={`/gear?category=${category.id}`}
                className={cn(
                  "group relative flex h-full flex-col overflow-hidden rounded-2xl border bg-linear-to-br shadow-xs transition-[border-color,box-shadow] hover:shadow-lg",
                  tone,
                  big ? "p-6" : "p-5"
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3
                      className={cn(
                        "font-heading font-bold",
                        big ? "text-h3" : "text-base"
                      )}
                    >
                      {category.name}
                    </h3>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {tCommon("listings", { count })}
                    </p>
                  </div>
                  <span className="grid size-9 shrink-0 place-items-center rounded-full border bg-card/80 text-foreground/70 transition-[transform,color] group-hover:-rotate-12 group-hover:text-foreground">
                    <ArrowUpRight className="size-4" aria-hidden />
                  </span>
                </div>

                {big && category.description && (
                  <p className="mt-3 max-w-sm text-sm text-pretty text-muted-foreground">
                    {category.description}
                  </p>
                )}

                <CategoryScene
                  name={category.name}
                  className={cn(
                    "mt-auto self-end transition-transform duration-500 group-hover:scale-[1.04]",
                    big ? "w-[78%] max-w-md pt-4" : "w-[62%] pt-2"
                  )}
                />
              </Link>
            </TiltCard>
          )
        })}
      </div>
    </Section>
  )
}
