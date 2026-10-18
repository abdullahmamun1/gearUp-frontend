"use client"

import { Link } from "@/i18n/navigation"
import { useSearchParams } from "next/navigation"
import { LinkIcon } from "lucide-react"
import { useTranslations } from "@/i18n/translations"

import { CenteredCard } from "@/components/shared/CenteredCard"
import { KeyScene } from "@/components/shared/illustrations/scenes"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

import { ResetPasswordForm } from "./ResetPasswordForm"

export function ResetPasswordView() {
  const t = useTranslations("auth.reset")
  const token = useSearchParams().get("token")

  if (!token) {
    return (
      <CenteredCard
        icon={LinkIcon}
        tone="error"
        title={t("incompleteTitle")}
        description={t("incompleteDescription")}
      >
        <Link
          href="/forgot-password"
          className={cn(buttonVariants({ size: "lg" }), "h-10 w-full text-sm")}
        >
          {t("requestNew")}
        </Link>
      </CenteredCard>
    )
  }

  return (
    <CenteredCard
      illustration={<KeyScene />}
      title={t("title")}
      description={t("description")}
    >
      <ResetPasswordForm token={token} />
    </CenteredCard>
  )
}
