import type { Metadata } from "next"
import { Suspense } from "react"

import { getGearList } from "./_actions/getGear"
import { CategoryGrid } from "./_components/home/CategoryGrid"
import { CategoryGridSkeleton } from "./_components/home/CategoryGridSkeleton"
import { Faq } from "./_components/home/Faq"
import { FeaturedGear } from "./_components/home/FeaturedGear"
import { FeaturedGearSkeleton } from "./_components/home/FeaturedGearSkeleton"
import { Hero } from "./_components/home/Hero"
import { HowItWorks } from "./_components/home/HowItWorks"
import { Newsletter } from "./_components/home/Newsletter"
import { ProviderCta } from "./_components/home/ProviderCta"
import { Testimonials } from "./_components/home/Testimonials"
import { TestimonialsSkeleton } from "./_components/home/TestimonialsSkeleton"

export const metadata: Metadata = {
  title: "GearUp — Rent sports & outdoor gear instantly",
  description:
    "Browse and rent tents, kayaks, bikes and more by the day from local providers.",
}

export default async function HomePage() {
  const countRes = await getGearList({ limit: "1", isAvailable: "true" })

  return (
    <>
      <Hero gearCount={countRes.data?.meta?.total ?? 0} />

      <Suspense fallback={<CategoryGridSkeleton />}>
        <CategoryGrid />
      </Suspense>

      <Suspense fallback={<FeaturedGearSkeleton />}>
        <FeaturedGear />
      </Suspense>

      <HowItWorks />

      <Suspense fallback={<TestimonialsSkeleton />}>
        <Testimonials />
      </Suspense>

      <ProviderCta />

      <Faq />

      <Newsletter />
    </>
  )
}
