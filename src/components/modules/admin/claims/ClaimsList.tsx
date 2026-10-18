"use client"

import { CalendarCheck, ShieldCheck, UserRound, Store } from "lucide-react"
import { useTranslations } from "@/i18n/translations"

import { EmptyState } from "@/components/shared/EmptyState"
import { GearCell } from "@/components/shared/GearCell"
import { Pagination } from "@/components/shared/Pagination"
import { Badge } from "@/components/ui/badge"
import { useClaims } from "@/hooks/queries/adminModeration"
import { useFormat } from "@/i18n/useFormat"
import { cn } from "@/lib/utils"
import type { ClaimList, RentalOrder } from "@/types"
import {
  ADMIN_CLAIMS_PATH,
  type AdminClaimsFilters,
} from "@/utils/filters/admin"
import { buildHref } from "@/utils/searchParams"

import { ResolveClaimDialog } from "./ResolveClaimDialog"

export function ClaimsList({
  filters,
  initialData,
}: {
  filters: AdminClaimsFilters
  initialData: ClaimList
}) {
  const { data, error, isFetching } = useClaims(filters, initialData)
  const resolved = filters.status === "resolved"
  const t = useTranslations("admin.claims")

  if (error) {
    return <EmptyState>{error.message || t("loadError")}</EmptyState>
  }

  const claims = data?.data ?? []
  const meta = data?.meta

  if (claims.length === 0) {
    return (
      <div className="grid place-items-center gap-3 rounded-2xl border border-dashed bg-card px-6 py-14 text-center">
        <ShieldCheck className="size-10 text-success" aria-hidden />
        <p className="font-heading text-lg font-semibold">
          {resolved ? t("emptySettledTitle") : t("emptyOpenTitle")}
        </p>
        <p className="max-w-sm text-sm text-muted-foreground">
          {resolved ? t("emptySettledBody") : t("emptyOpenBody")}
        </p>
      </div>
    )
  }

  return (
    <>
      <ul
        className={cn(
          "grid gap-4 transition-opacity",
          isFetching && "opacity-70"
        )}
      >
        {claims.map((order) => (
          <ClaimCard key={order.id} order={order} />
        ))}
      </ul>

      <Pagination
        page={filters.page}
        totalPages={meta?.totalPages ?? 1}
        hrefFor={(page) => buildHref(ADMIN_CLAIMS_PATH, { ...filters, page })}
        label={t("pagination")}
      />
    </>
  )
}

function ClaimCard({ order }: { order: RentalOrder }) {
  const deposit = Number(order.depositAmount)
  const claimed = Number(order.damageClaimAmount ?? 0)
  const open = order.depositStatus === "CLAIMED"
  const kept = Number(order.claimKeptAmount ?? 0)
  const t = useTranslations("admin.claims")
  const tc = useTranslations("common.depositStatus")
  const format = useFormat()

  return (
    <li className="overflow-hidden rounded-2xl border bg-card shadow-xs">
      <div className="flex flex-wrap items-start gap-4 p-5">
        <div className="grid min-w-0 flex-1 gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-xs text-muted-foreground">
              {t("orderNumber", { id: order.id.slice(0, 8) })}
            </span>
            {open ? (
              <Badge variant="warning">{t("tabAwaiting")}</Badge>
            ) : (
              <Badge
                variant={
                  order.depositStatus === "REFUNDED" ? "success" : "secondary"
                }
              >
                {tc(order.depositStatus)}
              </Badge>
            )}
          </div>

          <div className="grid gap-2">
            {order.items?.map(
              (item) =>
                item.gearItem && <GearCell key={item.id} item={item.gearItem} />
            )}
          </div>

          <dl className="grid gap-x-6 gap-y-1.5 text-sm sm:grid-cols-3">
            <Fact icon={UserRound} label={t("customer")}>
              {order.customer?.name}
              <span className="block text-xs text-muted-foreground">
                {order.customer?.email}
              </span>
            </Fact>
            <Fact icon={Store} label={t("provider")}>
              {order.provider?.name}
              <span className="block text-xs text-muted-foreground">
                {order.provider?.email}
              </span>
            </Fact>
            <Fact icon={CalendarCheck} label={t("returned")}>
              {order.returnedAt ? format.dateTime(order.returnedAt) : "—"}
              <span className="block text-xs text-muted-foreground">
                {t("rented", {
                  from: format.date(order.startDate),
                  to: format.date(order.endDate),
                })}
              </span>
            </Fact>
          </dl>

          {order.damageNote && (
            <blockquote className="rounded-lg border-l-4 border-warning/60 bg-warning/8 px-3.5 py-2.5 text-sm">
              <span className="block text-xs font-medium text-muted-foreground">
                {t("providerReport")}
              </span>
              “{order.damageNote}”
            </blockquote>
          )}
          {!open && order.claimResolutionNote && (
            <blockquote className="rounded-lg border-l-4 border-primary/50 bg-primary/5 px-3.5 py-2.5 text-sm">
              <span className="block text-xs font-medium text-muted-foreground">
                {t("decisionNote")}
              </span>
              “{order.claimResolutionNote}”
            </blockquote>
          )}
        </div>

        <div className="grid w-full gap-3 rounded-lg bg-muted/50 p-4 sm:w-60">
          <Money label={t("depositHeld")} value={deposit} />
          <Money label={t("providerClaims")} value={claimed} strong={open} />
          {!open && (
            <>
              <Money label={t("kept")} value={kept} strong />
              <Money label={t("refunded")} value={deposit - kept} />
              {order.claimResolvedAt && (
                <p className="text-xs text-muted-foreground">
                  {t("settledAt", {
                    date: format.dateTime(order.claimResolvedAt),
                  })}
                </p>
              )}
            </>
          )}
          {open && <ResolveClaimDialog order={order} />}
        </div>
      </div>
    </li>
  )
}

function Fact({
  icon: Icon,
  label,
  children,
}: {
  icon: typeof UserRound
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="flex gap-2">
      <Icon
        className="mt-0.5 size-4 shrink-0 text-muted-foreground"
        aria-hidden
      />
      <div className="min-w-0">
        <dt className="text-xs text-muted-foreground">{label}</dt>
        <dd className="break-words">{children}</dd>
      </div>
    </div>
  )
}

function Money({
  label,
  value,
  strong,
}: {
  label: string
  value: number
  strong?: boolean
}) {
  const format = useFormat()
  return (
    <div className="flex items-baseline justify-between gap-3 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className={cn("tabular-nums", strong && "font-semibold")}>
        {format.price(value)}
      </span>
    </div>
  )
}
