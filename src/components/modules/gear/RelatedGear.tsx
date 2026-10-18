import { Link } from "@/i18n/navigation"
import { ArrowRight } from "lucide-react"
import { getTranslations } from "@/i18n/getTranslations"

import { getGearList } from "@/api/gear"
import { GearCard } from "@/components/shared/GearCard"
import { GearCardSkeleton } from "@/components/shared/GearCardSkeleton"
import { Separator } from "@/components/ui/separator"
import { isRentable } from "@/utils/gearAvailability"
import type { GearItem } from "@/types"

const SHOWN = 4

const POOL = 24

/** Within ±40% of this item's daily price counts as "a similar budget". */
const PRICE_BAND = 0.4

/**
 * "You might also like": rule-based, no AI calls. Same category; rentable
 * first, then similar price, then best rated, then closest in price.
 */
export async function RelatedGear({
  gear,
}: {
  gear: Pick<GearItem, "id" | "category" | "pricePerDay">
}) {
  const category = gear.category
  if (!category) return null

  const res = await getGearList({ category: category.id, limit: String(POOL) })
  const pool = (res.data?.data ?? []).filter((item) => item.id !== gear.id)

  const price = Number(gear.pricePerDay)
  const gap = (item: GearItem) =>
    Math.abs(Number(item.pricePerDay) - price) / Math.max(price, 1)
  const score = (item: GearItem) => [
    isRentable(item) ? 0 : 1,
    gap(item) <= PRICE_BAND ? 0 : 1,
    -(item.rating?.average ?? 0),
    gap(item),
  ]
  const t = await getTranslations("gear.related")
  const items = [...pool]
    .sort((a, b) => {
      const [x, y] = [score(a), score(b)]
      for (let i = 0; i < x.length; i++) {
        if (x[i] !== y[i]) return x[i]! - y[i]!
      }
      return 0
    })
    .slice(0, SHOWN)

  if (items.length === 0) return null

  return (
    <>
      <Separator className="my-10" />

      <section aria-labelledby="related-heading">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold tracking-wider text-primary uppercase">
              {t("eyebrow", { category: category.name })}
            </p>
            <h2
              id="related-heading"
              className="mt-1.5 font-heading text-xl font-bold"
            >
              {t("title")}
            </h2>
          </div>

          <Link
            href={`/gear?category=${category.id}`}
            className="inline-flex shrink-0 items-center gap-1 text-sm text-primary hover:underline"
          >
            {t("viewAll", { category: category.name })}
            <ArrowRight className="size-3.5" aria-hidden />
          </Link>
        </div>

        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item) => (
            <GearCard key={item.id} gear={item} />
          ))}
        </div>
      </section>
    </>
  )
}

export function RelatedGearSkeleton() {
  return (
    <>
      <Separator className="my-10" />
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: SHOWN }, (_, i) => (
          <GearCardSkeleton key={i} />
        ))}
      </div>
    </>
  )
}
