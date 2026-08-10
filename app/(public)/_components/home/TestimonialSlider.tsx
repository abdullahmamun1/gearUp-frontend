"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { ChevronLeft, ChevronRight, Quote } from "lucide-react"

import type { Testimonial } from "@/app/(public)/_actions/getReviews"
import { Stars } from "@/components/shared/Stars"
import { Button } from "@/components/ui/button"
import { formatDate } from "@/lib/format"

export function TestimonialSlider({
  reviews,
  className,
}: {
  reviews: Testimonial[]
  className?: string
}) {
  const trackRef = useRef<HTMLUListElement>(null)
  const [atStart, setAtStart] = useState(true)
  const [atEnd, setAtEnd] = useState(true)

  const sync = useCallback(() => {
    const track = trackRef.current
    if (!track) return

    const max = track.scrollWidth - track.clientWidth
    setAtStart(track.scrollLeft <= 1)
    setAtEnd(track.scrollLeft >= max - 1)
  }, [])

  useEffect(() => {
    sync()
    const track = trackRef.current
    if (!track) return

    const observer = new ResizeObserver(sync)
    observer.observe(track)
    return () => observer.disconnect()
  }, [sync])

  function scrollByCard(direction: 1 | -1) {
    const track = trackRef.current
    if (!track) return

    const card = track.firstElementChild
    const step = card ? card.clientWidth + 20 : track.clientWidth
    track.scrollBy({ left: step * direction, behavior: "smooth" })
  }

  const scrollable = !atStart || !atEnd

  return (
    <div className={className}>
      <ul
        ref={trackRef}
        onScroll={sync}
        tabIndex={0}
        aria-label="Renter reviews"
        className="flex snap-x snap-mandatory [scrollbar-width:none] gap-5 overflow-x-auto pb-2 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring [&::-webkit-scrollbar]:hidden"
      >
        {reviews.map((review) => (
          <li
            key={review.id}
            className="flex w-[min(20rem,80vw)] shrink-0 snap-start flex-col rounded-xl border bg-card p-5 sm:w-[calc((100%-1.25rem)/2)] lg:w-[calc((100%-2.5rem)/3)]"
          >
            <Quote className="size-5 text-primary/40" aria-hidden />

            <p className="mt-3 flex-1 text-sm leading-relaxed text-pretty">
              {review.comment}
            </p>

            <Stars rating={review.rating} className="mt-4" />

            <p className="mt-2 text-sm font-medium">
              {review.customer?.name ?? "A renter"}
            </p>
            <p className="text-xs text-muted-foreground">
              Rented {review.gearName}
              {review.createdAt && ` · ${formatDate(review.createdAt)}`}
            </p>
          </li>
        ))}
      </ul>

      {scrollable && (
        <div className="mt-4 flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            size="icon-lg"
            className="size-9"
            onClick={() => scrollByCard(-1)}
            disabled={atStart}
            aria-label="Previous reviews"
          >
            <ChevronLeft aria-hidden />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon-lg"
            className="size-9"
            onClick={() => scrollByCard(1)}
            disabled={atEnd}
            aria-label="Next reviews"
          >
            <ChevronRight aria-hidden />
          </Button>
        </div>
      )}
    </div>
  )
}
