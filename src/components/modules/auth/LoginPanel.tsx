"use client"

import { useSearchParams } from "next/navigation"
import { useTranslations } from "@/i18n/translations"

const ALERTS = ["suspended", "google", "google_denied"] as const
type Alert = (typeof ALERTS)[number]

/** Good news shown above the form, e.g. after a password reset. */
const NOTICES = ["reset", "verified"] as const
type Notice = (typeof NOTICES)[number]

const isAlert = (value: string | null): value is Alert =>
  ALERTS.includes(value as Alert)
const isNotice = (value: string | null): value is Notice =>
  NOTICES.includes(value as Notice)

/**
 * Alerts and notices from ?reason and ?error, read in the browser so /login
 * stays static. Wrap it in <Suspense fallback={null}>. The form itself sits
 * outside the boundary (it reads ?redirectTo on submit), so it's never
 * swapped out after hydration and keeps what people typed.
 */
export function LoginNotices() {
  const t = useTranslations("auth.login")
  const params = useSearchParams()
  const reason = params.get("reason")
  const error = params.get("error")
  const alertKey = isAlert(reason) ? reason : isAlert(error) ? error : null
  const alert = alertKey ? t(`alerts.${alertKey}`) : null
  const notice = isNotice(reason) ? t(`notices.${reason}`) : null

  return (
    <>
      {alert && (
        <p
          role="alert"
          className="mt-6 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive"
        >
          {alert}
        </p>
      )}
      {notice && (
        <p
          role="status"
          className="mt-6 rounded-md border border-primary/30 bg-primary/5 px-3 py-2 text-xs"
        >
          {notice}
        </p>
      )}
    </>
  )
}
