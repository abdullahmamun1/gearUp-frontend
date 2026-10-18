import { cookies } from "next/headers"
import { getLocale } from "next-intl/server"

import { createFormat, DIGITS_COOKIE } from "./format"

/** Server components on public (static) pages. Never reads cookies. */
export async function getFormat() {
  return createFormat(await getLocale())
}

/**
 * Server components in dashboards (already dynamic): honours the user's
 * digits preference.
 */
export async function getDashboardFormat() {
  const digits = (await cookies()).get(DIGITS_COOKIE)?.value
  return createFormat(
    await getLocale(),
    digits === "latin" ? "latin" : "native"
  )
}
