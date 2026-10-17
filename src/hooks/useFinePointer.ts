"use client"

import { useSyncExternalStore } from "react"

const QUERY = "(hover: hover) and (pointer: fine)"

function subscribe(onChange: () => void) {
  const media = window.matchMedia(QUERY)
  media.addEventListener("change", onChange)
  return () => media.removeEventListener("change", onChange)
}

/**
 * True for a mouse or trackpad. Pointer-following effects (tilt, magnetic
 * buttons) are off on touch screens, where they'd only get in the way.
 * Always false during server rendering.
 */
export function useFinePointer() {
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(QUERY).matches,
    () => false
  )
}
