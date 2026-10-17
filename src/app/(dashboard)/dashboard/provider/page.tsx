import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { Backpack, BellRing, CircleCheckBig, Plus, Timer } from "lucide-react"

import { getProviderGear } from "@/api/gear"
import { getProviderOrderCounts, getProviderOrders } from "@/api/rentals"
import {
  DashboardPanel,
  OrderList,
  OrderRow,
  PanelEmpty,
  StatusPipeline,
  WelcomeBanner,
} from "@/components/modules/dashboard/Overview"
import { StatCard } from "@/components/modules/dashboard/PageHeader"
import { PickupStepScene } from "@/components/shared/illustrations/scenes"
import { buttonVariants } from "@/components/ui/button"
import { getSession } from "@/lib/session"
import { cn } from "@/lib/utils"
import { PROVIDER_ORDERS_PATH } from "@/utils/filters/dashboard"
import { PROVIDER_GEAR_PATH } from "@/utils/filters/providerGear"
import { formatDate, formatDateTime, formatPrice } from "@/utils/format"
import { isRentable } from "@/utils/gearAvailability"
import type { RentalOrder, RentalStatus } from "@/types"

export const metadata: Metadata = { title: "Provider overview · GearUp" }

const NEEDS_ACTION: RentalStatus[] = ["PLACED", "PAID", "PICKED_UP"]
const ACTIVE: RentalStatus[] = ["CONFIRMED", "PAID", "PICKED_UP"]

/** What the provider has to do next on an order. */
function nextStep(order: RentalOrder) {
  switch (order.status) {
    case "PLACED":
      return order.respondBy
        ? `Confirm or decline by ${formatDateTime(order.respondBy)}`
        : "Confirm or decline this booking"
    case "PAID":
      return `Hand over on ${formatDate(order.startDate)}`
    case "PICKED_UP":
      return `Due back ${formatDate(order.endDate)}`
    default:
      return undefined
  }
}

export default async function ProviderOverviewPage() {
  const [session, counts, ordersRes, gearRes] = await Promise.all([
    getSession(),
    getProviderOrderCounts(),
    getProviderOrders({ page: 1 }),
    getProviderGear({ limit: "4" }),
  ])

  const count = (statuses: RentalStatus[]) =>
    statuses.reduce((sum, status) => sum + counts.byStatus[status], 0)
  const orders = ordersRes.data?.data ?? []
  const todo = orders
    .filter((order) => NEEDS_ACTION.includes(order.status))
    .sort((a, b) => a.startDate.localeCompare(b.startDate))
  const gear = gearRes.data?.data ?? []
  const pending = count(NEEDS_ACTION)
  const statusHref = (status: RentalStatus) =>
    `${PROVIDER_ORDERS_PATH}?status=${status}`

  return (
    <>
      <WelcomeBanner
        eyebrow="Provider dashboard"
        title={session?.name ?? "Welcome back"}
        description={
          pending > 0
            ? `${pending} ${pending === 1 ? "order needs" : "orders need"} your attention — confirmations, handovers and returns.`
            : "You're all caught up. New bookings will show up here."
        }
        actions={
          <>
            <Link
              href={PROVIDER_GEAR_PATH}
              className={cn(
                buttonVariants({ variant: "cta", size: "lg" }),
                "h-10 gap-1.5 px-5 text-sm"
              )}
            >
              <Plus className="size-4" aria-hidden />
              Add or edit gear
            </Link>
            <Link
              href={PROVIDER_ORDERS_PATH}
              className={cn(
                buttonVariants({ variant: "glass", size: "lg" }),
                "h-10 px-5 text-sm"
              )}
            >
              View orders
            </Link>
          </>
        }
        scene={<PickupStepScene />}
      />

      {counts.failed && (
        <p className="mb-6 rounded-lg border border-destructive/30 bg-destructive/8 px-3.5 py-3 text-sm text-destructive">
          {counts.message}
        </p>
      )}

      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <StatCard
          label="Gear listed"
          value={gearRes.data?.meta?.total ?? "—"}
          icon={Backpack}
          href={PROVIDER_GEAR_PATH}
        />
        <StatCard
          label="Needs action"
          value={pending}
          hint="Confirm, hand over or check in"
          icon={BellRing}
          tone={pending > 0 ? "ember" : "muted"}
          href={statusHref("PLACED")}
        />
        <StatCard
          label="Active rentals"
          value={count(ACTIVE)}
          hint="Confirmed, paid or out"
          icon={Timer}
          tone="lagoon"
        />
        <StatCard
          label="Completed"
          value={count(["RETURNED"])}
          icon={CircleCheckBig}
          tone="success"
          href={statusHref("RETURNED")}
        />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <DashboardPanel
          title="Needs your action"
          description="From your latest orders, soonest first."
          href={PROVIDER_ORDERS_PATH}
        >
          {todo.length > 0 ? (
            <OrderList>
              {todo.slice(0, 5).map((order) => (
                <OrderRow
                  key={order.id}
                  order={order}
                  href={statusHref(order.status)}
                  note={nextStep(order)}
                  person={order.customer?.name}
                />
              ))}
            </OrderList>
          ) : (
            <PanelEmpty>Nothing to do right now.</PanelEmpty>
          )}
        </DashboardPanel>

        <div className="grid min-w-0 content-start gap-6">
          <DashboardPanel
            title="Order pipeline"
            description={`${counts.total} ${counts.total === 1 ? "order" : "orders"} in total`}
          >
            <StatusPipeline counts={counts.byStatus} hrefFor={statusHref} />
          </DashboardPanel>

          <DashboardPanel title="Your listings" href={PROVIDER_GEAR_PATH}>
            {gear.length > 0 ? (
              <ul className="divide-y">
                {gear.map((item) => (
                  <li
                    key={item.id}
                    className="flex items-center gap-3 px-5 py-3"
                  >
                    <span className="relative size-10 shrink-0 overflow-hidden rounded-lg bg-muted">
                      {item.imageUrl && (
                        <Image
                          src={item.imageUrl}
                          alt=""
                          fill
                          sizes="40px"
                          className="object-cover"
                        />
                      )}
                    </span>
                    <span className="min-w-0 flex-1">
                      <Link
                        href={`/gear/${item.id}`}
                        className="block truncate text-sm font-medium hover:text-primary"
                      >
                        {item.name}
                      </Link>
                      <span className="text-xs text-muted-foreground">
                        {formatPrice(item.pricePerDay)} / day · {item.stock}{" "}
                        {item.stock === 1 ? "unit" : "units"}
                      </span>
                    </span>
                    <span
                      className={cn(
                        "inline-flex items-center gap-1.5 text-xs font-medium",
                        isRentable(item)
                          ? "text-success"
                          : "text-muted-foreground"
                      )}
                    >
                      <span
                        className={cn(
                          "size-1.5 rounded-full",
                          isRentable(item)
                            ? "bg-success"
                            : "bg-muted-foreground"
                        )}
                        aria-hidden
                      />
                      {isRentable(item) ? "Live" : "Hidden"}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <PanelEmpty
                action={
                  <Link
                    href={PROVIDER_GEAR_PATH}
                    className={cn(buttonVariants({ variant: "outline" }))}
                  >
                    List your first item
                  </Link>
                }
              >
                No listings yet.
              </PanelEmpty>
            )}
          </DashboardPanel>
        </div>
      </div>
    </>
  )
}
