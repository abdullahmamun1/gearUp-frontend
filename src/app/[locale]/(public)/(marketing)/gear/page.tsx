import type { AppLocale, LocaleParams } from "@/i18n/routing"
import { initLocale } from "@/i18n/server"
import type { Metadata } from "next"
import { getTranslations } from "@/i18n/getTranslations"

import { pageMetadata } from "@/lib/site"
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

export async function generateMetadata({
  params,
}: LocaleParams): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({
    locale: locale as AppLocale,
    namespace: "gear.browse",
  })
  return pageMetadata({
    title: t("metaTitle"),
    description: t("metaDescription"),
    path: "/gear",
    locale,
  })
}

/**
 * Static (ISR): the shell and the unfiltered first page are prerendered for
 * search engines and a fast first paint; filtered views load in the browser.
 */
export default async function GearPage({ params }: LocaleParams) {
  await initLocale(params)
  const t = await getTranslations("gear.browse")
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
            ? t("eyebrow", { count: firstPageRes.data.meta.total })
            : t("eyebrowFallback")
        }
        title={
          <>
            {t.rich("title", {
              accent: (chunks) => (
                <span className="text-gradient">{chunks}</span>
              ),
            })}
          </>
        }
        description={t("description")}
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
