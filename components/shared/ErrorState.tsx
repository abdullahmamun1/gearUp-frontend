"use client"

import Link from "next/link"
import { useEffect } from "react"
import { RotateCw, TriangleAlert } from "lucide-react"

import { Button, buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type Props = {
  error: Error & { digest?: string }
  reset: () => void
  title?: string
  description?: string
  homeHref?: string
  homeLabel?: string
  className?: string
}

export function ErrorState({
  error,
  reset,
  title = "Something went wrong",
  description = "That request didn't go through. Trying again usually sorts it out.",
  homeHref = "/",
  homeLabel = "Go home",
  className,
}: Props) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <section
      className={cn(
        "mx-auto grid max-w-md place-content-center px-4 py-20 text-center",
        className
      )}
    >
      <TriangleAlert
        className="mx-auto size-10 text-muted-foreground"
        strokeWidth={1.25}
        aria-hidden
      />
      <h1 className="mt-4 font-heading text-2xl font-bold">{title}</h1>
      <p className="mt-2 text-sm text-muted-foreground">{description}</p>

      <div className="mt-6 flex justify-center gap-3">
        <Button size="lg" onClick={reset} className="h-9 text-sm">
          <RotateCw className="size-3.5" aria-hidden />
          Try again
        </Button>
        <Link
          href={homeHref}
          className={cn(
            buttonVariants({ variant: "outline", size: "lg" }),
            "h-9 text-sm"
          )}
        >
          {homeLabel}
        </Link>
      </div>

      {error.digest && (
        <p className="mt-6 font-mono text-xs text-muted-foreground">
          Reference: {error.digest}
        </p>
      )}
    </section>
  )
}
