"use client"

import { Link } from "@/i18n/navigation"
import { useRouter } from "@/i18n/navigation"
import { useState, useTransition } from "react"
import { Loader2 } from "lucide-react"
import { useTranslations } from "@/i18n/translations"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useFormat } from "@/i18n/useFormat"
import { cn } from "@/lib/utils"
import {
  ADMIN_ANALYTICS_PATH,
  type AnalyticsPreset,
  type AnalyticsRange,
} from "@/utils/filters/admin"
import { buildHref } from "@/utils/searchParams"

const same = (a: AnalyticsRange, b: AnalyticsRange) =>
  (a.from ?? "") === (b.from ?? "") && (a.to ?? "") === (b.to ?? "")

/** Quick ranges plus a custom from–to; the range lives in the URL. */
export function RangeBar({
  range,
  presets,
}: {
  range: AnalyticsRange
  presets: AnalyticsPreset[]
}) {
  const router = useRouter()
  const t = useTranslations("admin.analytics")
  const format = useFormat()
  const [isPending, startTransition] = useTransition()
  const [from, setFrom] = useState(range.from ?? "")
  const [to, setTo] = useState(range.to ?? "")
  const custom = !presets.some((preset) => same(preset.range, range))
  const invalid = Boolean(from && to && from > to)

  return (
    <div className="mb-6 flex flex-wrap items-center gap-3">
      <nav
        aria-label={t("range.label")}
        className="inline-flex flex-wrap rounded-full border bg-card p-1 shadow-xs"
      >
        {presets.map((preset) => {
          const active = same(preset.range, range)
          const label =
            preset.label === "thisYear"
              ? t("presets.thisYear")
              : t(`presets.${preset.label}`, {
                  count: format.number(preset.count ?? 0),
                })
          return (
            <Link
              key={`${preset.label}${preset.count ?? ""}`}
              href={buildHref(ADMIN_ANALYTICS_PATH, { ...preset.range })}
              aria-current={active ? "page" : undefined}
              scroll={false}
              className={cn(
                "inline-flex h-8 items-center rounded-full px-3.5 text-sm font-medium transition-colors",
                active
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {label}
            </Link>
          )
        })}
      </nav>

      <form
        className={cn(
          "flex flex-wrap items-center gap-2 rounded-full border bg-card py-1 pr-1 pl-3 shadow-xs",
          custom && "border-primary/40"
        )}
        onSubmit={(event) => {
          event.preventDefault()
          if (invalid) return
          startTransition(() =>
            router.push(
              buildHref(ADMIN_ANALYTICS_PATH, {
                from: from || undefined,
                to: to || undefined,
              }),
              { scroll: false }
            )
          )
        }}
      >
        <label className="text-sm text-muted-foreground" htmlFor="range-from">
          {t("range.from")}
        </label>
        <Input
          id="range-from"
          type="date"
          value={from}
          max={to || undefined}
          onChange={(event) => setFrom(event.target.value)}
          className="h-8 w-38 rounded-full"
        />
        <label className="text-sm text-muted-foreground" htmlFor="range-to">
          {t("range.to")}
        </label>
        <Input
          id="range-to"
          type="date"
          value={to}
          min={from || undefined}
          onChange={(event) => setTo(event.target.value)}
          className="h-8 w-38 rounded-full"
          aria-invalid={invalid || undefined}
        />
        <Button
          type="submit"
          size="sm"
          className="h-8 rounded-full"
          disabled={invalid || isPending}
        >
          {isPending && <Loader2 className="animate-spin" aria-hidden />}
          {t("range.apply")}
        </Button>
      </form>
    </div>
  )
}
