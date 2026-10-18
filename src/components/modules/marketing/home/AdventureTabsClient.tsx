"use client"

import { Link } from "@/i18n/navigation"
import { useState } from "react"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"
import { ArrowRight } from "lucide-react"

import { GearCard } from "@/components/shared/GearCard"
import { CategoryScene } from "@/components/shared/illustrations/scenes"
import { DURATION, EASE } from "@/constants/motion"
import { cn } from "@/lib/utils"
import type { GearItem } from "@/types"

export type Adventure = {
  id: string
  name: string
  pitch: string
  /** "See all camping" link text, already translated. */
  seeAll: string
  gear: GearItem[]
}

/**
 * Tabs with a sliding underline (motion layoutId) and a soft crossfade
 * between panels. Arrow keys move between tabs (WAI-ARIA tabs pattern).
 */
export function AdventureTabsClient({
  adventures,
  label,
}: {
  adventures: Adventure[]
  /** The tab list's accessible name. */
  label: string
}) {
  const [active, setActive] = useState(adventures[0]!.id)
  const reduced = useReducedMotion()
  const current = adventures.find((adventure) => adventure.id === active)!

  function onKeyDown(event: React.KeyboardEvent) {
    const index = adventures.findIndex((adventure) => adventure.id === active)
    const step =
      event.key === "ArrowRight" ? 1 : event.key === "ArrowLeft" ? -1 : 0
    if (!step) return
    event.preventDefault()
    const next =
      adventures[(index + step + adventures.length) % adventures.length]!
    setActive(next.id)
    document.getElementById(`adventure-tab-${next.id}`)?.focus()
  }

  return (
    <div>
      <div
        role="tablist"
        aria-label={label}
        onKeyDown={onKeyDown}
        className="flex [scrollbar-width:none] gap-1 overflow-x-auto border-b"
      >
        {adventures.map((adventure) => {
          const selected = adventure.id === active
          return (
            <button
              key={adventure.id}
              id={`adventure-tab-${adventure.id}`}
              type="button"
              role="tab"
              aria-selected={selected}
              aria-controls="adventure-panel"
              tabIndex={selected ? 0 : -1}
              onClick={() => setActive(adventure.id)}
              className={cn(
                "relative shrink-0 cursor-pointer px-4 pt-2 pb-3 text-[15px] font-medium whitespace-nowrap transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring",
                selected
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {adventure.name}
              {selected && (
                <motion.span
                  layoutId="adventure-underline"
                  className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-(image:--gradient-brand)"
                  transition={{ type: "spring", stiffness: 420, damping: 34 }}
                />
              )}
            </button>
          )
        })}
      </div>

      <div
        id="adventure-panel"
        role="tabpanel"
        aria-labelledby={`adventure-tab-${active}`}
        className="mt-8"
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={active}
            initial={reduced ? { opacity: 0 } : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, y: -8 }}
            transition={{ duration: DURATION.base, ease: EASE.out }}
            className="grid gap-6 lg:grid-cols-[1fr_2.4fr]"
          >
            <div className="flex flex-col rounded-2xl border bg-linear-to-br from-primary/10 to-lagoon/5 p-6 shadow-xs">
              <CategoryScene name={current.name} className="w-full max-w-xs" />
              <h3 className="mt-4 text-h3">{current.name}</h3>
              <p className="mt-2 text-sm text-pretty text-muted-foreground">
                {current.pitch}
              </p>
              <Link
                href={`/gear?category=${current.id}`}
                className="group mt-auto inline-flex items-center gap-1 pt-5 text-sm font-semibold text-primary"
              >
                {current.seeAll}
                <ArrowRight
                  className="size-4 transition-transform group-hover:translate-x-0.5"
                  aria-hidden
                />
              </Link>
            </div>
            <div className="grid gap-5 sm:grid-cols-3">
              {current.gear.map((gear) => (
                <GearCard key={gear.id} gear={gear} morph={false} />
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
