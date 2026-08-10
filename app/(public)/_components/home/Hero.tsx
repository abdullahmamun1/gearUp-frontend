import Link from "next/link"
import { ArrowRight, Search } from "lucide-react"

import { buttonVariants } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

const ENTER =
  "animate-in fade-in slide-in-from-bottom-6 fill-mode-backwards ease-out motion-reduce:animate-none"

export function Hero({ gearCount }: { gearCount: number }) {
  return (
    <section className="relative flex min-h-[60vh] items-center overflow-hidden border-b sm:max-h-[70vh] sm:min-h-[65vh]">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-linear-to-br from-primary/10 via-background to-background"
      />

      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 -right-24 size-72 rounded-full bg-primary/10 blur-3xl motion-safe:animate-pulse"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-32 -left-20 size-80 rounded-full bg-primary/5 blur-3xl [animation-delay:1.5s] motion-safe:animate-pulse"
      />

      <div className="relative mx-auto w-full max-w-6xl px-4 py-12 text-center">
        <p
          className={cn(
            ENTER,
            "mb-4 inline-flex items-center gap-2 rounded-full border bg-card px-3 py-1 text-xs text-muted-foreground duration-700"
          )}
        >
          <span
            className="size-1.5 rounded-full bg-primary motion-safe:animate-pulse"
            aria-hidden
          />
          {gearCount > 0
            ? `${gearCount} items ready to rent`
            : "New gear added weekly"}
        </p>

        <h1
          className={cn(
            ENTER,
            "font-heading text-4xl font-bold tracking-tight text-balance delay-100 duration-1000 sm:text-6xl"
          )}
        >
          Rent sports &amp; outdoor gear{" "}
          <span className="text-primary">instantly</span>
        </h1>

        <p
          className={cn(
            ENTER,
            "mx-auto mt-5 max-w-xl text-pretty text-muted-foreground delay-200 duration-1000 sm:text-lg"
          )}
        >
          Tents, kayaks, bikes and more — booked by the day from local
          providers. No storage, no upkeep, no commitment.
        </p>

        <form
          action="/gear"
          className={cn(
            ENTER,
            "mx-auto mt-8 flex max-w-md items-center gap-2 delay-300 duration-1000"
          )}
        >
          <div className="relative flex-1">
            <Search
              className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden
            />
            <Input
              type="search"
              name="searchTerm"
              placeholder="Search tents, kayaks, bikes…"
              aria-label="Search gear"
              className="h-11 pl-9"
            />
          </div>
          <button
            type="submit"
            className={cn(buttonVariants({ size: "lg" }), "h-11 px-5 text-sm")}
          >
            Search
          </button>
        </form>

        <div
          className={cn(
            ENTER,
            "mt-7 flex flex-wrap items-center justify-center gap-3 delay-500 duration-1000"
          )}
        >
          <Link
            href="/gear"
            className={cn(
              buttonVariants({ size: "lg" }),
              "group h-11 gap-1.5 px-6 text-sm"
            )}
          >
            Browse all gear
            <ArrowRight
              className="size-4 transition-transform group-hover:translate-x-0.5"
              aria-hidden
            />
          </Link>
          <Link
            href="/register"
            className={cn(
              buttonVariants({ variant: "outline", size: "lg" }),
              "h-11 px-6 text-sm"
            )}
          >
            List your gear
          </Link>
        </div>
      </div>
    </section>
  )
}
