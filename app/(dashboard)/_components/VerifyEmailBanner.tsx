import { MailWarning } from "lucide-react"

import { ResendVerificationButton } from "@/components/shared/ResendVerificationButton"
import { getMe } from "@/service/auth"

/** Shown until the user clicks their verification link. */
export async function VerifyEmailBanner() {
  const res = await getMe()
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
        <span className="font-medium">Verify your email.</span> We sent a link
        to {user.email}.{" "}
        {user.role === "PROVIDER"
          ? "You can publish listings once it's confirmed."
          : "You can pay for rentals once it's confirmed."}
      </p>
      <ResendVerificationButton />
    </div>
  )
}
