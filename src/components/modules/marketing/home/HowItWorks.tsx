import { CalendarRange, PackageCheck, Search } from "lucide-react"

import { Section } from "./Section"

const STEPS = [
  {
    icon: Search,
    title: "Find your gear",
    body: "Filter by category, brand and price to find kit that's free on your dates.",
  },
  {
    icon: CalendarRange,
    title: "Pick your dates",
    body: "Choose a start and end date — the total is priced per day, up front.",
  },
  {
    icon: PackageCheck,
    title: "Pay and collect",
    body: "Pay securely online, then collect from the provider and hit the trail.",
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
      <ol className="grid gap-8 sm:grid-cols-3">
        {STEPS.map((step, index) => (
          <li key={step.title} className="group relative text-center">
            <div className="mx-auto grid size-12 place-items-center rounded-full bg-primary/10 transition-transform group-hover:scale-110">
              <step.icon className="size-5 text-primary" aria-hidden />
            </div>
            <h3 className="mt-4 font-heading font-semibold">
              <span className="text-muted-foreground">{index + 1}. </span>
              {step.title}
            </h3>
            <p className="mt-1.5 text-sm text-muted-foreground">{step.body}</p>
          </li>
        ))}
      </ol>
    </Section>
  )
}
