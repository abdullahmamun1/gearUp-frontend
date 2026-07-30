import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, Backpack, Package, Store } from "lucide-react"

import { getGearById } from "../../_actions/getGear"
import { RentCta } from "../../_components/gear/RentCta"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { formatPrice } from "@/lib/format"
import type { GearItem } from "@/types"

type Props = { params: Promise<{ id: string }> }

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

  // 404 = no such gear, 400 = the id in the URL isn't a valid id. Either way
  // there's no page here. A 5xx is an outage and falls through to a message.
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
  const outOfStock = !gear.isAvailable || gear.stock < 1

  return (
    <section className="mx-auto max-w-6xl px-4 py-10">
      <Link
        href="/gear"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-3.5" aria-hidden />
        Back to browse
      </Link>

      <div className="mt-6 grid gap-10 lg:grid-cols-2">
        <GearImage gear={gear} outOfStock={outOfStock} />

        <div>
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

          {gear.description && (
            <>
              <Separator className="my-7" />
              <h2 className="font-heading text-sm font-semibold">
                About this gear
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-pretty text-muted-foreground">
                {gear.description}
              </p>
            </>
          )}

          {gear.provider && (
            <>
              <Separator className="my-7" />
              <h2 className="font-heading text-sm font-semibold">Provider</h2>
              <p className="mt-2 inline-flex items-center gap-2 text-sm text-muted-foreground">
                <Store className="size-4" aria-hidden />
                {gear.provider.name}
              </p>
            </>
          )}
        </div>
      </div>
    </section>
  )
}

function GearImage({
  gear,
  outOfStock,
}: {
  gear: GearItem
  outOfStock: boolean
}) {
  return (
    <div className="relative aspect-4/3 overflow-hidden rounded-xl border bg-muted">
      {gear.imageUrl ? (
        <Image
          src={gear.imageUrl}
          alt={gear.name}
          fill
          priority
          sizes="(min-width: 1024px) 50vw, 100vw"
          className="object-cover"
        />
      ) : (
        <div className="absolute inset-0 grid place-items-center bg-linear-to-br from-primary/12 via-transparent to-primary/4">
          <Backpack
            className="size-14 text-primary/30"
            strokeWidth={1.25}
            aria-hidden
          />
        </div>
      )}

      {outOfStock && (
        <div className="absolute inset-0 grid place-items-center bg-background/70">
          <Badge variant="secondary">Unavailable</Badge>
        </div>
      )}
    </div>
  )
}
