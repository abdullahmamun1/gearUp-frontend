import {
  DatesStepScene,
  PickupStepScene,
  SearchStepScene,
} from "@/components/shared/illustrations/scenes"

import { HowItWorksTimeline } from "./HowItWorksTimeline"
import { Section } from "./Section"

const STEPS = [
  {
    title: "Find your gear",
    body: "Filter by category, brand, price and your trip dates to see only what's free.",
    scene: <SearchStepScene />,
  },
  {
    title: "Book your dates",
    body: "The provider confirms within 48 hours. Then pay securely — deposits come back after the trip.",
    scene: <DatesStepScene />,
  },
  {
    title: "Pick up and go",
    body: "Collect the kit, enjoy the trail, bring it back. Leave a review when you're done.",
    scene: <PickupStepScene />,
  },
]

export function HowItWorks() {
  return (
    <Section
      id="how-it-works"
      eyebrow="Three steps"
      title="How it works"
      description="From browsing to the trailhead, with nothing in between."
    >
      <HowItWorksTimeline steps={STEPS} />
    </Section>
  )
}
