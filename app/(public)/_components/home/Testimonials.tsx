import { getTestimonials } from "@/app/(public)/_actions/getReviews"

import { Section } from "./Section"
import { TestimonialSlider } from "./TestimonialSlider"

export async function Testimonials() {
  const reviews = await getTestimonials()

  if (reviews.length === 0) {
    return null
  }

  return (
    <Section
      tone="muted"
      eyebrow="From renters"
      title="What renters say"
      description="Left by people after they returned the gear — nothing else counts."
    >
      <TestimonialSlider reviews={reviews} />
    </Section>
  )
}
