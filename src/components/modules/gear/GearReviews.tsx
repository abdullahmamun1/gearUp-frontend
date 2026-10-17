import { getGearReviews } from "@/api/reviews"
import { Stars } from "@/components/shared/Stars"

import { ReviewsList } from "./ReviewsList"

/** First page is prerendered with the gear page; "Show more" loads the rest. */
export async function GearReviews({ gearId }: { gearId: string }) {
  const res = await getGearReviews(gearId, 1)

  if (!res.success || !res.data) {
    return (
      <p className="mt-3 text-sm text-muted-foreground">
        {res.message || "Couldn't load reviews. Please try again."}
      </p>
    )
  }

  const { data: reviews, meta, summary } = res.data

  if (summary.total === 0) {
    return (
      <p className="mt-3 text-sm text-muted-foreground">
        No reviews yet. Renters can leave one once they&apos;ve returned this
        gear.
      </p>
    )
  }

  return (
    <>
      {summary.average !== null && (
        <div className="mt-3 flex items-center gap-3">
          <span className="font-heading text-2xl font-semibold">
            {summary.average.toFixed(1)}
          </span>
          <div>
            <Stars rating={summary.average} />
            <p className="mt-0.5 text-xs text-muted-foreground">
              {summary.total} {summary.total === 1 ? "review" : "reviews"}
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
