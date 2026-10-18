"use client"

import { Link } from "@/i18n/navigation"
import { Heart } from "lucide-react"
import { useTranslations } from "@/i18n/translations"

import { GearCard } from "@/components/shared/GearCard"
import { GearGridSkeleton } from "@/components/shared/GearCardSkeleton"
import { buttonVariants } from "@/components/ui/button"
import { useFavorites } from "@/hooks/queries/favorites"
import { cn } from "@/lib/utils"

/** The customer's wishlist; hearts update it in place. */
export function SavedGearList() {
  const t = useTranslations("dashboard.customer.saved")
  const favorites = useFavorites()

  if (favorites.isPending) return <GearGridSkeleton count={4} />

  if (favorites.isError) {
    return (
      <p className="rounded-lg border border-destructive/30 bg-destructive/8 px-3.5 py-3 text-sm text-destructive">
        {favorites.error.message}
      </p>
    )
  }

  // Items just unsaved disappear at once (optimistic); newly saved ones
  // appear after the refetch.
  const items = (favorites.data?.items ?? []).filter((item) =>
    favorites.ids.has(item.id)
  )

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center rounded-2xl border border-dashed bg-card/50 px-6 py-14 text-center">
        <span className="grid size-14 place-items-center rounded-2xl bg-ember/12 text-ember-strong">
          <Heart className="size-6" aria-hidden />
        </span>
        <h2 className="mt-4 text-h3">{t("empty")}</h2>
        <p className="mt-1.5 max-w-sm text-sm text-muted-foreground">
          {t("emptyBody")}
        </p>
        <Link
          href="/gear"
          className={cn(buttonVariants({ variant: "cta", size: "lg" }), "mt-5")}
        >
          {t("browse")}
        </Link>
      </div>
    )
  }

  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {items.map((item) => (
        <GearCard key={item.id} gear={item} morph={false} />
      ))}
    </div>
  )
}
