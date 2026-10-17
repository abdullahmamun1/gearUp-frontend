import type { Metadata } from "next"
import Link from "next/link"
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

export const metadata: Metadata = {
  title: "Contact · GearUp",
  description:
    "Questions about renting, listing your gear, or an order? Get in touch with the GearUp team.",
}

const CHANNELS = [
  {
    icon: Mail,
    label: "Email",
    value: SITE_CONTACT.email,
    href: `mailto:${SITE_CONTACT.email}`,
    tone: "bg-primary/10 text-primary",
  },
  {
    icon: Phone,
    label: "Phone",
    value: SITE_CONTACT.phoneLabel,
    href: `tel:${SITE_CONTACT.phone}`,
    tone: "bg-lagoon/10 text-lagoon",
  },
  {
    icon: MapPin,
    label: "Where we are",
    value: SITE_CONTACT.location,
    tone: "bg-ember/10 text-ember-strong",
  },
  {
    icon: Clock,
    label: "When we reply",
    value: "Within one working day, Sunday to Thursday",
    tone: "bg-success/10 text-success",
  },
]

const SHORTCUTS = [
  { icon: HelpCircle, href: "/#faq", label: "Read the FAQ" },
  { icon: Store, href: "/#earn", label: "How providers earn" },
]

export default function ContactPage() {
  return (
    <>
      <PageHero
        size="sm"
        eyebrow="We're here to help"
        title={
          <>
            Talk to a <span className="text-gradient">real person</span>
          </>
        }
        description="Questions about an order, listing your own gear, or something that doesn't look right? Send us a message and we'll get back to you."
        visual={<MailScene className="max-w-sm" />}
      />

      <section className="mx-auto max-w-6xl px-4 py-12 sm:py-16">
        <div className="grid items-start gap-10 lg:grid-cols-[1fr_1.25fr]">
          <div className="grid gap-6">
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
                      <span className="mt-0.5 block text-sm font-medium wrap-break-word">
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
                      <div className="flex items-center gap-4 rounded-xl border bg-card p-4 shadow-xs">
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
                  Already have an order?
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Include the order reference from your rentals page — it&apos;s
                  the first eight characters shown next to each booking. It
                  saves us asking.
                </p>
              </div>
            </div>

            <div>
              <p className="text-eyebrow text-muted-foreground">
                Maybe it&apos;s already answered
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
                    {shortcut.label}
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
