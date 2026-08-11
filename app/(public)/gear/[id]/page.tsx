import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Suspense } from "react"
import { ArrowLeft, Mail, Package, Store } from "lucide-react"

import { getGearById } from "../../_actions/getGear"
import { GearGallery } from "../../_components/gear/GearGallery"
import { RentCta } from "../../_components/gear/RentCta"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { formatDate, formatPrice } from "@/lib/format"
import {
  AVAILABILITY_LABEL,
  gearAvailability,
  isRentable,
} from "@/lib/gearAvailability"
import { POSITIVE_INT, first, matching } from "@/lib/searchParams"
import type { GearItem } from "@/types"

import { GearReviews } from "./_components/GearReviews"
import { RelatedGear, RelatedGearSkeleton } from "./_components/RelatedGear"

type Props = {
  params: Promise<{ id: string }>
  searchParams: Promise<{ reviewPage?: string | string[] }>
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

export default async function GearDetailPage({ params, searchParams }: Props) {
  const { id } = await params
  const reviewPage = Number(
    matching(first((await searchParams).reviewPage), POSITIVE_INT) ?? "1"
  )
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
      <Link
        href="/gear"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-3.5" aria-hidden />
        Back to browse
      </Link>

      <div className="mt-6 grid gap-10 lg:grid-cols-[1.4fr_1fr]">
        <div>
          <GearGallery
            images={images}
            name={gear.name}
            outOfStock={outOfStock}
          />

          {gear.description && (
            <>
              <Separator className="my-8" />
              <h2 className="font-heading text-sm font-semibold">
                About this gear
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-pretty text-muted-foreground">
                {gear.description}
              </p>
            </>
          )}

          <Separator className="my-8" />
          <Specifications gear={gear} />

          <Separator className="my-8" />
          <section id="reviews" className="scroll-mt-20">
            <h2 className="font-heading text-sm font-semibold">Reviews</h2>
            <Suspense key={reviewPage} fallback={<ReviewsSkeleton />}>
              <GearReviews gearId={gear.id} page={reviewPage} />
            </Suspense>
          </section>
        </div>

        <div className="lg:sticky lg:top-6 lg:self-start">
          {gear.category && (
            <Badge variant="secondary">{gear.category.name}</Badge>
          )}

          <h1 className="mt-3 font-heading text-3xl font-bold tracking-tight">
            {gear.name}
          </h1>

          {gear.brand && (
            <p className="mt-1 text-sm text-muted-foreground">{gear.brand}</p>
          )}

          <p className="mt-5 text-2xl font-semibold">
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
              : `${gear.stock} ${gear.stock === 1 ? "unit" : "units"} available`}
          </p>

          <div className="mt-6">
            <RentCta gear={gear} />
          </div>

          {gear.provider && <Provider provider={gear.provider} />}
        </div>
      </div>

      <Suspense fallback={<RelatedGearSkeleton />}>
        <RelatedGear gear={gear} />
      </Suspense>
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
    { label: "Units in stock", value: String(gear.stock) },
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
      <h2 className="font-heading text-sm font-semibold">Specifications</h2>
      <dl className="mt-3 grid gap-x-8 sm:grid-cols-2">
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
    <div className="mt-6 rounded-xl border bg-card p-4">
      <h2 className="font-heading text-sm font-semibold">Listed by</h2>
      <div className="mt-3 flex items-center gap-3">
        <span
          className="grid size-9 shrink-0 place-items-center rounded-full bg-primary/10 text-primary"
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
