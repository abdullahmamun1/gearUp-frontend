import { Star } from "lucide-react"
import { useLocale } from "next-intl"
import { useTranslations } from "@/i18n/translations"

import { cn } from "@/lib/utils"

export function Stars({
  rating,
  className,
}: {
  rating: number
  className?: string
}) {
  const t = useTranslations("common.stars")
  const locale = useLocale()
  const rounded = Math.round(rating)
  const value = new Intl.NumberFormat(locale === "bn" ? "bn-BD" : "en-GB", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(rating)

  return (
    <span
      className={cn("inline-flex items-center gap-0.5", className)}
      role="img"
      aria-label={t("label", { rating: value })}
    >
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          aria-hidden
          className={cn(
            "size-3.5",
            star <= rounded
              ? "fill-amber-500 text-amber-500"
              : "fill-muted text-muted-foreground/40"
          )}
        />
      ))}
    </span>
  )
}
