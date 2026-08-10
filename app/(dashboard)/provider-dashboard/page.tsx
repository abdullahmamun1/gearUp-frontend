import type { Metadata } from "next"
import Link from "next/link"

import { buttonVariants } from "@/components/ui/button"
import { getSession } from "@/lib/session"
import { cn } from "@/lib/utils"
import type { RentalStatus } from "@/types"

import { getProviderGear } from "../_actions/getProviderGear"
import { getProviderOrderCounts } from "../_actions/getProviderOrders"
import { PageHeader, StatCard } from "../_components/PageHeader"

import { EmptyState } from "@/components/shared/EmptyState"

export const metadata: Metadata = { title: "Provider overview · GearUp" }

const NEEDS_ACTION: RentalStatus[] = ["PLACED", "PAID", "PICKED_UP"]

export default async function ProviderOverviewPage() {
  const session = await getSession()
  const [counts, gearRes] = await Promise.all([
    getProviderOrderCounts(),
    getProviderGear({ limit: "1" }),
  ])

  const count = (statuses: RentalStatus[]) =>
    statuses.reduce((sum, status) => sum + counts.byStatus[status], 0)

  return (
    <>
      <PageHeader
        title={session?.name ?? "Provider overview"}
        description="Orders placed against your listings."
        action={
          <Link
            href="/provider-dashboard/gear"
            className={cn(buttonVariants({ size: "lg" }))}
          >
            Manage gear
          </Link>
        }
      />

      {counts.failed && (
        <p className="mb-6 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {counts.message}
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Gear listed"
          value={gearRes.data?.meta?.total ?? "—"}
        />
        <StatCard label="Total orders" value={counts.total} />
        <StatCard
          label="Needs action"
          value={count(NEEDS_ACTION)}
          hint="Awaiting confirm, pickup or return"
        />
        <StatCard label="Returned" value={count(["RETURNED"])} />
      </div>

      {counts.total === 0 && !counts.failed && (
        <EmptyState className="mt-6">
          No orders yet. They appear here as customers book your gear.
        </EmptyState>
      )}
    </>
  )
}
