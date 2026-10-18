import { initLocale } from "@/i18n/server"
import type { Metadata } from "next"
import { getTranslations } from "@/i18n/getTranslations"
import { useTranslations } from "@/i18n/translations"
import Image from "next/image"
import { Link } from "@/i18n/navigation"
import { notFound } from "next/navigation"
import { Suspense } from "react"
import {
  ArrowRight,
  ChevronRight,
  Clock,
  MapPin,
  Package,
  ShieldCheck,
  Sparkles,
  Star,
  Store,
  ThumbsDown,
  ThumbsUp,
  Undo2,
} from "lucide-react"

import { getGearById, getGearList } from "@/api/gear"
import { GearGallery } from "@/components/modules/gear/GearGallery"
import { FavoriteButton } from "@/components/shared/FavoriteButton"
import { JsonLd } from "@/components/shared/JsonLd"
import { absoluteUrl, pageMetadata } from "@/lib/site"
import { AreaMap } from "@/components/shared/map/maps"
import { RentCta } from "@/components/modules/gear/RentCta"
import { StickyRentBar } from "@/components/modules/gear/StickyRentBar"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { cityKey } from "@/constants/cities"
import { getFormat } from "@/i18n/getFormat"
import type { Format } from "@/i18n/format"
import { localizedPath, type AppLocale } from "@/i18n/routing"
import {
  AVAILABILITY_LABEL,
  formatRating,
  gearAvailability,
  isRentable,
} from "@/utils/gearAvailability"
import { RENTAL_POLICY } from "@/utils/rental"
import type { GearItem, ReviewSummary } from "@/types"

import { GearReviews } from "@/components/modules/gear/GearReviews"
import {
  RelatedGear,
  RelatedGearSkeleton,
} from "@/components/modules/gear/RelatedGear"

type Props = {
  params: Promise<{ locale: string; id: string }>
}

/** ISR: pages refresh at most every 5 minutes, or at once via the `gear` tag. */
export const revalidate = 300

/**
 * Prebuild the newest listings; any other id is rendered on its first visit
 * and then cached like the rest. A failed fetch just means nothing is
 * prebuilt — the build never depends on the API being up.
 */
export async function generateStaticParams() {
  const res = await getGearList({
    limit: "48",
    sortBy: "createdAt",
    sortOrder: "desc",
  })
  return (res.data?.data ?? []).map((gear) => ({ id: gear.id }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id, locale } = await params
  const t = await getTranslations({
    locale: locale as AppLocale,
    namespace: "gear.detail",
  })
  const res = await getGearById(id)

  if (!res.success || !res.data) return { title: t("notFoundTitle") }

  const gear = res.data
  return pageMetadata({
    title: t("metaTitle", { name: gear.name }),
    description: summarize(
      gear.description ||
        (gear.provider?.name
          ? t("metaDescription", {
              name: gear.name,
              provider: gear.provider.name,
            })
          : t("metaDescriptionLocal", { name: gear.name }))
    ),
    path: `/gear/${gear.id}`,
    locale,
    ownImage: true,
  })
}

/** Meta descriptions read best under ~160 characters. */
function summarize(text: string) {
  const flat = text.replace(/\s+/g, " ").trim()
  return flat.length > 160 ? `${flat.slice(0, 157).trimEnd()}…` : flat
}

/** Product + Offer (+ rating) and the breadcrumb trail, for rich results. */
function gearJsonLd(
  gear: GearItem,
  images: string[],
  locale: string,
  crumbs: { home: string; browse: string }
) {
  const link = (path: string) => absoluteUrl(localizedPath(locale, path))
  const url = link(`/gear/${gear.id}`)
  const rating = gear.rating
  return [
    {
      "@context": "https://schema.org",
      "@type": "Product",
      name: gear.name,
      description: gear.description ?? undefined,
      image: images,
      sku: gear.id,
      url,
      ...(gear.brand && { brand: { "@type": "Brand", name: gear.brand } }),
      ...(gear.category && { category: gear.category.name }),
      offers: {
        "@type": "Offer",
        url,
        priceCurrency: "BDT",
        price: Number(gear.pricePerDay).toFixed(2),
        priceSpecification: {
          "@type": "UnitPriceSpecification",
          price: Number(gear.pricePerDay).toFixed(2),
          priceCurrency: "BDT",
          referenceQuantity: {
            "@type": "QuantitativeValue",
            value: 1,
            unitCode: "DAY",
          },
        },
        availability: isRentable(gear)
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
        businessFunction: "http://purl.org/goodrelations/v1#LeaseOut",
        ...(gear.provider && {
          seller: {
            "@type": "Organization",
            name: gear.provider.name,
            url: link(`/providers/${gear.provider.id}`),
          },
        }),
      },
      ...(rating?.average &&
        rating.count > 0 && {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: rating.average.toFixed(1),
            reviewCount: rating.count,
            bestRating: 5,
            worstRating: 1,
          },
        }),
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { name: crumbs.home, path: "/" },
        { name: crumbs.browse, path: "/gear" },
        ...(gear.category
          ? [
              {
                name: gear.category.name,
                path: `/gear?category=${gear.category.id}`,
              },
            ]
          : []),
        { name: gear.name, path: `/gear/${gear.id}` },
      ].map((crumb, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: crumb.name,
        item: link(crumb.path),
      })),
    },
  ]
}

