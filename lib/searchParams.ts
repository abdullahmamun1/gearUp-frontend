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

export type QueryParams = Record<string, string | number | undefined>

export function toQueryString(params: QueryParams) {
  const search = new URLSearchParams()

  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === "") continue
    search.set(key, String(value))
  }

  return search.toString()
}

export function buildHref(basePath: string, params: QueryParams) {
  const query = toQueryString({
    ...params,
    page: Number(params.page) <= 1 ? undefined : params.page,
  })

  return query ? `${basePath}?${query}` : basePath
}
