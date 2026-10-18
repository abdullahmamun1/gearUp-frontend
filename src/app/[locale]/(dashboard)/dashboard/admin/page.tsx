import type { Metadata } from "next"
import { getTranslations } from "@/i18n/getTranslations"
import { Link } from "@/i18n/navigation"
import {
  ArrowRight,
  Backpack,
  BarChart3,
  ClipboardList,
  Inbox,
  ShieldAlert,
  Timer,
  Users,
} from "lucide-react"

import {
  getAdminAttention,
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
import { getDashboardFormat } from "@/i18n/getFormat"
import type { AppLocale, LocaleParams } from "@/i18n/routing"
import type { RentalStatus } from "@/types"

export async function generateMetadata({
  params,
}: LocaleParams): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({
    locale: locale as AppLocale,
    namespace: "admin.meta",
  })
  return { title: t("overview") }
}

const OPEN: RentalStatus[] = ["PLACED", "CONFIRMED", "PAID", "PICKED_UP"]
const RENTALS_PATH = "/dashboard/admin/rentals"
const USERS_PATH = "/dashboard/admin/users"

export default async function AdminOverviewPage() {
  const [
    counts,
    rentalsByStatus,
    gearByCategory,
    rentalsRes,
    usersRes,
    attention,
    t,
    tc,
    format,
  ] = await Promise.all([
    getAdminCounts(),
    getRentalsByStatus(),
    getGearByCategory(),
    getAdminRentals({ page: 1 }),
    getAdminUsers({ page: 1 }),
    getAdminAttention(),
    getTranslations("admin.overview"),
    getTranslations("common"),
    getDashboardFormat(),
  ])

  // rentalsByStatus.data follows RENTAL_STATUSES order.
  const open = RENTAL_STATUSES.reduce(
    (sum, status, i) =>
      OPEN.includes(status) ? sum + (rentalsByStatus.data[i]?.value ?? 0) : sum,
    0
  )
  const rentals = (rentalsRes.data?.data ?? []).slice(0, 5)
  const users = (usersRes.data?.data ?? []).slice(0, 5)
  const tCharts = await getTranslations("admin.charts")
  const count = (value: number | null) =>
    value === null ? "—" : format.number(value)

  return (
    <>
      <WelcomeBanner
        eyebrow={t("eyebrow")}
        title={t("title")}
        description={t("description", {
          users: count(counts.users),
          gear: count(counts.gear),
          open,
        })}
        actions={
          <>
            <Link
              href={RENTALS_PATH}
              className={cn(
                buttonVariants({ variant: "cta", size: "lg" }),
                "h-10 px-5 text-sm"
              )}
            >
              {t("reviewRentals")}
            </Link>
            <Link
              href="/dashboard/admin/analytics"
              className={cn(
                buttonVariants({ variant: "glass", size: "lg" }),
                "h-10 px-5 text-sm"
              )}
            >
              <BarChart3 aria-hidden />
              {t("analytics")}
            </Link>
          </>
        }
        scene={<ShieldScene />}
      />

      {counts.failed && (
        <p className="mb-6 rounded-lg border border-destructive/30 bg-destructive/8 px-3.5 py-3 text-sm text-destructive">
          {t("totalsFailed")}
        </p>
      )}

      {(attention.openClaims > 0 || attention.unreadMessages > 0) && (
        <div className="mb-6 grid gap-3 sm:grid-cols-2">
          {attention.openClaims > 0 && (
            <AttentionLink
              href="/dashboard/admin/claims"
              icon={<ShieldAlert className="size-5" aria-hidden />}
              title={t("claimsTitle", { count: attention.openClaims })}
              description={t("claimsDescription")}
            />
          )}
          {attention.unreadMessages > 0 && (
            <AttentionLink
              href="/dashboard/admin/inbox"
              icon={<Inbox className="size-5" aria-hidden />}
              title={t("messagesTitle", { count: attention.unreadMessages })}
              description={t("messagesDescription")}
            />
          )}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <StatCard
          label={t("statUsers")}
          value={count(counts.users)}
          icon={Users}
          href={USERS_PATH}
        />
        <StatCard
          label={t("statGear")}
          value={count(counts.gear)}
          icon={Backpack}
          tone="lagoon"
          href="/dashboard/admin/gear"
        />
        <StatCard
          label={t("statRentals")}
          value={count(counts.rentals)}
          icon={ClipboardList}
          tone="success"
          href={RENTALS_PATH}
        />
        <StatCard
          label={t("statOpen")}
          value={format.number(open)}
          hint={t("statOpenHint")}
          icon={Timer}
          tone="ember"
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <ChartCard
          title={t("byStatusTitle")}
          description={t("byStatusDescription")}
          columns={[tCharts("status"), tCharts("orders")]}
          series={rentalsByStatus}
        >
          <BarChartPanel
            data={rentalsByStatus.data}
            measure={tCharts("measureOrders")}
          />
        </ChartCard>

        <ChartCard
          title={t("byCategoryTitle")}
          description={t("byCategoryDescription")}
          columns={[tCharts("category"), tCharts("listings")]}
          series={gearByCategory}
        >
          <BarChartPanel
            data={gearByCategory.data}
            measure={tCharts("measureListings")}
          />
        </ChartCard>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <DashboardPanel title={t("latestRentals")} href={RENTALS_PATH}>
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
            <PanelEmpty>{t("noRentals")}</PanelEmpty>
          )}
        </DashboardPanel>

        <DashboardPanel title={t("accounts")} href={USERS_PATH}>
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
                      {t("joined", {
                        email: user.email,
                        date: format.date(user.createdAt),
                      })}
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
                      ? tc("userStatus.SUSPENDED")
                      : tc(`role.${user.role}`)}
                  </Badge>
                </li>
              ))}
            </ul>
          ) : (
            <PanelEmpty>{t("noAccounts")}</PanelEmpty>
          )}
        </DashboardPanel>
      </div>
    </>
  )
}

function AttentionLink({
  href,
  icon,
  title,
  description,
}: {
  href: string
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-4 rounded-2xl border border-warning/40 bg-warning/8 p-4 shadow-xs transition-colors hover:bg-warning/12"
    >
      <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-warning/15 text-warning">
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold">{title}</span>
        <span className="block text-xs text-muted-foreground">
          {description}
        </span>
      </span>
      <ArrowRight
        className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5"
        aria-hidden
      />
    </Link>
  )
}
