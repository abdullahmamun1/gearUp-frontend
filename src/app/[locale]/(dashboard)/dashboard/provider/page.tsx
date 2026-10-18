import type { Metadata } from "next"
import Image from "next/image"
import { Link } from "@/i18n/navigation"
import { initLocale } from "@/i18n/server"
import { Backpack, BellRing, CircleCheckBig, Plus, Timer } from "lucide-react"
import { getTranslations } from "@/i18n/getTranslations"

import { getProviderGear } from "@/api/gear"
import {
  getProviderOrderCounts,
  getProviderOrders,
  getProviderStats,
} from "@/api/rentals"
import { BarChartPanel } from "@/components/modules/dashboard/BarChartPanel"
import { ChartCard } from "@/components/modules/dashboard/ChartCard"
import { MonthlyChart } from "@/components/modules/dashboard/MonthlyChart"
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
import { getDashboardFormat } from "@/i18n/getFormat"
import type { LocaleParams } from "@/i18n/routing"
import { getSession } from "@/lib/session"
import { cn } from "@/lib/utils"
import { PROVIDER_ORDERS_PATH } from "@/utils/filters/dashboard"
import { PROVIDER_GEAR_PATH } from "@/utils/filters/providerGear"
import { isRentable } from "@/utils/gearAvailability"
import type { RentalOrder, RentalStatus } from "@/types"

export async function generateMetadata({
  params,
}: LocaleParams): Promise<Metadata> {
  const locale = await initLocale(params)
  const t = await getTranslations({ locale, namespace: "provider.meta" })
  return { title: t("overview") }
}

const NEEDS_ACTION: RentalStatus[] = ["PLACED", "PAID", "PICKED_UP"]
const ACTIVE: RentalStatus[] = ["CONFIRMED", "PAID", "PICKED_UP"]

type Translate = Awaited<
  ReturnType<typeof getTranslations<"provider.overview">>
>
type Format = Awaited<ReturnType<typeof getDashboardFormat>>

/** What the provider has to do next on an order. */
function nextStep(order: RentalOrder, t: Translate, format: Format) {
  switch (order.status) {
    case "PLACED":
      return order.respondBy
        ? t("confirmBy", { date: format.dateTime(order.respondBy) })
        : t("confirmBooking")
    case "PAID":
      return t("handover", { date: format.date(order.startDate) })
    case "PICKED_UP":
      return t("dueBack", { date: format.date(order.endDate) })
    default:
      return undefined
  }
}

export default async function ProviderOverviewPage() {
  const t = await getTranslations("provider.overview")
  const format = await getDashboardFormat()
  const [session, counts, ordersRes, gearRes, statsRes, tCharts] =
    await Promise.all([
      getSession(),
      getProviderOrderCounts(),
      getProviderOrders({ page: 1 }),
      getProviderGear({ limit: "4" }),
      getProviderStats(),
      getTranslations("dashboard.charts"),
    ])
  const stats = statsRes.data

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
        eyebrow={t("eyebrow")}
        title={session?.name ?? t("welcomeBack")}
        description={
          pending > 0 ? t("pending", { count: pending }) : t("caughtUp")
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
              {t("addEdit")}
            </Link>
            <Link
              href={PROVIDER_ORDERS_PATH}
              className={cn(
                buttonVariants({ variant: "glass", size: "lg" }),
                "h-10 px-5 text-sm"
              )}
            >
              {t("viewOrders")}
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
          label={t("gearListed")}
          value={
            gearRes.data?.meta?.total !== undefined
              ? format.number(gearRes.data.meta.total)
              : "—"
          }
          icon={Backpack}
          href={PROVIDER_GEAR_PATH}
        />
        <StatCard
          label={t("needsAction")}
          value={format.number(pending)}
          hint={t("needsActionHint")}
          icon={BellRing}
          tone={pending > 0 ? "ember" : "muted"}
          href={statusHref("PLACED")}
        />
        <StatCard
          label={t("active")}
          value={format.number(count(ACTIVE))}
          hint={t("activeHint")}
          icon={Timer}
          tone="lagoon"
        />
        <StatCard
          label={t("completed")}
          value={format.number(count(["RETURNED"]))}
          icon={CircleCheckBig}
          tone="success"
          href={statusHref("RETURNED")}
        />
      </div>

      {stats && (
        <div className="mt-6 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          <ChartCard
            title={tCharts("earningsTitle")}
            description={tCharts("earningsDesc")}
            columns={[tCharts("month"), tCharts("amount")]}
            series={{
              data: stats.earningsByMonth.map((row) => ({
                label: format.month(row.month),
                value: row.amount,
              })),
              failed: !statsRes.success,
            }}
          >
            <MonthlyChart data={stats.earningsByMonth} variant="area" />
          </ChartCard>
          <ChartCard
            title={tCharts("topGearTitle")}
            description={tCharts("topGearDesc")}
            columns={[tCharts("gear"), tCharts("orders")]}
            series={{
              data: stats.topGear.map((gear) => ({
                label: gear.name,
                value: gear.orders,
              })),
              failed: !statsRes.success,
            }}
          >
            <BarChartPanel
              data={stats.topGear.map((gear) => ({
                label: gear.name,
                value: gear.orders,
              }))}
              measure={tCharts("ordersMeasure")}
            />
          </ChartCard>
        </div>
      )}

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <DashboardPanel
          title={t("needsPanel")}
          description={t("needsPanelDescription")}
          href={PROVIDER_ORDERS_PATH}
        >
          {todo.length > 0 ? (
            <OrderList>
              {todo.slice(0, 5).map((order) => (
                <OrderRow
                  key={order.id}
                  order={order}
                  href={statusHref(order.status)}
                  note={nextStep(order, t, format)}
                  person={order.customer?.name}
                />
              ))}
            </OrderList>
          ) : (
            <PanelEmpty>{t("nothing")}</PanelEmpty>
          )}
        </DashboardPanel>

        <div className="grid min-w-0 content-start gap-6">
          <DashboardPanel
            title={t("pipeline")}
            description={t("pipelineTotal", { count: counts.total })}
          >
            <StatusPipeline counts={counts.byStatus} hrefFor={statusHref} />
          </DashboardPanel>

          <DashboardPanel title={t("listings")} href={PROVIDER_GEAR_PATH}>
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
                        {t("listingLine", {
                          price: format.price(item.pricePerDay),
                          count: item.stock,
                        })}
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
                      {isRentable(item) ? t("live") : t("hidden")}
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
                    {t("firstItem")}
                  </Link>
                }
              >
                {t("noListings")}
              </PanelEmpty>
            )}
          </DashboardPanel>
        </div>
      </div>
    </>
  )
}
