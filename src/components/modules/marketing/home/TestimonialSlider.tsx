"use client"

import { Quote } from "lucide-react"
import { useTranslations } from "@/i18n/translations"

import type { Testimonial } from "@/api/reviews"
import { Carousel } from "@/components/shared/Carousel"
import { Stars } from "@/components/shared/Stars"
import { useFormat } from "@/i18n/useFormat"

export function TestimonialSlider({
  reviews,
  className,
}: {
  reviews: Testimonial[]
  className?: string
}) {
  const t = useTranslations("home.testimonials")
  const format = useFormat()

  return (
    <Carousel
      label={t("carouselLabel")}
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
          className="flex h-full flex-col rounded-2xl border bg-card p-5 shadow-xs"
        >
          <Quote className="size-5 text-primary/40" aria-hidden />

          <blockquote className="mt-3 flex-1 text-sm leading-relaxed text-pretty">
            {review.comment}
          </blockquote>

          <Stars rating={review.rating} className="mt-4" />

          <figcaption className="mt-2">
            <p className="text-sm font-medium">
              {review.customer?.name ?? t("anonymous")}
            </p>
            <p className="text-xs text-muted-foreground">
              {t("rented", { gear: review.gearName })}
              {review.createdAt && ` · ${format.date(review.createdAt)}`}
            </p>
          </figcaption>
        </figure>
      ))}
    </Carousel>
  )
}
