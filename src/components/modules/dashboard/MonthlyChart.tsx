"use client"

import { useLocale } from "next-intl"
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type TooltipContentProps,
} from "recharts"

import { useFormat } from "@/i18n/useFormat"
import type { MonthAmount } from "@/types"

const AXIS_TICK = { fill: "var(--muted-foreground)", fontSize: 11 }

/** Money per month: bars (spending) or an area (earnings). */
export function MonthlyChart({
  data,
  variant = "bar",
}: {
  data: MonthAmount[]
  variant?: "bar" | "area"
}) {
  const locale = useLocale()
  const format = useFormat()
  const tag = locale === "bn" ? "bn-BD" : "en-GB"
  const rows = data.map((row) => ({ ...row, label: format.month(row.month) }))
  const compact = new Intl.NumberFormat(tag, {
    notation: "compact",
    maximumFractionDigits: 1,
  })
  const axes = (
    <>
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
      />
      <YAxis
        tickLine={false}
        axisLine={false}
        tick={AXIS_TICK}
        width={44}
        tickFormatter={(value: number) => compact.format(value)}
      />
      <Tooltip
        cursor={{ fill: "var(--muted-foreground)", opacity: 0.1 }}
        content={<MoneyTooltip price={format.price} />}
        animationDuration={120}
      />
    </>
  )

  return (
    <ResponsiveContainer width="100%" height={220}>
      {variant === "area" ? (
        <AreaChart
          data={rows}
          margin={{ top: 8, right: 8, bottom: 0, left: 0 }}
        >
          <defs>
            <linearGradient id="earnings-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.35} />
              <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0} />
            </linearGradient>
          </defs>
          {axes}
          <Area
            type="monotone"
            dataKey="amount"
            stroke="var(--chart-1)"
            strokeWidth={2}
            fill="url(#earnings-fill)"
            isAnimationActive={false}
          />
        </AreaChart>
      ) : (
        <BarChart data={rows} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
          {axes}
          <Bar
            dataKey="amount"
            fill="var(--chart-1)"
            radius={[6, 6, 0, 0]}
            maxBarSize={34}
            isAnimationActive={false}
          />
        </BarChart>
      )}
    </ResponsiveContainer>
  )
}

function MoneyTooltip({
  active,
  payload,
  price,
}: Partial<TooltipContentProps<number, string>> & {
  price: (value: number) => string
}) {
  const point = payload?.[0]
  if (!active || !point || typeof point.value !== "number") return null
  return (
    <div className="rounded-md border bg-popover px-2.5 py-1.5 text-xs shadow-md">
      <p className="font-medium">{point.payload.label}</p>
      <p className="text-foreground tabular-nums">{price(point.value)}</p>
    </div>
  )
}
