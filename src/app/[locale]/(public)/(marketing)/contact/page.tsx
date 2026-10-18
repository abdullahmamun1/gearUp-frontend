import type { AppLocale, LocaleParams } from "@/i18n/routing"
import { initLocale } from "@/i18n/server"
import type { Metadata } from "next"
import { getTranslations } from "@/i18n/getTranslations"

import { pageMetadata } from "@/lib/site"
import { Link } from "@/i18n/navigation"
import {
  ArrowRight,
  Clock,
  HelpCircle,
  Info,
  Mail,
  MapPin,
  Phone,
  Store,
} from "lucide-react"

import { ContactForm } from "@/components/modules/marketing/contact/ContactForm"
import { MailScene } from "@/components/shared/illustrations/scenes"
import { PageHero } from "@/components/shared/PageHero"
import { SITE_CONTACT } from "@/constants/siteConfig"
import { cn } from "@/lib/utils"

export async function generateMetadata({
  params,
}: LocaleParams): Promise<Metadata> {
  const locale = (await params).locale as AppLocale
  const t = await getTranslations({ locale, namespace: "pages.contact.meta" })
  return pageMetadata({
    title: t("title"),
    description: t("description"),
    path: "/contact",
    locale,
  })
}

const SHORTCUTS = [
  { icon: HelpCircle, href: "/help", key: "faq" },
  { icon: Store, href: "/#earn", key: "earn" },
] as const

export default async function ContactPage({ params }: LocaleParams) {
  await initLocale(params)
  const t = await getTranslations("pages.contact")
  const tCommon = await getTranslations("common")

  const CHANNELS = [
    {
      icon: Mail,
      label: t("channels.email"),
      value: SITE_CONTACT.email,
      href: `mailto:${SITE_CONTACT.email}`,
      tone: "bg-primary/10 text-primary",
    },
    {
      icon: Phone,
      label: t("channels.phone"),
      value: SITE_CONTACT.phoneLabel,
      href: `tel:${SITE_CONTACT.phone}`,
      tone: "bg-lagoon/10 text-lagoon",
    },
    {
      icon: MapPin,
      label: t("channels.location"),
      value: tCommon("siteContact.location"),
      tone: "bg-ember/10 text-ember-strong",
    },
    {
      icon: Clock,
      label: t("channels.reply"),
      value: t("channels.replyValue"),
      tone: "bg-success/10 text-success",
    },
  ]

  return (
    <>
      <PageHero
        size="sm"
        eyebrow={t("hero.eyebrow")}
        title={t.rich("hero.title", {
          accent: (chunks) => <span className="text-gradient">{chunks}</span>,
        })}
        description={t("hero.description")}
        visual={<MailScene className="max-w-sm" />}
      />

      <section className="mx-auto max-w-6xl px-4 py-12 sm:py-16">
        <div className="grid items-start gap-10 lg:grid-cols-[1fr_1.25fr]">
          <div className="grid min-w-0 gap-6">
            <ul className="reveal-stagger grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              {CHANNELS.map((channel) => {
                const body = (
                  <>
                    <span
                      className={cn(
                        "grid size-11 shrink-0 place-items-center rounded-xl",
                        channel.tone
                      )}
                    >
                      <channel.icon className="size-5" aria-hidden />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-xs text-muted-foreground">
                        {channel.label}
                      </span>
                      <span className="mt-0.5 block text-sm font-medium [overflow-wrap:anywhere]">
                        {channel.value}
                      </span>
                    </span>
                    {channel.href && (
                      <ArrowRight
                        className="ml-auto size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary"
                        aria-hidden
                      />
                    )}
                  </>
                )
                return (
                  <li key={channel.label}>
                    {channel.href ? (
                      <a
                        href={channel.href}
                        className="group flex items-center gap-4 card-elevated p-4"
                      >
                        {body}
                      </a>
                    ) : (
                      <div className="flex items-center gap-4 rounded-2xl border bg-card p-4 shadow-xs">
                        {body}
                      </div>
                    )}
                  </li>
                )
              })}
            </ul>

            <div className="flex gap-3 rounded-xl border border-lagoon/30 bg-lagoon/5 p-4">
              <Info
                className="mt-0.5 size-4 shrink-0 text-lagoon"
                aria-hidden
              />
              <div>
                <h2 className="font-heading text-sm font-semibold">
                  {t("order.title")}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {t("order.body")}
                </p>
              </div>
            </div>

            <div>
              <p className="text-eyebrow text-muted-foreground">
                {t("shortcuts.title")}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {SHORTCUTS.map((shortcut) => (
                  <Link
                    key={shortcut.href}
                    href={shortcut.href}
                    className="inline-flex h-9 items-center gap-2 rounded-full border bg-card px-4 text-sm font-medium transition-colors hover:border-primary/40 hover:bg-accent"
                  >
                    <shortcut.icon
                      className="size-4 text-primary"
                      aria-hidden
                    />
                    {t(`shortcuts.${shortcut.key}`)}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <ContactForm />
        </div>
      </section>
    </>
  )
}
