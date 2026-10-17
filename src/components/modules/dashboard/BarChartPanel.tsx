"use client"

import {
  Bar,
  Cell,
  BarChart,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

import type { ChartDatum } from "@/api/admin"
import { ChartTooltip } from "./ChartTooltip"

const AXIS_TICK = { fill: "var(--muted-foreground)", fontSize: 11 }
const CURSOR = { fill: "var(--muted-foreground)", opacity: 0.12 }

const ROW_HEIGHT = 34

export function BarChartPanel({
  data,
  measure,
}: {
  data: ChartDatum[]
  measure: string
}) {
  return (
    <ResponsiveContainer width="100%" height={data.length * ROW_HEIGHT}>
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 0, right: 28, bottom: 0, left: 0 }}
      >
        <XAxis type="number" hide />
        <YAxis
          type="category"
          dataKey="label"
          width={112}
          interval={0}
          tickLine={false}
          axisLine={false}
          tick={AXIS_TICK}
        />

        <Tooltip
          cursor={CURSOR}
          content={<ChartTooltip measure={measure} />}
          animationDuration={120}
        />

        <Bar
          dataKey="value"
          fill="var(--chart-1)"
          maxBarSize={18}
          minPointSize={2}
          radius={[0, 6, 6, 0]}
          isAnimationActive={false}
        >
          {/* One brand colour per row, so neighbouring bars read apart. */}
          {data.map((datum, index) => (
            <Cell key={datum.label} fill={`var(--chart-${(index % 5) + 1})`} />
          ))}
          <LabelList
            dataKey="value"
            position="right"
            offset={8}
            fill="var(--muted-foreground)"
            fontSize={11}
          />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
