import { Link } from "@/i18n/navigation"
import { ArrowRight, Search } from "lucide-react"
import { useLocale } from "next-intl"
import { useTranslations } from "@/i18n/translations"

import { CompassScene } from "@/components/shared/illustrations/scenes"
import { buttonVariants } from "@/components/ui/button"
import { createFormat } from "@/i18n/format"
import { cn } from "@/lib/utils"

export default function NotFound() {
  const t = useTranslations("nav.notFound")
  const format = createFormat(useLocale())

  return (
    <section className="relative isolate grid min-h-svh place-items-center overflow-hidden px-4 py-16">
      <div aria-hidden className="absolute inset-0 -z-20 bg-mesh" />
      <div aria-hidden className="absolute inset-0 -z-10 bg-grid opacity-50" />

      <div className="w-full max-w-lg text-center">
        <CompassScene className="mx-auto max-w-xs" />
        <p className="mt-6 text-eyebrow text-primary">
          {t("eyebrow", { code: format.number(404) })}
        </p>
        <h1 className="mt-3 text-h1">{t("title")}</h1>
        <p className="mx-auto mt-3 max-w-sm text-pretty text-muted-foreground">
          {t("description")}
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href="/gear"
            className={cn(
              buttonVariants({ variant: "cta", size: "lg" }),
              "group h-11 gap-1.5 px-6 text-sm"
            )}
          >
            <Search className="size-4" aria-hidden />
            {t("browseGear")}
          </Link>
          <Link
            href="/"
            className={cn(
              buttonVariants({ variant: "outline", size: "lg" }),
              "group h-11 gap-1.5 px-6 text-sm"
            )}
          >
            {t("goHome")}
            <ArrowRight
              className="size-4 transition-transform group-hover:translate-x-0.5"
              aria-hidden
            />
          </Link>
        </div>
      </div>
    </section>
  )
}
