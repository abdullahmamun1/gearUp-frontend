import { ImageResponse } from "next/og"
import { hasLocale } from "next-intl"
import { getTranslations } from "@/i18n/getTranslations"

import { LOCALES, routing } from "@/i18n/routing"
import { OG_FONT, OG_SIZE, OgWordmark, ogFonts, shapeText } from "@/lib/og"
import { BRAND_HEX } from "@/lib/site"

export const alt = "GearUp — rent sports and outdoor gear by the day"
export const size = OG_SIZE
export const contentType = "image/png"

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }))
}

const CHIPS = ["tents", "kayaks", "bikes", "climbing", "surf"] as const

/** The default share card for every page without its own. */
export default async function Image({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale: requested } = await params
  const locale = hasLocale(LOCALES, requested)
    ? requested
    : routing.defaultLocale
  const bn = locale === "bn"
  const translate = await getTranslations({ locale, namespace: "home.og" })
  const t = (key: Parameters<typeof translate>[0]) =>
    shapeText(locale, translate(key))
  const fonts = await ogFonts(locale)

  return new ImageResponse(
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        width: "100%",
        height: "100%",
        padding: 72,
        background: BRAND_HEX.paper,
        backgroundImage: `radial-gradient(circle at 85% 15%, ${BRAND_HEX.ember}33, transparent 45%), radial-gradient(circle at 10% 95%, ${BRAND_HEX.lagoon}2e, transparent 50%), radial-gradient(circle at 60% 80%, ${BRAND_HEX.pine}29, transparent 45%)`,
        fontFamily: OG_FONT.body,
        color: BRAND_HEX.ink,
      }}
    >
      <OgWordmark />

      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            // Bengali vowel signs need room above and below the line, and
            // no tight tracking.
            fontFamily: OG_FONT.heading,
            fontSize: bn ? 76 : 84,
            fontWeight: 700,
            lineHeight: bn ? 1.3 : 1.02,
            letterSpacing: bn ? 0 : -3,
            maxWidth: 940,
          }}
        >
          <span>{t("headlineStart")}&nbsp;</span>
          <span style={{ color: BRAND_HEX.pine }}>{t("headlineAccent")}</span>
        </div>
        <div
          style={{
            fontSize: 32,
            color: "#5d554e",
            maxWidth: 860,
            lineHeight: bn ? 1.5 : undefined,
          }}
        >
          {t("subtitle")}
        </div>
      </div>

      <div style={{ display: "flex", gap: 14 }}>
        {CHIPS.map((chip) => (
          <div
            key={chip}
            style={{
              display: "flex",
              padding: "10px 22px",
              borderRadius: 999,
              border: "2px solid #e7e2da",
              background: "#ffffff",
              fontSize: 24,
              fontWeight: 700,
            }}
          >
            {t(`chips.${chip}`)}
          </div>
        ))}
      </div>
    </div>,
    { ...size, fonts }
  )
}
