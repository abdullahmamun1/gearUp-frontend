"use client"

import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from "motion/react"

import { SPRING } from "@/constants/motion"
import { useFinePointer } from "@/hooks/useFinePointer"

/**
 * Pulls its child a few pixels toward the cursor. Wrap a primary CTA with it.
 * Mouse and trackpad only, and off with reduced motion.
 */
export function Magnetic({
  children,
  strength = 0.25,
  className,
}: {
  children: React.ReactNode
  /** Share of the cursor's offset to follow (0–1). */
  strength?: number
  className?: string
}) {
  const fine = useFinePointer()
  const reduced = useReducedMotion()
  const x = useSpring(useMotionValue(0), SPRING.follow)
  const y = useSpring(useMotionValue(0), SPRING.follow)

  if (!fine || reduced) {
    return <span className={className ?? "inline-flex"}>{children}</span>
  }

  return (
    <motion.span
      className={className ?? "inline-flex"}
      style={{ x, y }}
      onPointerMove={(event) => {
        const rect = event.currentTarget.getBoundingClientRect()
        x.set((event.clientX - rect.left - rect.width / 2) * strength)
        y.set((event.clientY - rect.top - rect.height / 2) * strength)
      }}
      onPointerLeave={() => {
        x.set(0)
        y.set(0)
      }}
    >
      {children}
    </motion.span>
  )
}
