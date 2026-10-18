"use client"

import { Link } from "@/i18n/navigation"
import { Heart, MessageCircle } from "lucide-react"
import { useTranslations } from "@/i18n/translations"

import { buttonVariants } from "@/components/ui/button"
import { useFavorites } from "@/hooks/queries/favorites"
import { useFormat } from "@/i18n/useFormat"
import { useUnreadMessages } from "@/hooks/queries/messages"
import { useSessionUser } from "@/hooks/useSessionUser"
import { cn } from "@/lib/utils"
import { DASHBOARD_HOME, PROFILE_HOME } from "@/routes"
import type { Role } from "@/types"

import { AccountMenu } from "./AccountMenu"

/**
 * Log in / Sign up, or the account menu. Rendered on the client so the
 * navbar (and every public page) can be prerendered. While the session
 * loads it holds the same space, so nothing shifts.
 */
export function AccountArea() {
  const t = useTranslations("nav.account")
  const { user, isPending } = useSessionUser()

  if (isPending) {
    return <div aria-hidden className="hidden h-11 w-[200px] sm:block" />
  }

  if (user) {
    return (
      <div className="flex items-center gap-1">
        <NavCounters role={user.role} />
        <AccountMenu
          user={user}
          links={[
            {
              label: t("dashboard"),
              href: DASHBOARD_HOME[user.role],
              icon: "dashboard",
            },
            {
              label: t("profile"),
              href: PROFILE_HOME[user.role],
              icon: "profile",
            },
          ]}
        />
      </div>
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
        {t("logIn")}
      </Link>
      <Link
        href="/register"
        className={cn(
          buttonVariants({ size: "lg" }),
          "h-11 rounded-full px-5 text-[15px]"
        )}
      >
        {t("signUp")}
      </Link>
    </div>
  )
}

/** Saved gear (customers) and unread messages (customers and providers). */
function NavCounters({ role }: { role: Role }) {
  const t = useTranslations("nav.account")
  const format = useFormat()
  const favorites = useFavorites()
  const unread = useUnreadMessages()

  const counters = [
    role === "CUSTOMER" && {
      href: `${DASHBOARD_HOME.CUSTOMER}/saved`,
      icon: Heart,
      count: favorites.count,
      label: t("saved"),
    },
    (role === "CUSTOMER" || role === "PROVIDER") && {
      href:
        role === "CUSTOMER"
          ? `${DASHBOARD_HOME.CUSTOMER}/orders`
          : `${DASHBOARD_HOME.PROVIDER}/orders`,
      icon: MessageCircle,
      count: unread.total,
      label: t("messages"),
    },
  ].filter(Boolean) as {
    href: string
    icon: typeof Heart
    count: number
    label: string
  }[]

  return counters.map((counter) => (
    <Link
      key={counter.href}
      href={counter.href}
      aria-label={
        counter.count
          ? t("counter", {
              label: counter.label,
              count: format.number(counter.count),
            })
          : counter.label
      }
      title={counter.label}
      className="relative hidden size-11 place-items-center rounded-full text-foreground/80 transition-colors hover:bg-accent hover:text-foreground sm:grid"
    >
      <counter.icon className="size-5" aria-hidden />
      {counter.count > 0 && (
        <span className="absolute top-1 right-1 grid h-4.5 min-w-4.5 place-items-center rounded-full bg-ember px-1 text-[10px] font-bold text-ember-foreground">
          {counter.count > 99
            ? `${format.number(99)}+`
            : format.number(counter.count)}
        </span>
      )}
    </Link>
  ))
}
