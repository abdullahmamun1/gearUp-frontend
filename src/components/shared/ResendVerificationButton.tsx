"use client"

import { useState, useTransition } from "react"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import { useTranslations } from "@/i18n/translations"

import { Button } from "@/components/ui/button"
import { resendVerification } from "@/api/auth"
import { cn } from "@/lib/utils"

export function ResendVerificationButton({
  className,
}: {
  className?: string
}) {
  const t = useTranslations("common.verifyEmail")
  const [isPending, startTransition] = useTransition()
  const [sent, setSent] = useState(false)

  function resend() {
    startTransition(async () => {
      const res = await resendVerification()
      if (!res.success) {
        toast.error(res.message || t("failed"))
        return
      }
      setSent(true)
      toast.success(t("sent"))
    })
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="lg"
      onClick={resend}
      disabled={isPending || sent}
      className={cn("h-8 text-xs", className)}
    >
      {isPending && <Loader2 className="size-3.5 animate-spin" aria-hidden />}
      {sent ? t("done") : isPending ? t("sending") : t("resend")}
    </Button>
  )
}
