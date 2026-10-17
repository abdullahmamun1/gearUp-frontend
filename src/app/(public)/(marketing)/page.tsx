import type { Metadata } from "next"
import { Suspense } from "react"

import { getGearList } from "@/api/gear"
import { CategoryGrid } from "@/components/modules/marketing/home/CategoryGrid"
import { CategoryGridSkeleton } from "@/components/modules/marketing/home/CategoryGridSkeleton"
import { Faq } from "@/components/modules/marketing/home/Faq"
import { FeaturedGear } from "@/components/modules/marketing/home/FeaturedGear"
import { FeaturedGearSkeleton } from "@/components/modules/marketing/home/FeaturedGearSkeleton"
import { Hero } from "@/components/modules/marketing/home/Hero"
import { HowItWorks } from "@/components/modules/marketing/home/HowItWorks"
import { Newsletter } from "@/components/modules/marketing/home/Newsletter"
import { PlatformStats } from "@/components/modules/marketing/home/PlatformStats"
import { PlatformStatsSkeleton } from "@/components/modules/marketing/home/PlatformStatsSkeleton"
import { ProviderCta } from "@/components/modules/marketing/home/ProviderCta"
import { Testimonials } from "@/components/modules/marketing/home/Testimonials"
import { TestimonialsSkeleton } from "@/components/modules/marketing/home/TestimonialsSkeleton"

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

      <Suspense fallback={<PlatformStatsSkeleton />}>
        <PlatformStats />
      </Suspense>

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
