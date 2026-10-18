import { Link } from "@/i18n/navigation"
import { ArrowRight } from "lucide-react"
import { useTranslations } from "@/i18n/translations"

import { Magnetic } from "@/components/shared/motion/Magnetic"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type CtaLink = { href: string; label: string }

/**
 * Closing gradient band: the bottom of the home page and inner pages. Inner
 * pages pass their own (translated) text; the defaults are the home page's.
 */
export function FinalCta({
  title,
  description,
  primary,
  secondary,
}: {
  title?: string
  description?: string
  primary?: CtaLink
  secondary?: CtaLink | null
} = {}) {
  const t = useTranslations("home.finalCta")
  title ??= t("title")
  description ??= t("description")
  primary ??= { href: "/gear", label: t("browse") }
  if (secondary === undefined) {
    secondary = { href: "/register", label: t("list") }
  }

  return (
    <section className="mx-auto max-w-6xl px-4 pb-20">
      <div className="reveal relative isolate overflow-hidden rounded-3xl bg-(image:--gradient-brand) px-6 py-14 text-center text-primary-foreground shadow-xl sm:px-12 sm:py-20">
        <div
          aria-hidden
          className="absolute inset-0 -z-10 bg-noise opacity-60"
        />
        <div
          aria-hidden
          className="absolute inset-0 -z-10 bg-grid opacity-40 mix-blend-overlay"
        />
        <h2 className="mx-auto max-w-2xl text-h1">{title}</h2>
        <p className="mx-auto mt-4 max-w-lg opacity-90">{description}</p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Magnetic>
            <Link
              href={primary.href}
              className={cn(
                buttonVariants({ variant: "cta", size: "lg" }),
                "group h-11 gap-1.5 px-6 text-sm"
              )}
            >
              {primary.label}
              <ArrowRight
                className="size-4 transition-transform group-hover:translate-x-0.5"
                aria-hidden
              />
            </Link>
          </Magnetic>
          {secondary && (
            <Link
              href={secondary.href}
              className={cn(
                buttonVariants({ variant: "glass", size: "lg" }),
                "h-11 px-6 text-sm"
              )}
            >
              {secondary.label}
            </Link>
          )}
        </div>
      </div>
    </section>
  )
}
