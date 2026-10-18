import { Link } from "@/i18n/navigation"
import { Mail, MapPin, Mountain, Phone } from "lucide-react"
import { getLocale } from "next-intl/server"
import { getTranslations } from "@/i18n/getTranslations"

import { SOCIAL_ICONS } from "@/components/shared/SocialIcons"
import { SITE_CONTACT, SOCIAL_LINKS } from "@/constants/siteConfig"

const EXPLORE_LINKS = [
  { label: "browseGear", href: "/gear" },
  { label: "howItWorks", href: "/#how-it-works" },
  { label: "becomeProvider", href: "/register" },
  { label: "logIn", href: "/login" },
] as const

const COMPANY_LINKS = [
  { label: "about", href: "/about" },
  { label: "help", href: "/help" },
  { label: "contactLink", href: "/contact" },
  { label: "privacy", href: "/privacy" },
] as const

export async function Footer() {
  const t = await getTranslations("nav.footer")
  const tCompany = await getTranslations("nav.company")
  const locale = await getLocale()
  // A year has no thousands separator ("2026", "২০২৬").
  const year = new Intl.NumberFormat(locale === "bn" ? "bn-BD" : "en-GB", {
    useGrouping: false,
  }).format(new Date().getFullYear())

  return (
    <footer className="border-t">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="flex items-center gap-2 font-heading font-bold">
            <Mountain className="size-4 text-primary" aria-hidden />
            GearUp
          </p>
          <p className="mt-2 max-w-xs text-sm text-muted-foreground">
            {t("tagline")}
          </p>

          <ul className="mt-5 flex gap-2">
            {SOCIAL_LINKS.map((social) => {
              const Icon = SOCIAL_ICONS[social.key]

              return (
                <li key={social.key}>
                  <a
                    href={social.href}
                    target="_blank"
                    rel="noreferrer noopener"
                    aria-label={t("social", { network: social.label })}
                    className="grid size-9 place-items-center rounded-md border text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
                  >
                    <Icon className="size-4" />
                  </a>
                </li>
              )
            })}
          </ul>
        </div>

        <div>
          <h2 className="font-heading text-sm font-semibold">{t("explore")}</h2>
          <ul className="mt-4 grid gap-2.5 text-sm text-muted-foreground">
            {EXPLORE_LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="hover:text-foreground">
                  {t(link.label)}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="font-heading text-sm font-semibold">{t("company")}</h2>
          <ul className="mt-4 grid gap-2.5 text-sm text-muted-foreground">
            {COMPANY_LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="hover:text-foreground">
                  {t(link.label)}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="font-heading text-sm font-semibold">{t("contact")}</h2>
          <ul className="mt-4 grid gap-2.5 text-sm text-muted-foreground">
            <li>
              <a
                href={`mailto:${SITE_CONTACT.email}`}
                className="inline-flex min-w-0 items-center gap-2 break-all hover:text-foreground"
              >
                <Mail className="size-4 shrink-0" aria-hidden />
                {SITE_CONTACT.email}
              </a>
            </li>
            <li>
              <a
                href={`tel:${SITE_CONTACT.phone}`}
                className="inline-flex items-center gap-2 hover:text-foreground"
              >
                <Phone className="size-4 shrink-0" aria-hidden />
                {SITE_CONTACT.phoneLabel}
              </a>
            </li>
            <li className="inline-flex items-center gap-2">
              <MapPin className="size-4 shrink-0" aria-hidden />
              {tCompany("location")}
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t">
        <p className="mx-auto max-w-6xl px-4 py-5 text-xs text-muted-foreground">
          {t("copyright", { year })}
        </p>
      </div>
    </footer>
  )
}
