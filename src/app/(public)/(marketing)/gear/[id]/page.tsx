import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Suspense } from "react"
import {
  ChevronRight,
  Clock,
  Mail,
  Package,
  ShieldCheck,
  Star,
  Store,
  Undo2,
} from "lucide-react"

import { getGearById, getGearList } from "@/api/gear"
import { GearGallery } from "@/components/modules/gear/GearGallery"
import { RentCta } from "@/components/modules/gear/RentCta"
import { StickyRentBar } from "@/components/modules/gear/StickyRentBar"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { formatDate, formatPrice } from "@/utils/format"
import {
  AVAILABILITY_LABEL,
  gearAvailability,
  isRentable,
} from "@/utils/gearAvailability"
import { RENTAL_POLICY } from "@/utils/rental"
import type { GearItem } from "@/types"

import { GearReviews } from "@/components/modules/gear/GearReviews"
import {
  RelatedGear,
  RelatedGearSkeleton,
} from "@/components/modules/gear/RelatedGear"

type Props = {
  params: Promise<{ id: string }>
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
  const { id } = await params
  const res = await getGearById(id)

  if (!res.success || !res.data) return { title: "Gear not found · GearUp" }

  return {
    title: `${res.data.name} · GearUp`,
    description:
      res.data.description ??
      `Rent ${res.data.name} by the day from a local provider.`,
  }
}

export default async function GearDetailPage({ params }: Props) {
  const { id } = await params
  const res = await getGearById(id)

  if (!res.success && (res.statusCode === 404 || res.statusCode === 400)) {
    notFound()
  }

  if (!res.success || !res.data) {
    return (
      <section className="mx-auto max-w-6xl px-4 py-16">
        <p className="text-sm text-muted-foreground">
          {res.message || "Couldn't load this gear. Please try again."}
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
      <nav aria-label="Breadcrumb">
        <ol className="flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground">
          <li>
            <Link href="/" className="transition-colors hover:text-foreground">
              Home
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
              Browse
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
            <Panel title="About this gear">
              <p className="text-[15px] leading-relaxed text-pretty text-muted-foreground">
                {gear.description}
              </p>
            </Panel>
          )}

          <Panel title="Specifications">
            <Specifications gear={gear} />
          </Panel>

          <section
            id="reviews"
            className="mt-6 scroll-mt-24 rounded-2xl border bg-card p-6 shadow-xs"
          >
            <h2 className="text-h3">Reviews</h2>
            <Suspense fallback={<ReviewsSkeleton />}>
              <GearReviews gearId={gear.id} />
            </Suspense>
          </section>
        </div>

        <div className="lg:sticky lg:top-24 lg:self-start">
          {gear.category && (
            <Badge variant="secondary">{gear.category.name}</Badge>
          )}

          <h1 className="mt-3 text-h1">{gear.name}</h1>

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
                    {gear.rating.average.toFixed(1)}
                  </span>
                  ({gear.rating.count}{" "}
                  {gear.rating.count === 1 ? "review" : "reviews"})
                </a>
              )}
          </div>

          <p className="mt-5 font-heading text-3xl font-bold">
            {formatPrice(gear.pricePerDay)}
            <span className="text-sm font-normal text-muted-foreground">
              {" "}
              / day
            </span>
          </p>

          <p className="mt-2 inline-flex items-center gap-1.5 text-sm text-muted-foreground">
            <Package className="size-4" aria-hidden />
            {outOfStock
              ? "Out of stock"
              : `${gear.stock} ${gear.stock === 1 ? "unit" : "units"} · pick dates to check availability`}
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
                text: `The provider confirms within ${RENTAL_POLICY.respondWithinHours} hours — you pay only after that`,
              },
              {
                icon: Undo2,
                text: `Free cancellation until you pay, full refund up to ${RENTAL_POLICY.freeCancellationHours} hours before pickup`,
              },
              { icon: ShieldCheck, text: "Secure checkout with Stripe" },
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

function Specifications({ gear }: { gear: GearItem }) {
  const specs = [
    { label: "Brand", value: gear.brand },
    { label: "Category", value: gear.category?.name },
    { label: "Price per day", value: formatPrice(gear.pricePerDay) },
    {
      label: "Refundable deposit",
      value:
        Number(gear.depositAmount ?? 0) > 0
          ? formatPrice(gear.depositAmount!)
          : "None",
    },
    { label: "Units", value: String(gear.stock) },
    {
      label: "Availability",
      value: AVAILABILITY_LABEL[gearAvailability(gear)],
    },
    { label: "Listed", value: gear.createdAt && formatDate(gear.createdAt) },
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
  return (
    <div className="mt-5 rounded-2xl border bg-card p-4 shadow-xs">
      <h2 className="text-eyebrow text-muted-foreground">Listed by</h2>
      <div className="mt-3 flex items-center gap-3">
        <span
          className="grid size-11 shrink-0 place-items-center rounded-xl bg-(image:--gradient-brand) text-primary-foreground"
          aria-hidden
        >
          <Store className="size-4" />
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">{provider.name}</p>
          <a
            href={`mailto:${provider.email}`}
            className="inline-flex items-center gap-1.5 truncate text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            <Mail className="size-3" aria-hidden />
            {provider.email}
          </a>
        </div>
      </div>
    </div>
  )
}
