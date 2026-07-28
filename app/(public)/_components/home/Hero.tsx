import Link from "next/link"
import { Search } from "lucide-react"

import { buttonVariants } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

export function Hero() {
  return (
    <section className="relative overflow-hidden border-b">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-linear-to-br from-primary/10 via-background to-background"
      />

      <div className="relative mx-auto max-w-6xl px-4 py-20 text-center sm:py-28">
        <p className="mb-4 inline-flex items-center gap-2 rounded-full border bg-card px-3 py-1 text-xs text-muted-foreground">
          <span className="size-1.5 rounded-full bg-primary" aria-hidden />
          New gear added weekly
        </p>

        <h1 className="font-heading text-4xl font-bold tracking-tight text-balance sm:text-6xl">
          Rent sports &amp; outdoor gear{" "}
          <span className="text-primary">instantly</span>
        </h1>

        <p className="mx-auto mt-5 max-w-xl text-pretty text-muted-foreground sm:text-lg">
          Tents, kayaks, bikes and more — booked by the day from local
          providers. No storage, no upkeep, no commitment.
        </p>

        <form
          action="/gear"
          className="mx-auto mt-8 flex max-w-md items-center gap-2"
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

        <div className="mt-6 flex items-center justify-center gap-4 text-sm">
          <Link href="/gear" className="text-primary hover:underline">
            Browse all gear
          </Link>
          <span className="text-muted-foreground" aria-hidden>
            ·
          </span>
          <Link href="/register" className="text-primary hover:underline">
            List your gear
          </Link>
        </div>
      </div>
    </section>
  )
}
