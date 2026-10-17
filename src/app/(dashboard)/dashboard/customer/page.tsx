import type { Metadata } from "next"
import Link from "next/link"
import {
  ArrowRight,
  CircleCheckBig,
  CircleX,
  CreditCard,
  Package,
  Search,
  Timer,
  UserRound,
} from "lucide-react"

import { getMyRentalCounts, getMyRentals } from "@/api/rentals"
import {
  DashboardPanel,
  OrderList,
  OrderRow,
  PanelEmpty,
  WelcomeBanner,
} from "@/components/modules/dashboard/Overview"
import { StatCard } from "@/components/modules/dashboard/PageHeader"
import { CampingScene } from "@/components/shared/illustrations/scenes"
import { buttonVariants } from "@/components/ui/button"
import { getSession } from "@/lib/session"
import { cn } from "@/lib/utils"
import { CUSTOMER_ORDERS_PATH } from "@/utils/filters/dashboard"
import { formatDate, formatDateTime } from "@/utils/format"
import type { RentalOrder, RentalStatus } from "@/types"

export const metadata: Metadata = { title: "Overview · GearUp" }

const ACTIVE: RentalStatus[] = ["PLACED", "CONFIRMED", "PAID", "PICKED_UP"]

/** What the customer should know (or do) next about an open order. */
function nextStep(order: RentalOrder) {
  switch (order.status) {
    case "PLACED":
      return order.respondBy
        ? `The provider answers by ${formatDateTime(order.respondBy)}`
        : "Waiting for the provider to confirm"
    case "CONFIRMED":
      return order.paymentDueAt
        ? `Confirmed — pay by ${formatDateTime(order.paymentDueAt)}`
        : "Confirmed — pay to lock it in"
    case "PAID":
      return `Pick up on ${formatDate(order.startDate)}`
    case "PICKED_UP":
      return `Return on ${formatDate(order.endDate)}`
    default:
      return undefined
  }
}

const QUICK_LINKS = [
  { href: "/gear", label: "Find gear", icon: Search },
  { href: "/dashboard/customer/payments", label: "Payments", icon: CreditCard },
  { href: "/dashboard/customer/profile", label: "Profile", icon: UserRound },
]

export default async function CustomerOverviewPage() {
  const [session, counts, recentRes] = await Promise.all([
    getSession(),
    getMyRentalCounts(),
    getMyRentals({ page: 1 }),
  ])

  const count = (statuses: RentalStatus[]) =>
    statuses.reduce((sum, status) => sum + counts.byStatus[status], 0)
  const recent = recentRes.data?.data ?? []
  const upcoming = recent
    .filter((order) => ACTIVE.includes(order.status))
    .sort((a, b) => a.startDate.localeCompare(b.startDate))
    .slice(0, 4)
  const past = recent
    .filter((order) => !ACTIVE.includes(order.status))
    .slice(0, 3)
  const statusHref = (status: RentalStatus) =>
    `${CUSTOMER_ORDERS_PATH}?status=${status}`

  return (
    <>
      <WelcomeBanner
        eyebrow="Your rentals"
        title={`Welcome back, ${session?.name.split(" ")[0] ?? "there"}`}
        description={
          count(["CONFIRMED"]) > 0
            ? `${count(["CONFIRMED"])} confirmed ${count(["CONFIRMED"]) === 1 ? "booking is" : "bookings are"} waiting for payment.`
            : count(ACTIVE) > 0
              ? `You have ${count(ACTIVE)} active ${count(ACTIVE) === 1 ? "rental" : "rentals"}. Here's what's coming up.`
              : "Nothing booked right now. Your next adventure is a search away."
        }
        actions={
          <>
            <Link
              href="/gear"
              className={cn(
                buttonVariants({ variant: "cta", size: "lg" }),
                "h-10 gap-1.5 px-5 text-sm"
              )}
            >
              Browse gear
              <ArrowRight className="size-4" aria-hidden />
            </Link>
            <Link
              href={CUSTOMER_ORDERS_PATH}
              className={cn(
                buttonVariants({ variant: "glass", size: "lg" }),
                "h-10 px-5 text-sm"
              )}
            >
              All rentals
            </Link>
          </>
        }
        scene={<CampingScene />}
      />

      {counts.failed && (
        <p className="mb-6 rounded-lg border border-destructive/30 bg-destructive/8 px-3.5 py-3 text-sm text-destructive">
          {counts.message}
        </p>
      )}

      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <StatCard
          label="Total rentals"
          value={counts.total}
          icon={Package}
          href={CUSTOMER_ORDERS_PATH}
        />
        <StatCard
          label="Active"
          value={count(ACTIVE)}
          hint="Booked and not yet returned"
          icon={Timer}
          tone="lagoon"
        />
        <StatCard
          label="Returned"
          value={count(["RETURNED"])}
          icon={CircleCheckBig}
          tone="success"
          href={statusHref("RETURNED")}
        />
        <StatCard
          label="Cancelled"
          value={count(["CANCELLED"])}
          icon={CircleX}
          tone="muted"
          href={statusHref("CANCELLED")}
        />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <DashboardPanel
          title="Up next"
          description="Open bookings, soonest first."
          href={CUSTOMER_ORDERS_PATH}
        >
          {upcoming.length > 0 ? (
            <OrderList>
              {upcoming.map((order) => (
                <OrderRow
                  key={order.id}
                  order={order}
                  href={`${CUSTOMER_ORDERS_PATH}/${order.id}`}
                  note={nextStep(order)}
                  person={order.provider?.name}
                />
              ))}
            </OrderList>
          ) : (
            <PanelEmpty
              action={
                <Link
                  href="/gear"
                  className={cn(buttonVariants({ variant: "outline" }))}
                >
                  Find something to rent
                </Link>
              }
            >
              No open bookings.
            </PanelEmpty>
          )}
        </DashboardPanel>

        <div className="grid min-w-0 content-start gap-6">
          <DashboardPanel title="Past rentals" href={statusHref("RETURNED")}>
            {past.length > 0 ? (
              <OrderList>
                {past.map((order) => (
                  <OrderRow
                    key={order.id}
                    order={order}
                    href={`${CUSTOMER_ORDERS_PATH}/${order.id}`}
                  />
                ))}
              </OrderList>
            ) : (
              <PanelEmpty>Finished rentals will show up here.</PanelEmpty>
            )}
          </DashboardPanel>

          <DashboardPanel title="Shortcuts">
            <ul className="grid grid-cols-3 gap-2 p-3">
              {QUICK_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="flex flex-col items-center gap-2 rounded-xl px-2 py-3 text-center text-xs font-medium transition-colors hover:bg-muted"
                  >
                    <span className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary">
                      <link.icon className="size-[18px]" aria-hidden />
                    </span>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </DashboardPanel>
        </div>
      </div>
    </>
  )
}
