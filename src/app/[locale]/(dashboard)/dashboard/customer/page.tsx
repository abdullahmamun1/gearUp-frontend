import type { Metadata } from "next"
import { getTranslations } from "@/i18n/getTranslations"

import type { AppLocale, LocaleParams } from "@/i18n/routing"
import { Link } from "@/i18n/navigation"
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

import {
  getMyRentalCounts,
  getMyRentalStats,
  getMyRentals,
} from "@/api/rentals"
import { ChartCard } from "@/components/modules/dashboard/ChartCard"
import { MonthlyChart } from "@/components/modules/dashboard/MonthlyChart"
import { StatusDonut } from "@/components/modules/dashboard/StatusDonut"
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
import { getDashboardFormat } from "@/i18n/getFormat"
import type { RentalOrder, RentalStatus } from "@/types"

export async function generateMetadata({
  params,
}: LocaleParams): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({
    locale: locale as AppLocale,
    namespace: "dashboard.meta",
  })
  return { title: t("overview") }
}

const ACTIVE: RentalStatus[] = ["PLACED", "CONFIRMED", "PAID", "PICKED_UP"]

const QUICK_LINKS = [
  { href: "/gear", label: "findGear", icon: Search },
  { href: "/dashboard/customer/payments", label: "payments", icon: CreditCard },
  { href: "/dashboard/customer/profile", label: "profile", icon: UserRound },
] as const

export default async function CustomerOverviewPage() {
  const [session, counts, recentRes, t, format, statsRes, tCharts, tCommon] =
    await Promise.all([
      getSession(),
      getMyRentalCounts(),
      getMyRentals({ page: 1 }),
      getTranslations("dashboard.customer.overview"),
      getDashboardFormat(),
      getMyRentalStats(),
      getTranslations("dashboard.charts"),
      getTranslations("common"),
    ])
  const stats = statsRes.data

  /** What the customer should know (or do) next about an open order. */
  const nextStep = (order: RentalOrder) => {
    switch (order.status) {
      case "PLACED":
        return order.respondBy
          ? t("providerAnswersBy", { date: format.dateTime(order.respondBy) })
          : t("waitingForProvider")
      case "CONFIRMED":
        return order.paymentDueAt
          ? t("payBy", { date: format.dateTime(order.paymentDueAt) })
          : t("payToLock")
      case "PAID":
        return t("pickUpOn", { date: format.date(order.startDate) })
      case "PICKED_UP":
        return t("returnOn", { date: format.date(order.endDate) })
      default:
        return undefined
    }
  }

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
        eyebrow={t("eyebrow")}
        title={t("welcome", {
          name: session?.name.split(" ")[0] ?? t("there"),
        })}
        description={
          count(["CONFIRMED"]) > 0
            ? t("awaitingPayment", { count: count(["CONFIRMED"]) })
            : count(ACTIVE) > 0
              ? t("activeRentals", { count: count(ACTIVE) })
              : t("nothingBooked")
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
              {t("browseGear")}
              <ArrowRight className="size-4" aria-hidden />
            </Link>
            <Link
              href={CUSTOMER_ORDERS_PATH}
              className={cn(
                buttonVariants({ variant: "glass", size: "lg" }),
                "h-10 px-5 text-sm"
              )}
            >
              {t("allRentals")}
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
          label={t("totalRentals")}
          value={counts.total}
          icon={Package}
          href={CUSTOMER_ORDERS_PATH}
        />
        <StatCard
          label={t("active")}
          value={count(ACTIVE)}
          hint={t("activeHint")}
          icon={Timer}
          tone="lagoon"
        />
        <StatCard
          label={t("returned")}
          value={count(["RETURNED"])}
          icon={CircleCheckBig}
          tone="success"
          href={statusHref("RETURNED")}
        />
        <StatCard
          label={t("cancelled")}
          value={count(["CANCELLED"])}
          icon={CircleX}
          tone="muted"
          href={statusHref("CANCELLED")}
        />
      </div>

      {stats && (
        <div className="mt-6 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          <ChartCard
            title={tCharts("spendingTitle")}
            description={tCharts("spendingDesc")}
            columns={[tCharts("month"), tCharts("amount")]}
            series={{
              data: stats.spendingByMonth.map((row) => ({
                label: format.month(row.month),
                value: row.amount,
              })),
              failed: !statsRes.success,
            }}
          >
            <MonthlyChart data={stats.spendingByMonth} />
          </ChartCard>
          <ChartCard
            title={tCharts("statusTitle")}
            description={tCharts("statusDesc")}
            columns={[tCharts("status"), tCharts("orders")]}
            series={{
              data: stats.ordersByStatus.map((row) => ({
                label: tCommon(`rentalStatusShort.${row.status}`),
                value: row.count,
              })),
              failed: !statsRes.success,
            }}
          >
            <StatusDonut
              data={stats.ordersByStatus}
              listPath={CUSTOMER_ORDERS_PATH}
            />
          </ChartCard>
        </div>
      )}

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <DashboardPanel
          title={t("upNext")}
          description={t("upNextDescription")}
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
                  {t("findSomething")}
                </Link>
              }
            >
              {t("noOpenBookings")}
            </PanelEmpty>
          )}
        </DashboardPanel>

        <div className="grid min-w-0 content-start gap-6">
          <DashboardPanel
            title={t("pastRentals")}
            href={statusHref("RETURNED")}
          >
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
              <PanelEmpty>{t("pastEmpty")}</PanelEmpty>
            )}
          </DashboardPanel>

          <DashboardPanel title={t("shortcuts")}>
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
                    {t(link.label)}
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
