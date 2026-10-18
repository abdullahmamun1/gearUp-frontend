import { ImageResponse } from "next/og"
import { getTranslations } from "@/i18n/getTranslations"

import { getProviderProfile } from "@/api/providers"
import {
  shapeText,
  OG_FONT,
  OG_SIZE,
  OgStars,
  OgWordmark,
  ogFonts,
  ogImageSrc,
} from "@/lib/og"
import { cityKey } from "@/constants/cities"
import type { AppLocale } from "@/i18n/routing"
import { BRAND_HEX } from "@/lib/site"
import { formatRating } from "@/utils/gearAvailability"

export const alt = "A gear provider on GearUp"
export const size = OG_SIZE
export const contentType = "image/png"

/** Like the page: built on first request, then cached for 5 minutes. */
export const revalidate = 300

export async function generateStaticParams() {
  return []
}

export default async function Image({
  params,
}: {
  params: Promise<{ locale: string; id: string }>
}) {
  const { id, locale } = await params
  const [res, fonts, translate, translateCommon] = await Promise.all([
    getProviderProfile(id),
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
  const provider = res.data
  const photos = [
    ...new Set(
      (provider?.gear ?? [])
        .map((item) => item.imageUrl ?? item.images?.[0])
        .filter((url): url is string => Boolean(url))
    ),
  ].slice(0, 3)
  const initials = (provider?.name ?? "G")
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()
  const city = cityKey(provider?.city)
  const place = [
    provider?.area,
    city ? tCommon(`city.${city}`) : provider?.city,
  ]
    .filter(Boolean)
    .join(", ")

  return new ImageResponse(
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        width: "100%",
        height: "100%",
        padding: 64,
        background: BRAND_HEX.paper,
        backgroundImage: `radial-gradient(circle at 90% 10%, ${BRAND_HEX.lagoon}2e, transparent 45%), radial-gradient(circle at 0% 100%, ${BRAND_HEX.pine}29, transparent 50%)`,
        fontFamily: OG_FONT.body,
        color: BRAND_HEX.ink,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 140,
            height: 140,
            borderRadius: 999,
            overflow: "hidden",
            background: `linear-gradient(135deg, ${BRAND_HEX.pine}, ${BRAND_HEX.lagoon})`,
            color: BRAND_HEX.mint,
            fontFamily: OG_FONT.heading,
            fontSize: 56,
            fontWeight: 700,
          }}
        >
          {provider?.avatarUrl ? (
            <img
              src={ogImageSrc(provider.avatarUrl, 280)}
              alt=""
              width={140}
              height={140}
              style={{ width: 140, height: 140, objectFit: "cover" }}
            />
          ) : (
            initials
          )}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div
            style={{
              display: "flex",
              fontFamily: OG_FONT.heading,
              fontSize: 64,
              fontWeight: 700,
              letterSpacing: -2,
            }}
          >
            {provider?.name ?? t("providerFallback")}
          </div>
          <div
            style={{ display: "flex", gap: 24, fontSize: 26, color: "#5d554e" }}
          >
            {place && <span>{place}</span>}
            {provider && (
              <span>
                {tCommon("units.listings", {
                  count: provider.stats.listings,
                })}
              </span>
            )}
          </div>
          {provider?.stats.rating.average ? (
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <OgStars rating={provider.stats.rating.average} size={26} />
              <span style={{ fontSize: 24, fontWeight: 700 }}>
                {formatRating(locale, provider.stats.rating.average)}
              </span>
            </div>
          ) : null}
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "flex-end", gap: 20 }}>
        {photos.map((photo) => (
          <img
            key={photo}
            src={ogImageSrc(photo, 400)}
            alt=""
            width={220}
            height={160}
            style={{
              width: 220,
              height: 160,
              borderRadius: 20,
              objectFit: "cover",
            }}
          />
        ))}
        <div style={{ display: "flex", marginLeft: "auto" }}>
          <OgWordmark />
        </div>
      </div>
    </div>,
    { ...size, fonts }
  )
}
