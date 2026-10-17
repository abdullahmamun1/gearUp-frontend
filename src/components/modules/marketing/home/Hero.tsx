import Link from "next/link"
import { ArrowRight, BadgeCheck, CreditCard, Star } from "lucide-react"

import { Magnetic } from "@/components/shared/motion/Magnetic"
import { RotatingWord } from "@/components/shared/motion/RotatingWord"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

import { HeroSearch } from "./hero/HeroSearch"
import { HeroVisual } from "./hero/HeroVisual"

const ENTER =
  "animate-in fade-in slide-in-from-bottom-6 fill-mode-backwards ease-out motion-reduce:animate-none"

/**
 * The headline and intro slide in without fading: an element that starts at
 * opacity 0 doesn't count as painted, which would delay LCP until it ends.
 */
const ENTER_NO_FADE =
  "animate-in slide-in-from-bottom-4 fill-mode-backwards ease-out motion-reduce:animate-none"

export function Hero({
  gearCount,
  providers,
  reviews,
}: {
  gearCount: number
  providers: number
  reviews: number
}) {
  const trust = [
    reviews > 0 && { icon: Star, text: `${reviews} verified reviews` },
    providers > 0 && { icon: BadgeCheck, text: `${providers} local providers` },
    { icon: CreditCard, text: "Secure Stripe checkout" },
  ].filter(Boolean) as { icon: typeof Star; text: string }[]

  return (
    <section className="relative isolate overflow-hidden border-b">
      <div aria-hidden className="absolute inset-0 -z-20 bg-mesh" />
      <div aria-hidden className="absolute inset-0 -z-10 bg-grid opacity-60" />
      <div aria-hidden className="absolute inset-0 -z-10 bg-noise opacity-50" />

      <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 pt-12 pb-14 sm:pt-16 lg:grid-cols-[1.08fr_1fr] lg:gap-6 lg:pt-14 lg:pb-16">
        <div className="text-center lg:text-left">
          <p
            className={cn(
              ENTER,
              "mb-5 inline-flex items-center gap-2 rounded-full border bg-card/80 px-3 py-1 text-xs text-muted-foreground shadow-xs backdrop-blur-sm duration-700"
            )}
          >
            <span className="relative flex size-2" aria-hidden>
              <span className="absolute inline-flex size-full rounded-full bg-success opacity-60 motion-safe:animate-ping" />
              <span className="relative inline-flex size-2 rounded-full bg-success" />
            </span>
            {gearCount > 0
              ? `${gearCount} items ready to rent`
              : "New gear added weekly"}
          </p>

          <h1 className={cn(ENTER_NO_FADE, "text-display duration-700")}>
            Rent{" "}
            <RotatingWord
              // Similar lengths keep the line balanced: the slot is as wide
              // as the longest word.
              words={["tents", "kayaks", "bikes", "boards", "ropes"]}
              className="text-gradient"
            />
            <br />
            by the day, instantly
          </h1>

          <p
            className={cn(
              ENTER_NO_FADE,
              "mx-auto mt-5 max-w-lg text-pretty text-muted-foreground duration-700 sm:text-lg lg:mx-0"
            )}
          >
            Tents, kayaks, bikes and more from local providers across
            Bangladesh. No storage, no upkeep — just pick your dates and go.
          </p>

          <div
            className={cn(
              ENTER,
              "mx-auto mt-8 max-w-xl delay-300 duration-1000 lg:mx-0"
            )}
          >
            <HeroSearch />
          </div>

          <div
            className={cn(
              ENTER,
              "mt-6 flex flex-wrap items-center justify-center gap-3 delay-500 duration-1000 lg:justify-start"
            )}
          >
            <Magnetic>
              <Link
                href="/gear"
                className={cn(
                  buttonVariants({ variant: "cta", size: "lg" }),
                  "group h-11 gap-1.5 px-6 text-sm"
                )}
              >
                Browse all gear
                <ArrowRight
                  className="size-4 transition-transform group-hover:translate-x-0.5"
                  aria-hidden
                />
              </Link>
            </Magnetic>
            <Magnetic>
              <Link
                href="/register?role=PROVIDER"
                className={cn(
                  buttonVariants({ variant: "glass", size: "lg" }),
                  "h-11 px-6 text-sm"
                )}
              >
                List your gear
              </Link>
            </Magnetic>
          </div>

          <ul
            className={cn(
              ENTER,
              "mt-8 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm text-muted-foreground delay-700 duration-1000 lg:justify-start"
            )}
          >
            {trust.map((item) => (
              <li key={item.text} className="inline-flex items-center gap-1.5">
                <item.icon className="size-4 text-primary" aria-hidden />
                {item.text}
              </li>
            ))}
          </ul>
        </div>

        <HeroVisual className="mx-auto w-full max-w-sm sm:max-w-md lg:max-w-none" />
      </div>
    </section>
  )
}
