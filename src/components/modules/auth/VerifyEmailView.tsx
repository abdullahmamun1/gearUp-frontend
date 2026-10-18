"use client"

import { Link } from "@/i18n/navigation"
import { useSearchParams } from "next/navigation"
import { useCallback } from "react"
import { CircleAlert, Loader2 } from "lucide-react"
import { useTranslations } from "@/i18n/translations"

import { verifyEmail } from "@/api/auth"
import { CenteredCard } from "@/components/shared/CenteredCard"
import { MailScene } from "@/components/shared/illustrations/scenes"
import { ResendVerificationButton } from "@/components/shared/ResendVerificationButton"
import { buttonVariants } from "@/components/ui/button"
import { useRunOnce } from "@/hooks/useRunOnce"
import { useSessionUser } from "@/hooks/useSessionUser"
import { cn } from "@/lib/utils"
import { DASHBOARD_HOME } from "@/routes"

/** Verifies the emailed token once, in the browser, so the page is static. */
export function VerifyEmailView() {
  const t = useTranslations("auth.verify")
  const token = useSearchParams().get("token")
  const { user } = useSessionUser()
  const verify = useCallback(() => verifyEmail(token!), [token])
  const state = useRunOnce(token ? verify : null)
  const next = user ? DASHBOARD_HOME[user.role] : "/login?reason=verified"

  if (state.status === "running") return <VerifyingCard />

  if (state.status === "done" && state.result.success) {
    return (
      <CenteredCard
        illustration={<MailScene />}
        tone="success"
        title={t("successTitle")}
        description={t("successDescription")}
      >
        <Link
          href={next}
          className={cn(buttonVariants({ size: "lg" }), "h-10 w-full text-sm")}
        >
          {user ? t("goToDashboard") : t("logIn")}
        </Link>
      </CenteredCard>
    )
  }

  return (
    <CenteredCard
      icon={CircleAlert}
      tone="error"
      title={t("errorTitle")}
      description={
        state.status === "done" ? state.result.message : t("incomplete")
      }
    >
      <div className="grid gap-3 text-sm text-muted-foreground">
        <p>{t("alreadyClicked")}</p>
        {user ? (
          <div className="flex items-center gap-3">
            <ResendVerificationButton />
            <Link href={next} className="text-primary hover:underline">
              {t("goToDashboard")}
            </Link>
          </div>
        ) : (
          <p>
            {t.rich("logInToResend", {
              link: (chunks) => (
                <Link href="/login" className="text-primary hover:underline">
                  {chunks}
                </Link>
              ),
            })}
          </p>
        )}
      </div>
    </CenteredCard>
  )
}

export function VerifyingCard() {
  const t = useTranslations("auth.verify")
  return (
    <CenteredCard
      icon={Loader2}
      busy
      title={t("checkingTitle")}
      description={t("checkingDescription")}
    />
  )
}
