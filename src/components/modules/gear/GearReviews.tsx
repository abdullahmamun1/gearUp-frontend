import { getLocale } from "next-intl/server"
import { getTranslations } from "@/i18n/getTranslations"

import { getGearReviews } from "@/api/reviews"
import { Stars } from "@/components/shared/Stars"
import { formatRating } from "@/utils/gearAvailability"

import { ReviewsList } from "./ReviewsList"

/** First page is prerendered with the gear page; "Show more" loads the rest. */
export async function GearReviews({ gearId }: { gearId: string }) {
  const res = await getGearReviews(gearId, 1)
  const t = await getTranslations("gear.reviews")
  const tCommon = await getTranslations("common")
  const locale = await getLocale()

  if (!res.success || !res.data) {
    return (
      <p className="mt-3 text-sm text-muted-foreground">
        {res.message || t("loadFailed")}
      </p>
    )
  }

  const { data: reviews, meta, summary } = res.data

  if (summary.total === 0) {
    return <p className="mt-3 text-sm text-muted-foreground">{t("empty")}</p>
  }

  return (
    <>
      {summary.average !== null && (
        <div className="mt-3 flex items-center gap-3">
          <span className="font-heading text-2xl font-semibold">
            {formatRating(locale, summary.average)}
          </span>
          <div>
            <Stars rating={summary.average} />
            <p className="mt-0.5 text-xs text-muted-foreground">
              {tCommon("units.reviews", { count: summary.total })}
            </p>
          </div>
        </div>
      )}

      <ReviewsList
        gearId={gearId}
        initial={reviews}
        totalPages={meta.totalPages ?? 1}
      />
    </>
  )
}
