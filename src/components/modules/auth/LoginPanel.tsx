"use client"

import { useSearchParams } from "next/navigation"

import { LoginForm } from "./LoginForm"

const ALERTS: Record<string, string> = {
  suspended:
    "Your account has been suspended, so you've been signed out. Please contact support if you think this is a mistake.",
  google:
    "We couldn't complete your Google sign-in. Please try again, or log in with your email and password.",
  google_denied:
    "You cancelled the Google sign-in, so nothing was changed. Try again whenever you're ready.",
}

/** Good news shown above the form, e.g. after a password reset. */
const NOTICES: Record<string, string> = {
  reset: "Your password has been changed. Log in with your new password.",
  verified: "Your email is verified. Log in to keep going.",
}

/**
 * Reads ?redirectTo, ?reason and ?error in the browser so /login can be a
 * static page. Wrap it in <Suspense fallback={<LoginForm />}>.
 */
export function LoginPanel() {
  const params = useSearchParams()
  const reason = params.get("reason") ?? ""
  const alert = ALERTS[reason] ?? ALERTS[params.get("error") ?? ""]
  const notice = NOTICES[reason]

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
      <LoginForm redirectTo={params.get("redirectTo") ?? undefined} />
    </>
  )
}
