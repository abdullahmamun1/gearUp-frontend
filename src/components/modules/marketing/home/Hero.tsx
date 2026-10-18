import { Link } from "@/i18n/navigation"
import { ArrowRight, BadgeCheck, CreditCard, Star } from "lucide-react"
import { getTranslations } from "@/i18n/getTranslations"

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

const HERO_WORDS = ["tents", "kayaks", "bikes", "boards", "ropes"] as const

export async function Hero({
  gearCount,
  providers,
  reviews,
}: {
  gearCount: number
  providers: number
  reviews: number
}) {
  const t = await getTranslations("home.hero")
  const trust = [
    reviews > 0 && {
      icon: Star,
      text: t("trustReviews", { count: reviews }),
    },
    providers > 0 && {
      icon: BadgeCheck,
      text: t("trustProviders", { count: providers }),
    },
    { icon: CreditCard, text: t("trustStripe") },
  ].filter(Boolean) as { icon: typeof Star; text: string }[]

  return (
    // The hero takes 60–70% of the screen at every size (a requirement): on
    // desktop the box is ~66svh and the headline scales with the height; on
    // phones the visual and trust row drop out so the essentials fit.
    <section className="relative isolate flex min-h-[62svh] items-center overflow-hidden border-b lg:h-[66svh] lg:max-h-[760px] lg:min-h-[440px]">
      <div aria-hidden className="absolute inset-0 -z-20 bg-mesh" />
      <div aria-hidden className="absolute inset-0 -z-10 bg-grid opacity-60" />
      <div aria-hidden className="absolute inset-0 -z-10 bg-noise opacity-50" />

      <div className="mx-auto grid w-full max-w-6xl items-center gap-10 px-4 py-8 sm:py-10 lg:grid-cols-[1.08fr_1fr] lg:gap-6 lg:py-6 lg:[@media(max-height:820px)]:py-2">
        <div className="text-center lg:text-left">
          <p
            className={cn(
              ENTER,
              "mb-4 inline-flex items-center gap-2 rounded-full border bg-card/80 px-3 py-1 text-xs text-muted-foreground shadow-xs backdrop-blur-sm duration-700 lg:mb-5"
            )}
          >
            <span className="relative flex size-2" aria-hidden>
              <span className="absolute inline-flex size-full rounded-full bg-success opacity-60 motion-safe:animate-ping" />
              <span className="relative inline-flex size-2 rounded-full bg-success" />
            </span>
            {gearCount > 0
              ? t("readyCount", { count: gearCount })
              : t("newWeekly")}
          </p>

          <h1
            className={cn(
              ENTER_NO_FADE,
              // Scales with the viewport height on desktop so short screens
              // (1280×720) still fit the hero in ~66% of the height.
              "text-display duration-700 lg:text-[clamp(2.2rem,5.9svh,4.5rem)]"
            )}
          >
            {t.rich("headline", {
              word: () => (
                <RotatingWord
                  // Similar lengths keep the line balanced: the slot is as
                  // wide as the longest word.
                  words={HERO_WORDS.map((word) => t(`words.${word}`))}
                  className="text-gradient"
                />
              ),
              br: () => <br />,
            })}
          </h1>

          <p
            className={cn(
              ENTER_NO_FADE,
              // Two lines on phones and short desktops; hidden on short phones.
              "mx-auto mt-4 line-clamp-2 max-w-lg text-pretty text-muted-foreground duration-700 sm:text-lg lg:mx-0 lg:mt-5 lg:line-clamp-none max-lg:[@media(max-height:780px)]:hidden lg:[@media(max-height:820px)]:line-clamp-2"
            )}
          >
            {t("intro")}
          </p>

          <div
            className={cn(
              ENTER,
              "mx-auto mt-6 max-w-xl delay-300 duration-1000 lg:mx-0 lg:mt-7 lg:[@media(max-height:820px)]:mt-5"
            )}
          >
            <HeroSearch />
          </div>

          <div
            className={cn(
              ENTER,
              // The search card has its own button, so short phones skip these.
              "mt-5 flex flex-wrap items-center justify-center gap-3 delay-500 duration-1000 lg:mt-6 lg:justify-start max-lg:[@media(max-height:780px)]:hidden"
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
                {t("browseAll")}
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
                {t("listGear")}
              </Link>
            </Magnetic>
          </div>

          <ul
            className={cn(
              ENTER,
              // Desktop only, and only when there's height to spare.
              "mt-6 hidden flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm text-muted-foreground delay-700 duration-1000 lg:flex lg:justify-start [@media(max-height:820px)]:lg:hidden"
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

        <HeroVisual className="mx-auto hidden w-full lg:block lg:max-h-[60svh] lg:max-w-none" />
      </div>
    </section>
  )
}
