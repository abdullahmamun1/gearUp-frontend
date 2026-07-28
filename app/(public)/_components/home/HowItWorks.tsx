import { CalendarRange, PackageCheck, Search } from "lucide-react"

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
    <section id="how-it-works" className="scroll-mt-20 border-t bg-muted/30">
      <div className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="text-center font-heading text-2xl font-bold sm:text-3xl">
          How it works
        </h2>

        <ol className="mt-10 grid gap-8 sm:grid-cols-3">
          {STEPS.map((step, index) => (
            <li key={step.title} className="text-center">
              <div className="mx-auto grid size-12 place-items-center rounded-full bg-primary/10">
                <step.icon className="size-5 text-primary" aria-hidden />
              </div>
              <h3 className="mt-4 font-heading font-semibold">
                <span className="text-muted-foreground">{index + 1}. </span>
                {step.title}
              </h3>
              <p className="mt-1.5 text-sm text-muted-foreground">
                {step.body}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
