import { cn } from "@/lib/utils"

export function Section({
  id,
  tone = "plain",
  eyebrow,
  title,
  description,
  action,
  children,
  className,
}: {
  id?: string
  tone?: "plain" | "muted"
  eyebrow?: string
  title?: string
  description?: React.ReactNode
  action?: React.ReactNode
  children: React.ReactNode
  className?: string
}) {
  return (
    <section
      id={id}
      className={cn(
        "scroll-mt-20",
        tone === "muted" && "border-y bg-muted/30",
        className
      )}
    >
      <div className="reveal mx-auto max-w-6xl px-4 py-16 sm:py-20">
        {title && (
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div>
              {eyebrow && (
                <p className="text-xs font-semibold tracking-wider text-primary uppercase">
                  {eyebrow}
                </p>
              )}
              <h2 className="mt-1.5 font-heading text-2xl font-bold sm:text-3xl">
                {title}
              </h2>
              {description && (
                <p className="mt-1.5 text-sm text-muted-foreground">
                  {description}
                </p>
              )}
            </div>
            {action}
          </div>
        )}

        {children}
      </div>
    </section>
  )
}
