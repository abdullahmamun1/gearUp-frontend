"use client"

import { useRef, useState } from "react"
import { useMotionValueEvent, useScroll } from "motion/react"

import { ScrollProgress } from "@/components/shared/motion/ScrollProgress"
import { cn } from "@/lib/utils"

/**
 * The header frame. It is `fixed` with a spacer of constant height, so
 * shrinking from 80px to 64px on scroll never pushes the page around (no
 * layout shift). On phones it slides away while scrolling down and returns
 * on the way up.
 */
export function NavbarShell({ children }: { children: React.ReactNode }) {
  const { scrollY } = useScroll()
  const last = useRef(0)
  const [scrolled, setScrolled] = useState(false)
  const [hidden, setHidden] = useState(false)

  useMotionValueEvent(scrollY, "change", (y) => {
    const delta = y - last.current
    last.current = y
    setScrolled(y > 8)

    const phone = window.matchMedia("(max-width: 767px)").matches
    if (!phone || y < 120) {
      setHidden(false)
    } else if (delta > 6) {
      setHidden(true)
    } else if (delta < -6) {
      setHidden(false)
    }
  })

  return (
    <>
      <div aria-hidden className="h-20" />
      <header
        data-scrolled={scrolled}
        style={{ viewTransitionName: "site-header" }}
        className={cn(
          "group/nav fixed inset-x-0 top-0 z-50 border-b transition-[translate,background-color,border-color,box-shadow] duration-300 ease-(--ease-out-soft) motion-reduce:transition-none",
          scrolled
            ? "glass border-border shadow-sm"
            : "border-transparent bg-background/70 backdrop-blur-md",
          hidden && "-translate-y-full"
        )}
      >
        {children}
        <ScrollProgress />
      </header>
    </>
  )
}
