import { routing, type LocaleParams } from "@/i18n/routing"
import { initLocale } from "@/i18n/server"
import type { Metadata } from "next"
import { hasLocale } from "next-intl"
import { getTranslations } from "@/i18n/getTranslations"

import { JsonLd } from "@/components/shared/JsonLd"
import { SITE_CONTACT, SOCIAL_LINKS } from "@/constants/siteConfig"
import { absoluteUrl, pageMetadata, SITE_NAME } from "@/lib/site"
import { Suspense } from "react"

import { getGearList } from "@/api/gear"
import { getPlatformStats } from "@/api/stats"
import { AiShowcase } from "@/components/modules/marketing/home/AiShowcase"
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

export async function generateMetadata({
  params,
}: LocaleParams): Promise<Metadata> {
  const { locale: requested } = await params
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale
  const t = await getTranslations({ locale, namespace: "home.meta" })
  return pageMetadata({
    title: t("title"),
    description: t("description"),
    path: "/",
    locale,
  })
}

const ORGANIZATION_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: SITE_NAME,
  url: absoluteUrl("/"),
  logo: absoluteUrl("/icons/icon-512.png"),
  email: SITE_CONTACT.email,
  telephone: SITE_CONTACT.phone,
  address: {
    "@type": "PostalAddress",
    addressLocality: "Sylhet",
    addressCountry: "BD",
  },
  sameAs: SOCIAL_LINKS.map((link) => link.href),
}

/** Lets search engines offer a search box that lands on /gear. */
const WEBSITE_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: SITE_NAME,
  url: absoluteUrl("/"),
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: `${absoluteUrl("/gear")}?searchTerm={search_term_string}`,
    },
    "query-input": "required name=search_term_string",
  },
}

export default async function HomePage({ params }: LocaleParams) {
  await initLocale(params)
  const [countRes, stats] = await Promise.all([
    getGearList({ limit: "1", isAvailable: "true" }),
    getPlatformStats(),
  ])

  return (
    <>
      <JsonLd data={ORGANIZATION_JSON_LD} />
      <JsonLd data={WEBSITE_JSON_LD} />
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

      <Suspense fallback={null}>
        <AiShowcase />
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
