import type { AppLocale, LocaleParams } from "@/i18n/routing"
import { initLocale } from "@/i18n/server"
import type { Metadata } from "next"
import { getTranslations } from "@/i18n/getTranslations"

import { pageMetadata } from "@/lib/site"
import { Link } from "@/i18n/navigation"
import {
  ArrowRight,
  BadgeCheck,
  Boxes,
  CreditCard,
  Lock,
  Star,
  Store,
  Tags,
} from "lucide-react"

import { getPlatformStats } from "@/api/stats"
import { getFormat } from "@/i18n/getFormat"
import { FinalCta } from "@/components/modules/marketing/home/FinalCta"
import { Section } from "@/components/modules/marketing/home/Section"
import {
  CampingScene,
  CyclingScene,
  PickupStepScene,
  SearchStepScene,
  ShieldScene,
  WaterScene,
} from "@/components/shared/illustrations/scenes"
import { AnimatedCounter } from "@/components/shared/motion/AnimatedCounter"
import { SpotlightCard } from "@/components/shared/motion/SpotlightCard"
import { PageHero } from "@/components/shared/PageHero"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export async function generateMetadata({
  params,
}: LocaleParams): Promise<Metadata> {
  const locale = (await params).locale as AppLocale
  const t = await getTranslations({ locale, namespace: "pages.about.meta" })
  return pageMetadata({
    title: t("title"),
    description: t("description"),
    path: "/about",
    locale,
  })
}

const ROLES = [
  {
    key: "renters",
    scene: SearchStepScene,
    tone: "bg-lagoon/10",
    href: "/gear",
  },
  {
    key: "providers",
    scene: PickupStepScene,
    tone: "bg-ember/10",
    href: "/register?role=PROVIDER",
  },
  {
    key: "admins",
    scene: ShieldScene,
    tone: "bg-primary/10",
    href: "/contact",
  },
] as const

const PROMISES = [
  { key: "payment", icon: CreditCard },
  { key: "cards", icon: Lock },
  { key: "reviews", icon: Star },
  { key: "stock", icon: Boxes },
] as const

