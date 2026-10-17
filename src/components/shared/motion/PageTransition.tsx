"use client"

import { usePathname } from "next/navigation"
import { ViewTransition } from "react"

/**
 * Page enter/exit animation, driven by the browser's View Transitions API.
 * Keyed by pathname, so every page change (but not a filter or query-string
 * change) remounts it and plays the transition.
 *
 * Links tagged `transitionTypes={["nav-forward"]}` (deeper) or
 * `["nav-back"]` slide; every other navigation is a quick crossfade.
 * Browsers without support simply swap pages. CSS lives in globals.css.
 */
const BY_TYPE = {
  "nav-forward": "nav-forward",
  "nav-back": "nav-back",
  default: "page",
}

export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <ViewTransition
      key={pathname}
      enter={BY_TYPE}
      exit={BY_TYPE}
      default="none"
    >
      {children}
    </ViewTransition>
  )
}
