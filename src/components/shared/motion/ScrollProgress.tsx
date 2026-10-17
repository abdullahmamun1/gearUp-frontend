"use client"

import { motion, useScroll, useSpring } from "motion/react"

/** A thin bar showing how far down the page the reader is. */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 200,
    damping: 30,
    restDelta: 0.001,
  })

  return (
    <motion.div
      aria-hidden
      className="pointer-events-none absolute inset-x-0 bottom-0 h-0.5 origin-left bg-(image:--gradient-brand)"
      style={{ scaleX }}
    />
  )
}
