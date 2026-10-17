import Image from "next/image"
import Link from "next/link"
import { Backpack } from "lucide-react"

import type { GearItem } from "@/types"

export function GearCell({ item }: { item: GearItem }) {
  return (
    <div className="flex items-center gap-3">
      <GearThumbnail item={item} />
      <div className="min-w-0">
        <Link
          href={`/gear/${item.id}`}
          className="font-medium transition-colors hover:text-primary"
        >
          {item.name}
        </Link>
        {item.brand && (
          <p className="text-xs text-muted-foreground">{item.brand}</p>
        )}
      </div>
    </div>
  )
}

function GearThumbnail({ item }: { item: GearItem }) {
  return (
    <div className="relative size-10 shrink-0 overflow-hidden rounded-md bg-muted">
      {item.imageUrl ? (
        <Image
          src={item.imageUrl}
          alt=""
          fill
          sizes="40px"
          className="object-cover"
        />
      ) : (
        <div className="absolute inset-0 grid place-items-center">
          <Backpack
            className="size-4 text-muted-foreground"
            strokeWidth={1.5}
            aria-hidden
          />
        </div>
      )}
    </div>
  )
}
