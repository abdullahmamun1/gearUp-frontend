import type { Metadata } from "next"
import { Suspense } from "react"

import { getBrands, getGearList } from "@/api/gear"
import { getCategories } from "@/api/categories"
import {
  GearBrowser,
  GearBrowserFallback,
} from "@/components/modules/gear/GearBrowser"
import { CampingScene } from "@/components/shared/illustrations/scenes"
import { PageHero } from "@/components/shared/PageHero"
import { DEFAULT_GEAR_FILTERS, toGearQuery } from "@/utils/filters/gear"

export const metadata: Metadata = {
  title: "Browse gear · GearUp",
  description:
    "Search tents, kayaks, bikes and more from local providers, and filter by category, price and availability.",
}

/**
 * Static (ISR): the shell and the unfiltered first page are prerendered for
 * search engines and a fast first paint; filtered views load in the browser.
 */
export default async function GearPage() {
  const [categoriesRes, brandsRes, firstPageRes] = await Promise.all([
    getCategories(),
    getBrands(),
    getGearList(toGearQuery(DEFAULT_GEAR_FILTERS)),
  ])
  const shared = {
    categories: categoriesRes.data ?? [],
    brands: brandsRes.data ?? [],
    firstPage: firstPageRes.success ? firstPageRes.data : undefined,
  }

  return (
    <>
      <PageHero
        size="sm"
        eyebrow={
          firstPageRes.success
            ? `${firstPageRes.data.meta.total} items from local providers`
            : "Local providers"
        }
        title={
          <>
            Browse <span className="text-gradient">gear</span>
          </>
        }
        description="Rent by the day from providers near you. Filter by category, price and what's free on your dates."
        visual={<CampingScene className="max-w-sm" />}
      />

      <section className="mx-auto max-w-6xl px-4 pt-2 pb-16">
        {/* useSearchParams needs a Suspense boundary on a static page. */}
        <Suspense fallback={<GearBrowserFallback {...shared} />}>
          <GearBrowser {...shared} />
        </Suspense>
      </section>
    </>
  )
}
