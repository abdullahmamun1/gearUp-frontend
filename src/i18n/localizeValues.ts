import { createFormat } from "./format"

type Values = Record<string, unknown> | undefined

/**
 * ICU prints a number in a plain `{count}` placeholder as-is ("48"); only
 * plurals and `{x, number}` localise digits. On Bangla pages this turns
 * numeric values of plain placeholders into Bengali digits ("৪৮"), so
 * callers can pass raw numbers. Strings (names, prices already formatted)
 * and plural arguments are left alone.
 */
export function localizeValues(
  raw: unknown,
  values: Values,
  locale: string
): Values {
  if (locale !== "bn" || !values || typeof raw !== "string") return values
  let out = values
  for (const [name, value] of Object.entries(values)) {
    if (typeof value !== "number") continue
    if (!new RegExp(`\\{\\s*${name}\\s*\\}`).test(raw)) continue
    if (out === values) out = { ...values }
    out[name] = createFormat(locale).number(value)
  }
  return out
}

type Translator = {
  (key: string, values?: Values, formats?: unknown): string
  rich: (key: string, values?: Values, formats?: unknown) => unknown
  markup: (key: string, values?: Values, formats?: unknown) => string
  raw: (key: string) => unknown
  has: (key: string) => boolean
}

/** Wraps a next-intl translator so plain numeric placeholders localise. */
export function withLocalizedNumbers<T>(translator: T, locale: string): T {
  if (locale !== "bn") return translator
  const t = translator as unknown as Translator
  const fix = (key: string, values: Values) => {
    if (!values) return values
    let raw: unknown
    try {
      raw = t.raw(key)
    } catch {
      return values
    }
    return localizeValues(raw, values, locale)
  }
  const wrapped = ((key: string, values?: Values, formats?: unknown) =>
    t(key, fix(key, values), formats)) as Translator
  wrapped.rich = (key, values, formats) =>
    t.rich(key, fix(key, values), formats)
  wrapped.markup = (key, values, formats) =>
    t.markup(key, fix(key, values), formats)
  wrapped.raw = (key) => t.raw(key)
  wrapped.has = (key) => t.has(key)
  return wrapped as unknown as T
}
