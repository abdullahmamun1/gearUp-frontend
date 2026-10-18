"use client"

import { useTransition } from "react"
import { Languages } from "lucide-react"
import { useLocale } from "next-intl"

import { saveLocale } from "@/api/auth"
import { Button } from "@/components/ui/button"
import { usePathname } from "@/i18n/navigation"
import { localizedPath } from "@/i18n/routing"
import { cn } from "@/lib/utils"
import type { Locale } from "@/types"

/** Each language is named in itself, so it reads the same in both UIs. */
const OTHER: Record<Locale, { locale: Locale; label: string; aria: string }> = {
  en: { locale: "bn", label: "বাংলা", aria: "বাংলায় দেখুন" },
  bn: { locale: "en", label: "English", aria: "View in English" },
}

/**
 * Switches to the other language on the same page (query string kept), and
 * saves the choice: a cookie for everyone, `User.locale` when signed in.
 */
export function LocaleSwitcher({
  className,
  compact = false,
}: {
  className?: string
  /** Icon + short label, for tight headers. */
  compact?: boolean
}) {
  const locale = useLocale() as Locale
  const pathname = usePathname()
  const [isPending, startTransition] = useTransition()
  const next = OTHER[locale]

  function switchLocale() {
    startTransition(async () => {
      // Save first: the cookie must say the new language before we land on
      // an unprefixed English URL, or the proxy would send us back to /bn.
      await saveLocale(next.locale)
      // A full load (fonts and <html lang> change anyway) straight to the
      // clean URL. The query is read now rather than via useSearchParams,
      // so static pages stay static.
      window.location.assign(
        localizedPath(next.locale, pathname) + window.location.search
      )
    })
  }

  return (
    <Button
      variant="ghost"
      onClick={switchLocale}
      disabled={isPending}
      aria-label={next.aria}
      lang={next.locale}
      className={cn(
        "h-11 gap-1.5 rounded-full px-3 text-sm font-medium",
        compact && "px-2.5",
        className
      )}
    >
      <Languages className="size-[18px]" aria-hidden />
      <span className={cn(compact && "sr-only 2xl:not-sr-only")}>
        {next.label}
      </span>
    </Button>
  )
}
