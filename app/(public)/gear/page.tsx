import type { Metadata } from "next"
import { Suspense } from "react"

import { getCategories } from "../_actions/getCategories"
import { GearFilterBar } from "../_components/gear/GearFilterBar"
import { GearResults } from "../_components/gear/GearResults"
import { GearGridSkeleton } from "@/components/shared/GearCardSkeleton"
import {
  GEAR_PAGE_SIZE,
  parseGearFilters,
  type RawSearchParams,
} from "@/lib/gearQuery"

export const metadata: Metadata = {
  title: "Browse gear · GearUp",
  description:
    "Search tents, kayaks, bikes and more from local providers, and filter by category, price and availability.",
}

export default async function GearPage({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>
}) {
  const filters = parseGearFilters(await searchParams)
  const categoriesRes = await getCategories()

  return (
    <section className="mx-auto max-w-6xl px-4 py-10 sm:py-14">
      <h1 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">
        Browse gear
      </h1>
      <p className="mt-2 max-w-lg text-pretty text-muted-foreground">
        Rent by the day from providers near you. Filter by category, price and
        what&apos;s in stock right now.
      </p>

      <GearFilterBar filters={filters} categories={categoriesRes.data ?? []} />

      <Suspense
        key={JSON.stringify(filters)}
        fallback={
          <div className="mt-10">
            <GearGridSkeleton count={GEAR_PAGE_SIZE} />
          </div>
        }
      >
        <GearResults filters={filters} />
      </Suspense>
    </section>
  )
}
