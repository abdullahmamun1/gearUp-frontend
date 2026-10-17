"use client"

import { useState } from "react"

import { Slider } from "@/components/ui/slider"
import { formatPrice } from "@/utils/format"

const FIELDS = [
  {
    key: "price",
    label: "Price per day",
    min: 100,
    max: 5000,
    step: 50,
    format: (v: number) => formatPrice(v),
  },
  {
    key: "days",
    label: "Days rented per month",
    min: 1,
    max: 30,
    step: 1,
    format: (v: number) => `${v} ${v === 1 ? "day" : "days"}`,
  },
  {
    key: "units",
    label: "Units you own",
    min: 1,
    max: 10,
    step: 1,
    format: (v: number) => `${v} ${v === 1 ? "unit" : "units"}`,
  },
] as const

type Values = Record<(typeof FIELDS)[number]["key"], number>

/** Rough monthly earnings for a provider: price × days × units. */
export function EarningsCalculator() {
  const [values, setValues] = useState<Values>({
    price: 800,
    days: 8,
    units: 2,
  })
  const monthly = values.price * values.days * values.units

  return (
    <div className="rounded-2xl border bg-card p-5 shadow-md sm:p-6">
      <div className="grid gap-5">
        {FIELDS.map((field) => (
          <div key={field.key} className="grid gap-2.5">
            <div className="flex items-baseline justify-between gap-3 text-sm">
              <label id={`earn-${field.key}`} className="text-muted-foreground">
                {field.label}
              </label>
              <span className="font-medium tabular-nums">
                {field.format(values[field.key])}
              </span>
            </div>
            <Slider
              aria-labelledby={`earn-${field.key}`}
              min={field.min}
              max={field.max}
              step={field.step}
              value={[values[field.key]]}
              onValueChange={(next) =>
                setValues((current) => ({
                  ...current,
                  [field.key]: Array.isArray(next) ? next[0] : next,
                }))
              }
            />
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-xl bg-(image:--gradient-brand) p-5 text-primary-foreground">
        <p className="text-sm opacity-90">You could earn about</p>
        <p className="mt-1 text-h2 tabular-nums" aria-live="polite">
          {formatPrice(monthly)}
          <span className="text-base font-medium opacity-90"> / month</span>
        </p>
      </div>
      <p className="mt-3 text-xs text-muted-foreground">
        An estimate — what you actually earn depends on your bookings.
      </p>
    </div>
  )
}
