import { cn } from "@/lib/utils"

/**
 * Frame for GearUp's in-house illustrations: flat, geometric scenes drawn
 * with the theme tokens (fill-primary, fill-ember, fill-lagoon…), so they
 * recolour themselves in dark mode. Decorative: hidden from screen readers.
 */
export function Illustration({
  className,
  children,
}: {
  className?: string
  children: React.ReactNode
}) {
  return (
    <svg
      viewBox="0 0 240 160"
      fill="none"
      aria-hidden
      focusable="false"
      className={cn("h-auto w-full", className)}
    >
      {children}
    </svg>
  )
}

/** Soft ground shadow shared by every scene. */
export function Ground({ cx = 120, rx = 96 }: { cx?: number; rx?: number }) {
  return (
    <ellipse cx={cx} cy={146} rx={rx} ry={8} className="fill-foreground/6" />
  )
}
