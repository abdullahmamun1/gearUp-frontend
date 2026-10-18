"use client"

import { useTranslations } from "@/i18n/translations"

import { GoogleIcon } from "@/components/shared/SocialIcons"
import { buttonVariants } from "@/components/ui/button"
import { GOOGLE_START_PATH } from "@/routes"
import { cn } from "@/lib/utils"
import type { RegisterRole } from "@/types"

export function GoogleButton({
  label,
  redirectTo,
  role,
  disabled = false,
}: {
  label?: string
  redirectTo?: string
  role?: RegisterRole
  disabled?: boolean
}) {
  const t = useTranslations("auth.google")
  const params = new URLSearchParams()
  if (redirectTo) params.set("redirectTo", redirectTo)
  if (role) params.set("role", role)

  const query = params.toString()

  return (
    <a
      href={query ? `${GOOGLE_START_PATH}?${query}` : GOOGLE_START_PATH}
      // ?redirectTo is read on click: the login form renders statically.
      onClick={(event) => {
        if (redirectTo) return
        const target = new URLSearchParams(window.location.search).get(
          "redirectTo"
        )
        if (!target) return
        event.preventDefault()
        const next = new URLSearchParams(params)
        next.set("redirectTo", target)
        // A route handler (OAuth redirect), not a page: needs a full load.
        // eslint-disable-next-line @next/next/no-location-assign-relative-destination
        window.location.assign(`${GOOGLE_START_PATH}?${next}`)
      }}
      aria-disabled={disabled || undefined}
      tabIndex={disabled ? -1 : undefined}
      className={cn(
        buttonVariants({ variant: "outline", size: "lg" }),
        "h-11 w-full gap-2.5 bg-card text-sm font-medium shadow-xs hover:border-foreground/20 hover:shadow-sm",
        disabled && "pointer-events-none opacity-50"
      )}
    >
      <GoogleIcon className="size-[18px]" />
      {label ?? t("continue")}
    </a>
  )
}

export function AuthDivider({ label }: { label?: string }) {
  const t = useTranslations("auth.google")
  return (
    <div className="flex items-center gap-3">
      <span className="h-px flex-1 bg-foreground/15" aria-hidden />
      <span className="text-xs text-muted-foreground">{label ?? t("or")}</span>
      <span className="h-px flex-1 bg-foreground/15" aria-hidden />
    </div>
  )
}
