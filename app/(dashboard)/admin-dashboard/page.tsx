import type { Metadata } from "next"

import { getAdminCounts } from "../_actions/getAdminCounts"
import { PageHeader, StatCard } from "../_components/PageHeader"

export const metadata: Metadata = { title: "Admin overview · GearUp" }

export default async function AdminOverviewPage() {
  const counts = await getAdminCounts()

  return (
    <>
      <PageHeader
        title="Platform overview"
        description="Everything on GearUp, across all providers and customers."
      />

      {counts.failed && (
        <p className="mb-6 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          Some totals could not be loaded.
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Users" value={counts.users ?? "—"} />
        <StatCard label="Gear listings" value={counts.gear ?? "—"} />
        <StatCard label="Rental orders" value={counts.rentals ?? "—"} />
      </div>
    </>
  )
}
