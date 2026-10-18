import { initLocale } from "@/i18n/server"
import type { Metadata } from "next"
import { getTranslations } from "@/i18n/getTranslations"
import Image from "next/image"
import { notFound } from "next/navigation"
import {
  BadgeCheck,
  CalendarDays,
  Clock,
  MapPin,
  Package,
  Star,
} from "lucide-react"

import { getProviderProfile } from "@/api/providers"
import { GearCard } from "@/components/shared/GearCard"
import { JsonLd } from "@/components/shared/JsonLd"
import { absoluteUrl, pageMetadata } from "@/lib/site"
import { AreaMap, MapFrame } from "@/components/shared/map/maps"
import { Stars } from "@/components/shared/Stars"
import { getFormat } from "@/i18n/getFormat"
import { cityKey } from "@/constants/cities"
import { localizedPath, type AppLocale } from "@/i18n/routing"
import { formatRating } from "@/utils/gearAvailability"

type Props = {
  params: Promise<{ locale: string; id: string }>
}

/** ISR: built on first visit, refreshed every 5 min or via `provider:{id}`. */
export const revalidate = 300

export async function generateStaticParams() {
  return []
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id, locale } = await params
  const t = await getTranslations({
    locale: locale as AppLocale,
    namespace: "gear.provider",
  })
  const tCommon = await getTranslations({
    locale: locale as AppLocale,
    namespace: "common",
  })
  const res = await getProviderProfile(id)
  if (!res.success || !res.data) return { title: t("notFoundTitle") }
  const provider = res.data
  return pageMetadata({
    title: t("metaTitle", { name: provider.name }),
    description:
      provider.bio ??
      (provider.city
        ? t("metaDescriptionCity", {
            name: provider.name,
            city: cityLabel(tCommon, provider.city),
          })
        : t("metaDescription", { name: provider.name })),
    path: `/providers/${provider.id}`,
    locale,
    ownImage: true,
  })
}

/** A stored city in the page's language (the raw name if it isn't known). */
function cityLabel(
  tCommon: Awaited<ReturnType<typeof getTranslations<"common">>>,
  name: string
) {
  const key = cityKey(name)
  return key ? tCommon(`city.${key}`) : name
}

type ProviderT = Awaited<ReturnType<typeof getTranslations<"gear.provider">>>

function responseLabel(t: ProviderT, hours: number | null) {
  if (hours === null) return t("responseNew")
  if (hours < 1) return t("responseHour")
  if (hours < 24) return t("responseHours", { count: Math.ceil(hours) })
  return t("responseDays", { count: Math.ceil(hours / 24) })
}

