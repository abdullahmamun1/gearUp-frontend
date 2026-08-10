import type { Metadata } from "next"
import { Suspense } from "react"
import Link from "next/link"

import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

import { getGearList } from "./_actions/getGear"
import { CategoryGrid } from "./_components/home/CategoryGrid"
import { CategoryGridSkeleton } from "./_components/home/CategoryGridSkeleton"
import { Faq } from "./_components/home/Faq"
import { FeaturedGear } from "./_components/home/FeaturedGear"
import { FeaturedGearSkeleton } from "./_components/home/FeaturedGearSkeleton"
import { Hero } from "./_components/home/Hero"
import { HowItWorks } from "./_components/home/HowItWorks"
import { Newsletter } from "./_components/home/Newsletter"
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

      <section className="mx-auto max-w-6xl px-4 pt-14">
        <div className="rounded-2xl border bg-card px-6 py-12 text-center">
          <h2 className="font-heading text-2xl font-bold sm:text-3xl">
            Got gear sitting in the garage?
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
            List it on GearUp and earn from it between your own adventures.
          </p>
          <Link
            href="/register"
            className={cn(
              buttonVariants({ size: "lg" }),
              "mt-6 h-11 px-5 text-sm"
            )}
          >
            Become a provider
          </Link>
        </div>
      </section>

      <Faq />

      <Newsletter />
    </>
  )
}
