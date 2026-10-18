"use client"

import { useMemo } from "react"
import { useLocale } from "next-intl"
import { useTranslations } from "@/i18n/translations"
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type TooltipContentProps,
} from "recharts"

import type { AdminAnalytics } from "@/types"
import { useFormat } from "@/i18n/useFormat"

type Row = AdminAnalytics["revenueByMonth"][number]

const AXIS_TICK = { fill: "var(--muted-foreground)", fontSize: 11 }
const CURSOR = { fill: "var(--muted-foreground)", opacity: 0.12 }

/**
 * The Intl tag for the current locale: "bn-BD" for Bangla, with Latin digits
 * when the dashboard digits preference asks for them.
 */
function useIntlTag() {
  const locale = useLocale()
  const latinDigits = useFormat().number(1) === "1"
  if (locale !== "bn") return "en-GB"
  return latinDigits ? "bn-BD-u-nu-latn" : "bn-BD"
}

const monthLabel = (tag: string, month: string, withYear: boolean) =>
  new Date(`${month}-01T00:00:00Z`).toLocaleDateString(tag, {
    month: "short",
    ...(withYear && { year: "2-digit" }),
    timeZone: "UTC",
  })

/** Net revenue per month, with refunds stacked on top to show the gross. */
export function RevenueChart({ data }: { data: Row[] }) {
  const tag = useIntlTag()
  const compact = useMemo(
    () =>
      new Intl.NumberFormat(tag === "en-GB" ? "en" : tag, {
        notation: "compact",
        maximumFractionDigits: 1,
      }),
    [tag]
  )
  const years = new Set(data.map((row) => row.month.slice(0, 4)))
  const rows = data.map((row) => ({
    ...row,
    label: monthLabel(tag, row.month, years.size > 1),
  }))

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={rows} margin={{ top: 8, right: 4, bottom: 0, left: 0 }}>
        <CartesianGrid
          vertical={false}
          stroke="var(--border)"
          strokeDasharray="3 3"
        />
        <XAxis
          dataKey="label"
          tickLine={false}
          axisLine={false}
          tick={AXIS_TICK}
          interval="preserveStartEnd"
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          tick={AXIS_TICK}
          width={44}
          tickFormatter={(value: number) => compact.format(value)}
        />
        <Tooltip
          cursor={CURSOR}
          content={<RevenueTooltip />}
          animationDuration={120}
        />
        <Bar
          dataKey="net"
          stackId="money"
          fill="var(--chart-1)"
          maxBarSize={36}
          isAnimationActive={false}
        />
        <Bar
          dataKey="refunded"
          stackId="money"
          fill="var(--chart-2)"
          maxBarSize={36}
          radius={[6, 6, 0, 0]}
          isAnimationActive={false}
        />
      </BarChart>
    </ResponsiveContainer>
  )
}

function RevenueTooltip({
  active,
  payload,
}: Partial<TooltipContentProps<number, string>>) {
  const t = useTranslations("admin.analytics")
  const tag = useIntlTag()
  const row = payload?.[0]?.payload as (Row & { label: string }) | undefined
  if (!active || !row) return null

  return (
    <div className="grid gap-1 rounded-md border bg-popover px-3 py-2 text-xs shadow-md">
      <p className="font-medium">
        {new Date(`${row.month}-01T00:00:00Z`).toLocaleDateString(tag, {
          month: "long",
          year: "numeric",
          timeZone: "UTC",
        })}
      </p>
      <Line swatch="var(--chart-1)" label={t("legendNet")} value={row.net} />
      <Line
        swatch="var(--chart-2)"
        label={t("legendRefunded")}
        value={row.refunded}
      />
      <Line label={t("legendGross")} value={row.gross} />
    </div>
  )
}

function Line({
  swatch,
  label,
  value,
}: {
  swatch?: string
  label: string
  value: number
}) {
  const format = useFormat()
  return (
    <p className="flex items-center gap-2 text-muted-foreground">
      <span
        className="size-2 rounded-full"
        style={{ background: swatch ?? "transparent" }}
        aria-hidden
      />
      <span className="flex-1">{label}</span>
      <span className="text-foreground tabular-nums">
        {format.price(value)}
      </span>
    </p>
  )
}
