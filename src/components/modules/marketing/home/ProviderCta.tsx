import Link from "next/link"
import { ArrowRight, CalendarCheck, ShieldCheck, Wallet } from "lucide-react"

import { Magnetic } from "@/components/shared/motion/Magnetic"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

import { EarningsCalculator } from "./EarningsCalculator"

const POINTS = [
  { icon: Wallet, text: "Paid by card through Stripe — no chasing cash." },
  { icon: ShieldCheck, text: "Optional refundable deposit on every listing." },
  {
    icon: CalendarCheck,
    text: "You confirm each booking; your calendar, your rules.",
  },
]

export function ProviderCta() {
  return (
    <section
      id="earn"
      className="mx-auto max-w-6xl scroll-mt-24 px-4 py-16 sm:py-20"
    >
      <div className="reveal grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
        <div>
          <p className="text-eyebrow text-primary">For providers</p>
          <h2 className="mt-2 text-h2">Got gear sitting in the garage?</h2>
          <p className="mt-3 max-w-md text-muted-foreground">
            List it on GearUp and earn from it between your own adventures. Move
            the sliders to see what it could bring in.
          </p>
          <ul className="mt-6 grid gap-3">
            {POINTS.map((point) => (
              <li key={point.text} className="flex items-start gap-3 text-sm">
                <span className="grid size-8 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
                  <point.icon className="size-4" aria-hidden />
                </span>
                <span className="pt-1.5">{point.text}</span>
              </li>
            ))}
          </ul>
          <Magnetic className="mt-8 inline-flex">
            <Link
              href="/register"
              className={cn(
                buttonVariants({ variant: "cta", size: "lg" }),
                "group h-11 gap-1.5 px-6 text-sm"
              )}
            >
              Become a provider
              <ArrowRight
                className="size-4 transition-transform group-hover:translate-x-0.5"
                aria-hidden
              />
            </Link>
          </Magnetic>
        </div>

        <EarningsCalculator />
      </div>
    </section>
  )
}
