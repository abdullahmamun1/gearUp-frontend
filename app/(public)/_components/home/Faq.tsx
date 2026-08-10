import Link from "next/link"

import {
  Accordion,
  AccordionItem,
  AccordionPanel,
  AccordionTrigger,
} from "@/components/ui/accordion"

const FAQS = [
  {
    q: "How does renting work?",
    a: "Pick your gear, choose a start and end date, and the total is priced per day up front — no deposit, no membership. The provider confirms the booking, you pay, then you collect the kit from them and return it on the end date.",
  },
  {
    q: "When do I pay?",
    a: "After the provider confirms your order. You'll get a Pay button on the order, which takes you to Stripe Checkout. Orders have a ৳65 minimum because Stripe rejects anything smaller.",
  },
  {
    q: "Can I cancel a booking?",
    a: "Yes — while the order is still awaiting confirmation. Once a provider has confirmed it, get in touch and we'll sort it out with them directly.",
  },
  {
    q: "Is my card information safe?",
    a: "Your card never touches GearUp. Payment happens on Stripe's own checkout page, and we only ever receive a confirmation that it succeeded — no card number is seen or stored on our side.",
  },
  {
    q: "Can I list my own gear?",
    a: "Register as a provider and you get a dashboard to add listings with photos and pricing, toggle availability, and work through the order queue: confirm, mark picked up, mark returned.",
  },
  {
    q: "Who can leave a review?",
    a: "Only someone who actually rented the gear, and only once the order is marked returned — one review per order. That's why every review on this site is from a completed rental.",
  },
]

export function Faq() {
  return (
    <section className="mx-auto max-w-6xl px-4 pt-14">
      <h2 className="font-heading text-2xl font-bold sm:text-3xl">
        Frequently asked questions
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Still stuck? The{" "}
        <Link href="/contact" className="text-primary hover:underline">
          contact page
        </Link>{" "}
        has a real email and phone number.
      </p>

      <Accordion
        keepMounted
        hiddenUntilFound
        className="mt-6 max-w-full border-t"
      >
        {FAQS.map((faq) => (
          <AccordionItem key={faq.q}>
            <AccordionTrigger>{faq.q}</AccordionTrigger>
            <AccordionPanel>{faq.a}</AccordionPanel>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  )
}
