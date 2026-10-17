import { cn } from "@/lib/utils"

/**
 * Fades and lifts content in as it scrolls into view. Pure CSS (scroll-driven
 * animations), so server-rendered content is never hidden waiting for
 * JavaScript; browsers without support just show it.
 *
 * `stagger` animates each direct child on its own timeline, so a row of
 * cards arrives one after another as it enters.
 */
export function Reveal({
  stagger = false,
  className,
  children,
  as: Tag = "div",
}: {
  stagger?: boolean
  className?: string
  children: React.ReactNode
  as?: "div" | "section" | "ul" | "ol"
}) {
  return (
    <Tag className={cn(stagger ? "reveal-stagger" : "reveal", className)}>
      {children}
    </Tag>
  )
}
