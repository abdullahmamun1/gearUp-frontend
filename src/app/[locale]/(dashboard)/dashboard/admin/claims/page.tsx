import type { Metadata } from "next"
import { getTranslations } from "@/i18n/getTranslations"

import type { AppLocale, LocaleParams } from "@/i18n/routing"
import { Link } from "@/i18n/navigation"
import { Suspense } from "react"

import { ClaimsTable } from "@/components/modules/admin/claims/ClaimsTable"
import { PageHeader } from "@/components/modules/dashboard/PageHeader"
import { PanelSkeleton } from "@/components/modules/dashboard/Skeletons"
import { cn } from "@/lib/utils"
import {
  ADMIN_CLAIMS_PATH,
  parseAdminClaimsFilters,
  type RawSearchParams,
} from "@/utils/filters/admin"
import { buildHref } from "@/utils/searchParams"

export async function generateMetadata({
  params,
}: LocaleParams): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({
    locale: locale as AppLocale,
    namespace: "admin.meta",
  })
  return { title: t("claims") }
}

const TABS = [
  { status: undefined, label: "tabAwaiting" },
  { status: "resolved", label: "tabSettled" },
] as const

export default async function AdminClaimsPage({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>
}) {
  const filters = parseAdminClaimsFilters(await searchParams)
  const t = await getTranslations("admin.claims")

  return (
    <>
      <PageHeader title={t("title")} description={t("description")} />

      <nav
        aria-label={t("tabsLabel")}
        className="mb-5 inline-flex rounded-full border bg-card p-1 shadow-xs"
      >
        {TABS.map((tab) => {
          const active = filters.status === tab.status
          return (
            <Link
              key={tab.label}
              href={buildHref(ADMIN_CLAIMS_PATH, { status: tab.status })}
              aria-current={active ? "page" : undefined}
              className={cn(
                "inline-flex h-8 items-center rounded-full px-4 text-sm font-medium transition-colors",
                active
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {t(tab.label)}
            </Link>
          )
        })}
      </nav>

      <Suspense
        key={JSON.stringify(filters)}
        fallback={<PanelSkeleton rows={3} />}
      >
        <ClaimsTable filters={filters} />
      </Suspense>
    </>
  )
}
