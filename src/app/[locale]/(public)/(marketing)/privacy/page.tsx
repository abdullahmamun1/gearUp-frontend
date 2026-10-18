import type { AppLocale, LocaleParams } from "@/i18n/routing"
import { initLocale } from "@/i18n/server"
import type { Metadata } from "next"
import { getTranslations } from "@/i18n/getTranslations"

import { getFormat } from "@/i18n/getFormat"
import { pageMetadata } from "@/lib/site"
import { Link } from "@/i18n/navigation"

import { ShieldScene } from "@/components/shared/illustrations/scenes"
import { PageHero } from "@/components/shared/PageHero"
import { TocNav } from "@/components/shared/TocNav"
import { SITE_CONTACT } from "@/constants/siteConfig"

export async function generateMetadata({
  params,
}: LocaleParams): Promise<Metadata> {
  const locale = (await params).locale as AppLocale
  const t = await getTranslations({ locale, namespace: "pages.privacy.meta" })
  return pageMetadata({
    title: t("title"),
    description: t("description"),
    path: "/privacy",
    locale,
  })
}

/** Ids are the anchors TocNav and links like /privacy#terms point at. */
const SECTION_IDS = [
  "what-we-collect",
  "how-we-use-it",
  "cookies",
  "payments",
  "ai",
  "retention",
  "terms",
  "contact",
] as const

export default async function PrivacyPage({ params }: LocaleParams) {
  await initLocale(params)
  const t = await getTranslations("pages.privacy")
  const format = await getFormat()
  const strong = (chunks: React.ReactNode) => <strong>{chunks}</strong>
  const sections = SECTION_IDS.map((id) => ({
    id,
    label: t(`sections.${id}`),
  }))
  const title = (id: (typeof SECTION_IDS)[number]) => t(`sections.${id}`)
  const n = (value: number) =>
    format.number(value).padStart(2, format.number(0))

  return (
    <>
      <PageHero
        size="sm"
        eyebrow={t("hero.eyebrow")}
        title={t.rich("hero.title", {
          accent: (chunks) => <span className="text-gradient">{chunks}</span>,
        })}
        description={t("hero.description")}
        visual={<ShieldScene className="max-w-xs" />}
      />

      <section className="mx-auto max-w-6xl px-4 py-12 sm:py-16">
        <div className="grid gap-10 lg:grid-cols-[240px_1fr]">
          <div className="lg:sticky lg:top-24 lg:self-start">
            <TocNav sections={sections} />
          </div>

          <div className="grid gap-5">
            <Section
              n={n(1)}
              id="what-we-collect"
              title={title("what-we-collect")}
            >
              <p>{t("collect.p1")}</p>
              <p>{t("collect.p2")}</p>
            </Section>

            <Section n={n(2)} id="how-we-use-it" title={title("how-we-use-it")}>
              <p>{t("use.p1")}</p>
              <p>{t("use.p2")}</p>
            </Section>

            <Section n={n(3)} id="cookies" title={title("cookies")}>
              <p>{t("cookies.p1")}</p>
              <p>{t.rich("cookies.p2", { strong })}</p>
            </Section>

            <Section n={n(4)} id="payments" title={title("payments")}>
              <p>{t.rich("payments.p1", { strong })}</p>
              <p>{t("payments.p2")}</p>
            </Section>

            <Section n={n(5)} id="ai" title={title("ai")}>
              <p>{t.rich("ai.p1", { strong })}</p>
              <p>{t("ai.p2")}</p>
            </Section>

            <Section n={n(6)} id="retention" title={title("retention")}>
              <p>{t("retention.p1")}</p>
              <p>{t("retention.p2")}</p>
            </Section>

            <Section n={n(7)} id="terms" title={title("terms")}>
              <p>{t.rich("terms.booking", { strong })}</p>
              <p>{t.rich("terms.cancelling", { strong })}</p>
              <p>{t.rich("terms.condition", { strong })}</p>
              <p>{t.rich("terms.accounts", { strong })}</p>
            </Section>

            <Section n={n(8)} id="contact" title={title("contact")}>
              <p>
                {t.rich("contact.p1", {
                  email: SITE_CONTACT.email,
                  mail: (chunks) => (
                    <a
                      href={`mailto:${SITE_CONTACT.email}`}
                      className="text-primary hover:underline"
                    >
                      {chunks}
                    </a>
                  ),
                  link: (chunks) => (
                    <Link
                      href="/contact"
                      className="text-primary hover:underline"
                    >
                      {chunks}
                    </Link>
                  ),
                })}
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
  /** Already formatted, e.g. "01" or "০১". */
  n: string
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
          {n}
        </span>
        {title}
      </h2>
      <div className="mt-4 grid gap-3 text-[15px] leading-relaxed text-pretty text-muted-foreground">
        {children}
      </div>
    </section>
  )
}
