import { Link } from "@/i18n/navigation"
import { ArrowRight } from "lucide-react"
import { getTranslations } from "@/i18n/getTranslations"

import { getFeaturedGear } from "@/api/gear"
import { Carousel } from "@/components/shared/Carousel"
import { GearCard } from "@/components/shared/GearCard"

import { Section } from "./Section"

export async function FeaturedGear() {
  const res = await getFeaturedGear(8)
  const items = res.data?.data ?? []
  const [t, tActions] = await Promise.all([
    getTranslations("home.featured"),
    getTranslations("common.actions"),
  ])

  return (
    <Section
      tone="muted"
      eyebrow={t("eyebrow")}
      title={t("title")}
      description={t("description")}
      action={
        <Link
          href="/gear"
          className="inline-flex shrink-0 items-center gap-1 text-sm text-primary hover:underline"
        >
          {tActions("viewAll")}
          <ArrowRight className="size-3.5" aria-hidden />
        </Link>
      }
    >
      {!res.success ? (
        <p className="text-sm text-muted-foreground">
          {res.message || t("loadError")}
        </p>
      ) : items.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t("empty")}</p>
      ) : (
        <Carousel
          label={t("title")}
          options={{ dragFree: true }}
          slideClassName="basis-[78%] sm:basis-1/2 lg:basis-1/4"
        >
          {items.map((gear) => (
            <GearCard key={gear.id} gear={gear} />
          ))}
        </Carousel>
      )}
    </Section>
  )
}
