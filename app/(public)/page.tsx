import type { Metadata } from "next"
import { Hero } from "./_components/home/Hero"
import { Suspense } from "react"
import { CategoryStrip } from "./_components/home/CategoryStrip"
import { CategoryStripSkeleton } from "./_components/home/CategoryStripSkeleton"
import { FeaturedGear } from "./_components/home/FeaturedGear"
import { FeaturedGearSkeleton } from "./_components/home/FeaturedGearSkeleton"
import { getGearList } from "./_actions/getGear"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import { HowItWorks } from "./_components/home/HowItWorks"

export const metadata: Metadata = {
  title: "GearUp — Rent sports & outdoor gear instantly",
  description:
    "Browse and rent tents, kayaks, bikes and more by the day from local providers.",
}

export default async function HomePage() {
  const countRes = await getGearList({ limit: "1", isAvailable: "true" })
  return (
    <>
      <Hero gearCount={countRes.meta?.total ?? 0} />

      <Suspense fallback={<CategoryStripSkeleton />}>
        <CategoryStrip />
      </Suspense>

      <Suspense fallback={<FeaturedGearSkeleton />}>
        <FeaturedGear />
      </Suspense>

      <div className="mx-auto mt-16 max-w-6xl px-4 py-10">
        <div className="rounded-2xl border bg-primary/5 px-6 py-12 text-center">
          <h2 className="font-heading text-2xl font-bold">
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
      </div>

      <HowItWorks />
    </>
  )
}
