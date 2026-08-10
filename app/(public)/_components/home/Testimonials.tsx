import { getTestimonials } from "@/app/(public)/_actions/getReviews"

import { TestimonialSlider } from "./TestimonialSlider"

export async function Testimonials() {
  const reviews = await getTestimonials()

  if (reviews.length === 0) {
    return null
  }

  return (
    <section className="mx-auto max-w-6xl px-4 ">
      <h2 className="font-heading text-2xl font-bold sm:text-3xl">
        What renters say
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Left by people after they returned the gear — nothing else counts.
      </p>

      <TestimonialSlider reviews={reviews} className="mt-6" />
    </section>
  )
}
