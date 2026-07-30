"use client"

import Image from "next/image"
import { useState } from "react"
import { Backpack } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export function GearGallery({
  images,
  name,
  outOfStock,
}: {
  images: string[]
  name: string
  outOfStock: boolean
}) {
  const [active, setActive] = useState(0)
  const current = images[active]

  return (
    <div className="grid gap-3">
      <div className="relative aspect-4/3 overflow-hidden rounded-xl border bg-muted">
        {current ? (
          <Image
            key={current}
            src={current}
            alt={
              images.length > 1
                ? `${name} — image ${active + 1} of ${images.length}`
                : name
            }
            fill
            priority
            sizes="(min-width: 1024px) 55vw, 100vw"
            className="object-cover"
          />
        ) : (
          <Placeholder />
        )}

        {outOfStock && (
          <div className="absolute inset-0 grid place-items-center bg-background/70">
            <Badge variant="secondary">Unavailable</Badge>
          </div>
        )}
      </div>

      {images.length > 1 && (
        <ul className="flex gap-2 overflow-x-auto pb-1">
          {images.map((image, index) => (
            <li key={image}>
              <button
                type="button"
                onClick={() => setActive(index)}
                aria-label={`Show image ${index + 1} of ${images.length}`}
                aria-current={index === active}
                className={cn(
                  "relative size-16 shrink-0 overflow-hidden rounded-lg border transition-opacity",
                  index === active
                    ? "ring-2 ring-primary ring-offset-2 ring-offset-background"
                    : "opacity-70 hover:opacity-100"
                )}
              >
                <Image
                  src={image}
                  alt=""
                  fill
                  sizes="64px"
                  className="object-cover"
                />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function Placeholder() {
  return (
    <div className="absolute inset-0 grid place-items-center bg-linear-to-br from-primary/12 via-transparent to-primary/4">
      <Backpack
        className="size-14 text-primary/30"
        strokeWidth={1.25}
        aria-hidden
      />
    </div>
  )
}
