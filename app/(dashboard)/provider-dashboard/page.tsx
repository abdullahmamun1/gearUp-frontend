import type { Metadata } from "next"
import Link from "next/link"

import { buttonVariants } from "@/components/ui/button"
import { getSession } from "@/lib/session"
import { cn } from "@/lib/utils"
import type { RentalStatus } from "@/types"

import { getProviderGear } from "../_actions/getProviderGear"
import { getProviderOrders } from "../_actions/getProviderOrders"
import { PageHeader, StatCard } from "../_components/PageHeader"

export const metadata: Metadata = { title: "Provider overview · GearUp" }

const NEEDS_ACTION: RentalStatus[] = ["PLACED", "PAID", "PICKED_UP"]

export default async function ProviderOverviewPage() {
  const session = await getSession()
  const [res, gearRes] = await Promise.all([
    getProviderOrders(),
    getProviderGear({ limit: "1" }),
  ])
  const orders = res.data?.data ?? []

  const count = (statuses: RentalStatus[]) =>
    orders.filter((order) => statuses.includes(order.status)).length

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

      {!res.success && (
        <p className="mb-6 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {res.message}
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Gear listed"
          value={gearRes.data?.meta?.total ?? "—"}
        />
        <StatCard
          label="Total orders"
          value={res.data?.meta?.total ?? orders.length}
        />
        <StatCard
          label="Needs action"
          value={count(NEEDS_ACTION)}
          hint="Awaiting confirm, pickup or return"
        />
        <StatCard label="Returned" value={count(["RETURNED"])} />
      </div>

      {orders.length === 0 && res.success && (
        <div className="mt-6 grid place-items-center rounded-xl border border-dashed p-12 text-center">
          <p className="text-sm text-muted-foreground">
            No orders yet. They appear here as customers book your gear.
          </p>
        </div>
      )}
    </>
  )
}