export default async function GearDetailPage({ params }: Props) {
  const locale = await initLocale(params)
  const { id } = await params
  const t = await getTranslations("gear.detail")
  const tCommon = await getTranslations("common")
  const format = await getFormat()
  const res = await getGearById(id)

  if (!res.success && (res.statusCode === 404 || res.statusCode === 400)) {
    notFound()
  }

  if (!res.success || !res.data) {
    return (
      <section className="mx-auto max-w-6xl px-4 py-16">
        <p className="text-sm text-muted-foreground">
          {res.message || t("loadFailed")}
        </p>
      </section>
    )
  }

  const gear = res.data
  const outOfStock = !isRentable(gear)
  const images = [
    ...new Set([gear.imageUrl, ...(gear.images ?? [])].filter(Boolean)),
  ] as string[]

  return (
    <section className="mx-auto max-w-6xl px-4 py-10">
      {gearJsonLd(
        gear,
        images.map((src) => absoluteUrl(src)),
        locale,
        { home: t("breadcrumbHome"), browse: t("breadcrumbBrowse") }
      ).map((data) => (
        <JsonLd key={String(data["@type"])} data={data} />
      ))}
      <nav aria-label={t("breadcrumbLabel")}>
        <ol className="flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground">
          <li>
            <Link href="/" className="transition-colors hover:text-foreground">
              {t("breadcrumbHome")}
            </Link>
          </li>
          <li aria-hidden>
            <ChevronRight className="size-3.5" />
          </li>
          <li>
            <Link
              href="/gear"
              transitionTypes={["nav-back"]}
              className="transition-colors hover:text-foreground"
            >
              {t("breadcrumbBrowse")}
            </Link>
          </li>
          {gear.category && (
            <>
              <li aria-hidden>
                <ChevronRight className="size-3.5" />
              </li>
              <li>
                <Link
                  href={`/gear?category=${gear.category.id}`}
                  transitionTypes={["nav-back"]}
                  className="transition-colors hover:text-foreground"
                >
                  {gear.category.name}
                </Link>
              </li>
            </>
          )}
          <li aria-hidden>
            <ChevronRight className="size-3.5" />
          </li>
          <li aria-current="page" className="max-w-56 truncate text-foreground">
            {gear.name}
          </li>
        </ol>
      </nav>

      <div className="mt-6 grid gap-10 lg:grid-cols-[1.4fr_1fr]">
        <div>
          <GearGallery
            gearId={gear.id}
            images={images}
            name={gear.name}
            outOfStock={outOfStock}
          />

          {gear.description && (
            <Panel title={t("about")}>
              <p className="text-[15px] leading-relaxed text-pretty text-muted-foreground">
                {gear.description}
              </p>
            </Panel>
          )}

          <Panel title={t("specifications")}>
            <Specifications gear={gear} format={format} />
          </Panel>

          {gear.reviewSummary && <ReviewDigest summary={gear.reviewSummary} />}

          <section
            id="reviews"
            className="mt-6 scroll-mt-24 rounded-2xl border bg-card p-6 shadow-xs"
          >
            <h2 className="text-h3">{t("reviews")}</h2>
            <Suspense fallback={<ReviewsSkeleton />}>
              <GearReviews gearId={gear.id} />
            </Suspense>
          </section>
        </div>

        <div className="lg:sticky lg:top-24 lg:self-start">
          {gear.category && (
            <Badge variant="secondary">{gear.category.name}</Badge>
          )}

          <div className="mt-3 flex items-start justify-between gap-3">
            <h1 className="text-h1">{gear.name}</h1>
            <FavoriteButton
              gearId={gear.id}
              gearName={gear.name}
              variant="outline"
              className="mt-1"
            />
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
            {gear.brand && <span>{gear.brand}</span>}
            {gear.rating &&
              gear.rating.count > 0 &&
              gear.rating.average !== null && (
                <a
                  href="#reviews"
                  className="inline-flex items-center gap-1 transition-colors hover:text-foreground"
                >
                  <Star
                    className="size-4 fill-current text-amber-500"
                    aria-hidden
                  />
                  <span className="font-medium text-foreground">
                    {formatRating(locale, gear.rating.average)}
                  </span>
                  ({tCommon("units.reviews", { count: gear.rating.count })})
                </a>
              )}
          </div>

          <p className="mt-5 font-heading text-3xl font-bold">
            {format.price(gear.pricePerDay)}
            <span className="text-sm font-normal text-muted-foreground">
              {" "}
              {tCommon("units.perDay")}
            </span>
          </p>

          <p className="mt-2 inline-flex items-center gap-1.5 text-sm text-muted-foreground">
            <Package className="size-4" aria-hidden />
            {outOfStock ? t("outOfStock") : t("stock", { count: gear.stock })}
          </p>

          <div id="rent" className="mt-6 scroll-mt-24">
            <RentCta gear={gear} />
          </div>
          {!outOfStock && (
            <StickyRentBar targetId="rent" pricePerDay={gear.pricePerDay} />
          )}

          <ul className="mt-5 grid gap-2.5 rounded-2xl border bg-muted/30 p-4 text-sm">
            {[
              {
                icon: Clock,
                text: t("perkConfirm", {
                  hours: RENTAL_POLICY.respondWithinHours,
                }),
              },
              {
                icon: Undo2,
                text: t("perkCancel", {
                  hours: RENTAL_POLICY.freeCancellationHours,
                }),
              },
              { icon: ShieldCheck, text: t("perkStripe") },
            ].map((item) => (
              <li key={item.text} className="flex gap-2.5">
                <item.icon
                  className="mt-0.5 size-4 shrink-0 text-primary"
                  aria-hidden
                />
                <span className="text-muted-foreground">{item.text}</span>
              </li>
            ))}
          </ul>

          {gear.provider && <Provider provider={gear.provider} />}
        </div>
      </div>

      <Suspense fallback={<RelatedGearSkeleton />}>
        <RelatedGear gear={gear} />
      </Suspense>
    </section>
  )
}

