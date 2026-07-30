import type { Metadata } from "next"
import Link from "next/link"

import { buttonVariants } from "@/components/ui/button"
import { getSession } from "@/lib/session"
import { cn } from "@/lib/utils"
import type { RentalStatus } from "@/types"
import { getMyRentals } from "../_actions/getMyRentals"
import { PageHeader, StatCard } from "../_components/PageHeader"

export const metadata: Metadata = { title: "Overview · GearUp" }

const ACTIVE: RentalStatus[] = ["PLACED", "CONFIRMED", "PAID", "PICKED_UP"]

export default async function CustomerOverviewPage() {
  const session = await getSession()
  const res = await getMyRentals()
  const orders = res.data?.data ?? []

  const count = (statuses: RentalStatus[]) =>
    orders.filter((order) => statuses.includes(order.status)).length

  return (
    <>
      <PageHeader
        title={`Welcome back, ${session?.name.split(" ")[0] ?? "there"}`}
        description="Your rentals at a glance."
        action={
          <Link href="/gear" className={cn(buttonVariants({ size: "lg" }))}>
            Browse gear
          </Link>
        }
      />

      {!res.success && (
        <p className="mb-6 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {res.message}
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total rentals" value={res.data?.meta?.total ?? 0} />
        <StatCard
          label="Active"
          value={count(ACTIVE)}
          hint="Not yet returned"
        />
        <StatCard label="Returned" value={count(["RETURNED"])} />
        <StatCard label="Cancelled" value={count(["CANCELLED"])} />
      </div>

      {orders.length === 0 && res.success && (
        <div className="mt-6 grid place-items-center rounded-xl border border-dashed p-12 text-center">
          <p className="text-sm text-muted-foreground">
            You haven&apos;t rented anything yet.
          </p>
          <Link
            href="/gear"
            className={cn(buttonVariants({ variant: "outline" }), "mt-4")}
          >
            Find your first rental
          </Link>
        </div>
      )}
    </>
  )
}
