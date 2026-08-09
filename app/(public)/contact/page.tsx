import type { Metadata } from "next"
import { Clock, Mail, MapPin, Phone } from "lucide-react"

import { SITE_CONTACT } from "@/lib/siteConfig"

import { ContactForm } from "./_components/ContactForm"

export const metadata: Metadata = {
  title: "Contact · GearUp",
  description:
    "Questions about renting, listing your gear, or an order? Get in touch with the GearUp team.",
}

export default function ContactPage() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-10 sm:py-14">
      <h1 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">
        Contact us
      </h1>
      <p className="mt-2 max-w-lg text-pretty text-muted-foreground">
        Questions about an order, listing your own gear, or something that
        doesn&apos;t look right? Send us a message.
      </p>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_1.3fr]">
        <div>
          <h2 className="font-heading text-sm font-semibold">
            Reach us directly
          </h2>

          <ul className="mt-4 grid gap-5">
            <ContactRow icon={Mail} label="Email">
              <a
                href={`mailto:${SITE_CONTACT.email}`}
                className="hover:text-primary"
              >
                {SITE_CONTACT.email}
              </a>
            </ContactRow>

            <ContactRow icon={Phone} label="Phone">
              <a
                href={`tel:${SITE_CONTACT.phone}`}
                className="hover:text-primary"
              >
                {SITE_CONTACT.phoneLabel}
              </a>
            </ContactRow>

            <ContactRow icon={MapPin} label="Where we are">
              {SITE_CONTACT.location}
            </ContactRow>

            <ContactRow icon={Clock} label="When we reply">
              Within one working day, Sunday to Thursday.
            </ContactRow>
          </ul>

          <div className="mt-8 rounded-xl border bg-muted/30 p-4">
            <h3 className="font-heading text-sm font-semibold">
              Already have an order?
            </h3>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Include the order reference from your rentals page — it&apos;s the
              first eight characters shown next to each booking. It saves us
              asking.
            </p>
          </div>
        </div>

        <ContactForm />
      </div>
    </section>
  )
}

function ContactRow({
  icon: Icon,
  label,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  children: React.ReactNode
}) {
  return (
    <li className="flex gap-4">
      <div className="grid size-10 shrink-0 place-items-center rounded-full bg-primary/10">
        <Icon className="size-4 text-primary" />
      </div>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="mt-0.5 text-sm font-medium">{children}</p>
      </div>
    </li>
  )
}
