import { UserRound } from "lucide-react"

import { Pagination } from "@/components/shared/Pagination"
import { Stars } from "@/components/shared/Stars"
import { formatDate } from "@/lib/format"
import type { Review } from "@/types"

import { getGearReviews } from "../../../_actions/getReviews"

export async function GearReviews({
  gearId,
  page,
}: {
  gearId: string
  page: number
}) {
  const res = await getGearReviews(gearId, page)

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

      <ul className="mt-6 grid gap-5">
        {reviews.map((review) => (
          <ReviewRow key={review.id} review={review} />
        ))}
      </ul>

      <Pagination
        page={meta.page}
        totalPages={meta.totalPages ?? 1}
        hrefFor={(next) => `?reviewPage=${next}#reviews`}
        label="Reviews pages"
        className="mt-8"
      />
    </>
  )
}

function ReviewRow({ review }: { review: Review }) {
  return (
    <li className="border-b pb-5 last:border-b-0 last:pb-0">
      <div className="flex items-center gap-3">
        <span
          className="grid size-8 shrink-0 place-items-center rounded-full bg-primary/10 text-primary"
          aria-hidden
        >
          <UserRound className="size-4" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">
            {review.customer?.name ?? "A renter"}
          </p>
          {review.createdAt && (
            <p className="text-xs text-muted-foreground">
              {formatDate(review.createdAt)}
            </p>
          )}
        </div>
        <Stars rating={review.rating} />
      </div>

      {review.comment && (
        <p className="mt-2.5 text-sm leading-relaxed text-pretty text-muted-foreground">
          {review.comment}
        </p>
      )}
    </li>
  )
}
