import Link from "next/link"
import { Compass } from "lucide-react"

import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export default function NotFound() {
  return (
    <section className="mx-auto grid min-h-svh max-w-md place-content-center px-4 text-center">
      <Compass
        className="mx-auto size-10 text-muted-foreground"
        strokeWidth={1.25}
        aria-hidden
      />
      <h1 className="mt-4 font-heading text-2xl font-bold">Page not found</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        That page doesn&apos;t exist, or you don&apos;t have access to it.
      </p>
      <div className="mt-6 flex justify-center gap-3">
        <Link
          href="/"
          className={cn(buttonVariants({ size: "lg" }), "h-9 text-sm")}
        >
          Go home
        </Link>
        <Link
          href="/gear"
          className={cn(
            buttonVariants({ variant: "outline", size: "lg" }),
            "h-9 text-sm"
          )}
        >
          Browse gear
        </Link>
      </div>
    </section>
  )
}
