import { MailWarning } from "lucide-react"
import { getTranslations } from "@/i18n/getTranslations"

import { ResendVerificationButton } from "@/components/shared/ResendVerificationButton"
import { getMe } from "@/api/auth"

/** Shown until the user clicks their verification link. */
export async function VerifyEmailBanner() {
  const [res, t] = await Promise.all([
    getMe(),
    getTranslations("dashboard.verifyBanner"),
  ])
  const user = res.data
  if (!res.success || !user || user.emailVerifiedAt) return null

  return (
    <div
      role="status"
      className="mb-6 flex flex-wrap items-center gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm"
    >
      <MailWarning
        className="size-4 shrink-0 text-amber-600 dark:text-amber-400"
        aria-hidden
      />
      <p className="min-w-0 flex-1">
        <span className="font-medium">{t("title")}</span>{" "}
        {t("sent", { email: user.email })}{" "}
        {user.role === "PROVIDER" ? t("provider") : t("customer")}
      </p>
      <ResendVerificationButton />
    </div>
  )
}
