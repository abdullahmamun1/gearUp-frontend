"use client"

import { Link } from "@/i18n/navigation"
import { useEffect } from "react"
import { RotateCw, TriangleAlert } from "lucide-react"
import { useTranslations } from "@/i18n/translations"

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
  title,
  description,
  homeHref = "/",
  homeLabel,
  className,
}: Props) {
  const t = useTranslations("common")
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
      <h1 className="mt-4 font-heading text-2xl font-bold">
        {title ?? t("errorState.title")}
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        {description ?? t("errorState.description")}
      </p>

      <div className="mt-6 flex justify-center gap-3">
        <Button size="lg" onClick={reset} className="h-9 text-sm">
          <RotateCw className="size-3.5" aria-hidden />
          {t("actions.retry")}
        </Button>
        <Link
          href={homeHref}
          className={cn(
            buttonVariants({ variant: "outline", size: "lg" }),
            "h-9 text-sm"
          )}
        >
          {homeLabel ?? t("actions.goHome")}
        </Link>
      </div>

      {error.digest && (
        <p className="mt-6 font-mono text-xs text-muted-foreground">
          {t("errorState.reference", { digest: error.digest })}
        </p>
      )}
    </section>
  )
}
