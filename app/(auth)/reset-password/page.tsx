import type { Metadata } from "next"
import Link from "next/link"
import { KeyRound, LinkIcon } from "lucide-react"

import { CenteredCard } from "@/components/shared/CenteredCard"
import { buttonVariants } from "@/components/ui/button"
import { first } from "@/lib/searchParams"
import { cn } from "@/lib/utils"

import { ResetPasswordForm } from "../_components/ResetPasswordForm"

export const metadata: Metadata = {
  title: "Reset password · GearUp",
  robots: { index: false },
}

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string | string[] }>
}) {
  const token = first((await searchParams).token)

  if (!token) {
    return (
      <CenteredCard
        icon={LinkIcon}
        tone="error"
        title="This link is incomplete"
        description="Open the link from your email again, or request a new one."
      >
        <Link
          href="/forgot-password"
          className={cn(buttonVariants({ size: "lg" }), "h-10 w-full text-sm")}
        >
          Request a new link
        </Link>
      </CenteredCard>
    )
  }

  return (
    <CenteredCard
      icon={KeyRound}
      title="Choose a new password"
      description="Pick something you don't use anywhere else."
    >
      <ResetPasswordForm token={token} />
    </CenteredCard>
  )
}
