"use client"

import { useRef } from "react"

import { cn } from "@/lib/utils"

/**
 * A soft highlight follows the cursor across the card and its border. It
 * only updates two CSS variables, so there is no React re-render per move.
 */
export function SpotlightCard({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  const ref = useRef<HTMLDivElement>(null)

  return (
    <div
      ref={ref}
      onPointerMove={(event) => {
        const node = ref.current
        if (!node || event.pointerType !== "mouse") return
        const rect = node.getBoundingClientRect()
        node.style.setProperty("--spot-x", `${event.clientX - rect.left}px`)
        node.style.setProperty("--spot-y", `${event.clientY - rect.top}px`)
      }}
      className={cn("spotlight relative", className)}
    >
      {children}
    </div>
  )
}
