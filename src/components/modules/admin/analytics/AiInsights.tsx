import { AlertTriangle, Info, Sparkles, TrendingUp } from "lucide-react"
import { getLocale } from "next-intl/server"

import { getAnalyticsInsights } from "@/api/ai"
import { Skeleton } from "@/components/ui/skeleton"
import { getTranslations } from "@/i18n/getTranslations"
import type { AppLocale } from "@/i18n/routing"
import { cn } from "@/lib/utils"
import type { InsightTone } from "@/types"
import type { AnalyticsRange } from "@/utils/filters/admin"

const TONE: Record<InsightTone, { icon: typeof Info; className: string }> = {
  positive: { icon: TrendingUp, className: "bg-success/12 text-success" },
  warning: { icon: AlertTriangle, className: "bg-warning/15 text-warning" },
  neutral: { icon: Info, className: "bg-lagoon/10 text-lagoon" },
}

/**
 * AI insights for the selected range: trends and anomalies against the
 * previous period of the same length. The backend detects them with plain
 * rules and Gemini words them; without the AI the rule checks still show.
 * Streamed in its own Suspense boundary so the charts never wait for it.
 */
export async function AiInsights({ range }: { range: AnalyticsRange }) {
  const locale = (await getLocale()) as AppLocale
  const [res, t] = await Promise.all([
    getAnalyticsInsights({ ...range, locale }),
    getTranslations("admin.insights"),
  ])
  if (!res.success || !res.data) return null
  const { headline, insights, source } = res.data

  return (
    <section className="mb-6 rounded-2xl border bg-card p-5 shadow-xs">
      <div className="flex flex-wrap items-center gap-2">
        <span className="grid size-8 place-items-center rounded-lg bg-(image:--gradient-brand) text-primary-foreground">
          <Sparkles className="size-4" aria-hidden />
        </span>
        <h2 className="font-heading font-semibold">{t("title")}</h2>
        <span className="ml-auto text-xs text-muted-foreground">
          {source === "ai" ? t("sourceAi") : t("sourceRules")}
        </span>
      </div>
      <p className="mt-3 text-[15px] text-pretty">{headline}</p>
      {/* One per row: side by side they came out uneven and cramped. */}
      {insights.length > 0 && (
        <ul className="mt-4 grid gap-3">
          {insights.map((insight) => {
            const tone = TONE[insight.tone]
            return (
              <li
                key={insight.title}
                className="flex gap-3 rounded-xl bg-muted/40 p-3.5"
              >
                <span
                  className={cn(
                    "grid size-8 shrink-0 place-items-center rounded-lg",
                    tone.className
                  )}
                >
                  <tone.icon className="size-4" aria-hidden />
                </span>
                <span>
                  <span className="block text-sm font-semibold">
                    {insight.title}
                  </span>
                  <span className="mt-0.5 block text-sm text-pretty text-muted-foreground">
                    {insight.detail}
                  </span>
                </span>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}

export function AiInsightsSkeleton() {
  return (
    <div className="mb-6 rounded-2xl border bg-card p-5 shadow-xs">
      <div className="flex items-center gap-2">
        <Skeleton className="size-8 rounded-lg" />
        <Skeleton className="h-5 w-32" />
      </div>
      <Skeleton className="mt-4 h-4 w-3/4" />
      <div className="mt-4 grid gap-3">
        <Skeleton className="h-16 rounded-xl" />
        <Skeleton className="h-16 rounded-xl" />
      </div>
    </div>
  )
}
