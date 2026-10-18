import { getTranslations } from "@/i18n/getTranslations"

import { getTestimonials } from "@/api/reviews"

import { Section } from "./Section"
import { TestimonialSlider } from "./TestimonialSlider"

export async function Testimonials() {
  const reviews = await getTestimonials()

  if (reviews.length === 0) {
    return null
  }
  const t = await getTranslations("home.testimonials")

  return (
    <Section
      tone="muted"
      eyebrow={t("eyebrow")}
      title={t("title")}
      description={t("description")}
    >
      <TestimonialSlider reviews={reviews} />
    </Section>
  )
}
