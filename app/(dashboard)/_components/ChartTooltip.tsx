"use client"

import type { TooltipContentProps } from "recharts"

export function ChartTooltip({
  active,
  payload,
  measure,
}: Partial<TooltipContentProps<number, string>> & { measure: string }) {
  const point = payload?.[0]
  if (!active || !point) return null

  return (
    <div className="rounded-md border bg-popover px-2.5 py-1.5 text-xs shadow-md">
      <p className="font-medium">{point.payload.label}</p>
      <p className="text-muted-foreground">
        <span className="text-foreground tabular-nums">{point.value}</span>{" "}
        {measure}
      </p>
    </div>
  )
}
