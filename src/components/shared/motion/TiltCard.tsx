"use client"

import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "motion/react"

import { SPRING } from "@/constants/motion"
import { useFinePointer } from "@/hooks/useFinePointer"
import { cn } from "@/lib/utils"

/**
 * Tilts toward the pointer in 3D with a soft glare. Mouse and trackpad only;
 * on touch screens or with reduced motion it renders a plain card.
 */
export function TiltCard({
  children,
  className,
  maxTilt = 8,
}: {
  children: React.ReactNode
  className?: string
  /** Degrees. */
  maxTilt?: number
}) {
  const fine = useFinePointer()
  const reduced = useReducedMotion()
  const px = useMotionValue(0.5)
  const py = useMotionValue(0.5)
  const rotateX = useSpring(
    useTransform(py, [0, 1], [maxTilt, -maxTilt]),
    SPRING.follow
  )
  const rotateY = useSpring(
    useTransform(px, [0, 1], [-maxTilt, maxTilt]),
    SPRING.follow
  )
  const glareX = useTransform(px, (v) => `${v * 100}%`)
  const glareY = useTransform(py, (v) => `${v * 100}%`)
  const glareOpacity = useSpring(0, SPRING.follow)
  const glare = useMotionTemplate`radial-gradient(circle at ${glareX} ${glareY}, color-mix(in oklch, white 22%, transparent), transparent 55%)`

  if (!fine || reduced) {
    return <div className={className}>{children}</div>
  }

  return (
    <motion.div
      className={cn("relative transform-3d", className)}
      style={{ rotateX, rotateY, transformPerspective: 900 }}
      onPointerMove={(event) => {
        const rect = event.currentTarget.getBoundingClientRect()
        px.set((event.clientX - rect.left) / rect.width)
        py.set((event.clientY - rect.top) / rect.height)
      }}
      onPointerEnter={() => glareOpacity.set(1)}
      onPointerLeave={() => {
        px.set(0.5)
        py.set(0.5)
        glareOpacity.set(0)
      }}
    >
      {children}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-[inherit]"
        style={{ background: glare, opacity: glareOpacity }}
      />
    </motion.div>
  )
}
