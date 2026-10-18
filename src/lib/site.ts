import { localizedPath } from "@/i18n/routing"

/**
 * The public origin, for canonical URLs, the sitemap, Open Graph and JSON-LD.
 * Server only. Set `SITE_URL` in production (falls back to `APP_URL`, then
 * the Vercel production domain, then localhost).
 */
export const SITE_URL = (
  process.env.SITE_URL ||
  process.env.APP_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000")
).replace(/\/$/, "")

export const SITE_NAME = "GearUp"

export const SITE_DESCRIPTION =
  "Rent tents, kayaks, bikes and more by the day from local providers across Bangladesh."

/** Brand colours as hex, for places CSS variables can't reach (OG, manifest). */
export const BRAND_HEX = {
  pine: "#0b764d",
  lagoon: "#0071a5",
  ember: "#f57f3a",
  paper: "#fdfcf9",
  ink: "#1b150f",
  night: "#130e0a",
  mint: "#f4fdf7",
}

export function absoluteUrl(path = "/") {
  return new URL(path, SITE_URL).toString()
}

/**
 * Title, description, canonical URL, language alternates and Open Graph for
 * a public page. `path` is the English path ("/gear"); the Bangla URL is
 * derived. A page's `openGraph` replaces the root one rather than merging,
 * so shared fields are repeated, and pages without their own
 * `opengraph-image` get the locale's default card unless `ownImage` is set.
 */
export function pageMetadata({
  title,
  description,
  path,
  locale,
  ownImage = false,
}: {
  title: string
  description: string
  path: string
  locale: string
  /** The route has its own `opengraph-image` file. */
  ownImage?: boolean
}) {
  const url = localizedPath(locale, path)
  const images = ownImage
    ? undefined
    : [
        {
          url: localizedPath(locale, "/opengraph-image"),
          width: 1200,
          height: 630,
          alt: SITE_NAME,
        },
      ]
  return {
    title,
    description,
    alternates: {
      canonical: url,
      languages: {
        en: localizedPath("en", path),
        bn: localizedPath("bn", path),
        "x-default": localizedPath("en", path),
      },
    },
    openGraph: {
      type: "website" as const,
      siteName: SITE_NAME,
      locale: locale === "bn" ? "bn_BD" : "en_BD",
      alternateLocale: locale === "bn" ? ["en_BD"] : ["bn_BD"],
      title,
      description,
      url,
      ...(images && { images }),
    },
    twitter: {
      card: "summary_large_image" as const,
      title,
      description,
      ...(images && { images }),
    },
  }
}
