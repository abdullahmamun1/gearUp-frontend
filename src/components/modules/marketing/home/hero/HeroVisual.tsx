"use client"

import dynamic from "next/dynamic"
import { useEffect, useRef, useState } from "react"
import { useReducedMotion } from "motion/react"
import { useTheme } from "next-themes"

import { IslandScene } from "@/components/shared/illustrations/scenes"
import { cn } from "@/lib/utils"

// three.js (~150 KB gzipped) loads only when the 3D scene is actually used.
const IslandCanvas = dynamic(() => import("./IslandCanvas"), { ssr: false })

/** WebGL, a wide screen, motion allowed, enough memory and no data saver. */
function canUse3D() {
  if (!window.matchMedia("(min-width: 1024px)").matches) return false
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches)
    return false
  const nav = navigator as Navigator & {
    connection?: { saveData?: boolean }
    deviceMemory?: number
  }
  if (nav.connection?.saveData) return false
  if ((nav.deviceMemory ?? 8) < 4) return false
  try {
    const canvas = document.createElement("canvas")
    return Boolean(canvas.getContext("webgl2") ?? canvas.getContext("webgl"))
  } catch {
    return false
  }
}

/**
 * The hero image.
 *
 * - Phones and tablets get the flat island, prerendered so it paints at once.
 * - Desktops never flash the flat island and then swap it for a different
 *   looking 3D one: they show a soft glow while three.js loads (after idle),
 *   then the 3D island fades and scales in once. The headline stays the LCP.
 * - Desktops that can't run it (no WebGL, reduced motion, Save-Data, low
 *   memory) fade the flat island in instead.
 *
 * The canvas pauses while scrolled out of view.
 */
export function HeroVisual({ className }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion() ?? false
  const { resolvedTheme } = useTheme()
  const [mode, setMode] = useState<"pending" | "3d" | "flat">("pending")
  const [ready, setReady] = useState(false)
  const [active, setActive] = useState(true)

  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 1024px)").matches
    const decide = () => setMode(canUse3D() ? "3d" : "flat")
    // Wait for an idle moment, but no longer than 2 s: the hero's own
    // animations can keep the browser from reporting one for a long time.
    // Phones decide at once; they only ever show the flat island.
    if (!desktop) {
      const frame = requestAnimationFrame(decide)
      return () => cancelAnimationFrame(frame)
    }
    if ("requestIdleCallback" in window) {
      const handle = window.requestIdleCallback(decide, { timeout: 2000 })
      return () => window.cancelIdleCallback(handle)
    }
    // Safari before 17.4 has no requestIdleCallback.
    const timer = setTimeout(decide, 800)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    const node = ref.current
    if (!node || mode !== "3d") return
    const observer = new IntersectionObserver(([entry]) =>
      setActive(entry!.isIntersecting)
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [mode])

  return (
    <div
      ref={ref}
      className={cn("relative aspect-10/9", className)}
      aria-hidden
    >
      {/* Ambient glow: the desktop placeholder, and a soft halo behind the
          3D island once it is in. */}
      <div className="absolute inset-[12%] hidden rounded-full bg-[radial-gradient(closest-side,var(--color-primary)_0%,transparent_100%)] opacity-15 blur-2xl lg:block dark:opacity-25" />
      <div
        className={cn(
          "absolute inset-x-[22%] bottom-[22%] hidden h-[10%] rounded-[50%] bg-lagoon/25 blur-xl lg:block",
          !ready && "motion-safe:animate-pulse"
        )}
      />

      <IslandScene
        className={cn(
          "absolute inset-0 h-full w-full transition-opacity duration-700",
          mode === "flat" ? "lg:opacity-100" : "lg:opacity-0",
          mode === "3d" && "lg:hidden"
        )}
      />
      {mode === "3d" && (
        <div
          className={cn(
            "absolute inset-0 transition-[opacity,scale] duration-1000 ease-out",
            ready ? "scale-100 opacity-100" : "scale-95 opacity-0"
          )}
        >
          <IslandCanvas
            theme={resolvedTheme === "dark" ? "dark" : "light"}
            active={active}
            animate={!reduced}
            onReady={() => setReady(true)}
          />
        </div>
      )}
    </div>
  )
}
