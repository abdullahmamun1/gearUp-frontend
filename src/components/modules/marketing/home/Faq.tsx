import { useTranslations } from "@/i18n/translations"

import { Link } from "@/i18n/navigation"

import {
  Accordion,
  AccordionItem,
  AccordionPanel,
  AccordionTrigger,
} from "@/components/ui/accordion"

import { Section } from "./Section"
import { JsonLd } from "@/components/shared/JsonLd"

/** Question ids under home.faq.items, in display order. */
const FAQS = [
  "how",
  "pay",
  "cancel",
  "deposit",
  "card",
  "list",
  "review",
] as const

/**
 * Numbers in the answers, passed in so Bangla shows Bengali digits: the
 * provider has 48 h to confirm, payment and free cancellation windows are
 * 24 h, and Stripe's minimum order is ৳65.
 */
const HOURS: Record<(typeof FAQS)[number], number> = {
  how: 48,
  pay: 24,
  cancel: 24,
  deposit: 0,
  card: 0,
  list: 0,
  review: 0,
}
const MINIMUM_ORDER = 65

export function Faq() {
  const t = useTranslations("home.faq")
  const faqs = FAQS.map((id) => ({
    id,
    q: t(`items.${id}.q`),
    a: t(`items.${id}.a`, { hours: HOURS[id], minimum: MINIMUM_ORDER }),
  }))

  /** FAQ rich results for search engines, in the page's language. */
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.q,
      acceptedAnswer: { "@type": "Answer", text: faq.a },
    })),
  }

  return (
    <>
      <JsonLd data={faqJsonLd} />
      <Section
        id="faq"
        tone="muted"
        eyebrow={t("eyebrow")}
        title={t("title")}
        description={t.rich("description", {
          link: (chunks) => (
            <Link href="/contact" className="text-primary hover:underline">
              {chunks}
            </Link>
          ),
        })}
      >
        <Accordion keepMounted hiddenUntilFound className="max-w-full border-t">
          {faqs.map((faq) => (
            <AccordionItem key={faq.id}>
              <AccordionTrigger>{faq.q}</AccordionTrigger>
              <AccordionPanel>{faq.a}</AccordionPanel>
            </AccordionItem>
          ))}
        </Accordion>
      </Section>
    </>
  )
}
