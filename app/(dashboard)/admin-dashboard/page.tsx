import type { Metadata } from "next"

import { getAdminCounts } from "../_actions/getAdminCounts"
import {
  getGearByCategory,
  getRentalsByStatus,
} from "../_actions/getAdminCharts"
import { BarChartPanel } from "../_components/BarChartPanel"
import { ChartCard } from "../_components/ChartCard"
import { PageHeader, StatCard } from "../_components/PageHeader"

export const metadata: Metadata = { title: "Admin overview · GearUp" }

export default async function AdminOverviewPage() {
  const [counts, rentalsByStatus, gearByCategory] = await Promise.all([
    getAdminCounts(),
    getRentalsByStatus(),
    getGearByCategory(),
  ])

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

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <ChartCard
          title="Rental orders by status"
          description="Where every order on the platform currently sits."
          columns={["Status", "Orders"]}
          series={rentalsByStatus}
        >
          <BarChartPanel data={rentalsByStatus.data} measure="orders" />
        </ChartCard>

        <ChartCard
          title="Listings by category"
          description="How the catalogue is spread across categories."
          columns={["Category", "Listings"]}
          series={gearByCategory}
        >
          <BarChartPanel data={gearByCategory.data} measure="listings" />
        </ChartCard>
      </div>
    </>
  )
}
