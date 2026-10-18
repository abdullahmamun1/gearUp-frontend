"use client"

import { useRef } from "react"
import { motion, useReducedMotion, useScroll, useSpring } from "motion/react"

import { useFormat } from "@/i18n/useFormat"

/**
 * A line draws itself across (or down, on phones) the steps as the section
 * scrolls through the viewport. With reduced motion the line is simply full.
 * The steps themselves are server-rendered and always visible.
 */
export function HowItWorksTimeline({
  steps,
}: {
  steps: { title: string; body: string; scene: React.ReactNode }[]
}) {
  const ref = useRef<HTMLOListElement>(null)
  const format = useFormat()
  const reduced = useReducedMotion()
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 85%", "end 55%"],
  })
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 30 })
  const scale = reduced ? 1 : progress

  return (
    <ol ref={ref} className="relative grid gap-10 md:grid-cols-3 md:gap-8">
      {/* track + drawn line: vertical on phones, horizontal from md */}
      <div
        aria-hidden
        className="absolute top-0 bottom-0 left-6 w-0.5 rounded-full bg-border md:top-6 md:right-[16.6%] md:bottom-auto md:left-[16.6%] md:h-0.5 md:w-auto"
      >
        <motion.div
          className="h-full w-full origin-top rounded-full bg-(image:--gradient-brand) md:hidden"
          style={{ scaleY: scale }}
        />
        <motion.div
          className="hidden h-full w-full origin-left rounded-full bg-(image:--gradient-brand) md:block"
          style={{ scaleX: scale }}
        />
      </div>

      {steps.map((step, index) => (
        <li
          key={step.title}
          className="reveal relative pl-16 md:pl-0 md:text-center"
        >
          <span className="absolute top-0 left-0 grid size-12 place-items-center rounded-full border-4 border-background bg-primary font-heading text-lg font-bold text-primary-foreground shadow-glow-primary md:relative md:mx-auto">
            {format.number(index + 1)}
          </span>
          <div className="mx-auto max-w-[15rem] md:mt-6">{step.scene}</div>
          <h3 className="mt-4 text-h3">{step.title}</h3>
          <p className="mx-auto mt-2 max-w-xs text-sm text-pretty text-muted-foreground">
            {step.body}
          </p>
        </li>
      ))}
    </ol>
  )
}