export default async function ProviderPage({ params }: Props) {
  const locale = await initLocale(params)
  const { id } = await params
  const t = await getTranslations("gear.provider")
  const tCommon = await getTranslations("common")
  const format = await getFormat()
  const res = await getProviderProfile(id)
  if (!res.success && (res.statusCode === 404 || res.statusCode === 400)) {
    notFound()
  }
  if (!res.success || !res.data) {
    return (
      <section className="mx-auto max-w-6xl px-4 py-16 text-sm text-muted-foreground">
        {res.message || t("loadFailed")}
      </section>
    )
  }

  const provider = res.data
  const { stats } = provider
  const place = [
    provider.area,
    provider.city && cityLabel(tCommon, provider.city),
  ]
    .filter(Boolean)
    .join(", ")
  const initials = provider.name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()

  const facts = [
    {
      icon: Package,
      label: t("listings"),
      value: format.number(stats.listings),
    },
    {
      icon: BadgeCheck,
      label: t("completedRentals"),
      value: format.number(stats.completedRentals),
    },
    {
      icon: Star,
      label: t("rating"),
      value:
        stats.rating.average !== null
          ? `${formatRating(locale, stats.rating.average)} (${format.number(stats.rating.count)})`
          : t("noReviews"),
    },
    {
      icon: Clock,
      label: t("usuallyConfirms"),
      value: responseLabel(t, stats.responseHours),
    },
  ]

  // A local rental business; the area only (never the exact pin).
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: provider.name,
    url: absoluteUrl(localizedPath(locale, `/providers/${provider.id}`)),
    ...(provider.bio && { description: provider.bio }),
    ...(provider.avatarUrl && { image: provider.avatarUrl }),
    ...(provider.city && {
      address: {
        "@type": "PostalAddress",
        addressLocality: provider.city,
        ...(provider.area && { streetAddress: provider.area }),
        addressCountry: "BD",
      },
    }),
    ...(stats.rating.average !== null &&
      stats.rating.count > 0 && {
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: stats.rating.average.toFixed(1),
          reviewCount: stats.rating.count,
          bestRating: 5,
          worstRating: 1,
        },
      }),
  }

  return (
    <>
      <JsonLd data={jsonLd} />
      <section className="relative isolate overflow-hidden border-b">
        <div aria-hidden className="absolute inset-0 -z-20 bg-mesh" />
        <div
          aria-hidden
          className="absolute inset-0 -z-10 bg-grid opacity-50"
        />
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-6 px-4 py-12 sm:py-16">
          <span className="relative grid size-24 shrink-0 place-items-center overflow-hidden rounded-3xl bg-card font-heading text-3xl font-bold text-primary shadow-lg ring-4 ring-card sm:size-28">
            {provider.avatarUrl ? (
              <Image
                src={provider.avatarUrl}
                alt=""
                fill
                sizes="112px"
                className="object-cover"
                loading="eager"
              />
            ) : (
              <span className="grid size-full place-items-center bg-primary/10">
                {initials}
              </span>
            )}
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-eyebrow text-primary">{t("eyebrow")}</p>
            <h1 className="mt-2 text-h1">{provider.name}</h1>
            <p className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
              {place && (
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="size-4" aria-hidden />
                  {place}
                </span>
              )}
              <span className="inline-flex items-center gap-1.5">
                <CalendarDays className="size-4" aria-hidden />
                {t("since", { date: format.date(provider.createdAt) })}
              </span>
            </p>
          </div>
        </div>
      </section>

      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 lg:grid-cols-[1fr_20rem]">
        <div className="min-w-0">
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {facts.map((fact) => (
              <li
                key={fact.label}
                className="rounded-2xl border bg-card p-4 shadow-xs"
              >
                <fact.icon className="size-4 text-primary" aria-hidden />
                <p className="mt-2 font-heading text-lg font-bold">
                  {fact.value}
                </p>
                <p className="text-xs text-muted-foreground">{fact.label}</p>
              </li>
            ))}
          </ul>

          {provider.bio && (
            <section className="mt-8">
              <h2 className="text-h3">{t("about")}</h2>
              <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-pretty text-muted-foreground">
                {provider.bio}
              </p>
            </section>
          )}
        </div>

        <aside className="grid content-start gap-4 lg:sticky lg:top-24 lg:self-start">
          {provider.location ? (
            <>
              <MapFrame className="aspect-square">
                <AreaMap center={provider.location} />
              </MapFrame>
              <p className="text-xs text-muted-foreground">{t("approxArea")}</p>
            </>
          ) : (
            <p className="rounded-xl border border-dashed p-4 text-sm text-muted-foreground">
              {t("noArea")}
            </p>
          )}
        </aside>
      </div>

      <section className="mx-auto max-w-6xl px-4 pb-10">
        <h2 className="text-h3">
          {t("gearFrom", { name: provider.name })}{" "}
          <span className="text-base font-normal text-muted-foreground">
            ({format.number(provider.gear.length)})
          </span>
        </h2>
        {provider.gear.length > 0 ? (
          <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {provider.gear.map((item) => (
              <GearCard key={item.id} gear={item} morph={false} />
            ))}
          </div>
        ) : (
          <p className="mt-3 text-sm text-muted-foreground">
            {t("noListings")}
          </p>
        )}
      </section>

      {provider.reviews.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 pb-14">
          <h2 className="text-h3">{t("reviewsTitle")}</h2>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {provider.reviews.map((review) => (
              <li
                key={review.id}
                className="rounded-2xl border bg-card p-4 shadow-xs"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-medium">
                    {review.customerName}
                  </span>
                  <Stars rating={review.rating} />
                </div>
                {review.comment && (
                  <p className="mt-2 text-sm text-pretty text-muted-foreground">
                    {review.comment}
                  </p>
                )}
                <p className="mt-2 text-xs text-muted-foreground">
                  {review.gearItem.name} · {format.date(review.createdAt)}
                </p>
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  )
}
