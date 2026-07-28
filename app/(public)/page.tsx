import type { Metadata } from "next"
import { Hero } from "./_components/home/Hero"
import { Suspense } from "react"
import { CategoryStrip } from "./_components/home/CategoryStrip"
import { CategoryStripSkeleton } from "./_components/home/CategoryStripSkeleton"
import { FeaturedGear } from "./_components/home/FeaturedGear"
import { FeaturedGearSkeleton } from "./_components/home/FeaturedGearSkeleton"

export const metadata: Metadata = {
  title: "GearUp — Rent sports & outdoor gear instantly",
  description:
    "Browse and rent tents, kayaks, bikes and more by the day from local providers.",
}

export default async function HomePage() {
  return (
    <>
      <Hero />

      <Suspense fallback={<CategoryStripSkeleton />}>
        <CategoryStrip />
      </Suspense>

      <Suspense fallback={<FeaturedGearSkeleton />}>
        <FeaturedGear />
      </Suspense>
    </>
  )
}
