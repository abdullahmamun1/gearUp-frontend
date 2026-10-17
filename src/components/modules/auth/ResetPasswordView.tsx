"use client"

import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { LinkIcon } from "lucide-react"

import { CenteredCard } from "@/components/shared/CenteredCard"
import { KeyScene } from "@/components/shared/illustrations/scenes"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

import { ResetPasswordForm } from "./ResetPasswordForm"

export function ResetPasswordView() {
  const token = useSearchParams().get("token")

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
      illustration={<KeyScene />}
      title="Choose a new password"
      description="Pick something you don't use anywhere else."
    >
      <ResetPasswordForm token={token} />
    </CenteredCard>
  )
}