/** The AI digest of an item's reviews (written when reviews arrive). */
function ReviewDigest({ summary }: { summary: ReviewSummary }) {
  const t = useTranslations("gear.detail")
  return (
    <section className="mt-6 rounded-2xl border border-primary/20 bg-primary/5 p-6">
      <div className="flex items-center gap-2.5">
        <span className="grid size-8 place-items-center rounded-lg bg-(image:--gradient-brand) text-primary-foreground">
          <Sparkles className="size-4" aria-hidden />
        </span>
        <h2 className="text-h3">{t("digestTitle")}</h2>
        <span className="ml-auto text-xs text-muted-foreground">
          {t("digestNote")}
        </span>
      </div>
      <p className="mt-3 text-[15px] leading-relaxed text-pretty">
        {summary.summary}
      </p>
      {(summary.pros.length > 0 || summary.cons.length > 0) && (
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {summary.pros.length > 0 && (
            <ul className="grid gap-1.5 text-sm">
              {summary.pros.map((pro) => (
                <li key={pro} className="flex gap-2">
                  <ThumbsUp
                    className="mt-0.5 size-4 shrink-0 text-success"
                    aria-hidden
                  />
                  <span>{pro}</span>
                </li>
              ))}
            </ul>
          )}
          {summary.cons.length > 0 && (
            <ul className="grid gap-1.5 text-sm">
              {summary.cons.map((con) => (
                <li key={con} className="flex gap-2">
                  <ThumbsDown
                    className="mt-0.5 size-4 shrink-0 text-muted-foreground"
                    aria-hidden
                  />
                  <span className="text-muted-foreground">{con}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </section>
  )
}

function Panel({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <section className="mt-6 rounded-2xl border bg-card p-6 shadow-xs">
      <h2 className="mb-3 text-h3">{title}</h2>
      {children}
    </section>
  )
}

function ReviewsSkeleton() {
  return (
    <div className="mt-3 grid gap-5">
      <Skeleton className="h-10 w-36" />
      {[0, 1].map((row) => (
        <div key={row} className="grid gap-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-full" />
        </div>
      ))}
    </div>
  )
}

function Specifications({ gear, format }: { gear: GearItem; format: Format }) {
  const t = useTranslations("gear.detail.specs")
  const tGear = useTranslations("gear")
  const specs = [
    { label: t("brand"), value: gear.brand },
    { label: t("category"), value: gear.category?.name },
    { label: t("pricePerDay"), value: format.price(gear.pricePerDay) },
    {
      label: t("deposit"),
      value:
        Number(gear.depositAmount ?? 0) > 0
          ? format.price(gear.depositAmount!)
          : t("none"),
    },
    { label: t("units"), value: format.number(gear.stock) },
    {
      label: t("availability"),
      value: tGear(AVAILABILITY_LABEL[gearAvailability(gear)]),
    },
    {
      label: t("listed"),
      value: gear.createdAt && format.date(gear.createdAt),
    },
  ].filter((spec): spec is { label: string; value: string } =>
    Boolean(spec.value)
  )

  return (
    <>
      <dl className="grid gap-x-8 sm:grid-cols-2">
        {specs.map((spec) => (
          <div
            key={spec.label}
            className="flex items-baseline justify-between gap-4 border-b py-2.5 text-sm"
          >
            <dt className="text-muted-foreground">{spec.label}</dt>
            <dd className="text-right">{spec.value}</dd>
          </div>
        ))}
      </dl>
    </>
  )
}

function Provider({
  provider,
}: {
  provider: NonNullable<GearItem["provider"]>
}) {
  const t = useTranslations("gear.detail")
  const tCommon = useTranslations("common")
  const city = cityKey(provider.city)
  const place = [provider.area, city ? tCommon(`city.${city}`) : provider.city]
    .filter(Boolean)
    .join(", ")
  return (
    <div className="mt-5 overflow-hidden rounded-2xl border bg-card shadow-xs">
      <div className="p-4">
        <h2 className="text-eyebrow text-muted-foreground">{t("listedBy")}</h2>
        <Link
          href={`/providers/${provider.id}`}
          className="group mt-3 flex items-center gap-3"
        >
          <span
            className="relative grid size-11 shrink-0 place-items-center overflow-hidden rounded-xl bg-(image:--gradient-brand) text-primary-foreground"
            aria-hidden
          >
            {provider.avatarUrl ? (
              <Image
                src={provider.avatarUrl}
                alt=""
                fill
                sizes="44px"
                className="object-cover"
              />
            ) : (
              <Store className="size-4" />
            )}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-medium group-hover:text-primary">
              {provider.name}
            </span>
            {place && (
              <span className="flex items-center gap-1 truncate text-xs text-muted-foreground">
                <MapPin className="size-3 shrink-0" aria-hidden />
                {place}
              </span>
            )}
          </span>
          <span className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-primary">
            {t("profile")}
            <ArrowRight
              className="size-3.5 transition-transform group-hover:translate-x-0.5"
              aria-hidden
            />
          </span>
        </Link>
      </div>
      {provider.location && (
        <>
          <div className="aspect-[16/9] border-t">
            <AreaMap center={provider.location} />
          </div>
          <p className="border-t px-4 py-2.5 text-xs text-muted-foreground">
            {t("approxArea")}
          </p>
        </>
      )}
    </div>
  )
}
