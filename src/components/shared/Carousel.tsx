"use client"

import { Children, useCallback, useEffect, useState } from "react"
import useEmblaCarousel from "embla-carousel-react"
import Autoplay from "embla-carousel-autoplay"
import { useReducedMotion } from "motion/react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useTranslations } from "@/i18n/translations"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

/**
 * Embla-powered slider: drag or swipe, arrow buttons, optional dots and
 * autoplay. Autoplay stops for good once the visitor interacts, pauses on
 * hover, and never runs with reduced motion.
 *
 * Each child is one slide; size slides with `slideClassName`
 * (e.g. "basis-full sm:basis-1/2 lg:basis-1/3").
 */
export function Carousel({
  children,
  label,
  options,
  autoplay = false,
  autoplayDelay = 5000,
  dots = false,
  arrows = true,
  slideClassName,
  className,
}: {
  children: React.ReactNode
  /** Accessible name, e.g. "Renter reviews". */
  label: string
  options?: Parameters<typeof useEmblaCarousel>[0]
  autoplay?: boolean
  autoplayDelay?: number
  dots?: boolean
  arrows?: boolean
  slideClassName?: string
  className?: string
}) {
  const t = useTranslations("common")
  const reduced = useReducedMotion()
  const [plugins] = useState(() =>
    autoplay
      ? [
          Autoplay({
            delay: autoplayDelay,
            stopOnInteraction: true,
            stopOnMouseEnter: true,
            stopOnFocusIn: true,
          }),
        ]
      : []
  )
  const [viewportRef, api] = useEmblaCarousel(
    { align: "start", containScroll: "trimSnaps", ...options },
    plugins
  )
  const [selected, setSelected] = useState(0)
  const [snaps, setSnaps] = useState<number[]>([])
  const [canPrev, setCanPrev] = useState(false)
  const [canNext, setCanNext] = useState(false)

  const sync = useCallback(() => {
    if (!api) return
    setSelected(api.selectedScrollSnap())
    setSnaps(api.scrollSnapList())
    setCanPrev(api.canScrollPrev())
    setCanNext(api.canScrollNext())
  }, [api])

  useEffect(() => {
    if (!api) return
    // First read on the next frame, once Embla has measured the slides.
    const frame = requestAnimationFrame(sync)
    api.on("select", sync).on("reInit", sync)
    return () => {
      cancelAnimationFrame(frame)
      api.off("select", sync).off("reInit", sync)
    }
  }, [api, sync])

  // Reduced motion: stop autoplay as soon as Embla is ready.
  useEffect(() => {
    if (reduced) api?.plugins().autoplay?.stop()
  }, [api, reduced])

  const slides = Children.toArray(children)
  const scrollable = snaps.length > 1

  return (
    <div
      role="region"
      aria-roledescription="carousel"
      aria-label={label}
      className={cn("relative", className)}
      onKeyDown={(event) => {
        if (event.key === "ArrowLeft") api?.scrollPrev()
        if (event.key === "ArrowRight") api?.scrollNext()
      }}
    >
      {/* Vertical padding so hover lifts and shadows aren't clipped. */}
      <div ref={viewportRef} className="-my-4 overflow-hidden py-4">
        <div className="-ml-5 flex touch-pan-y">
          {slides.map((slide, index) => (
            <div
              key={index}
              role="group"
              aria-roledescription="slide"
              aria-label={t("carousel.slide", {
                index: index + 1,
                total: slides.length,
              })}
              className={cn("min-w-0 shrink-0 grow-0 pl-5", slideClassName)}
            >
              {slide}
            </div>
          ))}
        </div>
      </div>

      {scrollable && (arrows || dots) && (
        <div className="mt-5 flex items-center justify-between gap-4">
          {dots ? (
            <div
              className="flex flex-wrap gap-1.5"
              role="tablist"
              aria-label={t("carousel.pages", { label })}
            >
              {snaps.map((_, index) => (
                <button
                  key={index}
                  type="button"
                  role="tab"
                  aria-selected={index === selected}
                  aria-label={t("carousel.goTo", { index: index + 1 })}
                  onClick={() => api?.scrollTo(index)}
                  className={cn(
                    "h-1.5 cursor-pointer rounded-full transition-all duration-300 outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    index === selected
                      ? "w-6 bg-primary"
                      : "w-1.5 bg-foreground/20 hover:bg-foreground/40"
                  )}
                />
              ))}
            </div>
          ) : (
            <span />
          )}

          {arrows && (
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="icon-lg"
                className="size-9 rounded-full"
                onClick={() => api?.scrollPrev()}
                disabled={!canPrev}
                aria-label={t("actions.previous")}
              >
                <ChevronLeft aria-hidden />
              </Button>
              <Button
                type="button"
                variant="outline"
                size="icon-lg"
                className="size-9 rounded-full"
                onClick={() => api?.scrollNext()}
                disabled={!canNext}
                aria-label={t("actions.next")}
              >
                <ChevronRight aria-hidden />
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
