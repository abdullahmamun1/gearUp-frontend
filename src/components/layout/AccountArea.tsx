"use client"

import Link from "next/link"

import { buttonVariants } from "@/components/ui/button"
import { useSessionUser } from "@/hooks/useSessionUser"
import { cn } from "@/lib/utils"
import { DASHBOARD_HOME, PROFILE_HOME } from "@/routes"

import { AccountMenu } from "./AccountMenu"

/**
 * Log in / Sign up, or the account menu. Rendered on the client so the
 * navbar (and every public page) can be prerendered. While the session
 * loads it holds the same space, so nothing shifts.
 */
export function AccountArea() {
  const { user, isPending } = useSessionUser()

  if (isPending) {
    return <div aria-hidden className="hidden h-11 w-[200px] sm:block" />
  }

  if (user) {
    return (
      <AccountMenu
        user={user}
        links={[
          {
            label: "Dashboard",
            href: DASHBOARD_HOME[user.role],
            icon: "dashboard",
          },
          { label: "Profile", href: PROFILE_HOME[user.role], icon: "profile" },
        ]}
      />
    )
  }

  return (
    <div className="hidden items-center gap-2 sm:flex">
      <Link
        href="/login"
        className={cn(
          buttonVariants({ variant: "ghost", size: "lg" }),
          "h-11 rounded-full px-4 text-[15px]"
        )}
      >
        Log in
      </Link>
      <Link
        href="/register"
        className={cn(
          buttonVariants({ size: "lg" }),
          "h-11 rounded-full px-5 text-[15px]"
        )}
      >
        Sign up
      </Link>
    </div>
  )
}
