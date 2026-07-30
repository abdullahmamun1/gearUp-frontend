import Link from "next/link"

import { RentPanel } from "./RentPanel"
import { buttonVariants } from "@/components/ui/button"
import { getSession } from "@/lib/session"
import { cn } from "@/lib/utils"
import type { GearItem } from "@/types"

export async function RentCta({ gear }: { gear: GearItem }) {
  const session = await getSession()
  const outOfStock = !gear.isAvailable || gear.stock < 1

  if (outOfStock) {
    return <Notice>This gear is unavailable right now. Check back soon.</Notice>
  }

  if (!session) {
    return (
      <div className="rounded-xl border bg-card p-4">
        <p className="font-heading text-sm font-semibold">Rent this gear</p>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Log in to pick your dates and place an order.
        </p>
        <Link
          href={`/login?redirectTo=${encodeURIComponent(`/gear/${gear.id}`)}`}
          className={cn(
            buttonVariants({ size: "lg" }),
            "mt-4 h-11 w-full text-sm"
          )}
        >
          Log in to rent
        </Link>
      </div>
    )
  }

  if (session.role !== "CUSTOMER") {
    return (
      <Notice>
        You&apos;re signed in as a {session.role.toLowerCase()}. Renting is for
        customer accounts.
      </Notice>
    )
  }

  return (
    <RentPanel
      gearId={gear.id}
      pricePerDay={gear.pricePerDay}
      stock={gear.stock}
    />
  )
}

function Notice({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-xl border border-dashed px-4 py-3 text-sm text-muted-foreground">
      {children}
    </p>
  )
}
