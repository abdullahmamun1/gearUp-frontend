"use client"

import { useState } from "react"
import { useTranslations } from "@/i18n/translations"

import { Slider } from "@/components/ui/slider"
import { useFormat } from "@/i18n/useFormat"

const FIELDS = [
  {
    key: "price",
    min: 100,
    max: 5000,
    step: 50,
  },
  {
    key: "days",
    min: 1,
    max: 30,
    step: 1,
  },
  {
    key: "units",
    min: 1,
    max: 10,
    step: 1,
  },
] as const

type Values = Record<(typeof FIELDS)[number]["key"], number>

/** Rough monthly earnings for a provider: price × days × units. */
export function EarningsCalculator() {
  const t = useTranslations("home.earnings")
  const tUnits = useTranslations("common.units")
  const format = useFormat()
  const show: Record<keyof Values, (v: number) => string> = {
    price: (v) => format.price(v),
    days: (v) => tUnits("days", { count: v }),
    units: (v) => t("unitsValue", { count: v }),
  }
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
                {t(field.key)}
              </label>
              <span className="font-medium tabular-nums">
                {show[field.key](values[field.key])}
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
        <p className="text-sm opacity-90">{t("earnAbout")}</p>
        <p className="mt-1 text-h2 tabular-nums" aria-live="polite">
          {format.price(monthly)}
          <span className="text-base font-medium opacity-90">
            {" "}
            {t("perMonth")}
          </span>
        </p>
      </div>
      <p className="mt-3 text-xs text-muted-foreground">{t("disclaimer")}</p>
    </div>
  )
}
