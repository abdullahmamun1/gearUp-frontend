"use client"

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts"

import { Link } from "@/i18n/navigation"
import { useTranslations } from "@/i18n/translations"
import { useFormat } from "@/i18n/useFormat"
import type { RentalStatus, StatusCount } from "@/types"

/** Status colours, in step with the status badges. */
const COLOR: Record<RentalStatus, string> = {
  PLACED: "var(--warning)",
  CONFIRMED: "var(--ember)",
  PAID: "var(--success)",
  PICKED_UP: "var(--lagoon)",
  RETURNED: "var(--chart-1)",
  CANCELLED: "var(--muted-foreground)",
}

/** Orders by status as a donut, with a legend that links to each list. */
export function StatusDonut({
  data,
  listPath,
}: {
  data: StatusCount[]
  /** The orders list; each legend row links to it filtered by status. */
  listPath: string
}) {
  const t = useTranslations("common")
  const tCharts = useTranslations("dashboard.charts")
  const format = useFormat()
  const rows = data.filter((row) => row.count > 0)
  const total = rows.reduce((sum, row) => sum + row.count, 0)

  return (
    <div className="grid items-center gap-4 sm:grid-cols-[180px_1fr]">
      <div className="relative mx-auto size-[180px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={rows}
              dataKey="count"
              nameKey="status"
              innerRadius={58}
              outerRadius={84}
              paddingAngle={2}
              stroke="var(--card)"
              isAnimationActive={false}
            >
              {rows.map((row) => (
                <Cell key={row.status} fill={COLOR[row.status]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value, _name, item) => [
                format.number(Number(value)),
                t(`rentalStatusShort.${(item.payload as StatusCount).status}`),
              ]}
              contentStyle={{
                background: "var(--popover)",
                border: "1px solid var(--border)",
                borderRadius: 8,
                fontSize: 12,
              }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 grid place-content-center text-center">
          <span className="font-heading text-2xl font-bold tabular-nums">
            {format.number(total)}
          </span>
          <span className="text-xs text-muted-foreground">
            {tCharts("total")}
          </span>
        </div>
      </div>
      <ul className="grid gap-1.5 text-sm">
        {rows.map((row) => (
          <li key={row.status}>
            <Link
              href={`${listPath}?status=${row.status}`}
              className="flex items-center gap-2 rounded-md px-2 py-1 transition-colors hover:bg-accent"
            >
              <span
                className="size-2.5 shrink-0 rounded-full"
                style={{ background: COLOR[row.status] }}
                aria-hidden
              />
              <span className="flex-1">
                {t(`rentalStatusShort.${row.status}`)}
              </span>
              <span className="font-medium tabular-nums">
                {format.number(row.count)}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
