"use client"

import { useState, useTransition } from "react"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { resendVerification } from "@/api/auth"
import { cn } from "@/lib/utils"

export function ResendVerificationButton({
  className,
}: {
  className?: string
}) {
  const [isPending, startTransition] = useTransition()
  const [sent, setSent] = useState(false)

  function resend() {
    startTransition(async () => {
      const res = await resendVerification()
      if (!res.success) {
        toast.error(res.message || "Couldn't send the email. Try again.")
        return
      }
      setSent(true)
      toast.success("Verification email sent. Check your inbox.")
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
      {sent ? "Email sent" : isPending ? "Sending…" : "Resend email"}
    </Button>
  )
}
