import type { Metadata } from "next"
import Link from "next/link"

import { buttonVariants } from "@/components/ui/button"
import { getSession } from "@/lib/session"
import { cn } from "@/lib/utils"
import type { RentalStatus } from "@/types"
import { getMyRentalCounts } from "../_actions/getMyRentals"
import { PageHeader, StatCard } from "../_components/PageHeader"

import { EmptyState } from "@/components/shared/EmptyState"

export const metadata: Metadata = { title: "Overview · GearUp" }

const ACTIVE: RentalStatus[] = ["PLACED", "CONFIRMED", "PAID", "PICKED_UP"]

export default async function CustomerOverviewPage() {
  const session = await getSession()
  const counts = await getMyRentalCounts()

  const count = (statuses: RentalStatus[]) =>
    statuses.reduce((sum, status) => sum + counts.byStatus[status], 0)

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

      {counts.failed && (
        <p className="mb-6 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {counts.message}
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total rentals" value={counts.total} />
        <StatCard
          label="Active"
          value={count(ACTIVE)}
          hint="Not yet returned"
        />
        <StatCard label="Returned" value={count(["RETURNED"])} />
        <StatCard label="Cancelled" value={count(["CANCELLED"])} />
      </div>

      {counts.total === 0 && !counts.failed && (
        <EmptyState
          className="mt-6"
          action={
            <Link
              href="/gear"
              className={cn(buttonVariants({ variant: "outline" }), "mt-4")}
            >
              Find your first rental
            </Link>
          }
        >
          You haven&apos;t rented anything yet.
        </EmptyState>
      )}
    </>
  )
}
