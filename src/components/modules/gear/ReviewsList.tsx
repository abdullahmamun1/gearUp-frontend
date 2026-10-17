"use client"

import { useState, useTransition } from "react"
import { Loader2, UserRound } from "lucide-react"

import { Stars } from "@/components/shared/Stars"
import { Button } from "@/components/ui/button"
import { queryFetch } from "@/hooks/queries/fetcher"
import { formatDate } from "@/utils/format"
import type { Review, ReviewList } from "@/types"

/** Review list with "Show more", so the gear page needs no query string. */
export function ReviewsList({
  gearId,
  initial,
  totalPages,
}: {
  gearId: string
  initial: Review[]
  totalPages: number
}) {
  const [reviews, setReviews] = useState(initial)
  const [page, setPage] = useState(1)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function loadMore() {
    startTransition(async () => {
      try {
        const next = await queryFetch<ReviewList>(
          `/api/gear/${gearId}/reviews?page=${page + 1}`
        )
        setReviews((current) => [...current, ...next.data])
        setPage(page + 1)
        setError(null)
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Couldn't load more reviews."
        )
      }
    })
  }

  return (
    <>
      <ul className="mt-6 grid gap-5">
        {reviews.map((review) => (
          <ReviewRow key={review.id} review={review} />
        ))}
      </ul>

      {page < totalPages && (
        <Button
          type="button"
          variant="outline"
          size="lg"
          onClick={loadMore}
          disabled={isPending}
          className="mt-6 h-10 px-5 text-sm"
        >
          {isPending && <Loader2 className="size-4 animate-spin" aria-hidden />}
          {isPending ? "Loading…" : "Show more reviews"}
        </Button>
      )}
      {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
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
