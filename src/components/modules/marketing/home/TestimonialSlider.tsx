"use client"

import { Quote } from "lucide-react"

import type { Testimonial } from "@/api/reviews"
import { Carousel } from "@/components/shared/Carousel"
import { Stars } from "@/components/shared/Stars"
import { formatDate } from "@/utils/format"

export function TestimonialSlider({
  reviews,
  className,
}: {
  reviews: Testimonial[]
  className?: string
}) {
  return (
    <Carousel
      label="Renter reviews"
      className={className}
      options={{ loop: reviews.length > 3 }}
      autoplay
      autoplayDelay={6000}
      dots
      slideClassName="basis-[85%] sm:basis-1/2 lg:basis-1/3"
    >
      {reviews.map((review) => (
        <figure
          key={review.id}
          className="flex h-full flex-col rounded-xl border bg-card p-5 shadow-xs"
        >
          <Quote className="size-5 text-primary/40" aria-hidden />

          <blockquote className="mt-3 flex-1 text-sm leading-relaxed text-pretty">
            {review.comment}
          </blockquote>

          <Stars rating={review.rating} className="mt-4" />

          <figcaption className="mt-2">
            <p className="text-sm font-medium">
              {review.customer?.name ?? "A renter"}
            </p>
            <p className="text-xs text-muted-foreground">
              Rented {review.gearName}
              {review.createdAt && ` · ${formatDate(review.createdAt)}`}
            </p>
          </figcaption>
        </figure>
      ))}
    </Carousel>
  )
}
