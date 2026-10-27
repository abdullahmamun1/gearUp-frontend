import type { LucideIcon } from "lucide-react"

import { cn } from "@/lib/utils"

const TONES = {
  default: {
    chip: "bg-primary/10 text-primary ring-primary/5",
    band: "bg-primary/8",
  },
  success: {
    chip: "bg-success/10 text-success ring-success/5",
    band: "bg-success/8",
  },
  error: {
    chip: "bg-destructive/10 text-destructive ring-destructive/5",
    band: "bg-destructive/6",
  },
}

/**
 * A single centred card on the brand backdrop: auth and email-link pages.
 * With `illustration`, the card opens with a tinted band showing it;
 * otherwise `icon` sits in a ringed chip. `busy` spins the icon.
 * `fullScreen` is for pages without the navbar (payment redirects).
 */
export function CenteredCard({
  icon: Icon,
  illustration,
  tone = "default",
  busy = false,
  fullScreen = false,
  title,
  description,
  children,
}: {
  icon?: LucideIcon
  illustration?: React.ReactNode
  tone?: keyof typeof TONES
  busy?: boolean
  fullScreen?: boolean
  title: string
  description?: React.ReactNode
  children?: React.ReactNode
}) {
  const colours = TONES[tone]

  return (
    <section className="relative isolate overflow-hidden">
      <div aria-hidden className="absolute inset-0 -z-20 bg-mesh" />
      <div aria-hidden className="absolute inset-0 -z-10 bg-grid opacity-50" />
      <div
        aria-hidden
        className="absolute top-1/4 left-1/2 -z-10 size-72 -translate-x-[120%] rounded-full bg-primary/15 blur-3xl"
      />
      <div
        aria-hidden
        className="absolute right-1/2 bottom-10 -z-10 size-64 translate-x-[130%] rounded-full bg-ember/15 blur-3xl"
      />

      <div
        className={cn(
          "mx-auto flex max-w-md flex-col justify-center px-4 py-14 sm:py-20",
          fullScreen ? "min-h-svh" : "min-h-[calc(100svh-5rem)]"
        )}
      >
        <div className="animate-in overflow-hidden rounded-2xl border bg-card/95 shadow-xl backdrop-blur-sm duration-500 fill-mode-backwards fade-in slide-in-from-bottom-4 motion-reduce:animate-none">
          {illustration && (
            <div className={cn("border-b px-10 pt-6", colours.band)}>
              <div className="mx-auto max-w-60">{illustration}</div>
            </div>
          )}
          <div className="p-6 sm:p-8">
            {Icon && !illustration && (
              <div
                className={cn(
                  "mb-5 grid size-12 place-items-center rounded-2xl ring-8",
                  colours.chip
                )}
              >
                <Icon
                  className={cn("size-5", busy && "animate-spin")}
                  aria-hidden
                />
              </div>
            )}
            <h1 className="text-h3 text-balance">{title}</h1>
            {description && (
              <p className="mt-2 text-sm text-pretty text-muted-foreground">
                {description}
              </p>
            )}
            {children && <div className="mt-6">{children}</div>}
          </div>
        </div>
      </div>
    </section>
  )
}
