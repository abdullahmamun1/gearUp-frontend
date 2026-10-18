import { ImageResponse } from "next/og"
import { getTranslations } from "@/i18n/getTranslations"

import { getGearById } from "@/api/gear"
import {
  shapeText,
  OG_FONT,
  OG_SIZE,
  OgStars,
  OgWordmark,
  ogFonts,
  ogImageSrc,
  ogPrice,
} from "@/lib/og"
import type { AppLocale } from "@/i18n/routing"
import { BRAND_HEX } from "@/lib/site"
import { formatRating } from "@/utils/gearAvailability"

export const alt = "Gear for rent on GearUp"
export const size = OG_SIZE
export const contentType = "image/png"

/** Like the page: built on first request, then cached for 5 minutes. */
export const revalidate = 300

export async function generateStaticParams() {
  return []
}

/** Photo on the left; name, price per day, rating and provider on the right. */
export default async function Image({
  params,
}: {
  params: Promise<{ locale: string; id: string }>
}) {
  const { id, locale } = await params
  const [res, fonts, translate, translateCommon] = await Promise.all([
    getGearById(id),
    ogFonts(locale),
    getTranslations({ locale: locale as AppLocale, namespace: "gear.og" }),
    getTranslations({ locale: locale as AppLocale, namespace: "common" }),
  ])
  // Satori doesn't shape Bengali: every translated string goes through
  // shapeText (user content such as gear names is left as it is).
  const t = ((key: never, values?: never) =>
    shapeText(locale, translate(key, values))) as typeof translate
  const tCommon = ((key: never, values?: never) =>
    shapeText(locale, translateCommon(key, values))) as typeof translateCommon
  const gear = res.data
  const photo = gear?.imageUrl ?? gear?.images?.[0]
  const rating = gear?.rating

  return new ImageResponse(
    <div
      style={{
        display: "flex",
        width: "100%",
        height: "100%",
        background: BRAND_HEX.paper,
        fontFamily: OG_FONT.body,
        color: BRAND_HEX.ink,
      }}
    >
      <div
        style={{
          display: "flex",
          width: 540,
          height: "100%",
          background: `linear-gradient(135deg, ${BRAND_HEX.pine}, ${BRAND_HEX.lagoon})`,
        }}
      >
        {photo && (
          <img
            src={ogImageSrc(photo)}
            alt=""
            width={540}
            height={630}
            style={{ width: 540, height: 630, objectFit: "cover" }}
          />
        )}
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          flex: 1,
          padding: "56px 56px 48px",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {gear?.category && (
            <div
              style={{
                display: "flex",
                alignSelf: "flex-start",
                padding: "8px 18px",
                borderRadius: 999,
                background: `${BRAND_HEX.pine}1f`,
                color: BRAND_HEX.pine,
                fontSize: 22,
                fontWeight: 700,
              }}
            >
              {gear.category.name}
            </div>
          )}
          <div
            style={{
              display: "flex",
              fontFamily: OG_FONT.heading,
              fontSize: (gear?.name.length ?? 0) > 34 ? 50 : 60,
              fontWeight: 700,
              lineHeight: 1.05,
              letterSpacing: -2,
            }}
          >
            {gear?.name ?? t("fallbackTitle")}
          </div>
          {gear && (
            <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
              <span
                style={{ fontSize: 46, fontWeight: 700, color: BRAND_HEX.pine }}
              >
                {ogPrice(gear.pricePerDay, locale)}
              </span>
              <span style={{ fontSize: 28, color: "#6a615b" }}>
                {tCommon("units.perDay")}
              </span>
            </div>
          )}
          {rating?.average && rating.count > 0 ? (
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <OgStars rating={rating.average} />
              <span style={{ fontSize: 26, fontWeight: 700 }}>
                {formatRating(locale, rating.average)}
              </span>
              <span style={{ fontSize: 24, color: "#6a615b" }}>
                ({tCommon("units.reviews", { count: rating.count })})
              </span>
            </div>
          ) : null}
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
          }}
        >
          <OgWordmark />
          {gear?.provider && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-end",
                fontSize: 22,
                color: "#6a615b",
              }}
            >
              <span>{t("listedBy")}</span>
              <span style={{ fontWeight: 700, color: BRAND_HEX.ink }}>
                {gear.provider.name}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>,
    { ...size, fonts }
  )
}
