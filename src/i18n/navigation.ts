import { createNavigation } from "next-intl/navigation"

import { routing } from "./routing"

/**
 * Locale-aware drop-ins for next/link and next/navigation: `href="/gear"`
 * becomes /bn/gear on Bangla pages, and `usePathname()` returns the path
 * without the locale. Use these everywhere instead of the Next originals
 * (useSearchParams and notFound still come from next/navigation).
 */
export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing)
