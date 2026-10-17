"use client"

import { useEffect, useRef } from "react"
import { animate, useReducedMotion } from "motion/react"

import { EASE } from "@/constants/motion"

/**
 * Counts up to `value` when it scrolls into view. The server renders the
 * final number, and a counter that is already on screen at load stays put,
 * so nothing flashes or shifts.
 */
export function AnimatedCounter({
  value,
  format = (n) => Math.round(n).toLocaleString("en-US"),
  duration = 1.2,
  className,
}: {
  value: number
  format?: (n: number) => string
  duration?: number
  className?: string
}) {
  const ref = useRef<HTMLSpanElement>(null)
  const reduced = useReducedMotion()

  useEffect(() => {
    const node = ref.current
    if (!node || reduced) return

    const rect = node.getBoundingClientRect()
    const visibleAtLoad = rect.top < window.innerHeight && rect.bottom > 0
    if (visibleAtLoad) return

    let controls: ReturnType<typeof animate> | undefined
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return
        observer.disconnect()
        controls = animate(0, value, {
          duration,
          ease: EASE.out,
          onUpdate: (latest) => {
            node.textContent = format(latest)
          },
        })
      },
      { threshold: 0.6 }
    )
    observer.observe(node)
    return () => {
      observer.disconnect()
      controls?.stop()
      node.textContent = format(value)
    }
  }, [value, duration, format, reduced])

  return (
    <span ref={ref} className={className}>
      {format(value)}
    </span>
  )
}
