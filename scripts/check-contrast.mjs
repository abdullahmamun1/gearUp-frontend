// WCAG contrast check for the design tokens in src/app/globals.css.
// Run with `npm run check:contrast`; exits 1 if any required pair fails.
import { readFileSync } from "node:fs"

const css = readFileSync(
  new URL("../src/app/globals.css", import.meta.url),
  "utf8"
)

function block(selector) {
  const start = css.indexOf(`${selector} {`)
  const body = css.slice(start, css.indexOf("\n}", start))
  return Object.fromEntries(
    [...body.matchAll(/--([\w-]+):\s*([^;]+);/g)].map((m) => [
      m[1],
      m[2].trim(),
    ])
  )
}

const light = block(":root")
const dark = { ...light, ...block(".dark") }

// --- OKLCH → sRGB → relative luminance -------------------------------
function parse(value, tokens) {
  const ref = value.match(/^var\(--([\w-]+)\)$/)
  if (ref) return parse(tokens[ref[1]], tokens)
  const m = value.match(
    /oklch\(\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)(?:\s*\/\s*([\d.]+)%?)?\s*\)/
  )
  if (!m) return null
  const alpha =
    m[4] === undefined
      ? 1
      : value.includes("%")
        ? Number(m[4]) / 100
        : Number(m[4])
  return { L: Number(m[1]), C: Number(m[2]), H: Number(m[3]), alpha }
}

function toLinearRgb({ L, C, H }) {
  const a = C * Math.cos((H * Math.PI) / 180)
  const b = C * Math.sin((H * Math.PI) / 180)
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3
  const clamp = (x) => Math.min(1, Math.max(0, x))
  return [
    clamp(4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s),
    clamp(-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s),
    clamp(-0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s),
  ]
}

const luminance = ([r, g, b]) => 0.2126 * r + 0.7152 * g + 0.0722 * b

/** Composites a translucent colour over its background, in linear RGB. */
function over(fg, bg) {
  const top = toLinearRgb(fg)
  return top.map((c, i) => c * fg.alpha + bg[i] * (1 - fg.alpha))
}

/** "success@12" = 12% success over the page background (a badge tint). */
function surface(name, tokens) {
  const [base, pct] = name.split("@")
  const page = toLinearRgb(parse(tokens.background, tokens))
  if (!pct) return over(parse(tokens[base], tokens), page)
  const tint = { ...parse(tokens[base], tokens), alpha: Number(pct) / 100 }
  return over(tint, page)
}

function contrast(fgName, bgName, tokens) {
  const bg = surface(bgName, tokens)
  const fg = over(parse(tokens[fgName], tokens), bg)
  const [hi, lo] = [luminance(fg), luminance(bg)].sort((x, y) => y - x)
  return (hi + 0.05) / (lo + 0.05)
}

// [foreground, background, minimum, what it's used for]
const PAIRS = [
  ["foreground", "background", 4.5, "body text"],
  ["card-foreground", "card", 4.5, "text on cards"],
  ["popover-foreground", "popover", 4.5, "menus"],
  ["muted-foreground", "background", 4.5, "secondary text"],
  ["muted-foreground", "card", 4.5, "secondary text on cards"],
  ["muted-foreground", "muted", 4.5, "secondary text on muted"],
  ["primary-foreground", "primary", 4.5, "primary button"],
  ["primary", "background", 4.5, "links / text-primary"],
  ["primary", "card", 4.5, "text-primary on cards"],
  ["ember-foreground", "ember", 4.5, "CTA button"],
  ["ember-strong", "background", 4.5, "text-ember-strong"],
  ["ember-strong", "card", 4.5, "text-ember-strong on cards"],
  ["lagoon-foreground", "lagoon", 4.5, "tertiary button"],
  ["lagoon", "background", 4.5, "text-lagoon"],
  ["secondary-foreground", "secondary", 4.5, "secondary button"],
  ["accent-foreground", "accent", 4.5, "hovered menu items"],
  ["destructive", "background", 4.5, "error text"],
  ["destructive", "card", 4.5, "error text on cards"],
  ["success", "background", 4.5, "success text"],
  ["warning", "background", 4.5, "warning text"],
  ["sidebar-foreground", "sidebar", 4.5, "sidebar text"],
  ["sidebar-primary-foreground", "sidebar-primary", 4.5, "active sidebar item"],
  ["sidebar-accent-foreground", "sidebar-accent", 4.5, "hovered sidebar item"],
  ["border", "background", 1.15, "borders stay visible"],
  ["success", "success@12", 4.5, "success badge"],
  ["warning", "warning@14", 4.5, "warning badge"],
  ["lagoon", "lagoon@12", 4.5, "info badge"],
  ["ember-strong", "ember@14", 4.5, "ember badge"],
  ["destructive", "destructive@10", 4.5, "destructive badge"],
]

let failed = 0
for (const [theme, tokens] of [
  ["light", light],
  ["dark", dark],
]) {
  console.log(`\n${theme}`)
  for (const [fg, bg, min, use] of PAIRS) {
    const ratio = contrast(fg, bg, tokens)
    const ok = ratio >= min
    if (!ok) failed++
    console.log(
      `  ${ok ? "pass" : "FAIL"}  ${ratio.toFixed(2).padStart(5)} ≥ ${min}  ${fg} on ${bg} — ${use}`
    )
  }
}
console.log(
  failed ? `\n${failed} pair(s) below target` : "\nAll pairs meet their target"
)
process.exit(failed ? 1 : 0)
