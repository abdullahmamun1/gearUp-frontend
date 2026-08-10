import Image from "next/image"
import Link from "next/link"
import { ArrowRight, Backpack, Star } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import { formatPrice } from "@/lib/format"
import { cn } from "@/lib/utils"
import type { GearItem } from "@/types"

export function GearCard({ gear }: { gear: GearItem }) {
  const outOfStock = !gear.isAvailable || gear.stock < 1
  const rating = gear.rating

  return (
    <div className="group flex flex-col overflow-hidden rounded-xl border bg-card transition-shadow hover:shadow-lg">
      <div className="relative aspect-4/3 overflow-hidden bg-muted">
        {gear.imageUrl ? (
          <Image
            src={gear.imageUrl}
            alt={gear.name}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <GearImageFallback />
        )}

        {outOfStock && (
          <div className="absolute inset-0 grid place-items-center bg-background/70">
            <Badge variant="secondary">Unavailable</Badge>
          </div>
        )}

        {gear.category && (
          <Badge
            variant="secondary"
            className="absolute top-2.5 left-2.5 backdrop-blur-sm"
          >
            {gear.category.name}
          </Badge>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-1 p-4">
        <h3 className="line-clamp-1 font-heading font-semibold">{gear.name}</h3>

        {gear.brand && (
          <p className="text-xs text-muted-foreground">{gear.brand}</p>
        )}

        {gear.description && (
          <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
            {gear.description}
          </p>
        )}

        <div className="mt-auto flex items-end justify-between gap-3 pt-3">
          <p className="font-semibold">
            {formatPrice(gear.pricePerDay)}
            <span className="text-xs font-normal text-muted-foreground">
              {" "}
              / day
            </span>
          </p>
          <div className="grid justify-items-end gap-0.5 text-right">
            {rating && rating.count > 0 && rating.average !== null && (
              <GearRating value={rating.average} count={rating.count} />
            )}
            {gear.provider && (
              <p className="line-clamp-1 text-xs text-muted-foreground">
                by {gear.provider.name}
              </p>
            )}
          </div>
        </div>

        <Link
          href={`/gear/${gear.id}`}
          aria-label={`View details for ${gear.name}`}
          className={cn(
            buttonVariants({ variant: "outline", size: "lg" }),
            "mt-4 h-9 w-full gap-1.5 text-sm transition-colors",
            "group-hover:border-primary/30 group-hover:text-primary",
            "hover:border-primary hover:bg-primary/10 hover:text-primary"
          )}
        >
          View details
          <ArrowRight
            className="size-3.5 transition-transform group-hover:translate-x-0.5"
            aria-hidden
          />
        </Link>
      </div>
    </div>
  )
}

function GearImageFallback() {
  return (
    <div className="absolute inset-0 grid place-items-center bg-linear-to-br from-primary/12 via-transparent to-primary/4">
      <Backpack
        className="size-10 text-primary/30"
        strokeWidth={1.25}
        aria-hidden
      />
    </div>
  )
}

function GearRating({ value, count }: { value: number; count?: number }) {
  return (
    <span
      className="inline-flex items-center gap-1 text-xs text-muted-foreground"
      aria-label={
        count === undefined
          ? `Rated ${value.toFixed(1)} out of 5`
          : `Rated ${value.toFixed(1)} out of 5 from ${count} ${count === 1 ? "review" : "reviews"}`
      }
    >
      <Star className="size-3.5 fill-current text-amber-500" aria-hidden />
      <span aria-hidden>
        {value.toFixed(1)}
        {count !== undefined && ` (${count})`}
      </span>
    </span>
  )
}
