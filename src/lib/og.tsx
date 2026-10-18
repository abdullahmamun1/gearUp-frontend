import { createFormat } from "@/i18n/format"
import { BRAND_HEX } from "@/lib/site"

/** Open Graph images are 1200×630 everywhere. */
export const OG_SIZE = { width: 1200, height: 630 }

type OgFont = {
  name: string
  data: ArrayBuffer
  weight: 500 | 600 | 700
  style: "normal"
}

/**
 * Bangla text needs Hind Siliguri: Satori falls back to it for glyphs the
 * Latin fonts lack. Use `fontFamily: OG_FONT.body` (or `.heading`) so both
 * scripts render.
 */
export const OG_FONT = {
  heading: "Heading, Bangla",
  body: "Body, Bangla",
} as const

/**
 * Google Fonts serves TTF to a plain fetch (no browser user agent), which is
 * what Satori needs. Fetched once per server instance; on failure the image
 * falls back to the built-in font rather than failing.
 */
async function googleFont(family: string, weight: 500 | 600 | 700) {
  const css = await fetch(
    `https://fonts.googleapis.com/css2?family=${family.replace(/ /g, "+")}:wght@${weight}`
  ).then((res) => res.text())
  const url = css.match(
    /src: url\((.+?)\) format\('(?:truetype|opentype)'\)/
  )?.[1]
  if (!url) throw new Error(`No TTF for ${family}`)
  return fetch(url).then((res) => res.arrayBuffer())
}

let fontsPromise: Promise<OgFont[]> | null = null
let banglaPromise: Promise<OgFont[]> | null = null

function banglaFonts() {
  banglaPromise ??= googleFont("Hind Siliguri", 600)
    .then(
      (data) =>
        [
          { name: "Bangla", data, weight: 600, style: "normal" },
        ] satisfies OgFont[]
    )
    .catch(() => {
      banglaPromise = null
      return []
    })
  return banglaPromise
}

/** The Latin fonts, plus Hind Siliguri for Bangla pages. */
export async function ogFonts(locale = "en") {
  const [latin, bangla] = await Promise.all([
    latinFonts(),
    locale === "bn" ? banglaFonts() : Promise.resolve([]),
  ])
  return [...latin, ...bangla]
}

function latinFonts() {
  fontsPromise ??= Promise.all([
    googleFont("Bricolage Grotesque", 700),
    googleFont("Plus Jakarta Sans", 500),
    googleFont("Plus Jakarta Sans", 700),
  ])
    .then(
      ([heading, body, bodyBold]) =>
        [
          { name: "Heading", data: heading, weight: 700, style: "normal" },
          { name: "Body", data: body, weight: 500, style: "normal" },
          { name: "Body", data: bodyBold, weight: 700, style: "normal" },
        ] satisfies OgFont[]
    )
    .catch(() => {
      fontsPromise = null
      return []
    })
  return fontsPromise
}

/**
 * Satori decodes PNG and JPEG reliably, not WebP/AVIF: ask the image hosts
 * we use for a JPEG at a sensible size.
 */
export function ogImageSrc(url: string, width = 700) {
  if (url.includes("res.cloudinary.com") && url.includes("/upload/")) {
    return url.replace("/upload/", `/upload/f_jpg,q_80,w_${width}/`)
  }
  if (url.includes("images.unsplash.com")) {
    const next = new URL(url)
    next.searchParams.set("fm", "jpg")
    next.searchParams.set("w", String(width))
    next.searchParams.set("q", "80")
    return next.toString()
  }
  return url
}

/** The GearUp mark: a mountain on the brand gradient. */
export function OgLogo({ size = 56 }: { size?: number }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: size,
        height: size,
        borderRadius: size * 0.28,
        background: `linear-gradient(135deg, ${BRAND_HEX.pine}, ${BRAND_HEX.lagoon})`,
      }}
    >
      <svg
        width={size * 0.55}
        height={size * 0.55}
        viewBox="0 0 24 24"
        fill="none"
        stroke={BRAND_HEX.mint}
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="m8 3 4 8 5-5 5 15H2L8 3z" />
      </svg>
    </div>
  )
}

export function OgWordmark({ color = BRAND_HEX.ink }: { color?: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
      <OgLogo />
      <div
        style={{
          fontFamily: "Heading",
          fontSize: 40,
          fontWeight: 700,
          color,
          letterSpacing: -1,
        }}
      >
        GearUp
      </div>
    </div>
  )
}

/** Five stars, filled to the rating (SVG: the fonts have no star glyph). */
export function OgStars({
  rating,
  size = 30,
}: {
  rating: number
  size?: number
}) {
  const filled = Math.round(rating)
  return (
    <div style={{ display: "flex", gap: 4 }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <svg key={star} width={size} height={size} viewBox="0 0 24 24">
          <path
            d="M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.3l-5.9 3.3 1.3-6.6-4.9-4.6 6.6-.8z"
            fill={star <= filled ? "#f59e0b" : "#e7e2da"}
          />
        </svg>
      ))}
    </div>
  )
}

/**
 * "BDT 1,250": the Latin fonts don't have the ৳ glyph. Bangla images load
 * Hind Siliguri, which does: "১,২৫০৳".
 */
export function ogPrice(value: string | number, locale = "en") {
  if (locale === "bn")
    return createFormat("bn").price(Math.round(Number(value)))
  return `BDT ${Math.round(Number(value)).toLocaleString("en-US")}`
}

/**
 * Satori places glyphs without OpenType shaping, so Bengali needs a little
 * help: vowel signs that sit before a consonant (ি ে ৈ, and the first half
 * of ো ৌ) are moved in front of it, and ড় ঢ় য় use their single code points.
 * Conjuncts still can't join, so the bn card text avoids them.
 */
const BN_CONSONANT = "\u0995-\u09B9\u09CE\u09DC\u09DD\u09DF"
const BN_PRE_BASE = new RegExp(
  `((?:[${BN_CONSONANT}]\u09BC?\u09CD)*[${BN_CONSONANT}]\u09BC?)([\u09BF\u09C7\u09C8])`,
  "g"
)

function shapeBengali(text: string) {
  return text
    .replace(/\u09A1\u09BC/g, "\u09DC")
    .replace(/\u09A2\u09BC/g, "\u09DD")
    .replace(/\u09AF\u09BC/g, "\u09DF")
    .replace(/\u09CB/g, "\u09C7\u09BE")
    .replace(/\u09CC/g, "\u09C7\u09D7")
    .replace(BN_PRE_BASE, "$2$1")
}

/** Text for a share image in `locale`: Bengali is pre-shaped for Satori. */
export function shapeText(locale: string, text: string) {
  return locale === "bn" ? shapeBengali(text) : text
}
