/**
 * One source for motion timing. Animate transform and opacity only, and
 * check `useReducedMotion()` (motion/react) before anything that moves.
 */
export const EASE = {
  /** Fast start, soft landing: entrances, hovers. */
  out: [0.22, 1, 0.36, 1],
  /** Symmetric: things that move from A to B. */
  inOut: [0.65, 0, 0.35, 1],
} as const

/** Seconds. */
export const DURATION = {
  fast: 0.15,
  base: 0.25,
  slow: 0.45,
  slower: 0.7,
} as const

export const SPRING = {
  gentle: { type: "spring", stiffness: 170, damping: 26 },
  snappy: { type: "spring", stiffness: 400, damping: 30 },
  /** Pointer-following effects (magnetic buttons, tilt). */
  follow: { stiffness: 220, damping: 18, mass: 0.4 },
} as const

/** Seconds between siblings in a staggered entrance. */
export const STAGGER = 0.06
