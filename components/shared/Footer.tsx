import Link from "next/link"
import { Mail, MapPin, Mountain, Phone } from "lucide-react"

import { SOCIAL_ICONS } from "@/components/shared/SocialIcons"
import { SITE_CONTACT, SOCIAL_LINKS } from "@/lib/siteConfig"

const EXPLORE_LINKS = [
  { label: "Browse gear", href: "/gear" },
  { label: "How it works", href: "/#how-it-works" },
  { label: "Become a provider", href: "/register" },
  { label: "Log in", href: "/login" },
]

const COMPANY_LINKS = [
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
  { label: "Privacy & Terms", href: "/privacy" },
]

export function Footer() {
  return (
    <footer className="mt-20 border-t">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="flex items-center gap-2 font-heading font-bold">
            <Mountain className="size-4 text-primary" aria-hidden />
            GearUp
          </p>
          <p className="mt-2 max-w-xs text-sm text-muted-foreground">
            Rent sports &amp; outdoor gear instantly, by the day, from local
            providers.
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
                    aria-label={`GearUp on ${social.label}`}
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
          <h2 className="font-heading text-sm font-semibold">Explore</h2>
          <ul className="mt-4 grid gap-2.5 text-sm text-muted-foreground">
            {EXPLORE_LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="hover:text-foreground">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="font-heading text-sm font-semibold">Company</h2>
          <ul className="mt-4 grid gap-2.5 text-sm text-muted-foreground">
            {COMPANY_LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="hover:text-foreground">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="font-heading text-sm font-semibold">Contact</h2>
          <ul className="mt-4 grid gap-2.5 text-sm text-muted-foreground">
            <li>
              <a
                href={`mailto:${SITE_CONTACT.email}`}
                className="inline-flex items-center gap-2 hover:text-foreground"
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
              {SITE_CONTACT.location}
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t">
        <p className="mx-auto max-w-6xl px-4 py-5 text-xs text-muted-foreground">
          © {new Date().getFullYear()} GearUp. Built by Abdullah Mamun.
        </p>
      </div>
    </footer>
  )
}
