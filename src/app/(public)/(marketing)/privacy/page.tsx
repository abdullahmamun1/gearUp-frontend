import type { Metadata } from "next"
import Link from "next/link"

import { ShieldScene } from "@/components/shared/illustrations/scenes"
import { PageHero } from "@/components/shared/PageHero"
import { TocNav } from "@/components/shared/TocNav"
import { SITE_CONTACT } from "@/constants/siteConfig"

export const metadata: Metadata = {
  title: "Privacy & Terms · GearUp",
  description:
    "What GearUp collects, how rentals and payments work, and the terms that apply when you book or list gear.",
}

const SECTIONS = [
  { id: "what-we-collect", label: "What we collect" },
  { id: "how-we-use-it", label: "How we use it" },
  { id: "cookies", label: "Cookies" },
  { id: "payments", label: "Payments" },
  { id: "retention", label: "Keeping and deleting data" },
  { id: "terms", label: "Rental terms" },
  { id: "contact", label: "Contact" },
]

export default function PrivacyPage() {
  return (
    <>
      <PageHero
        size="sm"
        eyebrow="Last updated October 2026"
        title={
          <>
            Privacy &amp; <span className="text-gradient">Terms</span>
          </>
        }
        description="Plain language, no boilerplate. This describes what GearUp actually stores and the rules that apply when you rent or list equipment."
        visual={<ShieldScene className="max-w-xs" />}
      />

      <section className="mx-auto max-w-6xl px-4 py-12 sm:py-16">
        <div className="grid gap-10 lg:grid-cols-[240px_1fr]">
          <div className="lg:sticky lg:top-24 lg:self-start">
            <TocNav sections={SECTIONS} />
          </div>

          <div className="grid gap-5">
            <Section n={1} id="what-we-collect" title="What we collect">
              <p>
                When you create an account we store your name, email address and
                — if you give one — a phone number. Your password is never
                stored as text; it is hashed before it reaches the database, and
                there is no way for us to read it back.
              </p>
              <p>
                Once you start using the site we also hold your rentals, the
                dates and quantities you booked, payment records, and any
                reviews you leave. Providers additionally have the listings they
                create.
              </p>
            </Section>

            <Section n={2} id="how-we-use-it" title="How we use it">
              <p>
                Your details are used to run the service and nothing else:
                showing a provider who has booked their gear, showing you your
                own rental history, and letting our admins moderate the
                platform.
              </p>
              <p>
                We do not sell your information, and we do not send marketing
                you did not ask for.
              </p>
            </Section>

            <Section n={3} id="cookies" title="Cookies">
              <p>
                GearUp sets two cookies, both strictly necessary: a short-lived
                access token and a longer-lived refresh token that keeps you
                signed in without asking for your password again.
              </p>
              <p>
                Both are <strong>httpOnly</strong>, which means JavaScript in
                your browser cannot read them — including any script that
                managed to get onto the page. There are no advertising or
                analytics cookies.
              </p>
            </Section>

            <Section n={4} id="payments" title="Payments">
              <p>
                Card payments are handled entirely by <strong>Stripe</strong>.
                When you pay, you are on Stripe&apos;s own checkout page — your
                card number is never entered into GearUp and never reaches our
                servers.
              </p>
              <p>
                What we keep is the outcome: an amount, a status, and a
                reference that lets us match the payment to your order.
              </p>
            </Section>

            <Section n={5} id="retention" title="Keeping and deleting data">
              <p>
                Rental and payment records are kept while your account is open,
                because both you and the provider may need to refer back to
                them.
              </p>
              <p>
                If you want your account removed, email us and we will confirm
                before deleting anything.
              </p>
            </Section>

            <Section n={6} id="terms" title="Rental terms">
              <p>
                <strong>Booking.</strong> A booking is a request until the
                provider confirms it. Payment only becomes available after that
                confirmation, so nothing is charged for gear nobody has
                accepted.
              </p>
              <p>
                <strong>Cancelling.</strong> You can cancel a booking yourself
                while it is still placed. Once it has been paid, contact the
                provider or us directly.
              </p>
              <p>
                <strong>Condition.</strong> Renters are expected to return gear
                in the condition it went out in, allowing for ordinary wear.
                Providers are expected to list equipment that is safe and works
                as described.
              </p>
              <p>
                <strong>Accounts.</strong> Accounts that misrepresent gear or
                abuse the platform can be suspended. Suspension takes effect
                immediately, on the next request that account makes.
              </p>
            </Section>

            <Section n={7} id="contact" title="Contact">
              <p>
                Questions about any of this, or a request about your own data,
                should go to{" "}
                <a
                  href={`mailto:${SITE_CONTACT.email}`}
                  className="text-primary hover:underline"
                >
                  {SITE_CONTACT.email}
                </a>{" "}
                — or use the{" "}
                <Link href="/contact" className="text-primary hover:underline">
                  contact form
                </Link>
                .
              </p>
            </Section>
          </div>
        </div>
      </section>
    </>
  )
}

function Section({
  n,
  id,
  title,
  children,
}: {
  n: number
  id: string
  title: string
  children: React.ReactNode
}) {
  return (
    <section
      id={id}
      className="scroll-mt-24 rounded-2xl border bg-card p-6 shadow-xs sm:p-8"
    >
      <h2 className="flex items-center gap-3 text-h3">
        <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-primary/10 font-mono text-xs font-semibold text-primary">
          {String(n).padStart(2, "0")}
        </span>
        {title}
      </h2>
      <div className="mt-4 grid gap-3 text-[15px] leading-relaxed text-pretty text-muted-foreground">
        {children}
      </div>
    </section>
  )
}
