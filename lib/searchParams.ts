export type RawSearchParams = Record<string, string | string[] | undefined>

export const UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
export const POSITIVE_INT = /^[1-9]\d*$/

export function first(value: string | string[] | undefined) {
  const raw = Array.isArray(value) ? value[0] : value
  const trimmed = raw?.trim()
  return trimmed ? trimmed : undefined
}

export function matching(value: string | undefined, pattern: RegExp) {
  return value && pattern.test(value) ? value : undefined
}
