import type { Metadata } from "next"
import { Suspense } from "react"

import { getGearList } from "@/api/gear"
import { getPlatformStats } from "@/api/stats"
import { AdventureTabs } from "@/components/modules/marketing/home/AdventureTabs"
import { BrandMarquee } from "@/components/modules/marketing/home/BrandMarquee"
import { CategoryGrid } from "@/components/modules/marketing/home/CategoryGrid"
import { CategoryGridSkeleton } from "@/components/modules/marketing/home/CategoryGridSkeleton"
import { FinalCta } from "@/components/modules/marketing/home/FinalCta"
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
  const [countRes, stats] = await Promise.all([
    getGearList({ limit: "1", isAvailable: "true" }),
    getPlatformStats(),
  ])

  return (
    <>
      <Hero
        gearCount={countRes.data?.meta?.total ?? 0}
        providers={stats?.providers ?? 0}
        reviews={stats?.reviews ?? 0}
      />

      <BrandMarquee />

      <Suspense fallback={<PlatformStatsSkeleton />}>
        <PlatformStats />
      </Suspense>

      <Suspense fallback={<CategoryGridSkeleton />}>
        <CategoryGrid />
      </Suspense>

      <Suspense fallback={<FeaturedGearSkeleton />}>
        <FeaturedGear />
      </Suspense>

      <Suspense fallback={<FeaturedGearSkeleton />}>
        <AdventureTabs />
      </Suspense>

      <HowItWorks />

      <Suspense fallback={<TestimonialsSkeleton />}>
        <Testimonials />
      </Suspense>

      <ProviderCta />

      <Faq />

      <Newsletter />

      <FinalCta />
    </>
  )
}
