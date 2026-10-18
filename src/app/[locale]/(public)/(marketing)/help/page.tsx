import type { Metadata } from "next"

import {
  HelpCenter,
  type HelpTopic,
} from "@/components/modules/marketing/help/HelpCenter"
import { CompassScene } from "@/components/shared/illustrations/scenes"
import { JsonLd } from "@/components/shared/JsonLd"
import { PageHero } from "@/components/shared/PageHero"
import { getFormat } from "@/i18n/getFormat"
import { getTranslations } from "@/i18n/getTranslations"
import type { AppLocale, LocaleParams } from "@/i18n/routing"
import { initLocale } from "@/i18n/server"
import { pageMetadata } from "@/lib/site"
import { RENTAL_POLICY } from "@/utils/rental"

/** The minimum card payment (Stripe's floor for BDT). */
const MIN_ORDER_BDT = 65

export async function generateMetadata({
  params,
}: LocaleParams): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({
    locale: locale as AppLocale,
    namespace: "pages.help.meta",
  })
  return pageMetadata({
    title: t("title"),
    description: t("description"),
    path: "/help",
    locale,
  })
}

export default async function HelpPage({ params }: LocaleParams) {
  await initLocale(params)
  const t = await getTranslations("pages.help")
  const format = await getFormat()

  // Answers quote the real rules, so they can't drift from the product.
  const values = {
    respondHours: RENTAL_POLICY.respondWithinHours,
    payHours: RENTAL_POLICY.payWithinHours,
    cancelHours: RENTAL_POLICY.freeCancellationHours,
    maxDays: RENTAL_POLICY.maxRentalDays,
    aheadDays: RENTAL_POLICY.maxDaysAhead,
    minOrder: format.price(MIN_ORDER_BDT),
  }
  const raw = t.raw("topics" as never) as Record<
    string,
    { title: string; items: Record<string, { q: string; a: string }> }
  >
  const topics: HelpTopic[] = Object.entries(raw).map(([id, topic]) => ({
    id,
    title: t(`topics.${id}.title` as never),
    items: Object.keys(topic.items).map((itemId) => ({
      id: `${id}-${itemId}`,
      q: t(`topics.${id}.items.${itemId}.q` as never, values as never),
      a: t(`topics.${id}.items.${itemId}.a` as never, values as never),
    })),
  }))

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: topics.flatMap((topic) =>
            topic.items.map((item) => ({
              "@type": "Question",
              name: item.q,
              acceptedAnswer: { "@type": "Answer", text: item.a },
            }))
          ),
        }}
      />
      <PageHero
        eyebrow={t("hero.eyebrow")}
        title={t.rich("hero.title", {
          accent: (chunks) => <span className="text-gradient">{chunks}</span>,
        })}
        description={t("hero.description")}
        visual={<CompassScene />}
        size="sm"
      />
      <HelpCenter topics={topics} />
    </>
  )
}
