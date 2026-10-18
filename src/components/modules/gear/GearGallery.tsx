"use client"

import Image from "next/image"
import { useCallback, useEffect, useState, ViewTransition } from "react"
import useEmblaCarousel from "embla-carousel-react"
import { Backpack, ChevronLeft, ChevronRight, Expand, X } from "lucide-react"
import { useTranslations } from "@/i18n/translations"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { gearImageTransition } from "@/utils/viewTransitions"

/**
 * Swipeable photos with a synced thumbnail strip and a full-screen lightbox.
 * The main viewport shares its view-transition name with the gear card, so
 * the card photo morphs into it when opening the page.
 */
export function GearGallery({
  gearId,
  images,
  name,
  outOfStock,
}: {
  gearId: string
  images: string[]
  name: string
  outOfStock: boolean
}) {
  const t = useTranslations("gear.gallery")
  const [mainRef, main] = useEmblaCarousel({ loop: images.length > 1 })
  const [thumbsRef, thumbs] = useEmblaCarousel({
    containScroll: "keepSnaps",
    dragFree: true,
  })
  const [selected, setSelected] = useState(0)
  const [lightbox, setLightbox] = useState(false)

  const onSelect = useCallback(() => {
    if (!main) return
    const index = main.selectedScrollSnap()
    setSelected(index)
    thumbs?.scrollTo(index)
  }, [main, thumbs])

  useEffect(() => {
    if (!main) return
    main.on("select", onSelect).on("reInit", onSelect)
    return () => {
      main.off("select", onSelect).off("reInit", onSelect)
    }
  }, [main, onSelect])

  const alt = (index: number) =>
    images.length > 1
      ? t("photoAlt", { name, index: index + 1, total: images.length })
      : name

  return (
    <div className="grid gap-3">
      <ViewTransition name={gearImageTransition(gearId)} share="morph">
        <div
          role="region"
          aria-roledescription="carousel"
          aria-label={t("photos", { name })}
          className="group relative aspect-4/3 overflow-hidden rounded-2xl border bg-muted shadow-xs"
          onKeyDown={(event) => {
            if (event.key === "ArrowLeft") main?.scrollPrev()
            if (event.key === "ArrowRight") main?.scrollNext()
          }}
        >
          {images.length === 0 ? (
            <Placeholder />
          ) : (
            <div ref={mainRef} className="h-full overflow-hidden">
              <div className="flex h-full touch-pan-y">
                {images.map((image, index) => (
                  <div
                    key={image}
                    role="group"
                    aria-roledescription="slide"
                    aria-label={t("slide", {
                      index: index + 1,
                      total: images.length,
                    })}
                    className="relative h-full min-w-0 shrink-0 grow-0 basis-full"
                  >
                    <Image
                      src={image}
                      alt={alt(index)}
                      fill
                      loading={index === 0 ? "eager" : "lazy"}
                      fetchPriority={index === 0 ? "high" : "auto"}
                      sizes="(min-width: 1024px) 55vw, 100vw"
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {images.length > 1 && (
            <>
              <GalleryArrow side="left" onClick={() => main?.scrollPrev()} />
              <GalleryArrow side="right" onClick={() => main?.scrollNext()} />
            </>
          )}

          {images.length > 0 && (
            <Button
              type="button"
              variant="glass"
              size="icon-lg"
              className="absolute right-3 bottom-3 size-9 rounded-full"
              onClick={() => setLightbox(true)}
              aria-label={t("fullScreen")}
            >
              <Expand aria-hidden />
            </Button>
          )}

          {outOfStock && (
            <div className="absolute inset-0 grid place-items-center bg-background/70">
              <Badge variant="secondary">{t("unavailable")}</Badge>
            </div>
          )}
        </div>
      </ViewTransition>

      {images.length > 1 && (
        <div ref={thumbsRef} className="overflow-hidden px-0.5 py-1">
          <div className="flex gap-2.5">
            {images.map((image, index) => (
              <button
                key={image}
                type="button"
                onClick={() => main?.scrollTo(index)}
                aria-label={t("showPhoto", {
                  index: index + 1,
                  total: images.length,
                })}
                aria-current={index === selected}
                className={cn(
                  "relative size-16 shrink-0 cursor-pointer overflow-hidden rounded-lg ring-1 transition-all outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  index === selected
                    ? "ring-2 ring-primary"
                    : "opacity-60 ring-border/80 hover:opacity-100 hover:ring-foreground/40"
                )}
              >
                <Image
                  src={image}
                  alt=""
                  fill
                  sizes="64px"
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        </div>
      )}

      <Lightbox
        open={lightbox}
        onOpenChange={setLightbox}
        images={images}
        start={selected}
        alt={alt}
        name={name}
        onIndexChange={(index) => main?.scrollTo(index, true)}
      />
    </div>
  )
}

function GalleryArrow({
  side,
  onClick,
}: {
  side: "left" | "right"
  onClick: () => void
}) {
  const t = useTranslations("gear.gallery")
  const Icon = side === "left" ? ChevronLeft : ChevronRight
  return (
    <Button
      type="button"
      variant="glass"
      size="icon-lg"
      onClick={onClick}
      aria-label={side === "left" ? t("previous") : t("next")}
      className={cn(
        "absolute top-1/2 size-9 -translate-y-1/2 rounded-full opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100 max-md:opacity-100",
        side === "left" ? "left-3" : "right-3"
      )}
    >
      <Icon aria-hidden />
    </Button>
  )
}

/**
 * Full-screen photos. Swipe or use the arrow keys; pinch-zoom is left to the
 * browser (`touch-action: pinch-zoom`), which handles it better than any JS.
 */
function Lightbox({
  open,
  onOpenChange,
  images,
  start,
  alt,
  name,
  onIndexChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  images: string[]
  start: number
  alt: (index: number) => string
  name: string
  onIndexChange: (index: number) => void
}) {
  const t = useTranslations("gear.gallery")
  const [ref, api] = useEmblaCarousel({
    loop: images.length > 1,
    startIndex: start,
  })
  const [selected, setSelected] = useState(start)

  useEffect(() => {
    if (!api) return
    const sync = () => {
      const index = api.selectedScrollSnap()
      setSelected(index)
      onIndexChange(index)
    }
    api.on("select", sync)
    return () => {
      api.off("select", sync)
    }
  }, [api, onIndexChange])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="grid h-dvh max-h-none w-screen max-w-none! gap-0 rounded-none bg-black/95 p-0 text-white ring-0 sm:max-w-none"
        onKeyDown={(event) => {
          if (event.key === "ArrowLeft") api?.scrollPrev()
          if (event.key === "ArrowRight") api?.scrollNext()
        }}
      >
        <DialogTitle className="sr-only">{t("photos", { name })}</DialogTitle>
        <div ref={ref} className="h-full overflow-hidden">
          <div className="flex h-full">
            {images.map((image, index) => (
              <div
                key={image}
                className="relative h-full min-w-0 shrink-0 grow-0 basis-full touch-pinch-zoom"
              >
                <Image
                  src={image}
                  alt={alt(index)}
                  fill
                  sizes="100vw"
                  className="object-contain"
                />
              </div>
            ))}
          </div>
        </div>

        <p className="absolute top-4 left-4 rounded-full bg-white/10 px-3 py-1 font-mono text-xs tabular-nums">
          {t("counter", { index: selected + 1, total: images.length })}
        </p>
        <DialogClose
          render={
            <Button
              type="button"
              variant="ghost"
              size="icon-lg"
              className="absolute top-3 right-3 size-10 rounded-full text-white hover:bg-white/10 hover:text-white"
              aria-label={t("close")}
            />
          }
        >
          <X aria-hidden />
        </DialogClose>
        {images.length > 1 && (
          <>
            <Button
              type="button"
              variant="ghost"
              size="icon-lg"
              onClick={() => api?.scrollPrev()}
              aria-label={t("previous")}
              className="absolute top-1/2 left-3 size-11 -translate-y-1/2 rounded-full text-white hover:bg-white/10 hover:text-white"
            >
              <ChevronLeft aria-hidden />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon-lg"
              onClick={() => api?.scrollNext()}
              aria-label={t("next")}
              className="absolute top-1/2 right-3 size-11 -translate-y-1/2 rounded-full text-white hover:bg-white/10 hover:text-white"
            >
              <ChevronRight aria-hidden />
            </Button>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}

function Placeholder() {
  return (
    <div className="absolute inset-0 grid place-items-center bg-linear-to-br from-primary/12 via-transparent to-primary/4">
      <Backpack
        className="size-14 text-primary/30"
        strokeWidth={1.25}
        aria-hidden
      />
    </div>
  )
}
