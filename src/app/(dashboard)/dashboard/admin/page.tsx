import type { Metadata } from "next"
import Link from "next/link"
import { Backpack, ClipboardList, Timer, Users } from "lucide-react"

import {
  getAdminCounts,
  getAdminRentals,
  getAdminUsers,
  getGearByCategory,
  getRentalsByStatus,
} from "@/api/admin"
import { BarChartPanel } from "@/components/modules/dashboard/BarChartPanel"
import { ChartCard } from "@/components/modules/dashboard/ChartCard"
import {
  DashboardPanel,
  OrderList,
  OrderRow,
  PanelEmpty,
  WelcomeBanner,
} from "@/components/modules/dashboard/Overview"
import { StatCard } from "@/components/modules/dashboard/PageHeader"
import { ShieldScene } from "@/components/shared/illustrations/scenes"
import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { RENTAL_STATUSES } from "@/utils/filters/admin"
import { formatDate } from "@/utils/format"
import type { RentalStatus } from "@/types"

export const metadata: Metadata = { title: "Admin overview · GearUp" }

const OPEN: RentalStatus[] = ["PLACED", "CONFIRMED", "PAID", "PICKED_UP"]
const RENTALS_PATH = "/dashboard/admin/rentals"
const USERS_PATH = "/dashboard/admin/users"

export default async function AdminOverviewPage() {
  const [counts, rentalsByStatus, gearByCategory, rentalsRes, usersRes] =
    await Promise.all([
      getAdminCounts(),
      getRentalsByStatus(),
      getGearByCategory(),
      getAdminRentals({ page: 1 }),
      getAdminUsers({ page: 1 }),
    ])

  // rentalsByStatus.data follows RENTAL_STATUSES order.
  const open = RENTAL_STATUSES.reduce(
    (sum, status, i) =>
      OPEN.includes(status) ? sum + (rentalsByStatus.data[i]?.value ?? 0) : sum,
    0
  )
  const rentals = (rentalsRes.data?.data ?? []).slice(0, 5)
  const users = (usersRes.data?.data ?? []).slice(0, 5)

  return (
    <>
      <WelcomeBanner
        eyebrow="Admin"
        title="Platform overview"
        description={`${counts.users ?? "—"} accounts, ${counts.gear ?? "—"} listings and ${open} open ${open === 1 ? "order" : "orders"} across GearUp right now.`}
        actions={
          <>
            <Link
              href={RENTALS_PATH}
              className={cn(
                buttonVariants({ variant: "cta", size: "lg" }),
                "h-10 px-5 text-sm"
              )}
            >
              Review rentals
            </Link>
            <Link
              href={USERS_PATH}
              className={cn(
                buttonVariants({ variant: "glass", size: "lg" }),
                "h-10 px-5 text-sm"
              )}
            >
              Manage users
            </Link>
          </>
        }
        scene={<ShieldScene />}
      />

      {counts.failed && (
        <p className="mb-6 rounded-lg border border-destructive/30 bg-destructive/8 px-3.5 py-3 text-sm text-destructive">
          Some totals could not be loaded.
        </p>
      )}

      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <StatCard
          label="Users"
          value={counts.users ?? "—"}
          icon={Users}
          href={USERS_PATH}
        />
        <StatCard
          label="Gear listings"
          value={counts.gear ?? "—"}
          icon={Backpack}
          tone="lagoon"
          href="/dashboard/admin/gear"
        />
        <StatCard
          label="Rental orders"
          value={counts.rentals ?? "—"}
          icon={ClipboardList}
          tone="success"
          href={RENTALS_PATH}
        />
        <StatCard
          label="Open orders"
          value={open}
          hint="Placed, confirmed, paid or out"
          icon={Timer}
          tone="ember"
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
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

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <DashboardPanel title="Latest rentals" href={RENTALS_PATH}>
          {rentals.length > 0 ? (
            <OrderList>
              {rentals.map((order) => (
                <OrderRow
                  key={order.id}
                  order={order}
                  href={`${RENTALS_PATH}?status=${order.status}`}
                  person={order.customer?.name}
                />
              ))}
            </OrderList>
          ) : (
            <PanelEmpty>No rentals yet.</PanelEmpty>
          )}
        </DashboardPanel>

        <DashboardPanel title="Accounts" href={USERS_PATH}>
          {users.length > 0 ? (
            <ul className="divide-y">
              {users.map((user) => (
                <li key={user.id} className="flex items-center gap-3 px-5 py-3">
                  <span className="grid size-9 shrink-0 place-items-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                    {user.name
                      .split(" ")
                      .map((part) => part[0])
                      .slice(0, 2)
                      .join("")
                      .toUpperCase()}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium">
                      {user.name}
                    </span>
                    <span className="block truncate text-xs text-muted-foreground">
                      {user.email} · joined {formatDate(user.createdAt)}
                    </span>
                  </span>
                  <Badge
                    variant={
                      user.status === "SUSPENDED"
                        ? "destructive"
                        : user.role === "ADMIN"
                          ? "default"
                          : user.role === "PROVIDER"
                            ? "info"
                            : "secondary"
                    }
                  >
                    {user.status === "SUSPENDED"
                      ? "Suspended"
                      : user.role.charAt(0) + user.role.slice(1).toLowerCase()}
                  </Badge>
                </li>
              ))}
            </ul>
          ) : (
            <PanelEmpty>No accounts yet.</PanelEmpty>
          )}
        </DashboardPanel>
      </div>
    </>
  )
}
