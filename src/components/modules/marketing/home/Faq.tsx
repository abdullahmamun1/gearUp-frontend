import Link from "next/link"

import {
  Accordion,
  AccordionItem,
  AccordionPanel,
  AccordionTrigger,
} from "@/components/ui/accordion"

import { Section } from "./Section"

const FAQS = [
  {
    q: "How does renting work?",
    a: "Pick your gear and your dates — the price per day and any refundable deposit are shown up front. The provider has up to 48 hours to confirm, then you pay, collect the kit from them and return it on the end date.",
  },
  {
    q: "When do I pay?",
    a: "Only after the provider confirms. You then have 24 hours to pay through Stripe Checkout, or the dates are released for other renters. Orders have a ৳65 minimum because Stripe rejects anything smaller.",
  },
  {
    q: "Can I cancel a booking?",
    a: "Yes. It's free until you've paid. After paying you get a full refund if you cancel at least 24 hours before the start day.",
  },
  {
    q: "What is the refundable deposit?",
    a: "Some providers ask for a deposit on pricier kit. It's charged with the rental and refunded to your card when the gear comes back in good condition. If something is damaged, GearUp reviews the provider's claim before any of it is kept.",
  },
  {
    q: "Is my card information safe?",
    a: "Your card never touches GearUp. Payment happens on Stripe's own checkout page, and we only ever receive a confirmation that it succeeded — no card number is seen or stored on our side.",
  },
  {
    q: "Can I list my own gear?",
    a: "Register as a provider, verify your email and you get a dashboard to add listings with photos, prices and deposits, and to confirm, hand over and check back in every booking.",
  },
  {
    q: "Who can leave a review?",
    a: "Only someone who actually rented the gear, and only once the order is marked returned — one review per order. That's why every review on this site is from a completed rental.",
  },
]

/** FAQ rich results for search engines. */
const FAQ_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQS.map((faq) => ({
    "@type": "Question",
    name: faq.q,
    acceptedAnswer: { "@type": "Answer", text: faq.a },
  })),
}

export function Faq() {
  return (
    <>
      <script
        type="application/ld+json"
        // Static, trusted content; JSON.stringify escapes it safely enough
        // here, and "<" is escaped so it can't close the script tag.
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(FAQ_JSON_LD).replace(/</g, "\\u003c"),
        }}
      />
      <Section
        id="faq"
        tone="muted"
        eyebrow="Before you book"
        title="Frequently asked questions"
        description={
          <>
            Still stuck? The{" "}
            <Link href="/contact" className="text-primary hover:underline">
              contact page
            </Link>{" "}
            has a real email and phone number.
          </>
        }
      >
        <Accordion keepMounted hiddenUntilFound className="max-w-full border-t">
          {FAQS.map((faq) => (
            <AccordionItem key={faq.q}>
              <AccordionTrigger>{faq.q}</AccordionTrigger>
              <AccordionPanel>{faq.a}</AccordionPanel>
            </AccordionItem>
          ))}
        </Accordion>
      </Section>
    </>
  )
}
