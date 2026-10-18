"use client"

import { useEffect, useState } from "react"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"
import { useTranslations } from "@/i18n/translations"

import { Button } from "@/components/ui/button"
import { DURATION, EASE } from "@/constants/motion"
import { useFormat } from "@/i18n/useFormat"

/**
 * Phones only: once the rent panel scrolls out of view, a bar with the price
 * and a "Rent now" button slides up from the bottom. Tapping it scrolls back
 * to the panel, which handles dates, login and payment.
 */
export function StickyRentBar({
  targetId,
  pricePerDay,
}: {
  targetId: string
  pricePerDay: string
}) {
  const t = useTranslations("gear.rent")
  const tCommon = useTranslations("common")
  const format = useFormat()
  const [visible, setVisible] = useState(false)
  const reduced = useReducedMotion()

  useEffect(() => {
    const target = document.getElementById(targetId)
    if (!target) return
    const observer = new IntersectionObserver(([entry]) =>
      // Show only after the panel has scrolled off the top, not before it.
      setVisible(!entry!.isIntersecting && entry!.boundingClientRect.top < 0)
    )
    observer.observe(target)
    return () => observer.disconnect()
  }, [targetId])

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-x-0 bottom-0 z-40 border-t glass px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] lg:hidden"
          initial={reduced ? { opacity: 0 } : { y: "100%" }}
          animate={reduced ? { opacity: 1 } : { y: 0 }}
          exit={reduced ? { opacity: 0 } : { y: "100%" }}
          transition={{ duration: DURATION.base, ease: EASE.out }}
        >
          <div className="mx-auto flex max-w-md items-center justify-between gap-4">
            <p className="text-lg font-semibold">
              {format.price(pricePerDay)}
              <span className="text-sm font-normal text-muted-foreground">
                {" "}
                {tCommon("units.perDay")}
              </span>
            </p>
            <Button
              type="button"
              variant="cta"
              size="lg"
              className="h-11 px-6 text-sm"
              onClick={() =>
                document.getElementById(targetId)?.scrollIntoView({
                  behavior: reduced ? "auto" : "smooth",
                  block: "center",
                })
              }
            >
              {t("rentNow")}
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
