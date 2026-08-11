import Link from "next/link"
import { ArrowRight } from "lucide-react"

import { getGearList } from "@/app/(public)/_actions/getGear"
import { GearCard } from "@/components/shared/GearCard"
import { GearCardSkeleton } from "@/components/shared/GearCardSkeleton"
import { Separator } from "@/components/ui/separator"
import { isRentable } from "@/lib/gearAvailability"
import type { GearItem } from "@/types"

const SHOWN = 4

const POOL = 12

export async function RelatedGear({
  gear,
}: {
  gear: Pick<GearItem, "id" | "category">
}) {
  const category = gear.category
  if (!category) return null

  const res = await getGearList({ category: category.id, limit: String(POOL) })
  const pool = (res.data?.data ?? []).filter((item) => item.id !== gear.id)

  const items = [
    ...pool.filter(isRentable),
    ...pool.filter((item) => !isRentable(item)),
  ].slice(0, SHOWN)

  if (items.length === 0) return null

  return (
    <>
      <Separator className="my-10" />

      <section aria-labelledby="related-heading">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold tracking-wider text-primary uppercase">
              Related gear
            </p>
            <h2
              id="related-heading"
              className="mt-1.5 font-heading text-xl font-bold"
            >
              More in {category.name}
            </h2>
          </div>

          <Link
            href={`/gear?category=${category.id}`}
            className="inline-flex shrink-0 items-center gap-1 text-sm text-primary hover:underline"
          >
            View all {category.name}
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
