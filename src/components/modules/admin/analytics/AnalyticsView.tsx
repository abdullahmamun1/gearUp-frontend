import { getTranslations } from "@/i18n/getTranslations"

import { getDashboardFormat } from "@/i18n/getFormat"
import { Link } from "@/i18n/navigation"
import { Banknote, PackageCheck, Receipt, UserPlus } from "lucide-react"

import { BarChartPanel } from "@/components/modules/dashboard/BarChartPanel"
import { ChartCard } from "@/components/modules/dashboard/ChartCard"
import { StatCard } from "@/components/modules/dashboard/PageHeader"
import { cityKey } from "@/constants/cities"
import type { AdminAnalytics } from "@/types"
import type { Format } from "@/i18n/format"

import { RevenueChart } from "./RevenueChart"

export async function AnalyticsView({ data }: { data: AdminAnalytics }) {
  const [t, tCharts, tStatus, tUnits, tCity, format] = await Promise.all([
    getTranslations("admin.analytics"),
    getTranslations("admin.charts"),
    getTranslations("common.rentalStatusShort"),
    getTranslations("common.units"),
    getTranslations("common.city"),
    getDashboardFormat(),
  ])
  // Stored city names are English; known ones have a translated label.
  const byCity = data.rentalsByCity.map((row) => {
    const key = cityKey(row.city)
    return { label: key ? tCity(key) : row.city, value: row.count }
  })
  const { totals } = data
  const byStatus = data.ordersByStatus.map((row) => ({
    label: tStatus(row.status),
    value: row.count,
  }))
  const refunded = data.revenueByMonth.reduce(
    (sum, row) => sum + row.refunded,
    0
  )

  return (
    <>
      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <StatCard
          label={t("netRevenue")}
          value={format.price(totals.netRevenue)}
          hint={
            refunded > 0
              ? t("afterRefunds", { amount: format.price(refunded) })
              : t("rentalsAndDeposits")
          }
          icon={Banknote}
          tone="success"
        />
        <StatCard
          label={t("paidOrders")}
          value={format.number(totals.paidOrders)}
          hint={t("ofPlaced", { count: format.number(totals.orders) })}
          icon={PackageCheck}
        />
        <StatCard
          label={t("averageOrder")}
          value={format.price(totals.averageOrderValue)}
          hint={t("rentalOnly")}
          icon={Receipt}
          tone="lagoon"
        />
        <StatCard
          label={t("newAccounts")}
          value={format.number(totals.newUsers)}
          hint={t("listingsLive", {
            count: format.number(totals.activeListings),
          })}
          icon={UserPlus}
          tone="ember"
        />
      </div>

      <div className="mt-6">
        <ChartCard
          title={t("revenueTitle")}
          description={t("revenueDescription")}
          columns={[tCharts("month"), tCharts("net")]}
          series={{
            data: data.revenueByMonth.map((row) => ({
              label: format.month(row.month),
              value: row.net,
            })),
            failed: false,
          }}
        >
          <div className="mb-2 flex gap-4 text-xs text-muted-foreground">
            <Legend swatch="var(--chart-1)">{t("legendNet")}</Legend>
            <Legend swatch="var(--chart-2)">{t("legendRefunded")}</Legend>
          </div>
          <RevenueChart data={data.revenueByMonth} />
        </ChartCard>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <ChartCard
          title={t("ordersByStatusTitle")}
          description={t("ordersByStatusDescription")}
          columns={[tCharts("status"), tCharts("orders")]}
          series={{ data: byStatus, failed: false }}
        >
          <BarChartPanel data={byStatus} measure={tCharts("measureOrders")} />
        </ChartCard>

        <ChartCard
          title={t("byCityTitle")}
          description={t("byCityDescription")}
          columns={[tCharts("city"), tCharts("orders")]}
          series={{ data: byCity, failed: false }}
        >
          <BarChartPanel data={byCity} measure={tCharts("measureOrders")} />
        </ChartCard>
      </div>

      {/* Side by side only from xl: beside the sidebar at lg the prices
          ran out of the cards. */}
      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-2">
        <Leaderboard
          title={t("topCategories")}
          description={t("byRevenue")}
          empty={t("noOrders")}
          format={format}
          ordersLabel={(count) => tUnits("orders", { count })}
          rows={data.topCategories.map((row) => ({
            key: row.name,
            name: row.name,
            orders: row.orders,
            revenue: row.revenue,
          }))}
        />
        <Leaderboard
          title={t("topProviders")}
          description={t("byRevenue")}
          empty={t("noOrders")}
          format={format}
          ordersLabel={(count) => tUnits("orders", { count })}
          rows={data.topProviders.map((row) => ({
            key: row.id,
            name: row.name,
            orders: row.orders,
            revenue: row.revenue,
            href: `/providers/${row.id}`,
          }))}
        />
      </div>
    </>
  )
}

function Legend({
  swatch,
  children,
}: {
  swatch: string
  children: React.ReactNode
}) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        className="size-2.5 rounded-sm"
        style={{ background: swatch }}
        aria-hidden
      />
      {children}
    </span>
  )
}

type LeaderRow = {
  key: string
  name: string
  orders: number
  revenue: number
  href?: string
}

function Leaderboard({
  title,
  description,
  empty,
  format,
  ordersLabel,
  rows,
}: {
  title: string
  description: string
  empty: string
  format: Format
  ordersLabel: (count: number) => string
  rows: LeaderRow[]
}) {
  const top = Math.max(1, ...rows.map((row) => row.revenue))

  return (
    <section className="rounded-2xl border bg-card p-4 shadow-xs">
      <h2 className="font-heading text-sm font-semibold">{title}</h2>
      <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>

      {rows.length === 0 ? (
        <p className="py-10 text-center text-sm text-muted-foreground">
          {empty}
        </p>
      ) : (
        <ol className="mt-4 grid gap-3">
          {rows.map((row, index) => (
            <li key={row.key} className="grid gap-1.5">
              <div className="flex items-baseline gap-3 text-sm">
                <span className="w-5 text-xs text-muted-foreground tabular-nums">
                  {format.number(index + 1)}
                </span>
                {row.href ? (
                  <Link
                    href={row.href}
                    className="min-w-0 flex-1 truncate font-medium underline-offset-4 hover:underline"
                  >
                    {row.name}
                  </Link>
                ) : (
                  <span className="min-w-0 flex-1 truncate font-medium">
                    {row.name}
                  </span>
                )}
                <span className="shrink-0 text-xs whitespace-nowrap text-muted-foreground tabular-nums">
                  {ordersLabel(row.orders)}
                </span>
                <span className="min-w-24 shrink-0 text-right font-medium whitespace-nowrap tabular-nums">
                  {format.price(row.revenue)}
                </span>
              </div>
              <div className="ml-8 h-1.5 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary"
                  style={{ width: `${(row.revenue / top) * 100}%` }}
                />
              </div>
            </li>
          ))}
        </ol>
      )}
    </section>
  )
}
