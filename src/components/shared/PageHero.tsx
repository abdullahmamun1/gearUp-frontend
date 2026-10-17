import { cn } from "@/lib/utils"

const ENTER =
  "animate-in slide-in-from-bottom-4 fill-mode-backwards duration-700 ease-out motion-reduce:animate-none"

/**
 * The header band of an inner marketing page: the home hero's mesh, grid and
 * noise backdrop, an eyebrow, a display headline and an optional
 * illustration. Entrances slide without fading, so the headline still
 * counts as painted for LCP.
 */
export function PageHero({
  eyebrow,
  title,
  description,
  visual,
  children,
  size = "md",
  className,
}: {
  eyebrow?: React.ReactNode
  /** Wrap a word in <span className="text-gradient"> to accent it. */
  title: React.ReactNode
  description?: React.ReactNode
  /** Usually an illustration; hidden on phones. */
  visual?: React.ReactNode
  /** Actions or extra content under the description. */
  children?: React.ReactNode
  size?: "sm" | "md"
  className?: string
}) {
  return (
    <section
      className={cn("relative isolate overflow-hidden border-b", className)}
    >
      <div aria-hidden className="absolute inset-0 -z-20 bg-mesh" />
      <div aria-hidden className="absolute inset-0 -z-10 bg-grid opacity-50" />
      <div aria-hidden className="absolute inset-0 -z-10 bg-noise opacity-40" />

      <div
        className={cn(
          "mx-auto grid max-w-6xl items-center gap-10 px-4",
          size === "md" ? "py-14 sm:py-20" : "py-10 sm:py-14",
          visual && "lg:grid-cols-[1.15fr_1fr]"
        )}
      >
        <div>
          {eyebrow && (
            <p
              className={cn(
                ENTER,
                "mb-4 inline-flex items-center gap-2 rounded-full border bg-card/80 px-3 py-1 text-xs font-medium text-muted-foreground shadow-xs backdrop-blur-sm"
              )}
            >
              <span className="size-1.5 rounded-full bg-primary" aria-hidden />
              {eyebrow}
            </p>
          )}
          <h1
            className={cn(
              ENTER,
              "max-w-2xl text-balance",
              size === "md" ? "text-h1" : "text-h2"
            )}
          >
            {title}
          </h1>
          {description && (
            <p
              className={cn(
                ENTER,
                "mt-4 max-w-2xl text-pretty text-muted-foreground delay-100",
                size === "md" && "sm:text-lg"
              )}
            >
              {description}
            </p>
          )}
          {children && (
            <div className={cn(ENTER, "mt-8 delay-200")}>{children}</div>
          )}
        </div>

        {visual && (
          <div
            aria-hidden
            className="mx-auto hidden w-full max-w-md animate-in duration-1000 fill-mode-backwards zoom-in-95 fade-in motion-reduce:animate-none lg:block"
          >
            {visual}
          </div>
        )}
      </div>
    </section>
  )
}