export default async function AboutPage({ params }: LocaleParams) {
  await initLocale(params)
  const t = await getTranslations("pages.about")
  const format = await getFormat()
  const stats = await getPlatformStats()

  const numbers = [
    {
      icon: Boxes,
      value: stats?.gear ?? 0,
      label: t("stats.gear"),
      tone: "text-primary bg-primary/10",
    },
    {
      icon: Tags,
      value: stats?.categories ?? 0,
      label: t("stats.categories"),
      tone: "text-lagoon bg-lagoon/10",
    },
    {
      icon: Store,
      value: stats?.providers ?? 0,
      label: t("stats.providers"),
      tone: "text-ember-strong bg-ember/10",
    },
    {
      icon: BadgeCheck,
      value: stats?.reviews ?? 0,
      label: t("stats.reviews"),
      tone: "text-success bg-success/10",
    },
  ]

  return (
    <>
      <PageHero
        eyebrow={t("hero.eyebrow")}
        title={t.rich("hero.title", {
          accent: (chunks) => <span className="text-gradient">{chunks}</span>,
        })}
        description={t("hero.description")}
        visual={<Collage />}
      >
        <div className="flex flex-wrap gap-3">
          <Link
            href="/gear"
            className={cn(
              buttonVariants({ variant: "cta", size: "lg" }),
              "group h-11 gap-1.5 px-6 text-sm"
            )}
          >
            {t("hero.browse")}
            <ArrowRight
              className="size-4 transition-transform group-hover:translate-x-0.5"
              aria-hidden
            />
          </Link>
          <Link
            href="/register?role=PROVIDER"
            className={cn(
              buttonVariants({ variant: "glass", size: "lg" }),
              "h-11 px-6 text-sm"
            )}
          >
            {t("hero.list")}
          </Link>
        </div>
      </PageHero>

      {stats && (
        <section className="mx-auto -mt-px max-w-6xl px-4 pt-12">
          <ul className="reveal-stagger grid grid-cols-2 gap-4 lg:grid-cols-4">
            {numbers.map((stat) => (
              <li key={stat.label} className="card-elevated p-5">
                <span
                  className={cn(
                    "grid size-10 place-items-center rounded-xl",
                    stat.tone
                  )}
                >
                  <stat.icon className="size-5" aria-hidden />
                </span>
                <p className="mt-4 font-heading text-3xl font-bold tracking-tight">
                  <AnimatedCounter value={stat.value} />
                </p>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  {stat.label}
                </p>
              </li>
            ))}
          </ul>
        </section>
      )}

      <Section
        eyebrow={t("roles.eyebrow")}
        title={t("roles.title")}
        description={t("roles.description")}
      >
        <ul className="reveal-stagger grid gap-5 md:grid-cols-3">
          {ROLES.map((role) => (
            <li key={role.key}>
              <SpotlightCard className="flex h-full flex-col overflow-hidden card-elevated">
                <div className={cn("px-8 pt-6", role.tone)}>
                  <role.scene className="mx-auto max-w-56" />
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <h3 className="text-h3">{t(`roles.${role.key}.title`)}</h3>
                  <p className="mt-2 flex-1 text-sm text-muted-foreground">
                    {t(`roles.${role.key}.body`)}
                  </p>
                  <Link
                    href={role.href}
                    className="group mt-5 inline-flex items-center gap-1 text-sm font-semibold text-primary"
                  >
                    {t(`roles.${role.key}.link`)}
                    <ArrowRight
                      className="size-3.5 transition-transform group-hover:translate-x-0.5"
                      aria-hidden
                    />
                  </Link>
                </div>
              </SpotlightCard>
            </li>
          ))}
        </ul>
      </Section>

      <Section
        tone="muted"
        eyebrow={t("trust.eyebrow")}
        title={t("trust.title")}
        description={t("trust.description")}
      >
        <ul className="reveal-stagger grid gap-4 sm:grid-cols-2">
          {PROMISES.map((promise, index) => (
            <li key={promise.key} className="flex gap-4 card-elevated p-6">
              <span className="relative grid size-11 shrink-0 place-items-center rounded-xl bg-(image:--gradient-brand) text-primary-foreground shadow-glow-primary">
                <promise.icon className="size-5" aria-hidden />
                <span className="absolute -top-2 -right-2 grid size-5 place-items-center rounded-full border bg-card font-mono text-[10px] font-semibold text-foreground">
                  {format.number(index + 1)}
                </span>
              </span>
              <div>
                <h3 className="font-heading font-semibold">
                  {t(`trust.${promise.key}.title`)}
                </h3>
                <p className="mt-1.5 text-sm text-muted-foreground">
                  {t(`trust.${promise.key}.body`)}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </Section>

      <div className="pt-16 sm:pt-20">
        <FinalCta
          title={t("cta.title")}
          description={t("cta.description")}
          primary={{ href: "/contact", label: t("cta.primary") }}
          secondary={{ href: "/#faq", label: t("cta.secondary") }}
        />
      </div>
    </>
  )
}

/** Three scenes stacked like postcards. */
function Collage() {
  return (
    <div className="relative aspect-5/4">
      <div className="absolute inset-x-[8%] top-[6%] rotate-[-3deg] rounded-3xl border bg-card p-5 shadow-xl">
        <CampingScene />
      </div>
      <div className="absolute bottom-[2%] left-0 w-[46%] rotate-[-8deg] rounded-2xl border bg-card p-3 shadow-lg motion-safe:animate-[float_6s_ease-in-out_infinite]">
        <WaterScene />
      </div>
      <div className="absolute right-0 bottom-[8%] w-[42%] rotate-[7deg] rounded-2xl border bg-card p-3 shadow-lg motion-safe:animate-[float_7s_ease-in-out_1s_infinite]">
        <CyclingScene />
      </div>
    </div>
  )
}
