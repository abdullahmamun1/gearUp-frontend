import Link from "next/link"
import { ArrowRight } from "lucide-react"

import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function ProviderCta() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:py-20">
      <div className="reveal rounded-2xl border bg-card px-6 py-12 text-center">
        <p className="text-xs font-semibold tracking-wider text-primary uppercase">
          For providers
        </p>
        <h2 className="mt-1.5 font-heading text-2xl font-bold sm:text-3xl">
          Got gear sitting in the garage?
        </h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
          List it on GearUp and earn from it between your own adventures.
        </p>
        <Link
          href="/register"
          className={cn(
            buttonVariants({ size: "lg" }),
            "group mt-6 h-11 gap-1.5 px-6 text-sm"
          )}
        >
          Become a provider
          <ArrowRight
            className="size-4 transition-transform group-hover:translate-x-0.5"
            aria-hidden
          />
        </Link>
      </div>
    </section>
  )
}
