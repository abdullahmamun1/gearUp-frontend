import { useTranslations } from "@/i18n/translations"

import {
  DatesStepScene,
  PickupStepScene,
  SearchStepScene,
} from "@/components/shared/illustrations/scenes"

import { HowItWorksTimeline } from "./HowItWorksTimeline"
import { Section } from "./Section"

export function HowItWorks() {
  const t = useTranslations("home.how")
  const steps = [
    {
      title: t("find.title"),
      body: t("find.body"),
      scene: <SearchStepScene />,
    },
    {
      title: t("book.title"),
      body: t("book.body", { hours: 48 }),
      scene: <DatesStepScene />,
    },
    {
      title: t("pickup.title"),
      body: t("pickup.body"),
      scene: <PickupStepScene />,
    },
  ]

  return (
    <Section
      id="how-it-works"
      eyebrow={t("eyebrow")}
      title={t("title")}
      description={t("description")}
    >
      <HowItWorksTimeline steps={steps} />
    </Section>
  )
}
