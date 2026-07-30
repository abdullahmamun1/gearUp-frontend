import Link from "next/link"

import { buttonVariants } from "@/components/ui/button"
import { getSession } from "@/lib/session"
import { cn } from "@/lib/utils"
import type { GearItem } from "@/types"

/**
 * Providers and admins never rent, so they get an explanation rather than a
 * button they can't use. Anonymous visitors go through login and come back.
 */
export async function RentCta({ gear }: { gear: GearItem }) {
  const session = await getSession()
  const outOfStock = !gear.isAvailable || gear.stock < 1

  if (outOfStock) {
    return (
      <p className="rounded-lg border border-dashed px-4 py-3 text-sm text-muted-foreground">
        This gear is unavailable right now. Check back soon.
      </p>
    )
  }

  if (!session) {
    return (
      <Link
        href={`/login?redirectTo=${encodeURIComponent(`/gear/${gear.id}`)}`}
        className={cn(buttonVariants({ size: "lg" }), "h-11 w-full text-sm")}
      >
        Log in to rent
      </Link>
    )
  }

  if (session.role !== "CUSTOMER") {
    return (
      <p className="rounded-lg border border-dashed px-4 py-3 text-sm text-muted-foreground">
        You&apos;re signed in as a {session.role.toLowerCase()}. Renting is for
        customer accounts.
      </p>
    )
  }

  return (
    <Link
      href={`/gear/${gear.id}/book`}
      className={cn(buttonVariants({ size: "lg" }), "h-11 w-full text-sm")}
    >
      Rent this gear
    </Link>
  )
}
