import type { Metadata } from "next"
import { Suspense } from "react"
import { getTranslations } from "@/i18n/getTranslations"

import type { AppLocale, LocaleParams } from "@/i18n/routing"

import { getAnalytics } from "@/api/reports"
import {
  AiInsights,
  AiInsightsSkeleton,
} from "@/components/modules/admin/analytics/AiInsights"
import { AnalyticsView } from "@/components/modules/admin/analytics/AnalyticsView"
import { ExportMenu } from "@/components/modules/admin/analytics/ExportMenu"
import { RangeBar } from "@/components/modules/admin/analytics/RangeBar"
import { PageHeader } from "@/components/modules/dashboard/PageHeader"
import { EmptyState } from "@/components/shared/EmptyState"
import {
  analyticsPresets,
  dhakaToday,
  parseAnalyticsRange,
  type RawSearchParams,
} from "@/utils/filters/admin"

export async function generateMetadata({
  params,
}: LocaleParams): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({
    locale: locale as AppLocale,
    namespace: "admin.meta",
  })
  return { title: t("analytics") }
}

export default async function AdminAnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>
}) {
  const range = parseAnalyticsRange(await searchParams)
  const [res, t] = await Promise.all([
    getAnalytics(range),
    getTranslations("admin.analytics"),
  ])

  return (
    <>
      <PageHeader
        title={t("title")}
        description={t("description")}
        action={<ExportMenu range={range} />}
      />

      <RangeBar
        key={`${range.from}:${range.to}`}
        range={range}
        presets={analyticsPresets(dhakaToday())}
      />

      {res.success && res.data && (
        <Suspense
          key={`insights:${range.from}:${range.to}`}
          fallback={<AiInsightsSkeleton />}
        >
          <AiInsights range={range} />
        </Suspense>
      )}

      {res.success && res.data ? (
        <AnalyticsView data={res.data} />
      ) : (
        <EmptyState>{res.message || t("loadError")}</EmptyState>
      )}
    </>
  )
}
