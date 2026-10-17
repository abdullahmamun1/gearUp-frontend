import { cn } from "@/lib/utils"

/**
 * An endless horizontal strip. CSS only: the items render twice and the
 * track slides by half its width, then loops. Pauses on hover and focus,
 * and wraps into a static row when the visitor prefers reduced motion.
 */
export function Marquee({
  children,
  label,
  speed = 40,
  className,
}: {
  children: React.ReactNode
  /** Accessible name for the list, e.g. "Brands on GearUp". */
  label: string
  /** Seconds per loop. */
  speed?: number
  className?: string
}) {
  return (
    <div
      role="region"
      aria-label={label}
      className={cn("marquee group relative overflow-hidden", className)}
      style={{ "--marquee-duration": `${speed}s` } as React.CSSProperties}
    >
      <div className="marquee-track flex w-max gap-10">
        <div className="flex shrink-0 items-center gap-10">{children}</div>
        <div aria-hidden className="flex shrink-0 items-center gap-10">
          {children}
        </div>
      </div>
    </div>
  )
}
