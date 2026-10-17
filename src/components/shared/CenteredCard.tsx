import type { LucideIcon } from "lucide-react"

import { cn } from "@/lib/utils"

/** A single centred card on a soft gradient — auth and email-link pages. */
export function CenteredCard({
  icon: Icon,
  tone = "default",
  title,
  description,
  children,
}: {
  icon?: LucideIcon
  tone?: "default" | "success" | "error"
  title: string
  description?: React.ReactNode
  children?: React.ReactNode
}) {
  return (
    <section className="relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-linear-to-br from-primary/10 via-background to-background"
      />
      <div className="relative mx-auto max-w-md px-4 py-16 sm:py-20">
        <div className="rounded-xl border bg-card p-6 shadow-sm sm:p-8">
          {Icon && (
            <div
              className={cn(
                "mb-4 grid size-11 place-items-center rounded-full",
                tone === "success" && "bg-success/10 text-success",
                tone === "error" && "bg-destructive/10 text-destructive",
                tone === "default" && "bg-primary/10 text-primary"
              )}
            >
              <Icon className="size-5" aria-hidden />
            </div>
          )}
          <h1 className="font-heading text-2xl font-bold tracking-tight">
            {title}
          </h1>
          {description && (
            <p className="mt-1.5 text-sm text-pretty text-muted-foreground">
              {description}
            </p>
          )}
          {children && <div className="mt-6">{children}</div>}
        </div>
      </div>
    </section>
  )
}
